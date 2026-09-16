import { Payment, Order } from '../../../../../Common/database/models';

class PaymentRepository {
    findByOrderId(orderId: number) {
        return Payment.findOne({ where: { orderId } });
    }

    findByGatewayOrderId(gatewayOrderId: string) {
        return Payment.findOne({ where: { gatewayOrderId } });
    }

    findById(id: number) {
        return Payment.findByPk(id);
    }

    create(data: Record<string, unknown>) {
        return Payment.create(data as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Payment.update(data, { where: { id } });
    }

    findOrder(id: number) {
        return Order.findByPk(id);
    }

    updateOrderStatus(id: number, status: string) {
        return Order.update({ status: status as never }, { where: { id } });
    }
}

export default new PaymentRepository();
