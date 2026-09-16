import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { ORDER_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import OrderController from './order.controller';

const orderAdminRouter = Router();
orderAdminRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...ORDER_MANAGER_ROLES));
orderAdminRouter.get('/', OrderController.listAdmin);
orderAdminRouter.patch('/:id/status', OrderController.updateStatus);

const customerAdminRouter = Router();
customerAdminRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...ORDER_MANAGER_ROLES));
customerAdminRouter.get('/', OrderController.listCustomers);
customerAdminRouter.get('/:id', OrderController.getCustomer);

export { orderAdminRouter, customerAdminRouter };
