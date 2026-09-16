import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import WishlistController from './wishlist.controller';

const wishlistRouter = Router();

wishlistRouter.use(TokenMiddleware.requireCustomerAuth);
wishlistRouter.get('/wishlist', WishlistController.list);
wishlistRouter.post('/wishlist/:productId', WishlistController.add);
wishlistRouter.delete('/wishlist/:productId', WishlistController.remove);

export default wishlistRouter;
