import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AdminAuthController from './auth.controller';

const adminAuthRouter = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

adminAuthRouter.post('/login', loginLimiter, AdminAuthController.login);
adminAuthRouter.post('/refresh', AdminAuthController.refresh);
adminAuthRouter.post('/logout', AdminAuthController.logout);
adminAuthRouter.get('/me', AdminAuthController.me);

export default adminAuthRouter;
