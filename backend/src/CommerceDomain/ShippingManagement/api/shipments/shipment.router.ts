import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import { requireAnyAdmin } from '../../../../Common/middleware/RBACMiddleware';
import ShipmentController from './shipment.controller';

const shipmentRouter = Router();

shipmentRouter.post('/', TokenMiddleware.requireAdminAuth, requireAnyAdmin, ShipmentController.create);
// optionalAuth — same reasoning as order.router.ts: a guest needs their own tracking page to
// load without a token; ShipmentService.track only enforces ownership for a logged-in customer.
shipmentRouter.get('/:orderId/track', TokenMiddleware.optionalAuthMiddleware, ShipmentController.track);
shipmentRouter.post('/webhook', ShipmentController.webhook);

export default shipmentRouter;
