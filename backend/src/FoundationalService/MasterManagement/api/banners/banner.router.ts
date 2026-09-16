import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import BannerController from './banner.controller';

const bannerRouter = Router();

bannerRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
bannerRouter.get('/', BannerController.list);
bannerRouter.post('/', BannerController.create);
bannerRouter.patch('/:id', BannerController.update);
bannerRouter.delete('/:id', BannerController.remove);

export default bannerRouter;
