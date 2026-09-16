import api from "@/Common/lib/api";
import type { Order } from "@/Common/types/entities";
import type { CheckoutRequest, CheckoutResponse, PaymentIntentResponse } from "../types/cart.types";

/** Per docs/API_CONTRACT.md "Checkout & Orders" and "Payments". */
export const checkoutService = {
  checkout: (data: CheckoutRequest) => api.post<CheckoutResponse>("/checkout", data),

  getOrder: (id: number | string) => api.get<Order>(`/orders/${id}`),

  cancelOrder: (id: number, reason: string) => api.post<Order>(`/orders/${id}/cancel`, { reason }),

  requestReturn: (id: number, items: { orderItemId: number; qty: number }[], reason: string) =>
    api.post(`/orders/${id}/return`, { items, reason }),

  createPaymentIntent: (orderId: number, method: string) =>
    api.post<PaymentIntentResponse>("/payments/create-intent", { orderId, method }),

  verifyPayment: (gatewayOrderId: string, paymentId: string, signature: string) =>
    api.post("/payments/verify", { gatewayOrderId, paymentId, signature }),

  codEligibility: (pincode: string, amount: number) =>
    api.get<{ eligible: boolean }>("/payments/cod-eligibility", { params: { pincode, amount } }),

  trackShipment: (orderId: number | string) => api.get(`/shipments/${orderId}/track`),

  getInvoiceUrl: (orderId: number | string) => `${api.defaults.baseURL}/orders/${orderId}/invoice`
};

/** My-orders calls live here (Order entity is owned by CartAndCheckout per DATA_MODEL.md) and
 * are re-used by FoundationalService/CustomerAccountManagement's order-history screens. */
export const myOrdersService = {
  list: (page = 1, pageSize = 10) => api.get<{ items: Order[]; total: number }>("/me/orders", { params: { page, pageSize } })
};
