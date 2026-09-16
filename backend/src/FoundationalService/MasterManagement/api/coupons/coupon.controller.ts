import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import CouponService from './coupon.service';
import { CouponSchema, UpdateCouponSchema } from './validations/coupon.validation';

class CouponController {
    public static async list(_req: Request, res: Response) {
        try {
            const coupons = await CouponService.list();
            return sendSuccess(res, HttpCode.OK, coupons, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async create(req: Request, res: Response) {
        try {
            const payload = CouponSchema.parse(req.body);
            const coupon = await CouponService.create(payload);
            return sendSuccess(res, HttpCode.CREATED, coupon, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const payload = UpdateCouponSchema.parse(req.body);
            const coupon = await CouponService.update(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, coupon, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const result = await CouponService.remove(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default CouponController;
