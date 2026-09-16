import { Wishlist, Product, Brand, Category } from '../../../../../Common/database/models';

class WishlistRepository {
    async findAllForUser(userId: number) {
        const rows = await Wishlist.findAll({ where: { userId }, attributes: ['productId'] });
        const productIds = rows.map((r) => r.productId);
        if (!productIds.length) return [];
        return Product.findAll({
            where: { id: productIds },
            include: [
                { model: Brand, as: 'brand' },
                { model: Category, as: 'category' }
            ]
        });
    }

    exists(userId: number, productId: number) {
        return Wishlist.findOne({ where: { userId, productId } });
    }

    add(userId: number, productId: number) {
        return Wishlist.create({ userId, productId });
    }

    remove(userId: number, productId: number) {
        return Wishlist.destroy({ where: { userId, productId } });
    }
}

export default new WishlistRepository();
