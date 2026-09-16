import { User } from '../../../../../Common/database/models';

class ProfileRepository {
    findById(id: number) {
        return User.findByPk(id);
    }

    update(id: number, data: Partial<{ name: string; email: string; phone: string }>) {
        return User.update(data, { where: { id } });
    }
}

export default new ProfileRepository();
