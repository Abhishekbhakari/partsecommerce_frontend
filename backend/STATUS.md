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
