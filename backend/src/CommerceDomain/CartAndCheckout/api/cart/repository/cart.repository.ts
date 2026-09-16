import {
    Cart,
    CartItem,
    ProductVariant,
    Product,
    Coupon
} from '../../../../../Common/database/models';

class CartRepository {
    findByUser(userId: number) {
        return Cart.findOne({ where: { userId } });
    }

    findBySession(sessionId: string) {
        return Cart.findOne({ where: { sessionId } });
    }

    create(data: { userId?: number | null; sessionId?: string | null }) {
        return Cart.create(data as never);
    }

    findById(id: number) {
        return Cart.findByPk(id, {
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }]
                },
                { model: Coupon, as: 'coupon' }
            ]
        });
    }

    findItem(cartId: number, variantId: number) {
        return CartItem.findOne({ where: { cartId, variantId } });
    }

    findItemById(id: number) {
        return CartItem.findByPk(id);
    }

    createItem(data: { cartId: number; variantId: number; qty: number; priceAtAdd: number }) {
        return CartItem.create(data);
    }

    updateItem(id: number, qty: number) {
        return CartItem.update({ qty }, { where: { id } });
    }

    removeItem(id: number) {
        return CartItem.destroy({ where: { id } });
    }

    setCoupon(cartId: number, couponId: number | null) {
        return Cart.update({ couponId }, { where: { id: cartId } });
    }

    findVariant(id: number) {
        return ProductVariant.findByPk(id, { include: [{ model: Product, as: 'product' }] });
    }

    findCouponByCode(code: string) {
        return Coupon.findOne({ where: { code: code.toUpperCase() } });
    }

    deleteCart(id: number) {
        return Cart.destroy({ where: { id } });
    }
}

export default new CartRepository();
