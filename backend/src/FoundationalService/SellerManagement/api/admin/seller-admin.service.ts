import SellerAdminRepository from './repository/seller-admin.repository';
import CommissionUtil from '../../../../Common/utils/CommissionUtil';
import { RecordNotFoundException, ValidationException } from '../../../../Common/httpErrorClasses';
import { buildPagination } from '../../../../Common/utils/Pagination';
import { GeneratePayoutPayload, RejectSellerPayload, SetCommissionPayload } from './validations/seller-admin.validation';

class SellerAdminService {
    async list(status: string | undefined, page: number, pageSize: number, offset: number, limit: number) {
        const { rows, count } = await SellerAdminRepository.findAndCount(status, offset, limit);
        return { items: rows, ...buildPagination(count, page, pageSize) };
    }

    async getById(id: number) {
        const seller = await SellerAdminRepository.findById(id);
        if (!seller) throw new RecordNotFoundException('Seller not found.');
        return seller;
    }

    async approve(id: number) {
        await this.getById(id);
        await SellerAdminRepository.update(id, { status: 'approved', approvedAt: new Date(), rejectionReason: null });
        return this.getById(id);
    }

    async reject(id: number, payload: RejectSellerPayload) {
        await this.getById(id);
        await SellerAdminRepository.update(id, { status: 'rejected', rejectionReason: payload.reason });
        return this.getById(id);
    }

    async suspend(id: number) {
        await this.getById(id);
        await SellerAdminRepository.update(id, { status: 'suspended' });
        return this.getById(id);
    }

    async setCommission(id: number, payload: SetCommissionPayload) {
        await this.getById(id);
        await SellerAdminRepository.update(id, { commissionRateOverride: payload.commissionRateOverride });
        return this.getById(id);
    }

    async generatePayout(sellerId: number, payload: GeneratePayoutPayload) {
        const seller = await this.getById(sellerId);
        const from = new Date(payload.periodStart);
        const to = new Date(payload.periodEnd);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
            throw new ValidationException('periodStart must be before periodEnd (valid ISO dates).');
        }

        const items = await SellerAdminRepository.findOrderItemsInRange(sellerId, from, to);
        const grossSales = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
        const commissionDeducted = items.reduce((sum, i) => sum + i.commissionAmount, 0);
        const netPayable = items.reduce((sum, i) => sum + i.sellerEarning, 0);

        const payout = await SellerAdminRepository.createPayout({
            sellerId,
            periodStart: payload.periodStart,
            periodEnd: payload.periodEnd,
            grossSales,
            commissionDeducted,
            netPayable,
            status: 'pending',
            notes: payload.notes || null
        });

        return { ...payout.toJSON(), seller: { id: seller.id, businessName: seller.businessName } };
    }

    async markPayoutPaid(payoutId: number) {
        const payout = await SellerAdminRepository.findPayoutById(payoutId);
        if (!payout) throw new RecordNotFoundException('Payout not found.');
        await SellerAdminRepository.updatePayout(payoutId, { status: 'paid', paidAt: new Date() });
        return SellerAdminRepository.findPayoutById(payoutId);
    }

    getPlatformCommissionRate() {
        return CommissionUtil.getPlatformDefaultRate();
    }

    async setPlatformCommissionRate(rate: number) {
        await CommissionUtil.setPlatformDefaultRate(rate);
        return { platform_commission_rate_percent: rate };
    }
}

export default new SellerAdminService();
