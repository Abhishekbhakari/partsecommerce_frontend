import { Request } from 'express';
import CheckoutRepository from './repository/checkout.repository';
import CartRepository from '../cart/repository/cart.repository';
import { BadRequestException, ForbiddenException, ValidationException } from '../../../../Common/httpErrorClasses';
import { CheckoutPayload } from './validations/checkout.validation';
import { generateOrderNumber } from '../../../../Common/utils/Slugify';
import CommissionUtil from '../../../../Common/utils/CommissionUtil';
import ShippingRateService, { chargeableShippingPaise, toQuoteItems, QuotableRow } from '../../../ShippingManagement/api/rates/shippingRate.service';

interface CartItemRow {
    id: number;
    qty: number;
    priceAtAdd: number;
    variant: {
        id: number;
        stock: number;
        product: { title: string; gstRate: number; sellerId: number };
    };
}

class CheckoutService {
    async checkout(req: Request, payload: CheckoutPayload) {
        // Same principal rule as the cart: only a customer token is a customer. An admin/seller
        // token must not place orders under customer #<their own id>.
        const userId = req.user?.type === 'customer' ? req.user.userId : undefined;
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
            // Saved addresses belong to accounts. Without a customer login there's nobody to check
            // ownership against, and a guest could otherwise pass any addressId, copy another
            // person's address onto their own order, and read it back from the order detail.
            if (!userId) throw new ForbiddenException('Sign in to use a saved address, or enter one.');
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

        // Shipping is priced per seller parcel from the buyer's pincode (live Shiprocket rates when
        // configured, otherwise our estimate table) — see ShippingRateService. The per-seller
        // breakdown is snapshotted on the order so a later rate change never rewrites history.
        const deliveryPincode = String((shippingAddress as { pincode?: unknown }).pincode ?? '');
        const shippingQuote = await ShippingRateService.quote(
            toQuoteItems(items as unknown as QuotableRow[]),
            deliveryPincode,
            payload.paymentMethod === 'cod'
        );
        const shippingFee = chargeableShippingPaise(shippingQuote, subtotal - discount);
        const total = subtotal - discount + shippingFee;

        // Commission is computed and snapshotted at checkout time, per seller — a later rate
        // change (platform default or a seller's override) never rewrites history for orders
        // already placed (see docs/PHASE3_ADDENDUM.md §1).
        const orderItems = [];
        for (const item of items) {
            const sellerId = item.variant.product.sellerId;
            const lineTotal = item.qty * item.priceAtAdd;
            const commissionRate = await CommissionUtil.getRateForSeller(sellerId);
            const { commissionAmount, sellerEarning } = CommissionUtil.compute(lineTotal, commissionRate);
            orderItems.push({
                variantId: item.variant.id,
                sellerId,
                productTitleSnapshot: item.variant.product.title,
                qty: item.qty,
                unitPrice: item.priceAtAdd,
                gstRateSnapshot: item.variant.product.gstRate,
                commissionRate,
                commissionAmount,
                sellerEarning
            });
        }

        const order = await CheckoutRepository.createOrderWithItems(
            {
                orderNumber: generateOrderNumber(),
                userId: userId || null,
                guestEmail: userId ? null : payload.guestEmail,
                status: 'pending',
                shippingAddress,
                shippingBreakdown: shippingQuote.shipments,
                subtotal,
                discount,
                shippingFee,
                gstAmount,
                total,
                couponId: coupon?.id || null
            },
            orderItems,
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
