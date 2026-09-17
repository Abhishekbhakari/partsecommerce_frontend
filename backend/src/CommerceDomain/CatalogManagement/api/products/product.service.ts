import ProductRepository from './repository/product.repository';
import { slugify } from '../../../../Common/utils/Slugify';
import { buildPagination, parsePagination } from '../../../../Common/utils/Pagination';
import { DuplicateRecordException, ForbiddenException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import {
    ProductPayload,
    UpdateProductPayload,
    SellerProductPayload,
    UpdateSellerProductPayload,
    ProductListQuery,
    UpdateInventoryPayload
} from './validations/product.validation';
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

    /**
     * Shared create logic used by both the admin product controller (sellerId taken from the
     * payload's required `sellerId` field, i.e. admin picks/assigns the seller) and the seller
     * product controller (sellerId hard-coded from the authenticated seller, never trusted from
     * the request body — see SellerProductSchema which omits it entirely).
     */
    private async createInternal(payload: Omit<ProductPayload, 'sellerId'>, sellerId: number) {
        const existingSku = await ProductRepository.findBySku(payload.sku);
        if (existingSku) throw new DuplicateRecordException('A product with this SKU already exists.');

        const slug = payload.slug || slugify(payload.title);
        const { variants, fitment, ...productFields } = payload;

        const product = await ProductRepository.create({ ...productFields, slug, sellerId });

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

    /** Admin create — sellerId comes from (and is required in) the request payload. */
    async create(payload: ProductPayload) {
        const { sellerId, ...rest } = payload;
        return this.createInternal(rest, sellerId);
    }

    /** Seller create — sellerId is always the authenticated seller, never from the payload. */
    async createAsSeller(payload: SellerProductPayload, sellerId: number) {
        return this.createInternal(payload, sellerId);
    }

    /**
     * Shared update logic. When `ownerSellerId` is provided (seller path), the product must
     * belong to that seller — otherwise a 403 is thrown — and `sellerId` reassignment is not
     * permitted even if present on the payload type. Admin calls (`ownerSellerId` undefined)
     * may reassign the owning seller.
     */
    private async updateInternal(
        id: number,
        payload: UpdateProductPayload | UpdateSellerProductPayload,
        ownerSellerId?: number
    ) {
        const product = await ProductRepository.findById(id);
        if (!product) throw new RecordNotFoundException('Product not found.');
        if (ownerSellerId !== undefined && product.sellerId !== ownerSellerId) {
            throw new ForbiddenException('You do not own this product.');
        }

        const { variants, fitment, ...productFields } = payload as UpdateProductPayload;
        const data = { ...productFields } as Record<string, unknown>;
        if (ownerSellerId !== undefined) delete data.sellerId; // never trust seller-supplied reassignment
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

    async update(id: number, payload: UpdateProductPayload) {
        return this.updateInternal(id, payload);
    }

    async updateAsSeller(id: number, payload: UpdateSellerProductPayload, sellerId: number) {
        return this.updateInternal(id, payload, sellerId);
    }

    async archive(id: number, ownerSellerId?: number) {
        const product = await ProductRepository.findById(id);
        if (!product) throw new RecordNotFoundException('Product not found.');
        if (ownerSellerId !== undefined && product.sellerId !== ownerSellerId) {
            throw new ForbiddenException('You do not own this product.');
        }
        await ProductRepository.archive(id);
        return { success: true };
    }

    async listForSeller(sellerId: number, query: ProductListQuery, req: Request) {
        const { page, pageSize, offset, limit } = parsePagination(req);
        const { rows, count } = await ProductRepository.findAndCountForSeller(sellerId, query, offset, limit);
        return { items: rows, ...buildPagination(count, page, pageSize) };
    }

    async updateInventory(productId: number, payload: UpdateInventoryPayload, ownerSellerId?: number) {
        const variant = await ProductRepository.findVariantById(payload.variantId);
        if (!variant || variant.productId !== productId) {
            throw new RecordNotFoundException('Variant not found for this product.');
        }
        if (ownerSellerId !== undefined) {
            const product = await ProductRepository.findById(productId);
            if (!product || product.sellerId !== ownerSellerId) {
                throw new ForbiddenException('You do not own this product.');
            }
        }
        await ProductRepository.updateVariant(payload.variantId, { stock: payload.stock });
        return { success: true };
    }

    lowStock(threshold: number) {
        return ProductRepository.lowStock(threshold);
    }
}

export default new ProductService();
