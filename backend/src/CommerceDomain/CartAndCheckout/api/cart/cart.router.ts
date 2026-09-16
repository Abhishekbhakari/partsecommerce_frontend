import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import { cartSessionMiddleware } from '../../../../Common/middleware/cartSessionMiddleware';
import CartController from './cart.controller';

const cartRouter = Router();

// Public/User: works for guest via X-Cart-Session, upgraded for logged-in users.
cartRouter.use(TokenMiddleware.optionalAuthMiddleware, cartSessionMiddleware);

cartRouter.get('/', CartController.getCart);
cartRouter.post('/items', CartController.addItem);
cartRouter.patch('/items/:id', CartController.updateItem);
cartRouter.delete('/items/:id', CartController.removeItem);
cartRouter.post('/apply-coupon', CartController.applyCoupon);
cartRouter.delete('/coupon', CartController.removeCoupon);
cartRouter.get('/pincode-check', CartController.pincodeCheck);

export default cartRouter;
