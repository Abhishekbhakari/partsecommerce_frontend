import ShipmentRepository from './repository/shipment.repository';
import { DuplicateRecordException, RecordNotFoundException, ForbiddenException } from '../../../../Common/httpErrorClasses';
import { CreateShipmentPayload } from './validations/shipment.validation';

/**
 * Structurally mirrors a Shiprocket-style create-shipment call, but stubs the actual
 * courier API — `carrier`/`awbNumber` are generated locally. Swap `createRemoteShipment`
 * for a real Shiprocket SDK/HTTP call (auth via SHIPROCKET_EMAIL/PASSWORD) in production.
 */
class ShipmentService {
    async create(payload: CreateShipmentPayload) {
        const order = await ShipmentRepository.findOrder(payload.orderId);
        if (!order) throw new RecordNotFoundException('Order not found.');

        const existing = await ShipmentRepository.findByOrderId(payload.orderId);
        if (existing) throw new DuplicateRecordException('A shipment already exists for this order.');

        const awbNumber = `AWB${Date.now()}${payload.orderId}`;
        const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

        const shipment = await ShipmentRepository.create({
            orderId: payload.orderId,
            carrier: 'Shiprocket',
            awbNumber,
            status: 'pending',
            trackingHistory: [{ status: 'pending', timestamp: new Date().toISOString() }],
            estimatedDelivery
        });

        return shipment;
    }

    async track(orderId: number, requester: { userId: number; type: 'customer' | 'admin' } | undefined) {
        const shipment = await ShipmentRepository.findByOrderId(orderId);
        if (!shipment) throw new RecordNotFoundException('No shipment found for this order.');

        if (requester?.type === 'customer') {
            const order = await ShipmentRepository.findOrder(orderId);
            if (!order || order.userId !== requester.userId) throw new ForbiddenException();
        }

        return { status: shipment.status, history: shipment.trackingHistory };
    }

    async handleWebhook(payload: { awbNumber?: string; status?: string; location?: string }) {
        if (!payload.awbNumber || !payload.status) return { received: true };
        const shipment = await ShipmentRepository.findByAwb(payload.awbNumber);
        if (!shipment) return { received: true };

        const event = { status: payload.status, timestamp: new Date().toISOString(), location: payload.location };
        await ShipmentRepository.update(shipment.id, {
            status: payload.status,
            trackingHistory: [...shipment.trackingHistory, event]
        });

        return { received: true };
    }
}

export default new ShipmentService();
