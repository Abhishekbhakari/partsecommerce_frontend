import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import NotificationAdminController from './notificationAdmin.controller';

const notificationAdminRouter = Router();
notificationAdminRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
notificationAdminRouter.post('/broadcast', NotificationAdminController.broadcast);

export default notificationAdminRouter;
