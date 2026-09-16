import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import PaymentService from './payment.service';
import { CreateIntentSchema, VerifyPaymentSchema, RefundSchema } from './validations/payment.validation';
import { BadRequestException } from '../../../../Common/httpErrorClasses';

class PaymentController {
    public static async createIntent(req: Request, res: Response) {
        try {
            const payload = CreateIntentSchema.parse(req.body);
            const result = await PaymentService.createIntent(payload);
            return sendSuccess(res, HttpCode.OK, result, 'Payment intent created.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async verify(req: Request, res: Response) {
        try {
            const payload = VerifyPaymentSchema.parse(req.body);
            const result = await PaymentService.verify(payload);
            return sendSuccess(res, HttpCode.OK, result, 'Payment verified.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async webhook(req: Request, res: Response) {
        try {
            const result = await PaymentService.handleWebhook(req.body);
            return sendSuccess(res, HttpCode.OK, result, 'Webhook processed.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async refund(req: Request, res: Response) {
        try {
            const payload = RefundSchema.parse(req.body);
            const result = await PaymentService.refund(Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, result, 'Refund initiated.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async codEligibility(req: Request, res: Response) {
        try {
            const pincode = String(req.query.pincode || '');
            const amount = Number(req.query.amount);
            if (!pincode || !amount) throw new BadRequestException('pincode and amount query params are required.');
            const result = PaymentService.codEligibility(pincode, amount);
            return sendSuccess(res, HttpCode.OK, result, 'Eligibility checked.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default PaymentController;
