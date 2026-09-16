import CategoryRepository from './repository/category.repository';
import { slugify } from '../../../../Common/utils/Slugify';
import { DuplicateRecordException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { CategoryPayload, UpdateCategoryPayload } from './validations/category.validation';

class CategoryService {
    list(parentId?: string) {
        if (parentId === undefined) return CategoryRepository.findAll();
        return CategoryRepository.findAll(parentId ? Number(parentId) : null);
    }

    async create(payload: CategoryPayload) {
        const slug = payload.slug || slugify(payload.name);
        const existing = await CategoryRepository.findBySlug(slug);
        if (existing) throw new DuplicateRecordException('A category with this slug already exists.');
        return CategoryRepository.create({ ...payload, slug });
    }

    async update(id: number, payload: UpdateCategoryPayload) {
        const category = await CategoryRepository.findById(id);
        if (!category) throw new RecordNotFoundException('Category not found.');
        const data = { ...payload } as Record<string, unknown>;
        if (payload.name && !payload.slug) data.slug = slugify(payload.name);
        await CategoryRepository.update(id, data);
        return CategoryRepository.findById(id);
    }

    async remove(id: number) {
        const category = await CategoryRepository.findById(id);
        if (!category) throw new RecordNotFoundException('Category not found.');
        await CategoryRepository.remove(id);
        return { success: true };
    }
}

export default new CategoryService();
