import { Op } from 'sequelize';
import { User, OtpRequest } from '../../../../../Common/database/models';

class CustomerAuthRepository {
    findByEmail(email: string) {
        return User.findOne({ where: { email } });
    }

    findByPhone(phone: string) {
        return User.findOne({ where: { phone } });
    }

    findByEmailOrPhone(identifier: string) {
        return User.findOne({ where: { [Op.or]: [{ email: identifier }, { phone: identifier }] } });
    }

    findById(id: number) {
        return User.findByPk(id);
    }

    createUser(data: Partial<{
        name: string;
        email: string | null;
        phone: string | null;
        authProvider: 'otp' | 'email' | 'google';
        passwordHash: string | null;
        googleId: string | null;
        isVerified: boolean;
    }>) {
        return User.create(data as never);
    }

    createOtpRequest(data: {
        requestId: string;
        identifier: string;
        otpHash: string;
        expiresAt: Date;
    }) {
        return OtpRequest.create(data);
    }

    findOtpRequest(requestId: string) {
        return OtpRequest.findOne({ where: { requestId } });
    }

    markOtpConsumed(id: number) {
        return OtpRequest.update({ consumedAt: new Date() }, { where: { id } });
    }

    incrementOtpAttempts(id: number, attempts: number) {
        return OtpRequest.update({ attempts }, { where: { id } });
    }
}

export default new CustomerAuthRepository();
