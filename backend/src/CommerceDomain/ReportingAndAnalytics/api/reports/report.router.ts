import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { ORDER_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import ReportController from './report.controller';

const reportRouter = Router();
reportRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...ORDER_MANAGER_ROLES));
reportRouter.get('/sales', ReportController.sales);
reportRouter.get('/inventory', ReportController.inventory);

export default reportRouter;
