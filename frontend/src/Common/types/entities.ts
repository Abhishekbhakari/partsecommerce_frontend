/** TypeScript mirrors of docs/DATA_MODEL.md entities, trimmed to fields the UI consumes. */

export interface User {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  authProvider: "otp" | "email" | "google";
  isVerified: boolean;
}

export interface Address {
  id: number;
  userId?: number | null;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  imageUrl?: string;
  sortOrder?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  skuSuffix: string;
  priceDelta: number;
  stock: number;
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  barcode?: string | null;
}

export interface FitmentCompatibility {
  id: number;
  productId: number;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  variant?: string | null;
}

export type ProductStatus = "draft" | "active" | "archived";

export interface ProductSellerSummary {
  id: number;
  businessName: string;
}

export interface ProductSummary {
  id: number;
  sku: string;
  title: string;
  slug: string;
  categoryId: number;
  brandId: number;
  sellerId?: number;
  partNumber?: string;
  oemNumber?: string;
  basePrice: number;
  gstRate: number;
  images: string[];
  status: ProductStatus;
  avgRating: number;
  reviewCount: number;
  category?: Category;
  brand?: Brand;
  seller?: ProductSellerSummary;
  inStock?: boolean;
}

export interface Product extends ProductSummary {
  description: string;
  variants: ProductVariant[];
  fitment: FitmentCompatibility[];
}

export interface CartItem {
  id: number;
  cartId: number;
  variantId: number;
  qty: number;
  priceAtAdd: number;
  variant?: ProductVariant;
  product?: ProductSummary;
}

export interface Cart {
  id: number;
  userId?: number | null;
  sessionId?: string | null;
  couponId?: number | null;
  couponCode?: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type FulfillmentStatus = "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed";

/** Photo evidence a seller submits when dispatching an item and again on delivery. `createdAt` is
 * set by the server, not the client, so it is a trustworthy "when was this claimed" timestamp. */
export interface FulfillmentProof {
  id: number;
  orderItemId: number;
  stage: "dispatch" | "delivery";
  imageUrls: string[];
  note: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  productTitleSnapshot: string;
  qty: number;
  unitPrice: number;
  gstRateSnapshot: number;
  sellerId?: number;
  commissionRate?: number;
  commissionAmount?: number;
  sellerEarning?: number;
  fulfillmentStatus?: FulfillmentStatus;
  proofs?: FulfillmentProof[];
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number | null;
  guestEmail?: string | null;
  status: OrderStatus;
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shippingFee: number;
  gstAmount: number;
  total: number;
  items: OrderItem[];
  placedAt: string;
  createdAt: string;
}

export interface TrackingEvent {
  status: string;
  timestamp: string;
  location?: string;
}

export interface Shipment {
  id: number;
  orderId: number;
  carrier: string;
  awbNumber?: string;
  status: string;
  trackingHistory: TrackingEvent[];
  estimatedDelivery?: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName?: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: "percentage" | "flat";
  value: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  validFrom: string;
  validTo: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  active: boolean;
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  link?: string;
  placement: string;
  active: boolean;
}

export type AdminRole = "owner" | "manager" | "catalog_editor" | "order_manager" | "support";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt?: string | null;
}

export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";

export interface PayoutBankDetails {
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
}

/** Where couriers collect this seller's parcels; its pincode drives every shipping quote. */
export interface PickupAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Seller {
  id: number;
  businessName: string;
  email: string;
  phone?: string | null;
  gstNumber?: string | null;
  status: SellerStatus;
  commissionRateOverride?: number | null;
  payoutBankDetails?: PayoutBankDetails | null;
  pickupAddress?: PickupAddress | null;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerPayout {
  id: number;
  sellerId: number;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  commissionDeducted: number;
  netPayable: number;
  status: "pending" | "paid";
  paidAt?: string | null;
  createdAt: string;
}

export interface SellerDashboardStats {
  salesThisMonth: number;
  pendingPayoutAmount: number;
  orderCount: number;
  lowStockCount: number;
  recentOrders?: Order[];
}
