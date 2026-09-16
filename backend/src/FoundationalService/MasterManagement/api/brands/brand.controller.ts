import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import BrandService from './brand.service';
import { BrandSchema, UpdateBrandSchema } from './validations/brand.validation';

class BrandController {
    public static async list(req: Request, res: Response) {
        try {
            const brands = await BrandService.list(req.query.search as string | undefined);
            return sendSuccess(res, HttpCode.OK, brands, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async create(req: Request, res: Response) {
        try {
            const payload = BrandSchema.parse(req.body);
            const brand = await BrandService.create(payload);
            return sendSuccess(res, HttpCode.CREATED, brand, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const payload = UpdateBrandSchema.parse(req.body);
            const brand = await BrandService.update(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, brand, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const result = await BrandService.remove(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default BrandController;
