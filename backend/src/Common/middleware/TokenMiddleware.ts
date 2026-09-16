import { Request, Response, NextFunction } from 'express';
import JwtUtil from '../utils/JwtUtil';
import { TokenException, UnauthorizedException } from '../httpErrorClasses';

class TokenMiddleware {
    /** Authenticates any bearer token (customer or admin) and populates req.user. */
    authMiddleware(req: Request, res: Response, next: NextFunction): void {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                throw new UnauthorizedException('Please provide a valid token to access this endpoint.');
            }
            const token = authHeader.substring(7);
            const decoded = JwtUtil.verifyToken(token);
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                type: decoded.type,
                email: decoded.email
            };
            next();
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            if ((error as Error)?.name === 'TokenExpiredError') {
                res.status(401).json({
                    success: false,
                    message: 'Your session has expired. Please log in again.'
                });
                return;
            }
            res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        }
    }

    /** Requires an authenticated request where req.user.type === 'admin'. */
    requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
        this.authMiddleware(req, res, () => {
            if (req.user?.type !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'This endpoint is restricted to admin/staff users.'
                });
                return;
            }
            next();
        });
    };

    /** Requires an authenticated request where req.user.type === 'customer'. */
    requireCustomerAuth = (req: Request, res: Response, next: NextFunction): void => {
        this.authMiddleware(req, res, () => {
            if (req.user?.type !== 'customer') {
                res.status(403).json({
                    success: false,
                    message: 'This endpoint is restricted to customer accounts.'
                });
                return;
            }
            next();
        });
    };

    /** Populates req.user when a valid bearer token is present, but never rejects the request. */
    optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const decoded = JwtUtil.verifyToken(authHeader.substring(7));
                req.user = {
                    userId: decoded.userId,
                    role: decoded.role,
                    type: decoded.type,
                    email: decoded.email
                };
            } catch {
                /* ignore invalid/expired token on optional-auth routes (guest flows) */
            }
        }
        next();
    }

    /** Validates the refresh token carried in the httpOnly cookie — used only on /auth/refresh. */
    refreshTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                throw new TokenException('No refresh token provided.');
            }
            const decoded = JwtUtil.verifyRefreshToken(refreshToken);
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                type: decoded.type,
                email: decoded.email
            };
            next();
        } catch {
            res.status(401).json({
                success: false,
                message: 'Your session has expired. Please log in again.'
            });
        }
    }
}

export default new TokenMiddleware();
