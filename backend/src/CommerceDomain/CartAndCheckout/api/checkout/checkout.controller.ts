import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import CheckoutService from './checkout.service';
import { CheckoutSchema } from './validations/checkout.validation';

class CheckoutController {
    public static async checkout(req: Request, res: Response) {
        try {
            const payload = CheckoutSchema.parse(req.body);
            const result = await CheckoutService.checkout(req, payload);
            return sendSuccess(res, HttpCode.CREATED, result, 'Order created successfully.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default CheckoutController;
