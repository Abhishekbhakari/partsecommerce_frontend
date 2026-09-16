import { Category } from '../../../../../Common/database/models';

class CategoryRepository {
    findAll(parentId?: number | null) {
        const where = parentId !== undefined ? { parentId } : {};
        return Category.findAll({ where, order: [['sortOrder', 'ASC'], ['name', 'ASC']] });
    }

    findById(id: number) {
        return Category.findByPk(id);
    }

    findBySlug(slug: string) {
        return Category.findOne({ where: { slug } });
    }

    create(data: Record<string, unknown>) {
        return Category.create(data as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Category.update(data, { where: { id } });
    }

    remove(id: number) {
        return Category.destroy({ where: { id } });
    }
}

export default new CategoryRepository();
