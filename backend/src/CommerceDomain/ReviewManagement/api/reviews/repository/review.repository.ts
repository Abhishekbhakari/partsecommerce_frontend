import { Review, OrderItem, Order, User, Product } from '../../../../../Common/database/models';

class ReviewRepository {
    findAllForProduct(productId: number, offset: number, limit: number) {
        return Review.findAndCountAll({
            where: { productId, status: 'approved' },
            include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });
    }

    /** Confirms the user purchased this product via a delivered order item, for the "verified purchase" gate. */
    findVerifiedOrderItem(userId: number, productId: number) {
        return OrderItem.findOne({
            include: [
                { model: Order, as: 'order', where: { userId, status: ['delivered', 'shipped', 'confirmed', 'packed'] } },
                {
                    association: 'variant',
                    required: true,
                    include: [{ model: Product, as: 'product', where: { id: productId } }]
                }
            ]
        });
    }

    findExisting(userId: number, orderItemId: number) {
        return Review.findOne({ where: { userId, orderItemId } });
    }

    create(data: Record<string, unknown>) {
        return Review.create(data as never);
    }

    findById(id: number) {
        return Review.findByPk(id);
    }

    updateStatus(id: number, status: string) {
        return Review.update({ status: status as never }, { where: { id } });
    }

    remove(id: number) {
        return Review.destroy({ where: { id } });
    }

    async recalculateProductRating(productId: number) {
        const approved = await Review.findAll({ where: { productId, status: 'approved' } });
        const reviewCount = approved.length;
        const avgRating = reviewCount ? approved.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
        await Product.update({ avgRating, reviewCount }, { where: { id: productId } });
    }
}

export default new ReviewRepository();
