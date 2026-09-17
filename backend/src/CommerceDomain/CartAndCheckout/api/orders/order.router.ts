import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import OrderController from './order.controller';

const orderRouter = Router();

// Reads use optionalAuth — a guest never has a token, but still needs their own
// order-confirmation and tracking pages to load right after checkout. OrderService.getById
// already enforces ownership when the requester IS a logged-in customer (order.userId must
// match); it only stays open for the guest (no-token) case, which is the same trust model as
// the checkout flow itself. Mutating actions (cancel/return) stay hard-authenticated — a guest
// browsing to /orders/:id can view it, not act on it.
orderRouter.get('/:id', TokenMiddleware.optionalAuthMiddleware, OrderController.getById);
orderRouter.post('/:id/cancel', TokenMiddleware.authMiddleware, OrderController.cancel);
orderRouter.post('/:id/return', TokenMiddleware.requireCustomerAuth, OrderController.requestReturn);
orderRouter.get('/:id/invoice', TokenMiddleware.optionalAuthMiddleware, OrderController.invoice);

const myOrdersRouter = Router();
myOrdersRouter.get('/orders', TokenMiddleware.requireCustomerAuth, OrderController.listMine);

export { orderRouter, myOrdersRouter };
