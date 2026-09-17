import SellerPortalRepository from './repository/seller-portal.repository';
import { ForbiddenException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { buildPagination } from '../../../../Common/utils/Pagination';
import { FulfillmentUpdatePayload } from './validations/seller-portal.validation';

const SHIPPED_STATUSES = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
const LOW_STOCK_THRESHOLD = 5;

class SellerPortalService {
    async dashboard(sellerId: number) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthItems = await SellerPortalRepository.salesTotalForSeller(sellerId, monthStart);
        const salesThisMonth = monthItems.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);

        const allItems = await SellerPortalRepository.salesTotalForSeller(sellerId);
        const totalEarnings = allItems.reduce((sum, i) => sum + i.sellerEarning, 0);
        const alreadyPaidOut = (await SellerPortalRepository.sumNetPayableForSeller(sellerId)) || 0;
        const pendingPayoutAmount = Math.max(0, totalEarnings - alreadyPaidOut);

        const orderCount = await SellerPortalRepository.distinctOrderCountForSeller(sellerId);
        const lowStockCount = await SellerPortalRepository.lowStockCountForSeller(sellerId, LOW_STOCK_THRESHOLD);

        return { salesThisMonth, pendingPayoutAmount, orderCount, lowStockCount };
    }

    async listOrderItems(sellerId: number, page: number, pageSize: number, offset: number, limit: number) {
        const { rows, count } = await SellerPortalRepository.findOrderItemsForSeller(sellerId, offset, limit);
        return { items: rows, ...buildPagination(count, page, pageSize) };
    }

    async updateFulfillment(orderItemId: number, sellerId: number, payload: FulfillmentUpdatePayload) {
        const orderItem = await SellerPortalRepository.findOrderItemById(orderItemId);
        if (!orderItem) throw new RecordNotFoundException('Order item not found.');
        if (orderItem.sellerId !== sellerId) throw new ForbiddenException('You do not own this order item.');

        await SellerPortalRepository.updateOrderItemFulfillment(orderItemId, payload.status);

        // Create/update this seller's Shipment for the order once any of their items moves
        // past 'pending', and (re)link every one of their order items in this order to it.
        if (SHIPPED_STATUSES.includes(payload.status)) {
            const sellerItems = await SellerPortalRepository.findOrderItemsForOrderAndSeller(orderItem.orderId, sellerId);
            const existingShipment = await SellerPortalRepository.findShipmentForOrderAndSeller(orderItem.orderId, sellerId);
            const event = { status: payload.status, timestamp: new Date().toISOString() };

            let shipmentId: number;
            if (existingShipment) {
                shipmentId = existingShipment.id;
                await SellerPortalRepository.updateShipment(existingShipment.id, {
                    status: payload.status,
                    trackingHistory: [...existingShipment.trackingHistory, event]
                });
            } else {
                const created = await SellerPortalRepository.createShipment({
                    orderId: orderItem.orderId,
                    sellerId,
                    carrier: 'Shiprocket',
                    status: payload.status,
                    trackingHistory: [event]
                });
                shipmentId = created.id;
            }

            await SellerPortalRepository.linkShipmentItems(
                shipmentId,
                sellerItems.map((i) => i.id)
            );
        }

        // Order-level status is a roll-up of every item's fulfillment state across all sellers.
        const allItemsInOrder = await SellerPortalRepository.findAllOrderItemsForOrder(orderItem.orderId);
        const refreshed = allItemsInOrder.map((i) => (i.id === orderItemId ? { ...i.toJSON(), fulfillmentStatus: payload.status } : i.toJSON()));
        if (refreshed.every((i) => i.fulfillmentStatus === 'delivered')) {
            await SellerPortalRepository.updateOrderStatus(orderItem.orderId, 'delivered');
        } else if (refreshed.some((i) => SHIPPED_STATUSES.includes(i.fulfillmentStatus))) {
            await SellerPortalRepository.updateOrderStatus(orderItem.orderId, 'shipped');
        }

        return SellerPortalRepository.findOrderItemById(orderItemId);
    }

    async listPayouts(sellerId: number) {
        const payouts = await SellerPortalRepository.findPayoutsForSeller(sellerId);
        const allItems = await SellerPortalRepository.salesTotalForSeller(sellerId);
        const totalEarnings = allItems.reduce((sum, i) => sum + i.sellerEarning, 0);
        const alreadyPaidOut = (await SellerPortalRepository.sumNetPayableForSeller(sellerId)) || 0;
        const pendingBalance = Math.max(0, totalEarnings - alreadyPaidOut);
        return { payouts, pendingBalance };
    }
}

export default new SellerPortalService();
