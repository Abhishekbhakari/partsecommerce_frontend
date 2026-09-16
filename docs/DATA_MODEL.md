# Data Model — Spare Parts E-commerce Platform

Core entities, key fields, and relationships. This is not full DDL — Backend derives actual migrations from this; Frontend derives TypeScript types from this. Frozen after Week 1; changes need a note here plus a heads-up to both other agents.

## User
| Field | Notes |
|---|---|
| id | PK |
| name | |
| email | unique, nullable if phone-only signup |
| phone | unique, nullable if email-only signup |
| authProvider | `otp` \| `email` \| `google` |
| passwordHash | nullable (only for email/password) |
| googleId | nullable |
| isVerified | bool |
| createdAt / updatedAt | |

**Relationships:** has many `Address`, `Order`, `Review`, `Notification`; has many `Product` via `Wishlist` (join table).

## Address
| Field | Notes |
|---|---|
| id | PK |
| userId | FK → User, nullable for guest orders (address captured on Order instead) |
| label | e.g. "Home", "Work" |
| line1, line2 | |
| city, state, pincode | |
| country | default "IN" |
| phone | contact for delivery |
| isDefault | bool |

**Relationships:** belongs to `User`; referenced by `Order.shippingAddress`.

## Category
| Field | Notes |
|---|---|
| id | PK |
| name, slug | |
| parentId | FK → Category (self-referential, nullable — supports subcategories) |
| imageUrl | |
| sortOrder | |

**Relationships:** has many `Product`; self-referential tree.

## Brand
| Field | Notes |
|---|---|
| id | PK |
| name, slug | |
| logoUrl | |

**Relationships:** has many `Product`.

## Product
| Field | Notes |
|---|---|
| id | PK |
| sku | unique, human-readable |
| title, slug | |
| description | |
| categoryId | FK → Category |
| brandId | FK → Brand |
| partNumber | manufacturer part number, indexed for search |
| oemNumber | OEM cross-reference number, indexed for search |
| basePrice | in paise |
| gstRate | percentage, e.g. 18 |
| images | array of URLs |
| status | `draft` \| `active` \| `archived` |
| avgRating, reviewCount | denormalized for listing performance |
| createdAt / updatedAt | |

**Relationships:** belongs to `Category`, `Brand`; has many `ProductVariant`, `FitmentCompatibility`, `Review`.

## ProductVariant
| Field | Notes |
|---|---|
| id | PK |
| productId | FK → Product |
| name | e.g. "Left / Right", "Size M" |
| skuSuffix | |
| priceDelta | paise, added to `Product.basePrice` |
| stock | integer |
| weightGrams | for shipping calc |
| barcode | nullable |

**Relationships:** belongs to `Product`; referenced by `CartItem`, `OrderItem`.

## FitmentCompatibility
| Field | Notes |
|---|---|
| id | PK |
| productId | FK → Product |
| make | e.g. "Maruti Suzuki" |
| model | e.g. "Swift" |
| yearFrom, yearTo | inclusive range |
| variant | trim/engine variant, nullable |

**Relationships:** belongs to `Product`. Indexed on (make, model, yearFrom, yearTo) for fitment finder queries.

## Cart
| Field | Notes |
|---|---|
| id | PK |
| userId | FK → User, nullable for guest |
| sessionId | for guest carts, stored client-side/cookie |
| couponId | FK → Coupon, nullable |
| createdAt / updatedAt | |

**Relationships:** has many `CartItem`; optionally belongs to `User`; optionally has one `Coupon`.

## CartItem
| Field | Notes |
|---|---|
| id | PK |
| cartId | FK → Cart |
| variantId | FK → ProductVariant |
| qty | integer |
| priceAtAdd | paise, snapshot for display consistency |

**Relationships:** belongs to `Cart`, `ProductVariant`.

## Order
| Field | Notes |
|---|---|
| id | PK |
| orderNumber | human-readable, unique |
| userId | FK → User, nullable for guest |
| guestEmail | nullable, used when userId null |
| status | `pending` \| `confirmed` \| `packed` \| `shipped` \| `delivered` \| `cancelled` \| `returned` |
| shippingAddress | denormalized snapshot (JSON) of Address at time of order |
| subtotal, discount, shippingFee, gstAmount, total | all paise |
| couponId | FK → Coupon, nullable |
| placedAt | |
| createdAt / updatedAt | |

**Relationships:** belongs to `User` (nullable); has many `OrderItem`; has one `Payment`; has one `Shipment`.

## OrderItem
| Field | Notes |
|---|---|
| id | PK |
| orderId | FK → Order |
| variantId | FK → ProductVariant |
| productTitleSnapshot | denormalized |
| qty | |
| unitPrice | paise, snapshot |
| gstRateSnapshot | |

**Relationships:** belongs to `Order`, `ProductVariant`.

## Payment
| Field | Notes |
|---|---|
| id | PK |
| orderId | FK → Order |
| gateway | `razorpay` \| `cod` \| etc. |
| gatewayOrderId, gatewayPaymentId | nullable until captured |
| method | `upi` \| `card` \| `netbanking` \| `wallet` \| `cod` |
| amount | paise |
| status | `initiated` \| `captured` \| `failed` \| `refunded` \| `partially_refunded` |
| refundedAmount | paise, default 0 |
| rawWebhookPayload | JSON, for audit |

**Relationships:** belongs to `Order`.

## Coupon
| Field | Notes |
|---|---|
| id | PK |
| code | unique |
| type | `percentage` \| `flat` |
| value | percentage or paise amount |
| minOrderValue | paise, nullable |
| maxDiscount | paise, nullable (cap for percentage coupons) |
| validFrom, validTo | |
| usageLimit | nullable, total redemptions allowed |
| perUserLimit | nullable |
| active | bool |

**Relationships:** referenced by `Cart`, `Order`.

## Review
| Field | Notes |
|---|---|
| id | PK |
| productId | FK → Product |
| userId | FK → User |
| orderItemId | FK → OrderItem, verifies purchase |
| rating | 1-5 |
| comment | |
| status | `pending` \| `approved` \| `rejected` |
| createdAt | |

**Relationships:** belongs to `Product`, `User`, `OrderItem`.

## Shipment
| Field | Notes |
|---|---|
| id | PK |
| orderId | FK → Order |
| carrier | e.g. "Shiprocket" |
| awbNumber | tracking number |
| status | `pending` \| `picked_up` \| `in_transit` \| `out_for_delivery` \| `delivered` \| `failed` |
| trackingHistory | JSON array of `{ status, timestamp, location }` |
| estimatedDelivery | |

**Relationships:** belongs to `Order`.

## AdminUser / Role
| Field | Notes |
|---|---|
| id | PK |
| name, email | |
| passwordHash | |
| role | `owner` \| `manager` \| `catalog_editor` \| `order_manager` \| `support` |
| active | bool |
| lastLoginAt | |

**Relationships:** standalone; role determines access to Admin API endpoints (see `API_CONTRACT.md`).

## Notification
| Field | Notes |
|---|---|
| id | PK |
| userId | FK → User, nullable for guest-triggered (order updates via email only) |
| channel | `email` \| `sms` \| `whatsapp` \| `in_app` |
| type | e.g. `order_placed`, `order_shipped`, `otp`, `promo` |
| payload | JSON |
| status | `queued` \| `sent` \| `failed` |
| readAt | nullable, for in-app notifications |
| createdAt | |

**Relationships:** belongs to `User` (nullable).

## Entity Relationship Summary

```
User 1---* Address
User 1---* Order
User 1---* Review
User *---* Product   (via Wishlist join table)
Category 1---* Product
Brand 1---* Product
Product 1---* ProductVariant
Product 1---* FitmentCompatibility
Product 1---* Review
Cart 1---* CartItem
CartItem *---1 ProductVariant
Order 1---* OrderItem
Order 1---1 Payment
Order 1---1 Shipment
OrderItem *---1 ProductVariant
Coupon 1---* Order (and 0-1 active Cart)
AdminUser (standalone, role-gated access to Admin APIs)
Notification *---1 User (nullable)
```
