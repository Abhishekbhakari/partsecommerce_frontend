import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import CustomerAuthService from './customerAuth.service';
import {
    OtpRequestSchema,
    OtpVerifySchema,
    EmailLoginSchema,
    EmailRegisterSchema,
    GoogleAuthSchema
} from './validations/customerAuth.validation';

const REFRESH_COOKIE_NAME = 'customerRefreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';

const setRefreshCookie = (res: Response, token: string) => {
    const maxAge = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MS || '604800000', 10);
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge,
        path: REFRESH_COOKIE_PATH
    });
};

class CustomerAuthController {
    public static async requestOtp(req: Request, res: Response) {
        try {
            const payload = OtpRequestSchema.parse(req.body);
            const result = await CustomerAuthService.requestOtp(payload);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.OTP_SENT);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async verifyOtp(req: Request, res: Response) {
        try {
            const payload = OtpVerifySchema.parse(req.body);
            const result = await CustomerAuthService.verifyOtp(payload);
            setRefreshCookie(res, result.refreshToken);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.LOGIN_SUCCESS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async emailLogin(req: Request, res: Response) {
        try {
            const payload = EmailLoginSchema.parse(req.body);
            const result = await CustomerAuthService.emailLogin(payload);
            setRefreshCookie(res, result.refreshToken);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.LOGIN_SUCCESS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async emailRegister(req: Request, res: Response) {
        try {
            const payload = EmailRegisterSchema.parse(req.body);
            const result = await CustomerAuthService.emailRegister(payload);
            setRefreshCookie(res, result.refreshToken);
            return sendSuccess(res, HttpCode.CREATED, result, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async google(req: Request, res: Response) {
        try {
            const payload = GoogleAuthSchema.parse(req.body);
            const result = await CustomerAuthService.googleAuth(payload);
            setRefreshCookie(res, result.refreshToken);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.LOGIN_SUCCESS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async refresh(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
            if (!refreshToken) {
                return res.status(HttpCode.UNAUTHORIZED).json({ success: false, message: 'No refresh token provided.' });
            }
            const result = await CustomerAuthService.refresh(refreshToken);
            setRefreshCookie(res, result.refreshToken);
            return sendSuccess(res, HttpCode.OK, { accessToken: result.accessToken }, HttpSuccessMessage.TOKEN_REFRESHED);
        } catch (error) {
            res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async logout(_req: Request, res: Response) {
        res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
        return sendSuccess(res, HttpCode.OK, { success: true }, HttpSuccessMessage.LOGOUT_SUCCESS);
    }
}

export default CustomerAuthController;
