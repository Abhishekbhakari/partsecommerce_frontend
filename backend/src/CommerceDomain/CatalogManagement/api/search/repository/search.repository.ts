import { Op } from 'sequelize';
import { Product, Category, Brand } from '../../../../../Common/database/models';

class SearchRepository {
    async autocomplete(q: string) {
        const products = await Product.findAll({
            where: {
                status: 'active',
                [Op.or]: [
                    { title: { [Op.iLike]: `%${q}%` } },
                    { partNumber: { [Op.iLike]: `%${q}%` } },
                    { oemNumber: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: 8,
            order: [['reviewCount', 'DESC']]
        });
        const suggestions = Array.from(new Set(products.map((p) => p.title)));
        return { suggestions, products };
    }

    async fullSearch(q: string, offset: number, limit: number) {
        return Product.findAndCountAll({
            where: {
                status: 'active',
                [Op.or]: [
                    { title: { [Op.iLike]: `%${q}%` } },
                    { partNumber: { [Op.iLike]: `%${q}%` } },
                    { oemNumber: { [Op.iLike]: `%${q}%` } },
                    { sku: { [Op.iLike]: `%${q}%` } }
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' }
            ],
            offset,
            limit,
            distinct: true
        });
    }
}

export default new SearchRepository();
