import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import StaffService from './staff.service';
import { InviteStaffSchema, ChangeStaffRoleSchema } from './validations/staff.validation';

class StaffController {
    public static async list(_req: Request, res: Response) {
        try {
            const staff = await StaffService.list();
            return sendSuccess(res, HttpCode.OK, staff, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async invite(req: Request, res: Response) {
        try {
            const payload = InviteStaffSchema.parse(req.body);
            const staff = await StaffService.invite(payload);
            return sendSuccess(res, HttpCode.CREATED, staff, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async changeRole(req: Request, res: Response) {
        try {
            const { role } = ChangeStaffRoleSchema.parse(req.body);
            const staff = await StaffService.changeRole(Number(req.params.id), role);
            return sendSuccess(res, HttpCode.OK, staff, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const result = await StaffService.remove(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default StaffController;
