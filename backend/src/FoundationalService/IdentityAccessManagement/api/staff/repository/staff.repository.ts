import { AdminUser } from '../../../../../Common/database/models';

class StaffRepository {
    findAll() {
        return AdminUser.findAll({ order: [['createdAt', 'DESC']] });
    }

    findByEmail(email: string) {
        return AdminUser.findOne({ where: { email } });
    }

    findById(id: number) {
        return AdminUser.findByPk(id);
    }

    create(data: {
        name: string;
        email: string;
        passwordHash: string;
        role: 'owner' | 'manager' | 'catalog_editor' | 'order_manager' | 'support';
    }) {
        return AdminUser.create(data);
    }

    updateRole(id: number, role: string) {
        return AdminUser.update({ role: role as never }, { where: { id } });
    }

    remove(id: number) {
        return AdminUser.destroy({ where: { id } });
    }
}

export default new StaffRepository();
