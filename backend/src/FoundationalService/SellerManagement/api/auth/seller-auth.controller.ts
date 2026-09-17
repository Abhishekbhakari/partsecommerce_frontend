import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import SellerAuthService from './seller-auth.service';
import { SellerLoginSchema, SellerRegisterSchema } from './validations/seller-auth.validation';

const REFRESH_COOKIE_NAME = 'sellerRefreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/seller/auth';

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

class SellerAuthController {
    public static async register(req: Request, res: Response) {
        try {
            const payload = SellerRegisterSchema.parse(req.body);
            const result = await SellerAuthService.register(payload);
            return sendSuccess(res, HttpCode.CREATED, result, 'Seller application submitted for review.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async login(req: Request, res: Response) {
        try {
            const payload = SellerLoginSchema.parse(req.body);
            const result = await SellerAuthService.login(payload);
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
            const result = await SellerAuthService.refresh(refreshToken);
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

    public static async me(req: Request, res: Response) {
        try {
            const result = await SellerAuthService.me(req.user!.userId);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default SellerAuthController;
