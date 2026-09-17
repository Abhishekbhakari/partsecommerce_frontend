import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import { parsePagination } from '../../../../Common/utils/Pagination';
import SellerPortalService from './seller-portal.service';
import { FulfillmentUpdateSchema } from './validations/seller-portal.validation';

class SellerPortalController {
    public static async dashboard(req: Request, res: Response) {
        try {
            const result = await SellerPortalService.dashboard(req.user!.userId);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async listOrderItems(req: Request, res: Response) {
        try {
            const { page, pageSize, offset, limit } = parsePagination(req);
            const result = await SellerPortalService.listOrderItems(req.user!.userId, page, pageSize, offset, limit);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async updateFulfillment(req: Request, res: Response) {
        try {
            const payload = FulfillmentUpdateSchema.parse(req.body);
            const result = await SellerPortalService.updateFulfillment(
                Number(req.params.orderItemId),
                req.user!.userId,
                payload
            );
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async listPayouts(req: Request, res: Response) {
        try {
            const result = await SellerPortalService.listPayouts(req.user!.userId);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default SellerPortalController;
