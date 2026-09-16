import { Request } from 'express';
import CheckoutRepository from './repository/checkout.repository';
import CartRepository from '../cart/repository/cart.repository';
import { BadRequestException, ForbiddenException, ValidationException } from '../../../../Common/httpErrorClasses';
import { CheckoutPayload } from './validations/checkout.validation';
import { generateOrderNumber } from '../../../../Common/utils/Slugify';

interface CartItemRow {
    id: number;
    qty: number;
    priceAtAdd: number;
    variant: {
        id: number;
        stock: number;
        product: { title: string; gstRate: number };
    };
}

class CheckoutService {
    async checkout(req: Request, payload: CheckoutPayload) {
        const userId = req.user?.userId;
        if (!userId && !payload.guestEmail) {
            throw new BadRequestException('guestEmail is required for guest checkout.');
        }

        const cartRecord = userId
            ? await CartRepository.findByUser(userId)
            : req.cartSessionId
            ? await CartRepository.findBySession(req.cartSessionId)
            : null;
        if (!cartRecord) throw new BadRequestException('Cart not found.');

        const cart = await CartRepository.findById(cartRecord.id);
        const items = ((cart as unknown as { items: CartItemRow[] })?.items || []) as CartItemRow[];
        if (!items.length) throw new ValidationException('Your cart is empty.');

        // Resolve shipping address — saved address (owned by this user) or an inline one.
        let shippingAddress: Record<string, unknown>;
        if (payload.addressId) {
            const address = await CheckoutRepository.findAddress(payload.addressId);
            if (!address) throw new BadRequestException('Address not found.');
            if (userId && address.userId !== userId) throw new ForbiddenException();
            shippingAddress = address.toJSON() as unknown as Record<string, unknown>;
        } else if (payload.address) {
            shippingAddress = payload.address;
        } else {
            throw new BadRequestException('addressId or address is required.');
        }

        for (const item of items) {
            if (item.variant.stock < item.qty) {
                throw new ValidationException(`Insufficient stock for ${item.variant.product.title}.`);
            }
        }

        const subtotal = items.reduce((sum, item) => sum + item.qty * item.priceAtAdd, 0);
        const gstAmount = items.reduce((sum, item) => {
            const lineTotal = item.qty * item.priceAtAdd;
            return sum + Math.round((lineTotal * Number(item.variant.product.gstRate)) / (100 + Number(item.variant.product.gstRate)));
        }, 0);

        const coupon = (cart as unknown as {
            coupon: { type: 'percentage' | 'flat'; value: number; minOrderValue: number | null; maxDiscount: number | null; id: number } | null;
        })?.coupon;
        let discount = 0;
        if (coupon && (!coupon.minOrderValue || subtotal >= coupon.minOrderValue)) {
            discount = coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        }
        discount = Math.min(discount, subtotal);

        const shippingFee = subtotal - discount >= 99900 ? 0 : 4900; // free shipping above INR 999
        const total = subtotal - discount + shippingFee;

        const order = await CheckoutRepository.createOrderWithItems(
            {
                orderNumber: generateOrderNumber(),
                userId: userId || null,
                guestEmail: userId ? null : payload.guestEmail,
                status: 'pending',
                shippingAddress,
                subtotal,
                discount,
                shippingFee,
                gstAmount,
                total,
                couponId: coupon?.id || null
            },
            items.map((item) => ({
                variantId: item.variant.id,
                productTitleSnapshot: item.variant.product.title,
                qty: item.qty,
                unitPrice: item.priceAtAdd,
                gstRateSnapshot: item.variant.product.gstRate
            })),
            items.map((item) => ({ variantId: item.variant.id, qty: item.qty }))
        );

        // Clear the cart after a successful order.
        for (const item of items) {
            await CartRepository.removeItem(item.id);
        }

        return { orderId: order.id, orderNumber: order.orderNumber, amountDue: total, gst: gstAmount };
    }
}

export default new CheckoutService();
