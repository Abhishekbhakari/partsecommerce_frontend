import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { v4 as uuidv4 } from 'uuid';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import { BadRequestException } from '../../../../Common/httpErrorClasses';
import ProductRepository from './repository/product.repository';
import { Product, Category, Brand } from '../../../../Common/database/models';
import { slugify } from '../../../../Common/utils/Slugify';
import WinstonLogger from '../../../../Common/logger/WinstonLogger';

/**
 * Expected CSV columns: sku,title,categorySlug,brandSlug,partNumber,oemNumber,basePrice,gstRate,stock
 * Import runs synchronously for the scaffold (row count for 5-10k SKUs is manageable in-process);
 * swap for a queued job (BullMQ/Sidekiq-style) behind the same jobId contract for real bulk loads.
 */
class BulkImportExportController {
    public static async importCsv(req: Request, res: Response) {
        try {
            if (!req.file) {
                throw new BadRequestException('CSV file is required (multipart field name: file).');
            }

            const records: Record<string, string>[] = parse(req.file.buffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });

            const jobId = uuidv4();
            let created = 0;
            let updated = 0;
            const errors: { row: number; message: string }[] = [];

            for (let i = 0; i < records.length; i++) {
                const row = records[i];
                try {
                    const category = await Category.findOne({ where: { slug: row.categorySlug } });
                    const brand = await Brand.findOne({ where: { slug: row.brandSlug } });
                    if (!category || !brand) {
                        throw new Error('Unknown categorySlug or brandSlug.');
                    }

                    const existing = await ProductRepository.findBySku(row.sku);
                    const basePrice = Number(row.basePrice);
                    const gstRate = row.gstRate ? Number(row.gstRate) : 18;

                    if (existing) {
                        await ProductRepository.update(existing.id, {
                            title: row.title,
                            categoryId: category.id,
                            brandId: brand.id,
                            partNumber: row.partNumber || null,
                            oemNumber: row.oemNumber || null,
                            basePrice,
                            gstRate
                        });
                        updated++;
                    } else {
                        const product = await ProductRepository.create({
                            sku: row.sku,
                            title: row.title,
                            slug: slugify(row.title),
                            categoryId: category.id,
                            brandId: brand.id,
                            partNumber: row.partNumber || null,
                            oemNumber: row.oemNumber || null,
                            basePrice,
                            gstRate,
                            status: 'active'
                        });
                        await ProductRepository.createVariant(product.id, {
                            name: 'Standard',
                            stock: row.stock ? Number(row.stock) : 0
                        });
                        created++;
                    }
                } catch (rowError) {
                    errors.push({ row: i + 2, message: (rowError as Error).message });
                }
            }

            WinstonLogger.logger.log({
                message: `[BulkImport] job=${jobId} created=${created} updated=${updated} errors=${errors.length}`,
                level: 'info'
            });

            return sendSuccess(
                res,
                HttpCode.OK,
                { jobId, status: 'completed', created, updated, errors },
                'CSV import processed.'
            );
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async exportCsv(req: Request, res: Response) {
        try {
            let categoryId: number | undefined;
            if (req.query.category) {
                const category = await Category.findOne({ where: { slug: String(req.query.category) } });
                categoryId = category?.id;
            }
            const products = await Product.findAll({
                include: [
                    { model: Category, as: 'category' },
                    { model: Brand, as: 'brand' }
                ],
                where: categoryId ? { categoryId } : undefined
            });

            const rows = products.map((p) => ({
                sku: p.sku,
                title: p.title,
                categorySlug: (p as unknown as { category?: { slug: string } }).category?.slug || '',
                brandSlug: (p as unknown as { brand?: { slug: string } }).brand?.slug || '',
                partNumber: p.partNumber || '',
                oemNumber: p.oemNumber || '',
                basePrice: p.basePrice,
                gstRate: p.gstRate,
                status: p.status
            }));

            const csv = stringify(rows, { header: true });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="products-export.csv"');
            return res.status(HttpCode.OK).send(csv);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default BulkImportExportController;
