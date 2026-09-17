import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import ProductService from './product.service';
import {
    ProductSchema,
    UpdateProductSchema,
    SellerProductSchema,
    UpdateSellerProductSchema,
    ProductListQuerySchema,
    UpdateInventorySchema
} from './validations/product.validation';

class ProductController {
    public static async list(req: Request, res: Response) {
        try {
            const query = ProductListQuerySchema.parse(req.query);
            const result = await ProductService.list(query, req);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async getBySlug(req: Request, res: Response) {
        try {
            const product = await ProductService.getBySlug(req.params.slug);
            return sendSuccess(res, HttpCode.OK, product, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async create(req: Request, res: Response) {
        try {
            const payload = ProductSchema.parse(req.body);
            const product = await ProductService.create(payload);
            return sendSuccess(res, HttpCode.CREATED, product, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const payload = UpdateProductSchema.parse(req.body);
            const product = await ProductService.update(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, product, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const result = await ProductService.archive(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async updateInventory(req: Request, res: Response) {
        try {
            const payload = UpdateInventorySchema.parse(req.body);
            const ownerSellerId = req.user?.type === 'seller' ? req.user.userId : undefined;
            const result = await ProductService.updateInventory(Number(req.params.id), payload, ownerSellerId);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async lowStock(req: Request, res: Response) {
        try {
            const threshold = Number(req.query.threshold) || 5;
            const products = await ProductService.lowStock(threshold);
            return sendSuccess(res, HttpCode.OK, products, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    /* ---- Seller self-service (sellerId always from req.user, never from the body) ---- */

    public static async sellerList(req: Request, res: Response) {
        try {
            const query = ProductListQuerySchema.parse(req.query);
            const result = await ProductService.listForSeller(req.user!.userId, query, req);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async sellerCreate(req: Request, res: Response) {
        try {
            const payload = SellerProductSchema.parse(req.body);
            const product = await ProductService.createAsSeller(payload, req.user!.userId);
            return sendSuccess(res, HttpCode.CREATED, product, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async sellerUpdate(req: Request, res: Response) {
        try {
            const payload = UpdateSellerProductSchema.parse(req.body);
            const product = await ProductService.updateAsSeller(Number(req.params.id), payload, req.user!.userId);
            return sendSuccess(res, HttpCode.OK, product, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async sellerRemove(req: Request, res: Response) {
        try {
            const result = await ProductService.archive(Number(req.params.id), req.user!.userId);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default ProductController;
