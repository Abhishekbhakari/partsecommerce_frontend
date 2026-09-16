import { Op } from 'sequelize';
import { Brand } from '../../../../../Common/database/models';

class BrandRepository {
    findAll(search?: string) {
        const where = search ? { name: { [Op.iLike]: `%${search}%` } } : {};
        return Brand.findAll({ where, order: [['name', 'ASC']] });
    }

    findById(id: number) {
        return Brand.findByPk(id);
    }

    findBySlug(slug: string) {
        return Brand.findOne({ where: { slug } });
    }

    create(data: Record<string, unknown>) {
        return Brand.create(data as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Brand.update(data, { where: { id } });
    }

    remove(id: number) {
        return Brand.destroy({ where: { id } });
    }
}

export default new BrandRepository();
