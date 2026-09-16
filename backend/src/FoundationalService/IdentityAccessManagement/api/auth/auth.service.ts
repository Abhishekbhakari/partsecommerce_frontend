import AuthRepository from './repository/auth.repository';
import PasswordUtil from '../../../../Common/utils/PasswordUtil';
import JwtUtil from '../../../../Common/utils/JwtUtil';
import { InvalidCredentialsException, ForbiddenException } from '../../../../Common/httpErrorClasses';
import { AdminLoginPayload } from './validations/auth.validation';
import WinstonLogger from '../../../../Common/logger/WinstonLogger';

class AuthService {
    async login(payload: AdminLoginPayload, _ip?: string, _userAgent?: unknown) {
        const admin = await AuthRepository.findByEmail(payload.email.toLowerCase());
        if (!admin) {
            throw new InvalidCredentialsException();
        }
        if (!admin.active) {
            throw new ForbiddenException('This staff account has been deactivated.');
        }

        const passwordMatches = await PasswordUtil.compare(payload.password, admin.passwordHash);
        if (!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        await AuthRepository.touchLastLogin(admin.id);

        const tokenPayload = { userId: admin.id, role: admin.role, type: 'admin' as const, email: admin.email };
        const accessToken = JwtUtil.generateToken(tokenPayload);
        const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

        return {
            accessToken,
            refreshToken,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        };
    }

    async refresh(refreshToken: string) {
        const decoded = JwtUtil.verifyRefreshToken(refreshToken);
        if (decoded.type !== 'admin') {
            throw new ForbiddenException('Invalid refresh token for this account type.');
        }
        const admin = await AuthRepository.findById(decoded.userId);
        if (!admin || !admin.active) {
            throw new ForbiddenException('Account no longer active.');
        }

        const tokenPayload = { userId: admin.id, role: admin.role, type: 'admin' as const, email: admin.email };
        return {
            accessToken: JwtUtil.generateToken(tokenPayload),
            refreshToken: JwtUtil.generateRefreshToken(tokenPayload)
        };
    }

    /** Ensures a super-admin (owner) account exists on server bootstrap. */
    async seedDefaultSuperAdmin() {
        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@spareparts.local';
        const existing = await AuthRepository.findByEmail(email);
        if (existing) return;

        const { AdminUser } = await import('../../../../Common/database/models');
        const passwordHash = await PasswordUtil.hash(process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!');
        await AdminUser.create({
            name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
            email,
            passwordHash,
            role: 'owner',
            active: true
        });
        WinstonLogger.logger.log({ message: `[AuthService] Seeded default super admin: ${email}`, level: 'info' });
    }
}

export default new AuthService();
