import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import ShipmentService from './shipment.service';
import { CreateShipmentSchema } from './validations/shipment.validation';

class ShipmentController {
    public static async create(req: Request, res: Response) {
        try {
            const payload = CreateShipmentSchema.parse(req.body);
            const shipment = await ShipmentService.create(payload);
            return sendSuccess(res, HttpCode.CREATED, shipment, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async track(req: Request, res: Response) {
        try {
            const result = await ShipmentService.track(Number(req.params.orderId), req.user);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async webhook(req: Request, res: Response) {
        try {
            const result = await ShipmentService.handleWebhook(req.body);
            return sendSuccess(res, HttpCode.OK, result, 'Webhook processed.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default ShipmentController;
