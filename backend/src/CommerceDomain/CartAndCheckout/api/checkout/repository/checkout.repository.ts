import { sequelize, Order, OrderItem, Address, ProductVariant } from '../../../../../Common/database/models';
import { Transaction } from 'sequelize';

class CheckoutRepository {
    findAddress(id: number) {
        return Address.findByPk(id);
    }

    async createOrderWithItems(
        orderData: Record<string, unknown>,
        items: { variantId: number; productTitleSnapshot: string; qty: number; unitPrice: number; gstRateSnapshot: number }[],
        stockDecrements: { variantId: number; qty: number }[]
    ) {
        return sequelize.transaction(async (t: Transaction) => {
            const order = await Order.create(orderData as never, { transaction: t });

            await OrderItem.bulkCreate(
                items.map((item) => ({ ...item, orderId: order.id })) as never,
                { transaction: t }
            );

            for (const dec of stockDecrements) {
                await ProductVariant.decrement('stock', { by: dec.qty, where: { id: dec.variantId }, transaction: t });
            }

            return order;
        });
    }
}

export default new CheckoutRepository();
