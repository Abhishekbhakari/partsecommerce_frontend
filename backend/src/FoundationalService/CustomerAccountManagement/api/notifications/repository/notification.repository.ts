import { Notification } from '../../../../../Common/database/models';

class NotificationRepository {
    findAllForUser(userId: number, offset: number, limit: number) {
        return Notification.findAndCountAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });
    }

    findById(id: number) {
        return Notification.findByPk(id);
    }

    markRead(id: number) {
        return Notification.update({ readAt: new Date() }, { where: { id } });
    }
}

export default new NotificationRepository();
