import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import CustomerAuthRepository from './repository/customerAuth.repository';
import { getOtpSender } from './services/OtpSender';
import PasswordUtil from '../../../../Common/utils/PasswordUtil';
import JwtUtil from '../../../../Common/utils/JwtUtil';
import {
    InvalidCredentialsException,
    DuplicateRecordException,
    BadRequestException
} from '../../../../Common/httpErrorClasses';
import {
    OtpRequestPayload,
    OtpVerifyPayload,
    EmailLoginPayload,
    EmailRegisterPayload,
    GoogleAuthPayload
} from './validations/customerAuth.validation';

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp: string) => crypto.createHash('sha256').update(otp).digest('hex');
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const isEmail = (identifier: string) => identifier.includes('@');

const issueTokens = (user: { id: number; email: string | null }) => {
    const payload = { userId: user.id, role: 'customer', type: 'customer' as const, email: user.email || undefined };
    return {
        accessToken: JwtUtil.generateToken(payload),
        refreshToken: JwtUtil.generateRefreshToken(payload)
    };
};

const publicUser = (user: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    authProvider: string;
    isVerified: boolean;
}) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    authProvider: user.authProvider,
    isVerified: user.isVerified
});

class CustomerAuthService {
    async requestOtp(payload: OtpRequestPayload) {
        const requestId = uuidv4();
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await CustomerAuthRepository.createOtpRequest({
            requestId,
            identifier: payload.identifier,
            otpHash: hashOtp(otp),
            expiresAt
        });

        await getOtpSender().send(payload.identifier, otp);

        return { requestId };
    }

    async verifyOtp(payload: OtpVerifyPayload) {
        const otpRequest = await CustomerAuthRepository.findOtpRequest(payload.requestId);
        if (!otpRequest) {
            throw new BadRequestException('Invalid or expired OTP request.');
        }
        if (otpRequest.consumedAt) {
            throw new BadRequestException('This OTP has already been used.');
        }
        if (otpRequest.expiresAt.getTime() < Date.now()) {
            throw new BadRequestException('OTP has expired. Please request a new one.');
        }
        if (otpRequest.attempts >= MAX_OTP_ATTEMPTS) {
            throw new BadRequestException('Too many incorrect attempts. Please request a new OTP.');
        }
        if (otpRequest.otpHash !== hashOtp(payload.otp)) {
            await CustomerAuthRepository.incrementOtpAttempts(otpRequest.id, otpRequest.attempts + 1);
            throw new InvalidCredentialsException('Incorrect OTP.');
        }

        await CustomerAuthRepository.markOtpConsumed(otpRequest.id);

        const identifier = otpRequest.identifier;
        let user = await CustomerAuthRepository.findByEmailOrPhone(identifier);
        if (!user) {
            user = await CustomerAuthRepository.createUser({
                name: identifier.split('@')[0] || 'Customer',
                email: isEmail(identifier) ? identifier : null,
                phone: isEmail(identifier) ? null : identifier,
                authProvider: 'otp',
                isVerified: true
            });
        } else if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const tokens = issueTokens(user);
        return { ...tokens, user: publicUser(user) };
    }

    async emailLogin(payload: EmailLoginPayload) {
        const user = await CustomerAuthRepository.findByEmail(payload.email.toLowerCase());
        if (!user || !user.passwordHash) {
            throw new InvalidCredentialsException();
        }
        const matches = await PasswordUtil.compare(payload.password, user.passwordHash);
        if (!matches) {
            throw new InvalidCredentialsException();
        }
        const tokens = issueTokens(user);
        return { ...tokens, user: publicUser(user) };
    }

    async emailRegister(payload: EmailRegisterPayload) {
        const existing = await CustomerAuthRepository.findByEmail(payload.email.toLowerCase());
        if (existing) {
            throw new DuplicateRecordException('An account with this email already exists.');
        }
        const passwordHash = await PasswordUtil.hash(payload.password);
        const user = await CustomerAuthRepository.createUser({
            name: payload.name,
            email: payload.email.toLowerCase(),
            authProvider: 'email',
            passwordHash,
            isVerified: false
        });
        const tokens = issueTokens(user);
        return { ...tokens, user: publicUser(user) };
    }

    /**
     * Google OAuth token exchange — structurally correct, but verification is stubbed:
     * a production build would verify `idToken` against Google's tokeninfo endpoint or
     * the `google-auth-library` SDK using GOOGLE_CLIENT_ID before trusting its payload.
     */
    async googleAuth(payload: GoogleAuthPayload) {
        if (!payload.idToken) {
            throw new BadRequestException('idToken is required.');
        }
        // Stub decode — replace with real verification in production.
        const decoded = { email: `google-user-${payload.idToken.slice(0, 8)}@example.com`, sub: payload.idToken };

        let user = await CustomerAuthRepository.findByEmail(decoded.email);
        if (!user) {
            user = await CustomerAuthRepository.createUser({
                name: decoded.email.split('@')[0],
                email: decoded.email,
                authProvider: 'google',
                googleId: decoded.sub,
                isVerified: true
            });
        }
        const tokens = issueTokens(user);
        return { ...tokens, user: publicUser(user) };
    }

    async refresh(refreshToken: string) {
        const decoded = JwtUtil.verifyRefreshToken(refreshToken);
        if (decoded.type !== 'customer') {
            throw new BadRequestException('Invalid refresh token for this account type.');
        }
        const user = await CustomerAuthRepository.findById(decoded.userId);
        if (!user) {
            throw new InvalidCredentialsException('Account no longer exists.');
        }
        return issueTokens(user);
    }
}

export default new CustomerAuthService();
