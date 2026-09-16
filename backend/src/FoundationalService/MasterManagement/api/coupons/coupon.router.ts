import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import CouponController from './coupon.controller';

const couponRouter = Router();

couponRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
couponRouter.get('/', CouponController.list);
couponRouter.post('/', CouponController.create);
couponRouter.patch('/:id', CouponController.update);
couponRouter.delete('/:id', CouponController.remove);

export default couponRouter;
