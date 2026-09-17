/**
 * Idempotent data seed: super-admin user + a handful of sample categories/brands/products
 * so the API is testable end to end. Run with `npm run db:seed` after migrations.
 */
import '../../Common/database/config/database';
import sequelize from '../../Common/database/config/sequelize';
import { AdminUser, Category, Brand, Product, ProductVariant, FitmentCompatibility, Seller } from '../models';
import PasswordUtil from '../../Common/utils/PasswordUtil';
import { slugify } from '../../Common/utils/Slugify';
import WinstonLogger from '../../Common/logger/WinstonLogger';

async function seedSystemSeller() {
    const email = 'system-seller@spareparts.local';
    const existing = await Seller.findOne({ where: { email } });
    if (existing) return existing;

    const passwordHash = await PasswordUtil.hash('NotALoginPassword!23');
    return Seller.create({
        businessName: 'PartsHub Direct',
        email,
        passwordHash,
        phone: '0000000000',
        status: 'approved',
        approvedAt: new Date()
    });
}

async function seedSuperAdmin() {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@spareparts.local';
    const existing = await AdminUser.findOne({ where: { email } });
    if (existing) return existing;

    const passwordHash = await PasswordUtil.hash(process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!');
    return AdminUser.create({
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email,
        passwordHash,
        role: 'owner',
        active: true
    });
}

async function seedCategory(name: string) {
    const slug = slugify(name);
    const [category] = await Category.findOrCreate({ where: { slug }, defaults: { name, slug } });
    return category;
}

async function seedBrand(name: string) {
    const slug = slugify(name);
    const [brand] = await Brand.findOrCreate({ where: { slug }, defaults: { name, slug } });
    return brand;
}

async function seedProduct(opts: {
    sku: string;
    title: string;
    categoryId: number;
    brandId: number;
    sellerId: number;
    partNumber: string;
    oemNumber: string;
    basePrice: number;
    fitment: { make: string; model: string; yearFrom: number; yearTo: number };
}) {
    const slug = slugify(opts.title);
    const [product] = await Product.findOrCreate({
        where: { sku: opts.sku },
        defaults: {
            sku: opts.sku,
            title: opts.title,
            slug,
            description: `${opts.title} — genuine-fit replacement spare part.`,
            categoryId: opts.categoryId,
            brandId: opts.brandId,
            sellerId: opts.sellerId,
            partNumber: opts.partNumber,
            oemNumber: opts.oemNumber,
            basePrice: opts.basePrice,
            gstRate: 18,
            images: [],
            status: 'active'
        }
    });

    await ProductVariant.findOrCreate({
        where: { productId: product.id, name: 'Standard' },
        defaults: { productId: product.id, name: 'Standard', priceDelta: 0, stock: 50 }
    });

    await FitmentCompatibility.findOrCreate({
        where: {
            productId: product.id,
            make: opts.fitment.make,
            model: opts.fitment.model
        },
        defaults: {
            productId: product.id,
            make: opts.fitment.make,
            model: opts.fitment.model,
            yearFrom: opts.fitment.yearFrom,
            yearTo: opts.fitment.yearTo
        }
    });

    return product;
}

async function run() {
    await sequelize.authenticate();

    const admin = await seedSuperAdmin();
    WinstonLogger.logger.log({ message: `[seed] Super admin ready: ${admin.email}`, level: 'info' });

    const systemSeller = await seedSystemSeller();
    WinstonLogger.logger.log({ message: `[seed] System seller ready: ${systemSeller.email}`, level: 'info' });

    const brakes = await seedCategory('Brakes');
    const suspension = await seedCategory('Suspension');
    const filters = await seedCategory('Filters & Fluids');

    const bosch = await seedBrand('Bosch');
    const mrf = await seedBrand('MRF');
    const generic = await seedBrand('Generic');

    await seedProduct({
        sku: 'BRK-PAD-001',
        title: 'Front Brake Pad Set',
        categoryId: brakes.id,
        brandId: bosch.id,
        sellerId: systemSeller.id,
        partNumber: 'BP-4521',
        oemNumber: 'OEM-77123',
        basePrice: 129900,
        fitment: { make: 'Maruti Suzuki', model: 'Swift', yearFrom: 2018, yearTo: 2024 }
    });

    await seedProduct({
        sku: 'SUS-SHK-001',
        title: 'Front Shock Absorber',
        categoryId: suspension.id,
        brandId: generic.id,
        sellerId: systemSeller.id,
        partNumber: 'SA-9981',
        oemNumber: 'OEM-55210',
        basePrice: 249900,
        fitment: { make: 'Hyundai', model: 'i20', yearFrom: 2015, yearTo: 2022 }
    });

    await seedProduct({
        sku: 'FLT-OIL-001',
        title: 'Engine Oil Filter',
        categoryId: filters.id,
        brandId: mrf.id,
        sellerId: systemSeller.id,
        partNumber: 'OF-1123',
        oemNumber: 'OEM-33019',
        basePrice: 34900,
        fitment: { make: 'Tata', model: 'Nexon', yearFrom: 2017, yearTo: 2024 }
    });

    WinstonLogger.logger.log({ message: '[seed] Sample catalog seeded.', level: 'info' });
    process.exit(0);
}

run().catch((error) => {
    WinstonLogger.logger.log({ message: `[seed] Failed: ${String(error)}`, level: 'error' });
    process.exit(1);
});
