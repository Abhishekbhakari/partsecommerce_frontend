import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import BrandController from './brand.controller';

const brandRouter = Router();
const adminRouter = Router();

brandRouter.get('/', BrandController.list);

adminRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
adminRouter.post('/', BrandController.create);
adminRouter.patch('/:id', BrandController.update);
adminRouter.delete('/:id', BrandController.remove);

export { brandRouter, adminRouter as brandAdminRouter };
