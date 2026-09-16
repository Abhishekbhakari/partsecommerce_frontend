import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import CategoryService from './category.service';
import { CategorySchema, UpdateCategorySchema } from './validations/category.validation';

class CategoryController {
    public static async list(req: Request, res: Response) {
        try {
            const categories = await CategoryService.list(req.query.parentId as string | undefined);
            return sendSuccess(res, HttpCode.OK, categories, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async create(req: Request, res: Response) {
        try {
            const payload = CategorySchema.parse(req.body);
            const category = await CategoryService.create(payload);
            return sendSuccess(res, HttpCode.CREATED, category, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const payload = UpdateCategorySchema.parse(req.body);
            const category = await CategoryService.update(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, category, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const result = await CategoryService.remove(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default CategoryController;
