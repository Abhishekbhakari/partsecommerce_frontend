import { Op, WhereOptions } from 'sequelize';
import { Seller, SellerPayout, OrderItem } from '../../../../../Common/database/models';

class SellerAdminRepository {
    findAndCount(status: string | undefined, offset: number, limit: number) {
        const where: Record<string | symbol, unknown> = {};
        if (status) where.status = status;
        return Seller.findAndCountAll({
            where: where as WhereOptions,
            attributes: { exclude: ['passwordHash'] },
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });
    }

    findById(id: number) {
        return Seller.findByPk(id, { attributes: { exclude: ['passwordHash'] } });
    }

    update(id: number, data: Record<string, unknown>) {
        return Seller.update(data, { where: { id } });
    }

    findPayoutById(id: number) {
        return SellerPayout.findByPk(id);
    }

    createPayout(data: Record<string, unknown>) {
        return SellerPayout.create(data as never);
    }

    updatePayout(id: number, data: Record<string, unknown>) {
        return SellerPayout.update(data, { where: { id } });
    }

    /** Order items for a seller placed within [from, to) — the basis for a payout run. */
    findOrderItemsInRange(sellerId: number, from: Date, to: Date) {
        return OrderItem.findAll({
            where: {
                sellerId,
                createdAt: { [Op.gte]: from, [Op.lt]: to }
            }
        });
    }
}

export default new SellerAdminRepository();
