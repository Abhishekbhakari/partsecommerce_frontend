import { AdminUser } from '../../../../../Common/database/models';

class AuthRepository {
    findByEmail(email: string) {
        return AdminUser.findOne({ where: { email } });
    }

    findById(id: number) {
        return AdminUser.findByPk(id);
    }

    touchLastLogin(id: number) {
        return AdminUser.update({ lastLoginAt: new Date() }, { where: { id } });
    }
}

export default new AuthRepository();
