import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { ORDER_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import PaymentController from './payment.controller';

const paymentRouter = Router();

paymentRouter.post('/create-intent', TokenMiddleware.optionalAuthMiddleware, PaymentController.createIntent);
paymentRouter.post('/verify', PaymentController.verify);
paymentRouter.post('/webhook', PaymentController.webhook);
paymentRouter.get('/cod-eligibility', PaymentController.codEligibility);
paymentRouter.post(
    '/:id/refund',
    TokenMiddleware.requireAdminAuth,
    RBAC.requireRole(...ORDER_MANAGER_ROLES),
    PaymentController.refund
);

export default paymentRouter;
