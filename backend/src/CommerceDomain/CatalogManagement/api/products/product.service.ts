import ProductRepository from './repository/product.repository';
import { slugify } from '../../../../Common/utils/Slugify';
import { buildPagination, parsePagination } from '../../../../Common/utils/Pagination';
import { DuplicateRecordException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { ProductPayload, UpdateProductPayload, ProductListQuery, UpdateInventoryPayload } from './validations/product.validation';
import { Request } from 'express';

class ProductService {
    async list(query: ProductListQuery, req: Request) {
        const { page, pageSize, offset, limit } = parsePagination(req);
        const { rows, count } = await ProductRepository.findAndCount(query, offset, limit);
        return { items: rows, ...buildPagination(count, page, pageSize) };
    }

    async getBySlug(slug: string) {
        const product = await ProductRepository.findBySlug(slug);
        if (!product) throw new RecordNotFoundException('Product not found.');
        return product;
    }

    async create(payload: ProductPayload) {
        const existingSku = await ProductRepository.findBySku(payload.sku);
        if (existingSku) throw new DuplicateRecordException('A product with this SKU already exists.');

        const slug = payload.slug || slugify(payload.title);
        const { variants, fitment, ...productFields } = payload;

        const product = await ProductRepository.create({ ...productFields, slug });

        if (variants?.length) {
            for (const variant of variants) {
                await ProductRepository.createVariant(product.id, variant);
            }
        } else {
            await ProductRepository.createVariant(product.id, { name: 'Standard', priceDelta: 0, stock: 0 });
        }

        if (fitment?.length) {
            await ProductRepository.replaceFitment(product.id, fitment);
        }

        return ProductRepository.findById(product.id);
    }

    async update(id: number, payload: UpdateProductPayload) {
        const product = await ProductRepository.findById(id);
        if (!product) throw new RecordNotFoundException('Product not found.');

        const { variants, fitment, ...productFields } = payload;
        const data = { ...productFields } as Record<string, unknown>;
        if (payload.title && !payload.slug) data.slug = slugify(payload.title);

        if (Object.keys(data).length) {
            await ProductRepository.update(id, data);
        }

        if (variants?.length) {
            for (const variant of variants) {
                if (variant.id) {
                    await ProductRepository.updateVariant(variant.id, variant);
                } else {
                    await ProductRepository.createVariant(id, variant);
                }
            }
        }

        if (fitment) {
            await ProductRepository.replaceFitment(id, fitment);
        }

        return ProductRepository.findById(id);
    }

    async archive(id: number) {
        const product = await ProductRepository.findById(id);
        if (!product) throw new RecordNotFoundException('Product not found.');
        await ProductRepository.archive(id);
        return { success: true };
    }

    async updateInventory(productId: number, payload: UpdateInventoryPayload) {
        const variant = await ProductRepository.findVariantById(payload.variantId);
        if (!variant || variant.productId !== productId) {
            throw new RecordNotFoundException('Variant not found for this product.');
        }
        await ProductRepository.updateVariant(payload.variantId, { stock: payload.stock });
        return { success: true };
    }

    lowStock(threshold: number) {
        return ProductRepository.lowStock(threshold);
    }
}

export default new ProductService();
