import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import { BroadcastSchema } from './validations/broadcast.validation';
import { User, Notification } from '../../../../Common/database/models';
import WinstonLogger from '../../../../Common/logger/WinstonLogger';

/**
 * Broadcasts are queued as `Notification` rows for every user matching `segment` (only
 * `all` is implemented here — extend with real segmentation query as the customer model
 * grows). Actual delivery is stubbed behind the same swappable-sender pattern as OTP.
 */
class NotificationAdminController {
    public static async broadcast(req: Request, res: Response) {
        try {
            const payload = BroadcastSchema.parse(req.body);
            const jobId = uuidv4();

            const users = payload.segment === 'all' ? await User.findAll({ attributes: ['id'] }) : [];

            await Notification.bulkCreate(
                users.map((u) => ({
                    userId: u.id,
                    channel: payload.channel,
                    type: payload.template,
                    payload: payload.params || {},
                    status: 'queued'
                })) as never,
                { validate: true }
            );

            WinstonLogger.logger.log({
                message: `[Broadcast] job=${jobId} segment=${payload.segment} channel=${payload.channel} recipients=${users.length}`,
                level: 'info'
            });

            return sendSuccess(res, HttpCode.OK, { jobId }, 'Broadcast queued.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default NotificationAdminController;
