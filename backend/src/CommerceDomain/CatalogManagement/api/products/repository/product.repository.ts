import { Op, WhereOptions, Order } from 'sequelize';
import {
    Product,
    ProductVariant,
    FitmentCompatibility,
    Category,
    Brand,
    Seller
} from '../../../../../Common/database/models';
import { ProductListQuery } from '../validations/product.validation';

const SELLER_LITE_INCLUDE = { model: Seller, as: 'seller', attributes: ['id', 'businessName'] };

const SORT_MAP: Record<string, Order> = {
    price_asc: [['basePrice', 'ASC']],
    price_desc: [['basePrice', 'DESC']],
    newest: [['createdAt', 'DESC']],
    rating: [['avgRating', 'DESC']],
    // "Most Popular" — reviewCount is the closest signal we track to real popularity/sales rank.
    popular: [['reviewCount', 'DESC'], ['avgRating', 'DESC']]
};

class ProductRepository {
    async findAndCount(query: ProductListQuery, offset: number, limit: number) {
        const where: Record<string | symbol, unknown> = { status: 'active' };

        if (query.category) {
            const category = await Category.findOne({ where: { slug: query.category } });
            if (category) where.categoryId = category.id;
        }
        if (query.brand) {
            const brand = await Brand.findOne({ where: { slug: query.brand } });
            if (brand) where.brandId = brand.id;
        }
        if (query.priceMin !== undefined || query.priceMax !== undefined) {
            where.basePrice = {
                ...(query.priceMin !== undefined ? { [Op.gte]: query.priceMin } : {}),
                ...(query.priceMax !== undefined ? { [Op.lte]: query.priceMax } : {})
            };
        }
        if (query.q) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${query.q}%` } },
                { partNumber: { [Op.iLike]: `%${query.q}%` } },
                { oemNumber: { [Op.iLike]: `%${query.q}%` } },
                { sku: { [Op.iLike]: `%${query.q}%` } }
            ];
        }

        return Product.findAndCountAll({
            where: where as WhereOptions,
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                SELLER_LITE_INCLUDE
            ],
            order: query.sort ? SORT_MAP[query.sort] : [['createdAt', 'DESC']],
            offset,
            limit,
            distinct: true
        });
    }

    findBySlug(slug: string) {
        return Product.findOne({
            where: { slug },
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants' },
                { model: FitmentCompatibility, as: 'fitment' },
                SELLER_LITE_INCLUDE
            ]
        });
    }

    /** Seller's own product management view — every status, not just 'active'. */
    async findAndCountForSeller(sellerId: number, query: ProductListQuery, offset: number, limit: number) {
        const where: Record<string | symbol, unknown> = { sellerId };
        if (query.q) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${query.q}%` } },
                { sku: { [Op.iLike]: `%${query.q}%` } }
            ];
        }
        return Product.findAndCountAll({
            where: where as WhereOptions,
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants' }
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit,
            distinct: true
        });
    }

    findById(id: number) {
        return Product.findByPk(id, {
            include: [
                { model: ProductVariant, as: 'variants' },
                { model: FitmentCompatibility, as: 'fitment' }
            ]
        });
    }

    findBySku(sku: string) {
        return Product.findOne({ where: { sku } });
    }

    create(data: Record<string, unknown>) {
        return Product.create(data as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Product.update(data, { where: { id } });
    }

    archive(id: number) {
        return Product.update({ status: 'archived' }, { where: { id } });
    }

    createVariant(productId: number, data: Record<string, unknown>) {
        return ProductVariant.create({ ...data, productId } as never);
    }

    updateVariant(id: number, data: Record<string, unknown>) {
        return ProductVariant.update(data, { where: { id } });
    }

    replaceFitment(productId: number, rows: Record<string, unknown>[]) {
        return FitmentCompatibility.destroy({ where: { productId } }).then(() =>
            rows.length
                ? FitmentCompatibility.bulkCreate(rows.map((r) => ({ ...r, productId })) as never)
                : Promise.resolve([])
        );
    }

    findVariantById(id: number) {
        return ProductVariant.findByPk(id);
    }

    lowStock(threshold: number) {
        return Product.findAll({
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    where: { stock: { [Op.lte]: threshold } }
                }
            ]
        });
    }
}

export default new ProductRepository();
