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

- Wire up Razorpay checkout SDK in the payment step (currently just captures the chosen method and
  calls `/checkout` directly — `checkoutService.createPaymentIntent` / `verifyPayment` are ready
  but unused)
- Wishlist page, order tracking timeline page, search autocomplete dropdown (see "Stubbed" above)
- Coupon/Banner create-edit forms, Staff invite/role management
- Bulk CSV import/export UI for admin products (`adminProductService.importCsv` / `exportCsvUrl`
  exist but aren't wired to a UI control yet)
- Connect to the real backend once it's running and re-verify every empty/error state actually
  shows real data
