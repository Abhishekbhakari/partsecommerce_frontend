import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';
import WinstonLogger from '../logger/WinstonLogger';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
    WinstonLogger.logger.log({
        message: '[JwtUtil] WARNING: JWT_SECRET environment variable is not set.',
        level: 'warn'
    });
}

const SECRET = JWT_SECRET || 'dev-insecure-secret';
const JWT_EXPIRES_IN = process.env.JWT_TOKEN_EXPIRY || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

class JwtUtil {
    generateToken(payload: TokenPayload): string {
        return jwt.sign(payload, SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    }

    generateRefreshToken(payload: TokenPayload): string {
        const secret = process.env.JWT_REFRESH_SECRET || SECRET;
        return jwt.sign(payload, secret, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
    }

    verifyToken(token: string): TokenPayload {
        return jwt.verify(token, SECRET) as unknown as TokenPayload;
    }

    verifyRefreshToken(token: string): TokenPayload {
        const secret = process.env.JWT_REFRESH_SECRET || SECRET;
        return jwt.verify(token, secret) as unknown as TokenPayload;
    }
}

export default new JwtUtil();
