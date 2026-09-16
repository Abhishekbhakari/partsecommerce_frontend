import BrandRepository from './repository/brand.repository';
import { slugify } from '../../../../Common/utils/Slugify';
import { DuplicateRecordException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { BrandPayload, UpdateBrandPayload } from './validations/brand.validation';

class BrandService {
    list(search?: string) {
        return BrandRepository.findAll(search);
    }

    async create(payload: BrandPayload) {
        const slug = payload.slug || slugify(payload.name);
        const existing = await BrandRepository.findBySlug(slug);
        if (existing) throw new DuplicateRecordException('A brand with this slug already exists.');
        return BrandRepository.create({ ...payload, slug });
    }

    async update(id: number, payload: UpdateBrandPayload) {
        const brand = await BrandRepository.findById(id);
        if (!brand) throw new RecordNotFoundException('Brand not found.');
        const data = { ...payload } as Record<string, unknown>;
        if (payload.name && !payload.slug) data.slug = slugify(payload.name);
        await BrandRepository.update(id, data);
        return BrandRepository.findById(id);
    }

    async remove(id: number) {
        const brand = await BrandRepository.findById(id);
        if (!brand) throw new RecordNotFoundException('Brand not found.');
        await BrandRepository.remove(id);
        return { success: true };
    }
}

export default new BrandService();
