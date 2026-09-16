import type { Address, Order } from "@/Common/types/entities";

export interface CheckoutRequest {
  addressId?: number;
  address?: Partial<Address>;
  guestEmail?: string;
}

export interface CheckoutResponse {
  orderId: number;
  amountDue: number;
  gst: number;
}

export interface PincodeCheckResponse {
  serviceable: boolean;
  etaDays: number;
  shippingFee: number;
}

export interface PaymentIntentResponse {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export type { Order };
