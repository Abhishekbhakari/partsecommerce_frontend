import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import { cartSessionMiddleware } from '../../../../Common/middleware/cartSessionMiddleware';
import CheckoutController from './checkout.controller';

const checkoutRouter = Router();

checkoutRouter.use(TokenMiddleware.optionalAuthMiddleware, cartSessionMiddleware);
checkoutRouter.post('/', CheckoutController.checkout);

export default checkoutRouter;
