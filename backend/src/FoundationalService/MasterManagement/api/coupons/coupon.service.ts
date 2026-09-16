import CouponRepository from './repository/coupon.repository';
import { DuplicateRecordException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { CouponPayload, UpdateCouponPayload } from './validations/coupon.validation';

class CouponService {
    list() {
        return CouponRepository.findAll();
    }

    async create(payload: CouponPayload) {
        const existing = await CouponRepository.findByCode(payload.code);
        if (existing) throw new DuplicateRecordException('A coupon with this code already exists.');
        return CouponRepository.create(payload);
    }

    async update(id: number, payload: UpdateCouponPayload) {
        const coupon = await CouponRepository.findById(id);
        if (!coupon) throw new RecordNotFoundException('Coupon not found.');
        await CouponRepository.update(id, payload);
        return CouponRepository.findById(id);
    }

    async remove(id: number) {
        const coupon = await CouponRepository.findById(id);
        if (!coupon) throw new RecordNotFoundException('Coupon not found.');
        await CouponRepository.remove(id);
        return { success: true };
    }
}

export default new CouponService();
