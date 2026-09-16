import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import NotificationController from './notification.controller';

const notificationRouter = Router();

notificationRouter.use(TokenMiddleware.requireCustomerAuth);
notificationRouter.get('/notifications', NotificationController.list);
notificationRouter.patch('/notifications/:id/read', NotificationController.markRead);

export default notificationRouter;
