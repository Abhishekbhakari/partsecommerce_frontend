import OrderRepository from './repository/order.repository';
import { ForbiddenException, RecordNotFoundException, ValidationException } from '../../../../Common/httpErrorClasses';
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

    async updateStatus(id: number, status: string) {
        const order = await OrderRepository.findById(id);
        if (!order) throw new RecordNotFoundException('Order not found.');
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
