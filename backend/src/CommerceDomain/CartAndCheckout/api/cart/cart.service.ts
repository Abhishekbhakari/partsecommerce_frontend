import { Request } from 'express';
import CartRepository from './repository/cart.repository';
import {
    BadRequestException,
    RecordNotFoundException,
    ValidationException
} from '../../../../Common/httpErrorClasses';
import { AddCartItemPayload, ApplyCouponPayload } from './validations/cart.validation';
import ShippingRateService, { chargeableShippingPaise, toQuoteItems, QuotableRow } from '../../../ShippingManagement/api/rates/shippingRate.service';

interface CartTotals {
    subtotal: number;
    discount: number;
    total: number;
}

class CartService {
    /** Resolves (and lazily creates) the cart for a logged-in user or guest session. */
    private async resolveCart(req: Request) {
        // Only a CUSTOMER token identifies a customer cart. Admin and seller tokens are separate
        // principals whose numeric ids overlap with customer ids (admin #1 and customer #1 are
        // different people) — trusting any token's userId here would hand an admin previewing the
        // store customer #1's cart, and let them edit it.
        if (req.user?.type === 'customer') {
            let cart = await CartRepository.findByUser(req.user.userId);
            if (!cart) cart = await CartRepository.create({ userId: req.user.userId });
            return cart;
        }
        const sessionId = req.cartSessionId;
        if (!sessionId) throw new BadRequestException('Cart session could not be resolved.');
        let cart = await CartRepository.findBySession(sessionId);
        if (!cart) cart = await CartRepository.create({ sessionId });
        return cart;
    }

    private computeTotals(cart: NonNullable<Awaited<ReturnType<typeof CartRepository.findById>>>): CartTotals {
        const items = (cart as unknown as { items: { qty: number; priceAtAdd: number }[] }).items || [];
        const subtotal = items.reduce((sum, item) => sum + item.qty * item.priceAtAdd, 0);

        const coupon = (cart as unknown as {
            coupon: {
                type: 'percentage' | 'flat';
                value: number;
                minOrderValue: number | null;
                maxDiscount: number | null;
            } | null;
        }).coupon;

        let discount = 0;
        if (coupon && (!coupon.minOrderValue || subtotal >= coupon.minOrderValue)) {
            discount = coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        }
        discount = Math.min(discount, subtotal);

        return { subtotal, discount, total: subtotal - discount };
    }

    async getCart(req: Request) {
        const cart = await this.resolveCart(req);
        const full = await CartRepository.findById(cart.id);
        return { ...full!.toJSON(), ...this.computeTotals(full!) };
    }

    async addItem(req: Request, payload: AddCartItemPayload) {
        const cart = await this.resolveCart(req);
        const variant = await CartRepository.findVariant(payload.variantId);
        if (!variant) throw new RecordNotFoundException('Product variant not found.');

        const product = (variant as unknown as { product: { basePrice: number; status: string } }).product;
        if (!product || product.status !== 'active') {
            throw new ValidationException('This product is not available for purchase.');
        }
        if (variant.stock < payload.qty) {
            throw new ValidationException('Insufficient stock for the requested quantity.');
        }

        const unitPrice = product.basePrice + variant.priceDelta;
        const existing = await CartRepository.findItem(cart.id, payload.variantId);
        if (existing) {
            await CartRepository.updateItem(existing.id, existing.qty + payload.qty);
        } else {
            await CartRepository.createItem({
                cartId: cart.id,
                variantId: payload.variantId,
                qty: payload.qty,
                priceAtAdd: unitPrice
            });
        }

        const full = await CartRepository.findById(cart.id);
        return { ...full!.toJSON(), ...this.computeTotals(full!) };
    }

    async updateItem(req: Request, itemId: number, qty: number) {
        const cart = await this.resolveCart(req);
        const item = await CartRepository.findItemById(itemId);
        if (!item || item.cartId !== cart.id) throw new RecordNotFoundException('Cart item not found.');
        await CartRepository.updateItem(itemId, qty);
        const full = await CartRepository.findById(cart.id);
        return { ...full!.toJSON(), ...this.computeTotals(full!) };
    }

    async removeItem(req: Request, itemId: number) {
        const cart = await this.resolveCart(req);
        const item = await CartRepository.findItemById(itemId);
        if (!item || item.cartId !== cart.id) throw new RecordNotFoundException('Cart item not found.');
        await CartRepository.removeItem(itemId);
        const full = await CartRepository.findById(cart.id);
        return { ...full!.toJSON(), ...this.computeTotals(full!) };
    }

    async applyCoupon(req: Request, payload: ApplyCouponPayload) {
        const cart = await this.resolveCart(req);
        const coupon = await CartRepository.findCouponByCode(payload.code);
        const now = new Date();
        if (!coupon || !coupon.active || coupon.validFrom > now || coupon.validTo < now) {
            throw new ValidationException('This coupon is invalid or has expired.');
        }
        await CartRepository.setCoupon(cart.id, coupon.id);
        const full = await CartRepository.findById(cart.id);
        return { ...full!.toJSON(), ...this.computeTotals(full!) };
    }

    async removeCoupon(req: Request) {
        const cart = await this.resolveCart(req);
        await CartRepository.setCoupon(cart.id, null);
        const full = await CartRepository.findById(cart.id);
        return { ...full!.toJSON(), ...this.computeTotals(full!) };
    }

    /**
     * Merges a guest (session-keyed) cart into a just-authenticated user's cart: sums quantities
     * for overlapping variants, adds the rest, then deletes the now-empty guest cart. Called from
     * CustomerAuthController after OTP verify / email login / register / Google auth issue tokens.
     * Silently no-ops if there's no session id or no guest cart — never blocks login.
     */
    async mergeGuestCartIntoUser(sessionId: string | undefined | null, userId: number): Promise<void> {
        if (!sessionId) return;
        const guestCart = await CartRepository.findBySession(sessionId);
        if (!guestCart || guestCart.userId) return; // already user-owned or doesn't exist

        const guestFull = await CartRepository.findById(guestCart.id);
        const guestItems = (guestFull as unknown as { items: { variantId: number; qty: number; priceAtAdd: number }[] } | null)?.items || [];

        if (guestItems.length > 0) {
            let userCart = await CartRepository.findByUser(userId);
            if (!userCart) userCart = await CartRepository.create({ userId });

            for (const item of guestItems) {
                const existing = await CartRepository.findItem(userCart.id, item.variantId);
                if (existing) {
                    await CartRepository.updateItem(existing.id, existing.qty + item.qty);
                } else {
                    await CartRepository.createItem({
                        cartId: userCart.id,
                        variantId: item.variantId,
                        qty: item.qty,
                        priceAtAdd: item.priceAtAdd
                    });
                }
            }
        }

        await CartRepository.deleteCart(guestCart.id);
    }

    /**
     * Delivery estimate for this cart to a pincode: serviceability + real shipping cost, priced per
     * seller parcel (see ShippingRateService). Every 6-digit pincode is treated as serviceable —
     * per-courier serviceability comes with live Shiprocket rates, which simply return no couriers
     * (and fall back to the estimate) for pincodes nobody serves.
     */
    async checkPincode(req: Request, pincode: string, cod: boolean) {
        const serviceable = /^\d{6}$/.test(pincode);
        if (!serviceable) return { serviceable: false, etaDays: null, shippingFee: null, shipments: [], live: ShippingRateService.isLive };

        const cart = await this.resolveCart(req);
        const full = await CartRepository.findById(cart.id);
        const rows = ((full as unknown as { items?: QuotableRow[] })?.items ?? []) as QuotableRow[];
        if (!rows.length) return { serviceable: true, etaDays: null, shippingFee: 0, shipments: [], live: ShippingRateService.isLive };

        const quote = await ShippingRateService.quote(toQuoteItems(rows), pincode, cod);
        const totals = this.computeTotals(full!);
        return {
            serviceable: true,
            etaDays: quote.etaDays,
            shippingFee: chargeableShippingPaise(quote, totals.total),
            shipments: quote.shipments,
            live: ShippingRateService.isLive
        };
    }
}

export default new CartService();
