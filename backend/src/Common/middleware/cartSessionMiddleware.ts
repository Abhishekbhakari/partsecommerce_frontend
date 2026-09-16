import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Resolves a guest cart session id from the `X-Cart-Session` header, falling back to
 * generating a fresh one — the frontend persists whatever comes back on `Cart.sessionId`
 * (response header `X-Cart-Session`) client-side. Logged-in users key their cart off
 * req.user.userId instead (see CartService).
 */
export const cartSessionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const headerSession = req.headers['x-cart-session'];
    const sessionId = (Array.isArray(headerSession) ? headerSession[0] : headerSession) || uuidv4();
    req.cartSessionId = sessionId;
    res.setHeader('X-Cart-Session', sessionId);
    next();
};
