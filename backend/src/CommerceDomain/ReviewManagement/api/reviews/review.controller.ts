import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import ReviewService from './review.service';
import { CreateReviewSchema, ModerateReviewSchema } from './validations/review.validation';
import { parsePagination } from '../../../../Common/utils/Pagination';

class ReviewController {
    public static async listForProduct(req: Request, res: Response) {
        try {
            const { page, pageSize, offset, limit } = parsePagination(req);
            const result = await ReviewService.listForProduct(Number(req.params.id), page, pageSize, offset, limit);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async create(req: Request, res: Response) {
        try {
            const payload = CreateReviewSchema.parse(req.body);
            const review = await ReviewService.create(Number(req.params.id), req.user!.userId, payload);
            return sendSuccess(res, HttpCode.CREATED, review, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async moderate(req: Request, res: Response) {
        try {
            const { status } = ModerateReviewSchema.parse(req.body);
            const review = await ReviewService.moderate(Number(req.params.id), status);
            return sendSuccess(res, HttpCode.OK, review, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const result = await ReviewService.remove(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default ReviewController;
