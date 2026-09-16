import PaymentRepository from './repository/payment.repository';
import { getRazorpayClient, verifyPaymentSignature } from './services/razorpayClient';
import { BadRequestException, RecordNotFoundException, ValidationException } from '../../../../Common/httpErrorClasses';
import { CreateIntentPayload, VerifyPaymentPayload, RefundPayload } from './validations/payment.validation';
import WinstonLogger from '../../../../Common/logger/WinstonLogger';

const COD_MAX_AMOUNT_PAISE = Number(process.env.COD_MAX_AMOUNT_PAISE || 500000);

class PaymentService {
    async createIntent(payload: CreateIntentPayload) {
        const order = await PaymentRepository.findOrder(payload.orderId);
        if (!order) throw new RecordNotFoundException('Order not found.');

        if (payload.method === 'cod') {
            if (order.total > COD_MAX_AMOUNT_PAISE) {
                throw new ValidationException('This order exceeds the COD eligibility limit.');
            }
            const payment = await PaymentRepository.create({
                orderId: order.id,
                gateway: 'cod',
                method: 'cod',
                amount: order.total,
                status: 'initiated'
            });
            return { gatewayOrderId: null, amount: order.total, currency: 'INR', key: null, paymentId: payment.id };
        }

        const razorpay = getRazorpayClient();
        const gatewayOrder = await razorpay.orders.create({
            amount: order.total,
            currency: 'INR',
            receipt: order.orderNumber,
            notes: { orderId: String(order.id) }
        });

        await PaymentRepository.create({
            orderId: order.id,
            gateway: 'razorpay',
            gatewayOrderId: gatewayOrder.id,
            method: payload.method,
            amount: order.total,
            status: 'initiated'
        });

        return {
            gatewayOrderId: gatewayOrder.id,
            amount: order.total,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID
        };
    }

    async verify(payload: VerifyPaymentPayload) {
        const isValid = verifyPaymentSignature(payload.gatewayOrderId, payload.paymentId, payload.signature);
        if (!isValid) {
            throw new BadRequestException('Payment signature verification failed.');
        }

        const payment = await PaymentRepository.findByGatewayOrderId(payload.gatewayOrderId);
        if (!payment) throw new RecordNotFoundException('Payment record not found for this gateway order.');

        await PaymentRepository.update(payment.id, {
            gatewayPaymentId: payload.paymentId,
            status: 'captured'
        });
        await PaymentRepository.updateOrderStatus(payment.orderId, 'confirmed');

        const order = await PaymentRepository.findOrder(payment.orderId);
        return { success: true, order };
    }

    /** Server-to-server webhook — trusts the gateway payload once the HMAC signature is verified upstream. */
    async handleWebhook(payload: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } }) {
        WinstonLogger.logger.log({ message: `[PaymentService] Webhook event: ${payload.event}`, level: 'info' });
        const entity = payload.payload?.payment?.entity;
        if (!entity) return { received: true };

        const gatewayOrderId = entity.order_id as string | undefined;
        if (!gatewayOrderId) return { received: true };

        const payment = await PaymentRepository.findByGatewayOrderId(gatewayOrderId);
        if (!payment) return { received: true };

        await PaymentRepository.update(payment.id, { rawWebhookPayload: payload });

        if (payload.event === 'payment.captured') {
            await PaymentRepository.update(payment.id, { status: 'captured' });
            await PaymentRepository.updateOrderStatus(payment.orderId, 'confirmed');
        } else if (payload.event === 'payment.failed') {
            await PaymentRepository.update(payment.id, { status: 'failed' });
        }

        return { received: true };
    }

    async refund(paymentId: number, payload: RefundPayload) {
        const payment = await PaymentRepository.findById(paymentId);
        if (!payment) throw new RecordNotFoundException('Payment not found.');

        const refundAmount = payload.amount ?? payment.amount - payment.refundedAmount;
        if (refundAmount <= 0 || payment.refundedAmount + refundAmount > payment.amount) {
            throw new ValidationException('Invalid refund amount.');
        }

        let refundId = `stub-refund-${payment.id}-${Date.now()}`;
        if (payment.gateway === 'razorpay' && payment.gatewayPaymentId) {
            const razorpay = getRazorpayClient();
            const refund = await razorpay.payments.refund(payment.gatewayPaymentId, { amount: refundAmount });
            refundId = refund.id;
        }

        const newRefundedAmount = payment.refundedAmount + refundAmount;
        const status = newRefundedAmount >= payment.amount ? 'refunded' : 'partially_refunded';
        await PaymentRepository.update(payment.id, { refundedAmount: newRefundedAmount, status });

        return { refundId, status };
    }

    codEligibility(_pincode: string, amount: number) {
        return { eligible: amount <= COD_MAX_AMOUNT_PAISE };
    }
}

export default new PaymentService();
