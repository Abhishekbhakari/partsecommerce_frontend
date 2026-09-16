import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import OrderController from './order.controller';

const orderRouter = Router();

orderRouter.get('/:id', TokenMiddleware.authMiddleware, OrderController.getById);
orderRouter.post('/:id/cancel', TokenMiddleware.authMiddleware, OrderController.cancel);
orderRouter.post('/:id/return', TokenMiddleware.requireCustomerAuth, OrderController.requestReturn);
orderRouter.get('/:id/invoice', TokenMiddleware.authMiddleware, OrderController.invoice);

const myOrdersRouter = Router();
myOrdersRouter.get('/orders', TokenMiddleware.requireCustomerAuth, OrderController.listMine);

export { orderRouter, myOrdersRouter };
