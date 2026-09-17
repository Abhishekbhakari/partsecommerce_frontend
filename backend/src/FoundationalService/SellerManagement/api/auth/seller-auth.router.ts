import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import SellerAuthController from './seller-auth.controller';

const sellerAuthRouter = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many registration attempts. Please try again later.' }
});

sellerAuthRouter.post('/register', registerLimiter, SellerAuthController.register);
sellerAuthRouter.post('/login', loginLimiter, SellerAuthController.login);
sellerAuthRouter.post('/refresh', SellerAuthController.refresh);
sellerAuthRouter.post('/logout', SellerAuthController.logout);
sellerAuthRouter.get('/me', TokenMiddleware.requireSellerAuth, SellerAuthController.me);

export default sellerAuthRouter;
