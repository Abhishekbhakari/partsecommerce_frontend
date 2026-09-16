import { Coupon } from '../../../../../Common/database/models';

class CouponRepository {
    findAll() {
        return Coupon.findAll({ order: [['createdAt', 'DESC']] });
    }

    findById(id: number) {
        return Coupon.findByPk(id);
    }

    findByCode(code: string) {
        return Coupon.findOne({ where: { code } });
    }

    create(data: Record<string, unknown>) {
        return Coupon.create(data as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Coupon.update(data, { where: { id } });
    }

    remove(id: number) {
        return Coupon.destroy({ where: { id } });
    }
}

export default new CouponRepository();
