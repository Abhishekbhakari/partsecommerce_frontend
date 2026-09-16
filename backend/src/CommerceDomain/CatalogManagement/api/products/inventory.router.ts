import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import ProductController from './product.controller';

const inventoryRouter = Router();
inventoryRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
inventoryRouter.get('/low-stock', ProductController.lowStock);

export default inventoryRouter;
