import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { ORDER_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import ReviewController from './review.controller';

// Mounted at /api/v1/products/:id/reviews
const productReviewRouter = Router({ mergeParams: true });
productReviewRouter.get('/', ReviewController.listForProduct);
productReviewRouter.post('/', TokenMiddleware.requireCustomerAuth, ReviewController.create);

// Mounted at /api/v1/admin/reviews
const reviewAdminRouter = Router();
reviewAdminRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...ORDER_MANAGER_ROLES));
reviewAdminRouter.patch('/:id', ReviewController.moderate);
reviewAdminRouter.delete('/:id', ReviewController.remove);

export { productReviewRouter, reviewAdminRouter };
