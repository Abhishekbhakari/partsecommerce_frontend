import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import { requireAnyAdmin } from '../../../../Common/middleware/RBACMiddleware';
import ShipmentController from './shipment.controller';

const shipmentRouter = Router();

shipmentRouter.post('/', TokenMiddleware.requireAdminAuth, requireAnyAdmin, ShipmentController.create);
shipmentRouter.get('/:orderId/track', TokenMiddleware.authMiddleware, ShipmentController.track);
shipmentRouter.post('/webhook', ShipmentController.webhook);

export default shipmentRouter;
