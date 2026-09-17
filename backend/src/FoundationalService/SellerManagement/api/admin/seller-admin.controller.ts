import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import { parsePagination } from '../../../../Common/utils/Pagination';
import SellerAdminService from './seller-admin.service';
import {
    SellerListQuerySchema,
    RejectSellerSchema,
    SetCommissionSchema,
    GeneratePayoutSchema
} from './validations/seller-admin.validation';

class SellerAdminController {
    public static async list(req: Request, res: Response) {
        try {
            const query = SellerListQuerySchema.parse(req.query);
            const { page, pageSize, offset, limit } = parsePagination(req);
            const result = await SellerAdminService.list(query.status, page, pageSize, offset, limit);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async getById(req: Request, res: Response) {
        try {
            const seller = await SellerAdminService.getById(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, seller, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async approve(req: Request, res: Response) {
        try {
            const seller = await SellerAdminService.approve(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, seller, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async reject(req: Request, res: Response) {
        try {
            const payload = RejectSellerSchema.parse(req.body);
            const seller = await SellerAdminService.reject(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, seller, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async suspend(req: Request, res: Response) {
        try {
            const seller = await SellerAdminService.suspend(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, seller, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async setCommission(req: Request, res: Response) {
        try {
            const payload = SetCommissionSchema.parse(req.body);
            const seller = await SellerAdminService.setCommission(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, seller, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async generatePayout(req: Request, res: Response) {
        try {
            const payload = GeneratePayoutSchema.parse(req.body);
            const payout = await SellerAdminService.generatePayout(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.CREATED, payout, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async markPayoutPaid(req: Request, res: Response) {
        try {
            const payout = await SellerAdminService.markPayoutPaid(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, payout, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default SellerAdminController;
