import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import UploadService from './upload.service';

class UploadController {
    public static async uploadImage(req: Request, res: Response) {
        try {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const result = await UploadService.saveImage(req.file, baseUrl);
            return sendSuccess(res, HttpCode.CREATED, result, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async removeImage(req: Request, res: Response) {
        try {
            const result = await UploadService.removeImage(req.params.filename);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default UploadController;
