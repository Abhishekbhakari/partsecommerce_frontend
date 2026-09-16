import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import AddressController from './address.controller';

const addressRouter = Router();

addressRouter.use(TokenMiddleware.requireCustomerAuth);
addressRouter.get('/addresses', AddressController.list);
addressRouter.post('/addresses', AddressController.create);
addressRouter.patch('/addresses/:id', AddressController.update);
addressRouter.delete('/addresses/:id', AddressController.remove);

export default addressRouter;
