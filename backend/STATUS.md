# Backend Status

Scaffold is complete: TypeScript compiles clean (`npx tsc --noEmit` passes, `npm run build` emits
`dist/`), all P0 slices from `docs/BACKLOG.md` have real logic (not empty stubs), and the schema
is migration-driven. No live Postgres instance was available in this environment, so DB
connectivity itself is untested end-to-end — the code is structurally ready to run against one.

## What's implemented

- **Common layer**: Winston logger, JWT util (access + refresh), bcrypt password util, Zod-driven
  error handler (`ErrorHandler.commonErrorHandler`), typed HTTP error classes, pagination helper,
  JWT auth middleware (`TokenMiddleware` — customer/admin/optional variants), role-based
  `RBACMiddleware`, multer upload middleware (CSV/image), guest-cart session middleware, global
  error handler + request logger wired in `app.ts`.
- **Models + migrations**: every entity in `docs/DATA_MODEL.md` (User, Address, Category, Brand,
  Product, ProductVariant, FitmentCompatibility, Cart, CartItem, Order, OrderItem, Payment,
  Coupon, Review, Shipment, AdminUser, Notification) plus supporting tables the contract implies
  but the data model doesn't fully spell out (Wishlist join table, Banner for CMS, OtpRequest for
  OTP state). One consolidated migration (`20260101000000-create-core-schema.js`) creates
  everything in FK-safe order; associations are wired in `src/database/models/index.ts`.
- **IdentityAccessManagement**: admin/staff login (bcrypt + JWT + httpOnly refresh cookie), token
  refresh, logout, staff invite/role-change/remove (owner-only), auto-seeded super-admin on boot.
- **CustomerAccountManagement**: OTP request/verify (OTP delivery stubbed — see below),
  email+password login/register, Google OAuth token exchange (stubbed verification — see below),
  refresh/logout, profile get/update, addresses CRUD, wishlist add/remove/list, notifications
  list/mark-read, admin broadcast (queues `Notification` rows).
- **MasterManagement**: categories (tree via `parentId`), brands, coupons, CMS banners — all
  public GET + admin CRUD gated by `CATALOG_MANAGER_ROLES`.
- **CatalogManagement**: product CRUD with variants + fitment sub-resources, list with
  category/brand/price/sort/pagination/search filters, product detail by slug, autocomplete +
  full search (part number / OEM number / title / SKU), fitment lookup + fitment options
  (makes/models/years), inventory update + low-stock report, CSV bulk import (upsert by SKU,
  per-row error reporting) and CSV export.
- **CartAndCheckout**: guest (session-header) and logged-in cart, add/update/remove items,
  coupon apply/remove with percentage/flat + min-order/max-discount logic, pincode
  serviceability stub, checkout (creates Order + OrderItems in a DB transaction, decrements
  variant stock, computes GST as inclusive-tax split, computes shipping fee with a free-shipping
  threshold), order detail/cancel/return, `/me/orders` history, admin order list/status update,
  admin customer list/detail.
- **PaymentManagement**: Razorpay order creation (`razorpay` SDK), COD path with an eligibility
  ceiling, HMAC-SHA256 payment-signature verification, webhook handler (captures/fails payments,
  stores raw payload for audit), admin refund (calls Razorpay refund API when a real payment
  exists).
- **ShippingManagement**: shipment creation (locally-generated AWB — see below), tracking-status
  endpoint (ownership-checked for customers), webhook handler appending to `trackingHistory`.
- **ReviewManagement**: review create gated on a verified purchase (matching `OrderItem`),
  one-review-per-purchase, admin moderate (approve/reject recalculates `Product.avgRating`/
  `reviewCount`), admin delete.
- **ReportingAndAnalytics**: sales report (date-bucketed via `date_trunc`, Postgres-specific),
  low-stock-style inventory report.

## What's intentionally stubbed (structurally correct, not wired to a real provider)

- **OTP delivery** — `CustomerAccountManagement/api/auth/services/OtpSender.ts` defines a
  swappable `OtpSender` interface; the default `ConsoleOtpSender` just logs the OTP. Swap in a
  real SMS/email gateway (MSG91/Twilio/etc.) by implementing the interface and updating
  `getOtpSender()`.
- **Google OAuth verification** — `customerAuth.service.ts#googleAuth` does NOT verify the
  `idToken` against Google; it decodes a synthetic email from the token string. Replace with
  `google-auth-library` token verification against `GOOGLE_CLIENT_ID` before trusting the payload.
- **Shiprocket integration** — `ShipmentService.create` generates a local AWB number instead of
  calling the real Shiprocket API. Swap for an authenticated HTTP call using
  `SHIPROCKET_EMAIL`/`SHIPROCKET_PASSWORD`.
- **GST invoice** — `/orders/:id/invoice` returns a plain-text stub, not a real PDF. Swap for a
  PDF renderer (e.g. `pdfkit`) using the order/payment data already assembled in the controller.
- **Refresh tokens are stateless JWTs**, not DB-tracked sessions — there's no server-side revoke
  list, so `logout` only clears the cookie client-side. Acceptable for v1; add a `RefreshToken`
  table + rotation if you need forced-logout-everywhere.
- **Bulk CSV import runs synchronously** in the request (fine for a few thousand rows); the
  `jobId` in the response is already shaped for a future queued-job upgrade (BullMQ etc.) without
  changing the API contract.

## Deviations from `docs/API_CONTRACT.md` (flagging per CODING_STANDARDS.md)

- **Admin auth is a separate route group**: `POST /api/v1/admin/auth/login`,
  `/admin/auth/refresh`, `/admin/auth/logout`, `GET /admin/auth/me`. The contract's `/auth/*`
  block is customer-only (OTP/email/Google); it doesn't define how staff/admin log in, so this
  was added to satisfy `docs/DATA_MODEL.md`'s `AdminUser` role-gated access requirement. Refresh
  cookies are scoped separately (`adminRefreshToken` @ `/api/v1/admin/auth` vs
  `customerRefreshToken` @ `/api/v1/auth`) so the two token types never collide in the browser.
- **`/products/:id/reviews`** uses the numeric product **id** in the path (matches
  `API_CONTRACT.md` literally), while the public product detail route (`GET /products/:slug`)
  uses the **slug**. Frontend should resolve `product.id` from the detail response before hitting
  the reviews endpoints.

## What the Frontend agent needs to know

- **Base URL**: `http://localhost:4000/api/v1` in dev (`PORT` env var controls the port).
- **Response envelope**: every endpoint returns `{ success, message?, data? }` on success or
  `{ success: false, message, errors? }` (Zod/DB validation errors include a `field`-keyed
  `errors` array) on failure. Always read `data` for the payload — it matches the shapes in
  `docs/API_CONTRACT.md`.
- **Auth flow (customer)**: `POST /auth/otp/verify` (or `/auth/email/login`, `/auth/email/register`,
  `/auth/google`) returns `{ accessToken, refreshToken, user }` and also sets an httpOnly
  `customerRefreshToken` cookie scoped to `/api/v1/auth`. Store `accessToken` client-side (memory
  or short-lived storage) and send it as `Authorization: Bearer <token>`. Call
  `POST /auth/refresh` (no body needed — cookie carries the refresh token; body `refreshToken` is
  also accepted as a fallback) to get a new `accessToken` on 401. `POST /auth/logout` clears the
  cookie.
- **Auth flow (admin dashboard)**: same shape, under `/admin/auth/login` +
  `/admin/auth/refresh` + `/admin/auth/logout`, cookie name `adminRefreshToken`.
- **Guest cart**: send header `X-Cart-Session: <uuid>` on every `/cart*` and `/checkout` call.
  If omitted, the server generates one and echoes it back via the `X-Cart-Session` response
  header (and CORS `exposedHeaders` already allows reading it) — persist whatever comes back.
  Once a guest logs in, their cart is looked up by `userId` instead automatically.
  merge-on-login is NOT implemented — this is worth a follow-up if guest→login cart merge is
  expected.
- **Money**: every amount is an integer in paise, per contract convention.
- **Seeded data**: `npm run db:seed` creates a super-admin (`SUPER_ADMIN_EMAIL` /
  `SUPER_ADMIN_PASSWORD` in `.env`, default `admin@spareparts.local` / `ChangeMe123!`) and three
  sample products (Brakes/Suspension/Filters categories; Bosch/MRF/Generic brands) with variants
  and fitment rows, so catalog/search/fitment endpoints are testable immediately after migrate+seed.

## Verification performed

- `npm install` — clean install, 430 packages, 0 errors (only deprecation warnings from
  transitive deps).
- `npx tsc --noEmit` — 0 errors.
- `npm run build` (`tsc -p tsconfig.json`) — emits `dist/` cleanly (removed after verification;
  not committed, see `.gitignore`).
- `npx eslint "src/**/*.ts"` — 0 errors, 3 stylistic warnings.
- Did **not** verify against a live PostgreSQL instance (none available in this environment) —
  `sequelize.authenticate()` in `server.ts` will surface any real connection issue at boot; the
  migration file has not been run against real Postgres and should be smoke-tested first.

## Phase 2

All work below was verified against a live server (`npm run dev`, Postgres in Docker on :5433,
migrated + seeded), not just compiled. `npx tsc --noEmit` is clean and `npx eslint "src/**/*.ts"`
has 0 errors (3 pre-existing/expected stylistic warnings, none new besides one intentional unused
destructure in the staff-response sanitizer below).

### 1. Image upload endpoint (new)

- `POST /api/v1/admin/uploads/image` — admin-auth + `CATALOG_MANAGER_ROLES`, multipart field
  **`file`**. Stores to `backend/uploads/` (created, gitignored except `.gitkeep`), served
  statically at `/uploads/<filename>` via `express.static` (mounted in `app.ts` before the routers).
  Returns `{ success, message, data: { url, filename } }` — `url` is an **absolute** URL
  (`${req.protocol}://${req.get('host')}/uploads/<filename>`) so it's directly usable as an
  `<img src>` regardless of which origin the frontend is served from.
- `DELETE /api/v1/admin/uploads/image/:filename` — best-effort delete (404/missing file is
  swallowed, never 500s); rejects filenames containing `/`, `\`, or `..` to prevent path traversal.
- Behind a swappable `ImageStorage` interface (mirrors the existing `OtpSender` pattern) at
  `FoundationalService/MasterManagement/api/uploads/services/ImageStorage.ts` — default
  `LocalDiskImageStorage`; swap `setImageStorage()` for an S3/Cloudinary implementation later
  without touching the controller/service.
- **Reuse this one endpoint** for both product images (`Product.images: string[]`) and banner
  images (`Banner.imageUrl`) — upload first, then include the returned `url` in the product/banner
  create-or-update payload.
- Live-verified: uploaded a real PNG, confirmed the returned URL was servable via a follow-up GET
  (200, correct `content-type: image/png`), deleted it, confirmed the follow-up GET now 404s, and
  confirmed a second delete of the same filename still returns 200 (idempotent, no 500). Also
  confirmed unauthenticated requests get 401.

  ```
  $ curl -X POST http://localhost:4000/api/v1/admin/uploads/image \
      -H "Authorization: Bearer <admin token>" -F "file=@test.png;type=image/png"
  {"success":true,"message":"Record created successfully.",
   "data":{"url":"http://localhost:4000/uploads/0bfd507e-452c-48af-b312-212418d8698f.png",
           "filename":"0bfd507e-452c-48af-b312-212418d8698f.png"}}

  $ curl -o /dev/null -w "%{http_code}" http://localhost:4000/uploads/0bfd507e-....png
  200
  ```

### 2. Guest cart merge-on-login (new)

- `CartService.mergeGuestCartIntoUser(sessionId, userId)` (new method in
  `CommerceDomain/CartAndCheckout/api/cart/cart.service.ts`) sums quantities for overlapping
  variants, adds the rest, then deletes the now-empty guest cart (`CartItem` rows cascade-delete
  via FK `ON DELETE CASCADE`).
- Wired into `CustomerAuthController` (`FoundationalService/CustomerAccountManagement/api/auth/
  customerAuth.controller.ts`) — called after tokens are issued on **OTP verify, email login,
  email register, and Google auth**, reading the guest cart from the `X-Cart-Session` request
  header. Merge failures are logged and swallowed — they never block login.
- Live-verified: added a guest-session item (variant 3, qty 2), registered a new customer with
  the same `X-Cart-Session` header, confirmed the item appeared in the new user's cart and the
  guest cart was gone. Then added qty 5 to a *second* guest session for the same variant, logged
  in as the same (now-existing) user with that session header, and confirmed the user cart's
  quantity summed to 7 (2 + 5), not duplicated as a second line item.

### 3. Coupons / banners / staff — verified live, one bug found and fixed each

- **Coupons**: create/list/update/delete all worked correctly on the first pass (percentage type,
  `minOrderValue`/`maxDiscount`, `active` toggle). No changes needed.
- **Banners**: create/list/delete worked; **found and fixed a too-strict validation bug** — `link`
  was `z.string().url()`, which rejects in-app relative paths like `/products` (the realistic case
  for "link to a category/product page"), only accepting absolute URLs. Fixed in
  `FoundationalService/MasterManagement/api/banners/validations/banner.validation.ts` to accept
  either an absolute URL or a path starting with `/`. Re-verified: relative link (`/products`)
  now accepts, absolute URL still accepts, garbage string still correctly 422s.
- **Staff**: invite/list/change-role/remove/duplicate-email(409) all worked functionally, but
  **found and fixed a real security bug** — every response (`invite`, `list`, `changeRole`) was
  returning the raw Sequelize row including `passwordHash` (a bcrypt hash, but still shouldn't
  leave the server). Fixed in `staff.service.ts` with a `publicStaff()` helper that strips
  `passwordHash` before returning from all three methods. Re-verified the field is gone from all
  three response shapes.

### 4. Reviews / shipment tracking / search autocomplete — verified live, all correct as built

Ran a full live flow: customer checkout → admin confirms order → admin creates shipment → customer
tracks shipment → customer posts a review → admin approves it → public listing + `Product.avgRating`
update.

- **Reviews**: verified-purchase gate correctly requires an order in
  `confirmed`/`packed`/`shipped`/`delivered` status; duplicate review on the same order item 409s;
  reviewing a product never purchased 403s; newly-created reviews are `pending` and invisible on
  the public `GET /products/:id/reviews` list until admin-approved; approval recalculates
  `Product.avgRating`/`reviewCount` correctly (verified `avgRating` went from `0.00` to `5.00`
  after a single 5-star approval).
- **Shipment tracking**: `GET /shipments/:orderId/track` correctly enforces ownership — the
  purchasing customer gets 200 with tracking history, a *different* logged-in customer gets 403.
- **Search autocomplete**: `GET /search/autocomplete?q=oil` and `GET /search?q=oil` both return
  correct, relevant results (title/part-number/OEM matching) with the documented response shapes.

No bugs found in this group — all four behaved correctly against real data on the first pass.

## What Frontend needs to know (Phase 2 additions)

- **Image upload contract**: `POST /api/v1/admin/uploads/image`, `multipart/form-data`, field
  name **`file`** (not `image`), admin Bearer token required, role must be one of
  `CATALOG_MANAGER_ROLES` (owner/manager/catalog_editor). Response:
  `{ success, message, data: { url: string, filename: string } }` — `url` is already absolute,
  use it directly as `<img src>` or in the product/banner payload's `images`/`imageUrl` field.
  `DELETE /api/v1/admin/uploads/image/:filename` to remove (pass just the filename, not the full
  URL) — safe to call even if the file's already gone.
- **Banner `link` field** accepts a relative path (`/products`, `/category/brakes`) or an absolute
  URL — no need to force full URLs in the banner form.
- **Guest cart merge** is now implemented — no frontend changes required, it happens automatically
  server-side on any successful customer auth call as long as the client keeps sending the same
  `X-Cart-Session` header value through the login/register/OTP-verify/Google request that it was
  using for the guest cart. After that call succeeds, switch to sending the `Authorization` header
  (logged-in cart) — the old guest session cart will already be empty/deleted.

## Phase 3 — Multi-vendor marketplace (sellers, commission, split fulfillment, payouts)

Full scope in `docs/PHASE3_ADDENDUM.md`. All work below was verified live against the running
Postgres container (`spareparts-pg`, :5433) with the real Phase 1/2 seed data already in it —
`npx tsc --noEmit` is clean.

### 1. Migration — highest-risk step, verified live

New migration `backend/src/database/migrations/20260201000000-add-marketplace-sellers.js` (the
already-applied `20260101000000-create-core-schema.js` was **not** touched). Creates `sellers`,
`seller_payouts`, `settings` (new generic key-value table — none existed before; seeded
`platform_commission_rate_percent = 10`), `shipment_items` (maps a `Shipment` to the specific
`OrderItem`s it covers, `orderItemId` unique). Adds columns via the nullable → backfill → NOT NULL
sequence within this one migration: `products.sellerId`, `order_items.sellerId` /
`commissionRate` / `commissionAmount` / `sellerEarning` / `fulfillmentStatus`,
`shipments.sellerId`.

A system seller (`PartsHub Direct`, `system-seller@spareparts.local`, `status: 'approved'`) is
seeded in the migration and used to backfill every pre-existing row. Ran `npm run db:migrate`
against the live container and verified:
- All 6 pre-existing products backfilled to the system seller (`sellerId = 1`).
- Pre-existing `order_items` backfilled with `commissionRate = 10.00` and correctly computed
  `commissionAmount`/`sellerEarning` (spot-checked: qty 7 × unitPrice 34900 → commissionAmount
  24430, sellerEarning 219870 — sums back to the line total).
- Both pre-existing `shipments` got a `shipment_items` row per order item in their order.
- `GET /products` and `GET /admin/orders` both returned 200 with correct data immediately after
  migrating — no regression to Phase 1/2 reads.

### 2. Seller auth — `FoundationalService/SellerManagement/api/auth`

Mirrors admin auth exactly: separate JWT `type: 'seller'`, separate refresh cookie
`sellerRefreshToken` scoped to `/api/v1/seller/auth`. Live-verified register → still-pending login
rejection → admin approve → login succeeds:

```
POST /api/v1/seller/auth/register {"businessName":"Test Auto Parts Co","email":"testseller1@example.com","password":"SellerPass123!","phone":"9998887777"}
→ {"success":true,"data":{"id":2,"status":"pending","message":"Your application has been submitted for review..."}}

POST /api/v1/seller/auth/login (same creds, still pending)
→ {"success":false,"message":"Your seller account is still under review. We will email you once it is approved."}

PATCH /api/v1/admin/sellers/2/approve (admin Bearer)
→ {"success":true,"data":{"id":2,"status":"approved",...}}

POST /api/v1/seller/auth/login (same creds)
→ {"success":true,"data":{"accessToken":"...","refreshToken":"...","seller":{"id":2,"businessName":"Test Auto Parts Co","email":"testseller1@example.com","status":"approved"}}}
```

Rejected/suspended logins get status-specific messages (rejection includes the admin's
`rejectionReason`).

### 3. Seller self-service — `FoundationalService/SellerManagement/api/portal` + product router additions

- `GET /seller/dashboard`, `GET/POST/PATCH/DELETE /seller/products` (+ `/inventory`, `/import`),
  `GET /seller/orders`, `PATCH /seller/orders/items/:orderItemId/fulfillment`, `GET /seller/payouts`.
- Product CRUD reuses `ProductService`'s existing logic — refactored `create`/`update`/`archive`/
  `updateInventory` into shared private `*Internal` methods that both the admin controller
  (`sellerId` required in the payload) and the new seller controller (`sellerId` always
  `req.user.userId`, **never accepted from the request body** — `SellerProductSchema` omits the
  field entirely at the Zod layer, and `updateInternal` deletes `data.sellerId` even if present)
  call. Same pattern applied to CSV bulk import (`bulkImportExport.controller.ts`): a seller
  bearer token forces `sellerId` from auth regardless of any `sellerId` column in the CSV; an
  admin bearer token requires that column.
- Live-verified isolation: seller 2 created a product (`POST /seller/products`, no `sellerId` in
  body) → response correctly has `sellerId: 2`. Seller 3 (a second approved seller) called
  `GET /seller/products` and got an **empty list** — seller 2's product is invisible to them. The
  public `GET /products?q=...` correctly includes it with `"seller":{"id":2,"businessName":"Test Auto Parts Co"}`.
- Fulfillment endpoint: on any status update away from `pending`, creates/updates that seller's
  `Shipment` row for the order (`sellerId` + `orderId`) and links every one of that seller's
  `OrderItem`s in the order via `ShipmentItem` (idempotent — `findOrCreate` on the unique
  `orderItemId`). Also rolls up `Order.status`: `delivered` once every item across **all** sellers
  in that order is delivered, `shipped` once any item is picked_up/in_transit/out_for_delivery/
  delivered. Live-verified: marking the sole item on a single-seller order `delivered` moved
  `Order.status` from `pending` to `delivered` in one call, and created `shipments` row
  `{orderId, sellerId, status: 'delivered'}` with a matching `shipment_items` row.

### 4. Commission computation at checkout

`Common/utils/CommissionUtil.ts` — `getRateForSeller(sellerId)` returns the seller's
`commissionRateOverride` if set, else `settings.platform_commission_rate_percent`. Wired into
`CartAndCheckout/api/checkout/checkout.service.ts`: computed **per line item** (mixed-seller carts
supported) and snapshotted onto the `OrderItem` at order-creation time — never recalculated later.
Live-verified: set seller 2's `commissionRateOverride` to 15, checked out 2× a ₹1999 item
(₹3998.00 line total) → `OrderItem` row: `commissionRate: 15.00, commissionAmount: 59970,
sellerEarning: 339830` (59970 + 339830 = 399800, exact).

### 5. Admin seller management — `FoundationalService/SellerManagement/api/admin`

`GET/PATCH /admin/sellers*` (list/get = `CATALOG_MANAGER_ROLES`; approve/reject/suspend/commission/
payout-generation = `requireOwner`, per the addendum's "business-sensitive, lean toward owner"
guidance), `POST /admin/sellers/:id/payouts`, `PATCH /admin/payouts/:id/mark-paid`. List/get
responses exclude `passwordHash` (fixed before commit — first pass leaked it, same class of bug as
the Phase 2 staff-response issue, same fix pattern: `attributes: { exclude: ['passwordHash'] }`).

Payout generation sums `qty*unitPrice` (grossSales), `commissionAmount`, and `sellerEarning`
(netPayable) from that seller's `OrderItem`s created within `[periodStart, periodEnd)`. Live end-
to-end: generated a payout for the ₹3998 order above → `{grossSales: 399800, commissionDeducted:
59970, netPayable: 339830, status: 'pending'}`, then `PATCH .../mark-paid` → `status: 'paid'`,
`paidAt` set. Seller's `GET /seller/payouts` then correctly showed `pendingBalance: 0`.

### What's stubbed / known limitations

- **Payout generation has no anti-double-counting guard.** There is no `OrderItem.payoutId` or
  similar link recorded when a payout is generated — an admin who generates two overlapping-date-
  range payouts for the same seller will double-count those order items in `grossSales`/
  `netPayable`. `GET /seller/dashboard` and `GET /seller/payouts`'s `pendingBalance` approximate
  "pending" as `sum(sellerEarning of all order items) - sum(netPayable of all payouts, any
  status)`, which is only correct if payout ranges never overlap. Documented here rather than
  silently wrong — if Frontend needs a hard guarantee here, flag it back for a proper
  `OrderItem.payoutId` migration.
- **Payout payment-out is manual**, same honesty-of-scope reasoning as the Razorpay/Shiprocket
  stubs: `mark-paid` just flips a status/timestamp, no real bank transfer integration.
  `Seller.payoutBankDetails` is stored (self-reported JSONB) but never verified against anything.
- **Order-level status roll-up is best-effort**, not a full state machine: it only ever moves
  forward to `shipped`/`delivered` on a fulfillment update; it does not handle partial-cancellation
  or per-seller-cancel scenarios (out of scope for this phase).
- The old single-shipment admin endpoints (`POST /shipments`, `GET /shipments/:orderId/track`)
  were left as-is for backward compatibility (`Order.hasOne(Shipment, as:'shipment')` association
  kept alongside the new `Order.hasMany(Shipment, as:'shipments')`) — for a multi-seller order
  these old endpoints only see/create *one* shipment. Use the seller fulfillment endpoint or query
  `shipments` directly for correct multi-seller behavior.

### Exact field names Frontend needs (avoid a Phase 1/2-style mismatch)

- Seller JWT payload `type` is the string `'seller'` (not `'customer'`/`'admin'`); refresh cookie
  name is `sellerRefreshToken`, path `/api/v1/seller/auth`.
- Seller product create/update payloads use the **same field names** as admin `Product` fields
  (`sku, title, categoryId, brandId, basePrice, gstRate, images, status, variants, fitment`) but
  **must never include `sellerId`** — it's rejected at the Zod layer on the seller endpoint (schema
  omits it) but silently ignored (not merely rejected) on update if somehow present.
  `SellerProductSchema`/`UpdateSellerProductSchema` in
  `CommerceDomain/CatalogManagement/api/products/validations/product.validation.ts`.
  Admin's `POST /admin/products` now requires `sellerId` (number) — this is a breaking change to
  the existing admin product-create form, gains a required Seller dropdown per the addendum.
  Non-integer/missing `sellerId` on that admin route returns a 422 with `errors: [{field:
  'sellerId', message: 'Required'}]`.
- `PATCH /seller/orders/items/:orderItemId/fulfillment` body is `{ status }`, one of the exact
  strings `pending | picked_up | in_transit | out_for_delivery | delivered | failed` (same enum as
  `Shipment.status`, reused for `OrderItem.fulfillmentStatus`).
- All money fields (`salesThisMonth`, `pendingPayoutAmount`, `grossSales`, `commissionDeducted`,
  `netPayable`, `commissionAmount`, `sellerEarning`) are **paise integers**, same convention as
  every other money field in the API.
- `commissionRateOverride` is `null` when unset (falls back to platform default) — `PATCH
  /admin/sellers/:id/commission` accepts `{ commissionRateOverride: number | null }`, sending
  `null` clears the override.
