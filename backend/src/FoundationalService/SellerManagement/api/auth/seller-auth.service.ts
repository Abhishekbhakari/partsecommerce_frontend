import SellerAuthRepository from './repository/seller-auth.repository';
import PasswordUtil from '../../../../Common/utils/PasswordUtil';
import JwtUtil from '../../../../Common/utils/JwtUtil';
import { DuplicateRecordException, ForbiddenException, InvalidCredentialsException } from '../../../../Common/httpErrorClasses';
import { SellerLoginPayload, SellerRegisterPayload } from './validations/seller-auth.validation';

const PENDING_MESSAGE = 'Your seller account is still under review. We will email you once it is approved.';
const REJECTED_MESSAGE_PREFIX = 'Your seller application was rejected.';
const SUSPENDED_MESSAGE = 'Your seller account has been suspended. Contact platform support for details.';

class SellerAuthService {
    async register(payload: SellerRegisterPayload) {
        const existing = await SellerAuthRepository.findByEmail(payload.email.toLowerCase());
        if (existing) {
            throw new DuplicateRecordException('A seller account with this email already exists.');
        }

        const passwordHash = await PasswordUtil.hash(payload.password);
        const seller = await SellerAuthRepository.create({
            businessName: payload.businessName,
            email: payload.email.toLowerCase(),
            passwordHash,
            phone: payload.phone,
            gstNumber: payload.gstNumber || null,
            status: 'pending'
        });

        return {
            id: seller.id,
            businessName: seller.businessName,
            email: seller.email,
            status: seller.status,
            message: 'Your application has been submitted for review. You can log in once an administrator approves your account.'
        };
    }

    async login(payload: SellerLoginPayload) {
        const seller = await SellerAuthRepository.findByEmail(payload.email.toLowerCase());
        if (!seller) {
            throw new InvalidCredentialsException();
        }

        const passwordMatches = await PasswordUtil.compare(payload.password, seller.passwordHash);
        if (!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        if (seller.status !== 'approved') {
            if (seller.status === 'pending') throw new ForbiddenException(PENDING_MESSAGE);
            if (seller.status === 'rejected') {
                throw new ForbiddenException(`${REJECTED_MESSAGE_PREFIX} ${seller.rejectionReason || 'No reason was provided.'}`);
            }
            throw new ForbiddenException(SUSPENDED_MESSAGE);
        }

        const tokenPayload = { userId: seller.id, role: 'seller', type: 'seller' as const, email: seller.email };
        const accessToken = JwtUtil.generateToken(tokenPayload);
        const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

        return {
            accessToken,
            refreshToken,
            seller: {
                id: seller.id,
                businessName: seller.businessName,
                email: seller.email,
                status: seller.status
            }
        };
    }

    async refresh(refreshToken: string) {
        const decoded = JwtUtil.verifyRefreshToken(refreshToken);
        if (decoded.type !== 'seller') {
            throw new ForbiddenException('Invalid refresh token for this account type.');
        }
        const seller = await SellerAuthRepository.findById(decoded.userId);
        if (!seller || seller.status !== 'approved') {
            throw new ForbiddenException('Seller account no longer active.');
        }

        const tokenPayload = { userId: seller.id, role: 'seller', type: 'seller' as const, email: seller.email };
        return {
            accessToken: JwtUtil.generateToken(tokenPayload),
            refreshToken: JwtUtil.generateRefreshToken(tokenPayload)
        };
    }

    async me(sellerId: number) {
        const seller = await SellerAuthRepository.findById(sellerId);
        if (!seller) throw new InvalidCredentialsException('Seller account not found.');
        return {
            id: seller.id,
            businessName: seller.businessName,
            email: seller.email,
            phone: seller.phone,
            gstNumber: seller.gstNumber,
            status: seller.status,
            commissionRateOverride: seller.commissionRateOverride,
            payoutBankDetails: seller.payoutBankDetails,
            approvedAt: seller.approvedAt
        };
    }
}

export default new SellerAuthService();
