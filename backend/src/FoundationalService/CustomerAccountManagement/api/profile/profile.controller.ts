import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import ProfileService from './profile.service';
import { UpdateProfileSchema } from './validations/profile.validation';

class ProfileController {
    public static async getProfile(req: Request, res: Response) {
        try {
            const user = await ProfileService.getProfile(req.user!.userId);
            return sendSuccess(res, HttpCode.OK, user, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async updateProfile(req: Request, res: Response) {
        try {
            const payload = UpdateProfileSchema.parse(req.body);
            const user = await ProfileService.updateProfile(req.user!.userId, payload);
            return sendSuccess(res, HttpCode.OK, user, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default ProfileController;
