declare global {
    namespace Express {
        interface Request {
            /** Populated by TokenMiddleware.authMiddleware after verifying the JWT. */
            user?: {
                userId: number;
                role: string;
                type: 'customer' | 'admin';
                email?: string;
            };
            /** Guest cart session id, resolved from `X-Cart-Session` header or cookie. */
            cartSessionId?: string;
        }
    }
}

export {};
