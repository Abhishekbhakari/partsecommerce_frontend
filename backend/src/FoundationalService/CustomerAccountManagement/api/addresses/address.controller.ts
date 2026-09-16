import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import AddressService from './address.service';
import { AddressSchema, UpdateAddressSchema } from './validations/address.validation';

class AddressController {
    public static async list(req: Request, res: Response) {
        try {
            const addresses = await AddressService.list(req.user!.userId);
            return sendSuccess(res, HttpCode.OK, addresses, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async create(req: Request, res: Response) {
        try {
            const payload = AddressSchema.parse(req.body);
            const address = await AddressService.create(req.user!.userId, payload);
            return sendSuccess(res, HttpCode.CREATED, address, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const payload = UpdateAddressSchema.parse(req.body);
            const address = await AddressService.update(req.user!.userId, Number(req.params.id), payload);
            return sendSuccess(res, HttpCode.OK, address, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const result = await AddressService.remove(req.user!.userId, Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default AddressController;
