import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import AuthService from './auth.service';
import { AdminLoginSchema } from './validations/auth.validation';
import JwtUtil from '../../../../Common/utils/JwtUtil';

const REFRESH_COOKIE_NAME = 'adminRefreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/admin/auth';

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

class AdminAuthController {
    public static async login(req: Request, res: Response) {
        try {
            const payload = AdminLoginSchema.parse(req.body);
            const result = await AuthService.login(payload, req.ip, req.headers['user-agent']);
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
            const result = await AuthService.refresh(refreshToken);
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
            const decoded = JwtUtil.verifyToken(req.headers.authorization!.substring(7));
            return sendSuccess(res, HttpCode.OK, decoded, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default AdminAuthController;
