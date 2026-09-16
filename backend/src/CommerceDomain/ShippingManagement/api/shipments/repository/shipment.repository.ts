import { Shipment, Order } from '../../../../../Common/database/models';

class ShipmentRepository {
    findByOrderId(orderId: number) {
        return Shipment.findOne({ where: { orderId } });
    }

    findOrder(orderId: number) {
        return Order.findByPk(orderId);
    }

    create(data: Record<string, unknown>) {
        return Shipment.create(data as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Shipment.update(data, { where: { id } });
    }

    findByAwb(awbNumber: string) {
        return Shipment.findOne({ where: { awbNumber } });
    }
}

export default new ShipmentRepository();
