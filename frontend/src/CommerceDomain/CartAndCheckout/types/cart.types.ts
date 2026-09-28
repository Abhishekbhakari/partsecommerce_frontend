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

/** One parcel = one seller's items. Shipping is priced per parcel, so a cart with items from two
 * sellers ships (and is charged) as two parcels. */
export interface ShipmentQuote {
  sellerId: number;
  sellerName: string;
  pickupPincode: string;
  chargeableWeightGrams: number;
  courierName: string;
  amountPaise: number;
  etaDays: number;
  /** 'shiprocket' = live courier rate; 'estimate' = our own zone/weight table. */
  source: "shiprocket" | "estimate";
  pickupAddressMissing: boolean;
}

export interface PincodeCheckResponse {
  serviceable: boolean;
  etaDays: number | null;
  shippingFee: number | null;
  shipments: ShipmentQuote[];
  /** True when quotes come from a live courier account rather than the estimate table. */
  live: boolean;
}

export interface PaymentIntentResponse {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export type { Order };
