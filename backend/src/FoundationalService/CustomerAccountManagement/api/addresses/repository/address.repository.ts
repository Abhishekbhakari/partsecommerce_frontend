import { Address } from '../../../../../Common/database/models';

class AddressRepository {
    findAllForUser(userId: number) {
        return Address.findAll({ where: { userId }, order: [['isDefault', 'DESC'], ['createdAt', 'DESC']] });
    }

    findById(id: number) {
        return Address.findByPk(id);
    }

    create(userId: number, data: Record<string, unknown>) {
        return Address.create({ ...data, userId } as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Address.update(data, { where: { id } });
    }

    remove(id: number) {
        return Address.destroy({ where: { id } });
    }

    clearDefault(userId: number) {
        return Address.update({ isDefault: false }, { where: { userId } });
    }
}

export default new AddressRepository();
