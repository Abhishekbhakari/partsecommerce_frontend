import { Op } from 'sequelize';
import { FitmentCompatibility, Product, Category, Brand } from '../../../../../Common/database/models';

class FitmentRepository {
    async lookup(make: string, model: string, year?: number, offset = 0, limit = 20) {
        const where: Record<string, unknown> = { make, model };
        if (year) {
            where.yearFrom = { [Op.lte]: year };
            where.yearTo = { [Op.gte]: year };
        }

        const matches = await FitmentCompatibility.findAll({ where, attributes: ['productId'] });
        const productIds = Array.from(new Set(matches.map((m) => m.productId)));
        if (!productIds.length) return { rows: [], count: 0 };

        const { rows, count } = await Product.findAndCountAll({
            where: { id: productIds, status: 'active' },
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' }
            ],
            offset,
            limit,
            distinct: true
        });
        return { rows, count };
    }

    async makes() {
        const rows = await FitmentCompatibility.findAll({
            attributes: ['make'],
            group: ['make'],
            order: [['make', 'ASC']]
        });
        return rows.map((r) => r.make);
    }

    async models(make?: string) {
        const rows = await FitmentCompatibility.findAll({
            where: make ? { make } : {},
            attributes: ['model'],
            group: ['model'],
            order: [['model', 'ASC']]
        });
        return rows.map((r) => r.model);
    }

    async years(make?: string, model?: string) {
        const where: Record<string, unknown> = {};
        if (make) where.make = make;
        if (model) where.model = model;
        const rows = await FitmentCompatibility.findAll({ where, attributes: ['yearFrom', 'yearTo'] });
        const years = new Set<number>();
        rows.forEach((r) => {
            for (let y = r.yearFrom; y <= r.yearTo; y++) years.add(y);
        });
        return Array.from(years).sort((a, b) => b - a);
    }
}

export default new FitmentRepository();
