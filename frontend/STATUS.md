# Frontend Status

Scaffolding pass for the storefront, customer account area, and admin dashboard. Builds clean
(`tsc --noEmit` + `vite build`, zero errors, 4 non-blocking ESLint warnings) against `docs/API_CONTRACT.md`.
The backend isn't assumed to be running — every data hook catches request failures and renders an
empty/error state rather than crashing.

## Implemented

**Common layer**
- Axios client (`Common/lib/api.ts`) with request interceptor (Bearer token attach, guest
  `X-Cart-Session` header) and response interceptor (401 → `/auth/refresh`, queues concurrent
  requests while refreshing, redirects to `/login` or `/admin/login` on failure).
- Shared UI primitives: Button, Input, Select, Textarea, Label, Card, Badge, Modal, Pagination,
  DataTable, Breadcrumb, Spinner, StatCard, Toast (sonner).
- `StorefrontLayout` (header with search + mobile hamburger nav, footer with trust badges/links)
  and `AdminLayout` (collapsible sidebar, desktop-first per design brief).
- `RequireAuth` / `RequireAdminAuth` route guards.
- Redux Toolkit: `authSlice` (customer + admin sessions, persisted to `sessionStorage`) and
  `cartSlice` (cross-cutting item-count/total badge only — the full cart lives in
  `CartAndCheckout`'s own hook state, per the "Redux only for cross-cutting state" rule).

**Storefront** (`CommerceDomain/CatalogManagement`, `CommerceDomain/CartAndCheckout`)
- Home (hero, embedded Fitment Finder, category grid, featured products)
- Product listing (category/brand/price filters, sort, mobile filter drawer, responsive grid,
  pagination)
- Product detail (gallery, variant selector, specs/fitment/reviews tabs, add-to-cart)
- Fitment Finder (Make→Model→Year cascading selects, embeddable widget + standalone results page)
- Search results page
- Cart (qty edit, remove, coupon apply/remove, pincode serviceability check)
- Checkout (address → payment method → review steps; guest checkout path with inline address form,
  logged-in path picks from saved addresses)
- Order confirmation page
- Static page template covering About/Contact/Terms/Privacy/Shipping/Returns, and a 404 page

**Customer account** (`FoundationalService/CustomerAccountManagement`)
- Login with OTP and email/password tabs
- Profile edit, address book (add/edit/delete via modal), order history + order detail
  (cancel action, invoice download link, shipment status is left for the tracking-page follow-up)

**Admin dashboard** (`/admin/*`, guarded by `RequireAdminAuth`)
- Admin login
- Dashboard overview (sales-30d stat, order count, low-stock count, recent orders, low-stock list)
- Product list (search, pagination, archive) + create/edit form (Zod-validated)
- Order list (status/search filters, pagination) + order detail with a status-progression control
- Customer list + detail
- Category/Brand management (list + quick-create + delete)
- Coupon list, banner list, review moderation — see "Stubbed" below

## Stubbed / list-only for now

These exist as real routed screens (so admin nav never dead-ends) but only cover the P0 "list"
view, not create/edit forms — flagged P1 in `docs/BACKLOG.md`, deprioritized to fit this pass:
- Coupon management: list only, no create/edit form yet
- Banner management: list only, no create/edit + image upload yet
- Staff & Roles: placeholder screen, not wired to `/admin/staff` endpoints yet
- Wishlist: service methods exist (`customerService.listWishlist` etc.) but no page wired up yet
- Order tracking timeline page (`GET /shipments/:orderId/track`): service method exists
  (`checkoutService.trackShipment`), no dedicated page yet — order detail shows status only
- Search autocomplete dropdown: header search is submit-only (Enter/click), no live suggestions
  dropdown yet — `catalogService.autocomplete` exists and is ready to wire up

## Assumptions made (please confirm/adjust — flagged inline in the relevant service files too)

1. **Admin login endpoint**: `docs/API_CONTRACT.md` only lists `/auth/email/login` for
   *customers*. Admin login (`FoundationalService/IdentityAccessManagement/service/adminAuth.service.ts`)
   reuses that same path and expects `{ accessToken, refreshToken, admin }` back. Backend should
   either branch on account type there, or add a dedicated `/admin/auth/login` — whichever is
   simpler on that side; frontend can repoint in one place either way.
2. **Category/Brand admin CRUD**: the contract only documents public `GET /categories` and
   `GET /brands`. `FoundationalService/MasterManagement/service/master.service.ts` assumes
   `/admin/categories` and `/admin/brands` (POST/PATCH/DELETE) mirroring the shape of the
   documented `/admin/products` routes. Please confirm or adjust the paths.
2b. Same assumption applies to `/admin/banners` GET/POST/PATCH/DELETE, which the contract also
   only lists a subset of — the frontend calls all four verbs.
3. **Money fields**: per `docs/DATA_MODEL.md` all amounts are integer paise. The admin product
   form's "Base Price" and "GST Rate" inputs are raw numeric fields labeled accordingly (paise,
   not ₹) rather than converting rupees↔paise client-side — flag if Backend would prefer the form
   to accept rupees and convert.
4. **Guest cart session**: a random UUID is generated client-side and stored in `localStorage`,
   sent as `X-Cart-Session` per the contract's "Public/User" cart auth note — assumes the backend
   reads that exact header name.

## Design token sync

`design/design-system.md`, `design/tailwind.tokens.js`, and the `design/mockups/*.html` files were
available by the time this pass finished. `frontend/tailwind.config.js` imports
`design/tailwind.tokens.js` directly and layers semantic aliases (`primary`, `accent`, `secondary`,
`destructive`, `success`, `muted`, `border`, `input`, `ring`, `background`, `foreground`, `card`,
`popover`) on top of the published color scales so the shared UI primitives keep working. Inter /
JetBrains Mono are loaded via the same Google Fonts URL used in the mockups. Component-level
polish (exact shadow/spacing parity with `design/mockups/*.html`) has not been pixel-diffed against
every screen — worth a follow-up visual pass once both sides are stable.

## Next steps (not done in this pass)

- Connect to the real backend once it's running and re-verify every empty/error state actually
  shows real data

## Phase 2 (this pass) — docs/PHASE2_ADDENDUM.md §3–§5

All items below were exercised live against the running backend (`localhost:4000`) and, where
practical, driven end-to-end in a real browser (admin login, product form, coupon/banner/staff
CRUD, wishlist add-to-cart, checkout → order → tracking) rather than just compiled. `npx tsc
--noEmit` and `npx vite build` are both clean.

### Newly implemented
- **Mobile bottom tab nav** (`Common/components/Layout/StorefrontLayout/BottomTabNav.tsx`) — fixed
  Home/Categories/Cart(badge)/Account bar on `<768px` per `design/MOBILE_NAV.md`, which had landed
  by the time this task was reached. `pathReplacesBottomNav()` swaps the bar for a page-specific
  sticky action bar on PDP (add-to-cart), Cart (order-summary/checkout), and hides it on
  checkout/order-confirmation, per the spec's §7. Page content gets `--bottom-nav-h`-aware bottom
  padding via the new `.pb-bottom-nav` utility in `index.css` instead of a hardcoded spacer.
  Header hamburger now holds secondary links only (Fitment Finder, Track Order, Wishlist, Help) —
  primary nav moved to the bar; mobile search row is always-visible per §5.
- **Search autocomplete** (`Common/components/Layout/StorefrontLayout/SearchAutocomplete.tsx`) —
  debounced (300ms) live suggestions + matched-product dropdown under both the desktop and mobile
  header search boxes, wired to the existing `catalogService.autocomplete`
  (`GET /search/autocomplete`).
- **Bulk CSV product import UI**
  (`CommerceDomain/CatalogManagement/components/BulkImportProducts`, route
  `/admin/products/import`, linked from the product list) — drag-drop/file-picker, posts to the
  existing `POST /admin/products/import`, shows created/updated/failed counts and a per-row error
  table with a "download failed rows as CSV" action (response shape confirmed by reading
  `backend/.../bulkImportExport.controller.ts` directly: `{jobId,status,created,updated,errors:
  [{row,message}]}`).
- **Product image upload** — new shared `Common/components/ImageUploader` (drag-drop, multi-file,
  preview thumbnails, reorder, remove, "set primary" = move to index 0) backed by
  `Common/lib/uploadService.ts` (`POST /admin/uploads/image` / `DELETE
  /admin/uploads/image/:filename`, which the Backend agent landed — uncommitted but running —
  during this pass). Replaces the (previously nonexistent) image field in
  `CommerceDomain/CatalogManagement/components/AdminProductForm` with a real multi-image uploader.
- **Banner create/edit form** (`FoundationalService/MasterManagement/components/BannerForm`,
  routes `/admin/banners/new` and `/:id/edit`) — title, image via `ImageUploader` (single-image
  mode), link, placement, active toggle. List page now has edit/delete actions.
- **Coupon create/edit form** (`.../CouponForm`, routes `/admin/coupons/new` / `/:id/edit`) — code,
  type (percentage/flat), value, min order, max discount, usage/per-user limits, validity dates,
  active toggle. List page now has edit/delete actions.
- **Staff & Roles** (`FoundationalService/IdentityAccessManagement/components/StaffManagement`,
  new `service/staff.service.ts`) — invite (name/email/role) via modal, inline role change,
  remove, wired to `/admin/staff` (owner-only per backend RBAC). Invite success toast notes the
  temp password is only logged server-side (email delivery is stubbed, per `backend/STATUS.md`).
- **Wishlist page** (`FoundationalService/CustomerAccountManagement/components/Wishlist`, route
  `/account/wishlist`, added to the account tab nav) — list, remove, add-to-cart (resolves the
  product's first variant via `catalogService.getProductBySlug` since `ProductSummary` carries no
  variant info, then calls `cartService.addItem` — verified live: click → `GET
  /products/:slug` → `POST /cart/items` → cart badge updates).
- **Order tracking timeline page**
  (`FoundationalService/CustomerAccountManagement/components/OrderTracking`, route
  `/account/orders/:id/track`, linked from Order Detail when status is trackable) — visual
  placed→confirmed→packed→shipped→delivered timeline. `GET /shipments/:orderId/track` 404s until
  an admin creates a shipment for the order (no shipment row exists at checkout time), so the hook
  falls back to the order's own status for the timeline and only shows the "Tracking History" list
  once a shipment exists — verified both states live (pre- and post-shipment-creation).
- **Razorpay checkout** (`CommerceDomain/CartAndCheckout/components/Checkout/index.hook.ts`,
  new `Common/lib/razorpay.ts` lazy SDK loader) — order is created once (`POST /checkout`) and
  reused across retries (`pendingOrderId`); COD calls `createPaymentIntent(id, "cod")` and goes
  straight to confirmation; other methods call `createPaymentIntent` for a
  `{gatewayOrderId,amount,currency,key}` Razorpay order, open Checkout.js, and on success call
  `verifyPayment`. Modal dismiss/failure leaves the order `pending` and lets the customer retry
  without re-checking-out. Verified live end-to-end for the COD path (order → payment-intent →
  confirmation); the Razorpay-hosted-modal path is wired to the same documented contract but
  couldn't be fully payment-captured since this environment's `RAZORPAY_KEY_ID`/`SECRET` in
  `backend/.env` are placeholders (`rzp_test_xxxxxxxx`).
- **Visual polish** — new `Common/components/EmptyState` + `EmptyState/illustrations.tsx` (simple
  inline SVG, on-brand) applied to empty cart, no orders, no search results, no wishlist. Fixed a
  live crash (`product.avgRating.toFixed is not a function` — Sequelize returns DECIMAL columns as
  strings) in `Common/components/ProductCard.tsx` and `ProductDetail` that was taking down the
  Home page's Featured Products section and any PDP with reviews; found while testing the bottom
  nav on Home in-browser. Skeleton loaders, card/badge elevation parity, and micro-interactions
  from `design/design-system.md` §10 were not fully swept across every existing page in this pass
  — the empty-state and crash-fix work took priority within the time available.

### Still stubbed / follow-up
- Skeleton loaders (the addendum's "instead of bare spinners") are not yet applied everywhere —
  most loading states still use the existing `Spinner`. `EmptyState` illustrations are done for the
  four call-outs named in the addendum.
- Razorpay's hosted-modal path is implemented against the documented contract but unverified with
  a real payment capture (placeholder test keys in this environment — swap real
  `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` into `backend/.env` to fully exercise it).
- `AdminProductForm`'s edit-save path still does `Number(slug)` where `slug` is the route's slug
  param (pre-existing from Phase 1, not touched by this pass) — likely needs the product's numeric
  `id` resolved from the loaded product instead; flagging since it's adjacent to the image-upload
  work but out of this pass's scope.
- Header nav still collapses to the hamburger at the `lg` (1024px) breakpoint while the new bottom
  tab bar only shows `<768px` (per `design/MOBILE_NAV.md`'s explicit "<768px"), so 768–1024px
  tablet widths have neither the desktop nav row nor the bottom bar as primary nav (pre-existing
  Phase 1 breakpoint choice for the header, not reconciled with the new mobile-nav spec in this
  pass).

## Phase 3 — Multi-vendor marketplace (seller portal, admin seller management, PDP attribution)

Full scope in `docs/PHASE3_ADDENDUM.md` §5. `npx tsc --noEmit` and `npx vite build` are both
clean. Exercised live end-to-end against the running backend (`localhost:4000`, Postgres Phase 3
data already migrated) and in-browser: registered a seller through the new UI, approved it through
the new Admin Sellers UI, logged in as that seller, created a product through the new seller
product form, confirmed it appeared on the public storefront PDP with the "Sold by" line, placed a
guest order for it through the existing checkout, confirmed it showed in the seller's Orders page
with the correct commission/earning split, marked it delivered, generated a payout through the
admin UI, marked it paid, and confirmed the seller's Payouts page showed the correct pending
balance (₹0) and payout history row. Also live-verified the pending-review and rejected
account-status screens (a second test seller, rejected with a reason, got the exact rejection copy
back on login attempt).

### Newly implemented

- **Seller session** — fully separate from the existing customer/admin session per the addendum's
  explicit requirement: new `redux/sellerAuthSlice.ts` + own sessionStorage key
  (`spareparts_seller_auth`, `Common/lib/api.ts`'s `SELLER_AUTH_STORAGE_KEY`), new
  `Common/hooks/useSellerAuth.ts`. `Common/lib/api.ts`'s request/response interceptors now branch
  on whether a call targets `/seller/*` — seller calls attach the seller token and refresh via
  `POST /seller/auth/refresh` (cookie `sellerRefreshToken`) instead of the customer/admin path, and
  a failed seller refresh redirects to `/seller/login` only, never `/login` or `/admin/login`.
  Live-verified in one browser tab with both an admin and a seller logged in simultaneously —
  `sessionStorage` showed both `spareparts_auth` (admin) and `spareparts_seller_auth` (seller)
  intact at once, no collision.
- **New route guard** `RequireSellerAuth` (`Common/components/Layout/RequireAuth.tsx`), new
  `SellerLayout` (`FoundationalService/SellerManagement/components/SellerLayout`) copying
  `AdminLayout`'s markup/structure exactly per `design/SELLER_PORTAL_NOTES.md`, nav: Dashboard,
  Products, Orders, Payouts, Profile.
- **Seller auth pages**: `SellerRegister` (`/seller/register`), `SellerLogin` (`/seller/login`),
  `SellerStatusScreen` (`/seller/account-status`) — the addendum's single status-driven template
  (not three screens), rendered when a login attempt fails while the account isn't `approved`. It
  displays the backend's exact message verbatim and only picks its icon/badge/title by matching
  keywords ("reject"/"suspend") in that message — it never invents its own reason text.
- **Seller dashboard** (`SellerDashboard`) — 4 `StatCard`s (sales this month, pending payout,
  orders, low stock) wired to `GET /seller/dashboard`, recent-orders list.
- **Seller product management** — `SellerProductForm` (thin sibling of `AdminProductForm`, same
  field set minus the Seller-picker field, pointed at `/seller/products/*` via the new
  `seller.service.ts`) and `SellerProductList` (same `DataTable`/`Pagination` pattern as
  `AdminProductList`, scoped to `GET /seller/products`). Reuses `ImageUploader` as-is. Bulk CSV
  import for sellers was **not** built this pass (not explicitly in the addendum's frontend task
  list, unlike the backend endpoint which exists) — flagged below as a follow-up.
- **Seller order fulfillment** (`SellerOrders`) — order **items** belonging to the seller (not full
  orders), with a per-item fulfillment-status `<Select>` wired to
  `PATCH /seller/orders/items/:id/fulfillment`.
- **Seller payouts** (`SellerPayouts`) — pending-balance `StatCard` + payout history table wired to
  `GET /seller/payouts`.
- **Seller profile** (`SellerProfile`) — read-only summary (business name, email, phone, GST,
  commission override); editable settings (bank details, password change) weren't in the
  addendum's explicit scope, left as a follow-up.
- **Admin additions**: new "Sellers" nav item in the existing `AdminLayout` sidebar
  (`AdminSellerList`) — status-filterable list, Approve/Reject(with reason)/Suspend actions,
  commission-override modal, payout-generation + mark-paid modal. Added a `success` Button variant
  (`Common/components/ui/button.tsx`) per `design/SELLER_PORTAL_NOTES.md`'s explicit call-out for
  the Approve action.
- **Admin product form** (`AdminProductForm`) — added the required Seller `<Select>` (options from
  `GET /admin/sellers?status=approved`), required in the Zod schema and included in both
  create/update payloads. `Product`/`ProductSummary` types gained `sellerId`/`seller`.
- **Storefront PDP** (`ProductDetail`) — "Sold by {businessName}" line under the rating/SKU row
  using the new `product.seller` field, per the mockup.

### Contract deviations found live (Phase 3)

- **`GET /seller/payouts` response key is `payouts`, not `items`** — every other list endpoint in
  this app (`admin/sellers`, `seller/products`, `seller/orders`, etc.) uses `{ items, ... }`; this
  one returns `{ payouts: [...], pendingBalance }`. Confirmed via a live curl
  (`{"success":true,"data":{"payouts":[...],"pendingBalance":0}}`). Fixed on the frontend side
  (`seller.service.ts#listPayouts` types against `payouts`) rather than blocked on a backend
  rename — flagging here in case Backend wants to align it with the rest of the contract for
  consistency.
- **`POST /seller/auth/register` requires `phone`**, contradicting `docs/PHASE3_ADDENDUM.md`'s
  field list (`phone?`) and `backend/STATUS.md`'s phrasing. Live-verified: registering without
  `phone` 422s with `{errors:[{field:'phone',message:'Required'}]}`. Fixed on the frontend side —
  `SellerRegisterForm`'s Zod schema now requires `phone` and the label no longer says "(optional)".
- **Pre-existing (not Phase 3, found while live-testing the checkout path needed for the seller
  order-fulfillment test)**: guest checkout's order-confirmation step calls `GET /orders/:id`
  without an auth token (correct — it's a guest order), but that route requires authentication and
  returns 401, which trips the axios response interceptor's refresh-and-redirect-to-`/login` logic
  even for a guest who was never supposed to be signed in. The order itself is still created
  successfully server-side (verified via admin token lookup) — only the confirmation page's own
  fetch is affected. Left unfixed (out of Phase 3 scope, pre-existing Phase 1/2 checkout code) but
  flagged here since it was hit directly while verifying this phase's seller order flow.

### What's stubbed / follow-up

- Seller bulk CSV import UI (backend endpoint `/seller/products/import` exists and is reused by
  the seller product service pattern conceptually, but no dedicated `SellerBulkImport` screen was
  built — not explicitly listed in the addendum's frontend task list, unlike the admin one).
- Seller profile page is read-only — no bank-details or password-change form yet.
- Payout generation has no client-side guard against overlapping date ranges (matches the backend's
  own documented limitation in `backend/STATUS.md` Phase 3 — "no anti-double-counting guard"); the
  admin UI doesn't add one either, it's a straight passthrough to `POST /admin/sellers/:id/payouts`.
- Visual polish (skeleton loaders, pixel parity with `design/mockups/seller-*.html`) wasn't
  pixel-diffed against every seller screen — functionally verified live, not a full design-QA pass.
