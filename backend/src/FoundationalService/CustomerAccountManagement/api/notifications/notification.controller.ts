import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import NotificationRepository from './repository/notification.repository';
import { parsePagination, buildPagination } from '../../../../Common/utils/Pagination';
import { ForbiddenException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';

class NotificationController {
    public static async list(req: Request, res: Response) {
        try {
            const { page, pageSize, offset, limit } = parsePagination(req);
            const { rows, count } = await NotificationRepository.findAllForUser(req.user!.userId, offset, limit);
            return sendSuccess(
                res,
                HttpCode.OK,
                { items: rows, ...buildPagination(count, page, pageSize) },
                HttpSuccessMessage.GET_ALL_RECORDS
            );
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async markRead(req: Request, res: Response) {
        try {
            const notification = await NotificationRepository.findById(Number(req.params.id));
            if (!notification) throw new RecordNotFoundException('Notification not found.');
            if (notification.userId !== req.user!.userId) throw new ForbiddenException();
            await NotificationRepository.markRead(notification.id);
            return sendSuccess(res, HttpCode.OK, { success: true }, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default NotificationController;
