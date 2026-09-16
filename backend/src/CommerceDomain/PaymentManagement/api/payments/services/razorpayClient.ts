import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Lazily-constructed Razorpay SDK client. Reads keys from env — safe to import even when
 * RAZORPAY_KEY_ID/SECRET aren't set yet (dev/CI); the error only surfaces if a route that
 * actually needs the gateway is hit.
 */
let client: Razorpay | null = null;

export const getRazorpayClient = (): Razorpay => {
    if (!client) {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_id || !key_secret) {
            throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured.');
        }
        client = new Razorpay({ key_id, key_secret });
    }
    return client;
};

/** HMAC-SHA256 signature verification for the client-side payment callback. */
export const verifyPaymentSignature = (gatewayOrderId: string, paymentId: string, signature: string): boolean => {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${gatewayOrderId}|${paymentId}`)
        .digest('hex');
    return expected === signature;
};

/** HMAC-SHA256 verification for the Razorpay server-to-server webhook. */
export const verifyWebhookSignature = (rawBody: string, signature: string): boolean => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
};
