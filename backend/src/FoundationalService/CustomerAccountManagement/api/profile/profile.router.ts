import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import ProfileController from './profile.controller';

const profileRouter = Router();

profileRouter.use(TokenMiddleware.requireCustomerAuth);
profileRouter.get('/', ProfileController.getProfile);
profileRouter.patch('/', ProfileController.updateProfile);

export default profileRouter;
