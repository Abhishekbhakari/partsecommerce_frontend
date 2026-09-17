import { Op } from 'sequelize';
import {
    OrderItem,
    Order,
    ProductVariant,
    Product,
    Shipment,
    ShipmentItem,
    SellerPayout,
    User
} from '../../../../../Common/database/models';

class SellerPortalRepository {
    findOrderItemsForSeller(sellerId: number, offset: number, limit: number) {
        return OrderItem.findAndCountAll({
            where: { sellerId },
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'orderNumber', 'status', 'shippingAddress', 'guestEmail', 'userId', 'placedAt'],
                    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
                }
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });
    }

    findOrderItemById(id: number) {
        return OrderItem.findByPk(id, { include: [{ model: Order, as: 'order' }] });
    }

    updateOrderItemFulfillment(id: number, status: string) {
        return OrderItem.update({ fulfillmentStatus: status as never }, { where: { id } });
    }

    findOrderItemsForOrderAndSeller(orderId: number, sellerId: number) {
        return OrderItem.findAll({ where: { orderId, sellerId } });
    }

    findAllOrderItemsForOrder(orderId: number) {
        return OrderItem.findAll({ where: { orderId } });
    }

    updateOrderStatus(orderId: number, status: string) {
        return Order.update({ status: status as never }, { where: { id: orderId } });
    }

    findShipmentForOrderAndSeller(orderId: number, sellerId: number) {
        return Shipment.findOne({ where: { orderId, sellerId } });
    }

    createShipment(data: Record<string, unknown>) {
        return Shipment.create(data as never);
    }

    updateShipment(id: number, data: Record<string, unknown>) {
        return Shipment.update(data, { where: { id } });
    }

    async linkShipmentItems(shipmentId: number, orderItemIds: number[]) {
        for (const orderItemId of orderItemIds) {
            const [row] = await ShipmentItem.findOrCreate({
                where: { orderItemId },
                defaults: { shipmentId, orderItemId }
            });
            if (row.shipmentId !== shipmentId) {
                await ShipmentItem.update({ shipmentId }, { where: { orderItemId } });
            }
        }
    }

    /** Sum of qty*unitPrice (gross) for a seller's order items, optionally within [from, to). */
    salesTotalForSeller(sellerId: number, from?: Date, to?: Date) {
        const where: Record<string | symbol, unknown> = { sellerId };
        if (from || to) {
            where.createdAt = {
                ...(from ? { [Op.gte]: from } : {}),
                ...(to ? { [Op.lt]: to } : {})
            };
        }
        return OrderItem.findAll({ where, attributes: ['qty', 'unitPrice', 'sellerEarning', 'commissionAmount', 'orderId'] });
    }

    lowStockCountForSeller(sellerId: number, threshold: number) {
        return ProductVariant.count({
            where: { stock: { [Op.lte]: threshold } },
            include: [{ model: Product, as: 'product', where: { sellerId }, attributes: [] }]
        });
    }

    distinctOrderCountForSeller(sellerId: number) {
        return OrderItem.count({ where: { sellerId }, distinct: true, col: 'orderId' });
    }

    findPayoutsForSeller(sellerId: number) {
        return SellerPayout.findAll({ where: { sellerId }, order: [['createdAt', 'DESC']] });
    }

    sumNetPayableForSeller(sellerId: number) {
        return SellerPayout.sum('netPayable', { where: { sellerId } });
    }
}

export default new SellerPortalRepository();
