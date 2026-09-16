import { Op, WhereOptions } from 'sequelize';
import {
    Order,
    OrderItem,
    Payment,
    Shipment,
    User,
    ProductVariant,
    Product
} from '../../../../../Common/database/models';

const DETAIL_INCLUDE = [
    {
        model: OrderItem,
        as: 'items',
        include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }]
    },
    { model: Payment, as: 'payment' },
    { model: Shipment, as: 'shipment' }
];

class OrderRepository {
    findById(id: number) {
        return Order.findByPk(id, { include: DETAIL_INCLUDE });
    }

    findAllForUser(userId: number, offset: number, limit: number) {
        return Order.findAndCountAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            offset,
            limit,
            include: [{ model: OrderItem, as: 'items' }]
        });
    }

    async findAllAdmin(
        filters: { status?: string; q?: string },
        offset: number,
        limit: number
    ) {
        const where: Record<string | symbol, unknown> = {};
        if (filters.status) where.status = filters.status;
        if (filters.q) {
            where[Op.or] = [
                { orderNumber: { [Op.iLike]: `%${filters.q}%` } },
                { guestEmail: { [Op.iLike]: `%${filters.q}%` } }
            ];
        }
        return Order.findAndCountAll({
            where: where as WhereOptions,
            order: [['createdAt', 'DESC']],
            offset,
            limit,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        });
    }

    updateStatus(id: number, status: string) {
        return Order.update({ status: status as never }, { where: { id } });
    }

    findCustomers(offset: number, limit: number, q?: string) {
        const where = q
            ? { [Op.or]: [{ name: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }] }
            : {};
        return User.findAndCountAll({ where, offset, limit, order: [['createdAt', 'DESC']] });
    }

    findCustomerById(id: number) {
        return User.findByPk(id, { include: [{ model: Order, as: 'orders' }] });
    }
}

export default new OrderRepository();
