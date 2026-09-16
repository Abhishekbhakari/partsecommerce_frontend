# API Contract — Spare Parts E-commerce Platform

This is the binding contract between Backend and Frontend. Base path: `/api/v1`. All authenticated routes require `Authorization: Bearer <jwt>` unless noted. Response shapes are brief/illustrative, not exhaustive — see `DATA_MODEL.md` for full entity fields.

**Changelog:** v1 published Week 2 (frozen). Any post-freeze change must be logged here with date + reason.

## Auth

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| POST | /auth/otp/request | Send OTP to phone/email | Public | `{ identifier }` | `{ requestId }` |
| POST | /auth/otp/verify | Verify OTP, issue tokens | Public | `{ requestId, otp }` | `{ accessToken, refreshToken, user }` |
| POST | /auth/email/login | Email+password login | Public | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | /auth/email/register | Email+password signup | Public | `{ name, email, password }` | `{ accessToken, refreshToken, user }` |
| POST | /auth/google | Google OAuth token exchange | Public | `{ idToken }` | `{ accessToken, refreshToken, user }` |
| POST | /auth/refresh | Refresh access token | Public (refresh token) | `{ refreshToken }` | `{ accessToken }` |
| POST | /auth/logout | Invalidate refresh token | User | — | `{ success }` |

## Products / Catalog / Search / Fitment

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| GET | /categories | List category tree | Public | query: `parentId?` | `Category[]` |
| GET | /brands | List brands | Public | query: `search?` | `Brand[]` |
| GET | /products | List/filter/paginate products | Public | query: `category, brand, priceMin, priceMax, sort, page, pageSize, q` | `{ items: Product[], total, page }` |
| GET | /products/:slug | Product detail incl. variants | Public | — | `Product` (with `variants[]`, `fitment[]`) |
| GET | /search/autocomplete | Search-as-you-type suggestions | Public | query: `q` | `{ suggestions: string[], products: ProductSummary[] }` |
| GET | /search | Full search (part number, OEM, keyword) | Public | query: `q, page, pageSize` | `{ items: Product[], total }` |
| GET | /fitment/lookup | Fitment finder: parts for make/model/year | Public | query: `make, model, year` | `{ items: Product[], total }` |
| GET | /fitment/options | Get available makes/models/years | Public | query: `make?, model?` | `{ makes[], models[], years[] }` |
| POST | /admin/products/import | Bulk CSV import | Admin | multipart CSV file | `{ jobId, status }` |
| GET | /admin/products/export | Bulk CSV export | Admin | query: `category?` | CSV file stream |

## Customer Account

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| GET | /me | Current user profile | User | — | `User` |
| PATCH | /me | Update profile | User | `{ name, email, phone }` | `User` |
| GET | /me/addresses | List saved addresses | User | — | `Address[]` |
| POST | /me/addresses | Add address | User | `Address` fields | `Address` |
| PATCH | /me/addresses/:id | Update address | User | `Address` fields | `Address` |
| DELETE | /me/addresses/:id | Delete address | User | — | `{ success }` |
| GET | /me/wishlist | List wishlist items | User | — | `Product[]` |
| POST | /me/wishlist/:productId | Add to wishlist | User | — | `{ success }` |
| DELETE | /me/wishlist/:productId | Remove from wishlist | User | — | `{ success }` |
| GET | /me/orders | Order history | User | query: `page, pageSize` | `{ items: Order[], total }` |

## Cart

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| GET | /cart | Get current cart (session or user) | Public/User | header: `X-Cart-Session?` | `Cart` |
| POST | /cart/items | Add item | Public/User | `{ variantId, qty }` | `Cart` |
| PATCH | /cart/items/:id | Update qty | Public/User | `{ qty }` | `Cart` |
| DELETE | /cart/items/:id | Remove item | Public/User | — | `Cart` |
| POST | /cart/apply-coupon | Apply coupon code | Public/User | `{ code }` | `Cart` (with discount) |
| DELETE | /cart/coupon | Remove coupon | Public/User | — | `Cart` |
| GET | /cart/pincode-check | Serviceability + shipping estimate | Public | query: `pincode` | `{ serviceable, etaDays, shippingFee }` |

## Checkout & Orders

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| POST | /checkout | Create order from cart (guest or user) | Public/User | `{ addressId or address, cartId, guestEmail? }` | `{ orderId, amountDue, gst }` |
| GET | /orders/:id | Order detail | User (own) / Admin | — | `Order` (with items, payment, shipment) |
| POST | /orders/:id/cancel | Cancel order | User (own) / Admin | `{ reason }` | `Order` |
| POST | /orders/:id/return | Request return | User (own) | `{ items, reason }` | `{ returnId, status }` |

## Payments

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| POST | /payments/create-intent | Create Razorpay order/intent | User/Public (checkout session) | `{ orderId, method }` | `{ gatewayOrderId, amount, currency, key }` |
| POST | /payments/verify | Verify payment signature after client callback | Public | `{ gatewayOrderId, paymentId, signature }` | `{ success, order }` |
| POST | /payments/webhook | Gateway server-to-server webhook (Razorpay etc.) | Signed webhook | gateway payload | `{ received: true }` |
| POST | /payments/:id/refund | Initiate refund | Admin | `{ amount?, reason }` | `{ refundId, status }` |
| GET | /payments/cod-eligibility | Check COD availability for pincode/amount | Public | query: `pincode, amount` | `{ eligible }` |

## Shipping & Tracking

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| POST | /shipments | Create shipment (Shiprocket) after order confirm | Admin/System | `{ orderId }` | `Shipment` |
| GET | /shipments/:orderId/track | Get tracking status | User (own) / Admin | — | `{ status, history: TrackingEvent[] }` |
| POST | /shipments/webhook | Shiprocket status webhook | Signed webhook | payload | `{ received: true }` |

## Reviews

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| GET | /products/:id/reviews | List reviews for product | Public | query: `page, pageSize` | `{ items: Review[], total, avgRating }` |
| POST | /products/:id/reviews | Submit review | User (verified purchase) | `{ rating, comment }` | `Review` |
| PATCH | /admin/reviews/:id | Moderate (approve/reject) | Admin | `{ status }` | `Review` |
| DELETE | /admin/reviews/:id | Remove review | Admin | — | `{ success }` |

## Admin — Products & Inventory

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| POST | /admin/products | Create product | Admin | `Product` fields | `Product` |
| PATCH | /admin/products/:id | Update product | Admin | partial `Product` | `Product` |
| DELETE | /admin/products/:id | Delete/archive product | Admin | — | `{ success }` |
| PATCH | /admin/products/:id/inventory | Update stock levels | Admin | `{ variantId, stock }` | `{ success }` |
| GET | /admin/inventory/low-stock | Low-stock report | Admin | query: `threshold?` | `Product[]` |

## Admin — Orders & Customers

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| GET | /admin/orders | List/filter orders | Admin | query: `status, page, pageSize, q` | `{ items: Order[], total }` |
| PATCH | /admin/orders/:id/status | Update order status | Admin | `{ status }` | `Order` |
| GET | /admin/customers | List/search customers | Admin | query: `q, page, pageSize` | `{ items: User[], total }` |
| GET | /admin/customers/:id | Customer detail + order history | Admin | — | `User` with `orders[]` |

## Admin — Coupons, Banners/CMS, Reports, Staff

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| GET | /admin/coupons | List coupons | Admin | — | `Coupon[]` |
| POST | /admin/coupons | Create coupon | Admin | `Coupon` fields | `Coupon` |
| PATCH | /admin/coupons/:id | Update coupon | Admin | partial `Coupon` | `Coupon` |
| DELETE | /admin/coupons/:id | Delete coupon | Admin | — | `{ success }` |
| GET | /admin/banners | List CMS banners | Admin | — | `Banner[]` |
| POST | /admin/banners | Create banner | Admin | `{ title, imageUrl, link, placement, active }` | `Banner` |
| PATCH | /admin/banners/:id | Update banner | Admin | partial | `Banner` |
| DELETE | /admin/banners/:id | Delete banner | Admin | — | `{ success }` |
| GET | /admin/reports/sales | Sales analytics | Admin | query: `from, to, groupBy` | `{ series: ReportPoint[] }` |
| GET | /admin/reports/inventory | Inventory analytics | Admin | — | `{ series: ReportPoint[] }` |
| GET | /admin/staff | List staff/admin users | Admin (owner role) | — | `AdminUser[]` |
| POST | /admin/staff | Invite staff member | Admin (owner role) | `{ email, role }` | `AdminUser` |
| PATCH | /admin/staff/:id/role | Change staff role | Admin (owner role) | `{ role }` | `AdminUser` |
| DELETE | /admin/staff/:id | Remove staff member | Admin (owner role) | — | `{ success }` |

## Notifications & Invoicing

| Method | Path | Purpose | Auth | Request | Response |
|---|---|---|---|---|---|
| GET | /me/notifications | List notifications | User | query: `page, pageSize` | `{ items: Notification[], total }` |
| PATCH | /me/notifications/:id/read | Mark as read | User | — | `{ success }` |
| GET | /orders/:id/invoice | Download GST invoice PDF | User (own) / Admin | — | PDF file stream |
| POST | /admin/notifications/broadcast | Send bulk email/SMS/WhatsApp (e.g. promo) | Admin | `{ segment, channel, template, params }` | `{ jobId }` |

## Conventions

- **Pagination:** `page` (1-indexed), `pageSize` (default 20, max 100); all list responses include `total`.
- **Auth levels:** `Public` (no token), `User` (any logged-in customer), `Admin` (staff with matching role), `Public/User` (works for guest via session, upgraded for logged-in).
- **Errors:** standard shape `{ error: { code, message, details? } }` with appropriate HTTP status.
- **Money:** all amounts in paise (integer) to avoid float issues; currency always INR for v1.
- **Timestamps:** ISO 8601 UTC.
