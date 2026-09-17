import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import SellerPortalController from './seller-portal.controller';

const sellerPortalRouter = Router();

sellerPortalRouter.use(TokenMiddleware.requireSellerAuth);
sellerPortalRouter.get('/dashboard', SellerPortalController.dashboard);
sellerPortalRouter.get('/orders', SellerPortalController.listOrderItems);
sellerPortalRouter.patch('/orders/items/:orderItemId/fulfillment', SellerPortalController.updateFulfillment);
sellerPortalRouter.get('/payouts', SellerPortalController.listPayouts);

export default sellerPortalRouter;
