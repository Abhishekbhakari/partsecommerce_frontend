import OrderRepository from './repository/order.repository';
import { ForbiddenException, RecordNotFoundException, ValidationException } from '../../../../Common/httpErrorClasses';
import WinstonLogger from '../../../../Common/logger/WinstonLogger';
import { buildPagination } from '../../../../Common/utils/Pagination';
import { CancelOrderPayload, ReturnOrderPayload } from './validations/order.validation';

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

class OrderService {
    async getById(id: number, requester: { userId: number; type: 'customer' | 'admin' | 'seller' } | undefined) {
        const order = await OrderRepository.findById(id);
        if (!order) throw new RecordNotFoundException('Order not found.');
        if (requester?.type === 'customer' && order.userId !== requester.userId) {
            throw new ForbiddenException();
        }
        return order;
    }

    async listForUser(userId: number, page: number, pageSize: number, offset: number, limit: number) {
        const { rows, count } = await OrderRepository.findAllForUser(userId, offset, limit);
        return { items: rows, ...buildPagination(count, page, pageSize) };
    }

    async cancel(id: number, requester: { userId: number; type: 'customer' | 'admin' | 'seller' }, _payload: CancelOrderPayload) {
        const order = await this.getById(id, requester);
        if (!CANCELLABLE_STATUSES.includes(order.status)) {
            throw new ValidationException('This order can no longer be cancelled.');
        }
        await OrderRepository.updateStatus(id, 'cancelled');
        return OrderRepository.findById(id);
    }

    async requestReturn(id: number, requester: { userId: number; type: 'customer' | 'admin' | 'seller' }, payload: ReturnOrderPayload) {
        const order = await this.getById(id, requester);
        if (order.status !== 'delivered') {
            throw new ValidationException('Only delivered orders are eligible for return.');
        }
        await OrderRepository.updateStatus(id, 'returned');
        return { returnId: `RET-${order.orderNumber}`, status: 'requested', items: payload.items, reason: payload.reason };
    }

    async listAdmin(filters: { status?: string; q?: string }, page: number, pageSize: number, offset: number, limit: number) {
        const { rows, count } = await OrderRepository.findAllAdmin(filters, offset, limit);
        return { items: rows, ...buildPagination(count, page, pageSize) };
    }

    /**
     * Admin order-level status change. 'shipped' and 'delivered' are the two states a buyer relies
     * on as proof the goods moved, so they can't be set by hand without the seller's photo proof:
     *  - shipped   needs at least one item already dispatched by its seller (which required a photo)
     *  - delivered needs EVERY item delivered by its seller (which required a delivery photo)
     * Without this the admin dropdown would bypass the whole proof rule. Genuine exceptions — e.g.
     * the platform's own stock, whose "PartsHub Direct" seller has no login — go through an
     * owner-only override that requires a written reason and is logged with who did it.
     */
    async updateStatus(
        id: number,
        status: string,
        actor?: { userId: number; role?: string },
        overrideReason?: string
    ) {
        const order = await OrderRepository.findById(id);
        if (!order) throw new RecordNotFoundException('Order not found.');

        if (status === 'shipped' || status === 'delivered') {
            const items = ((order as unknown as { items?: { fulfillmentStatus?: string }[] }).items ?? []);
            const dispatched = (s?: string) => !!s && s !== 'pending' && s !== 'failed';
            const satisfied =
                status === 'delivered'
                    ? items.length > 0 && items.every((i) => i.fulfillmentStatus === 'delivered')
                    : items.some((i) => dispatched(i.fulfillmentStatus));

            if (!satisfied) {
                if (!overrideReason) {
                    throw new ValidationException(
                        status === 'delivered'
                            ? 'Every item must be marked delivered by its seller, with a delivery photo, before the order can be set to Delivered.'
                            : 'At least one item must be dispatched by its seller, with a packed-item photo, before the order can be set to Shipped.'
                    );
                }
                if (actor?.role !== 'owner') {
                    throw new ForbiddenException('Only an owner can override the photo-proof requirement.');
                }
                WinstonLogger.logger.log({
                    message: `[ProofOverride] admin#${actor.userId} set order#${id} to '${status}' without seller proof. Reason: ${overrideReason}`,
                    level: 'warn'
                });
            }
        }

        await OrderRepository.updateStatus(id, status);
        return OrderRepository.findById(id);
    }

    async listCustomers(page: number, pageSize: number, offset: number, limit: number, q?: string) {
        const { rows, count } = await OrderRepository.findCustomers(offset, limit, q);
        return { items: rows, ...buildPagination(count, page, pageSize) };
    }

    async getCustomer(id: number) {
        const customer = await OrderRepository.findCustomerById(id);
        if (!customer) throw new RecordNotFoundException('Customer not found.');
        return customer;
    }
}

export default new OrderService();
