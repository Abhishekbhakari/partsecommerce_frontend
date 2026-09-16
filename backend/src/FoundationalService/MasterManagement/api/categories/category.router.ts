import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import CategoryController from './category.controller';

const categoryRouter = Router();
const adminRouter = Router();

categoryRouter.get('/', CategoryController.list);

adminRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
adminRouter.post('/', CategoryController.create);
adminRouter.patch('/:id', CategoryController.update);
adminRouter.delete('/:id', CategoryController.remove);

export { categoryRouter, adminRouter as categoryAdminRouter };
