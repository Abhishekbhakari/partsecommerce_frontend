import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import CustomerAuthController from './customerAuth.controller';

const customerAuthRouter = Router();

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many OTP requests. Please try again in 5 minutes.' }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' }
});

customerAuthRouter.post('/otp/request', otpLimiter, CustomerAuthController.requestOtp);
customerAuthRouter.post('/otp/verify', loginLimiter, CustomerAuthController.verifyOtp);
customerAuthRouter.post('/email/login', loginLimiter, CustomerAuthController.emailLogin);
customerAuthRouter.post('/email/register', loginLimiter, CustomerAuthController.emailRegister);
customerAuthRouter.post('/google', loginLimiter, CustomerAuthController.google);
customerAuthRouter.post('/refresh', CustomerAuthController.refresh);
customerAuthRouter.post('/logout', CustomerAuthController.logout);

export default customerAuthRouter;
