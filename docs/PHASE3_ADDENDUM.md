# Phase 3 Addendum — Multi-Vendor Marketplace

Written by the PM pass on top of Phase 1+2 (see `backend/STATUS.md`, `frontend/STATUS.md`,
`docs/PHASE2_ADDENDUM.md`). This is a real architecture change, not a UI add-on: the platform
moves from "we sell our own stock" to "third-party sellers list, we take a cut." Read this in
full before touching code — it supersedes any conflicting assumption in `docs/DATA_MODEL.md` /
`docs/API_CONTRACT.md` (those stay correct for everything they don't mention here).

## 1. Product decision — how this marketplace works

- **Sellers** are a new, separate principal type — not an `AdminUser` role, not a `Customer`.
  They register themselves (public signup), and a new account starts as `pending`. An **admin
  must approve** a seller before that seller can log in and list products — this is the trust/
  safety gate every real marketplace (Amazon, Flipkart, Etsy) has; skipping it means anyone can
  instantly list junk under the platform's name.
- **Every product has an owning seller.** `Product.sellerId` is a required FK once this phase
  ships (not nullable) — including the platform's own Phase-1 seed catalog, which gets migrated
  to a system seller record (see §3 migration notes) so "we sell our own stock" becomes "the
  platform is seller #1," the same code path as everyone else. This is the simplest model — no
  branching between "platform product" and "seller product" anywhere in the codebase.
- **Admin can create or reassign any product to any seller** ("add products on their behalf") —
  the existing admin product form gains a required Seller dropdown. A seller's own product form
  has no such dropdown; their `sellerId` is implied by who's logged in and is enforced
  server-side, never trusted from the request body.
- **Commission**: a platform-wide default rate (percentage, configurable — a `Settings` row or
  env-seeded default, admin-editable) with an optional **per-seller override** (negotiated rates
  for high-volume sellers). Commission is **computed and snapshotted at checkout**, not
  recalculated later — store `commissionRate` and `commissionAmount` on each `OrderItem` at the
  moment the order is placed, so a later rate change never rewrites history for orders already
  placed. This is a standard, important marketplace-accounting rule.
- **One customer order can span multiple sellers.** The cart already allows mixed items; nothing
  changes for the buyer (one cart, one checkout, one payment, one order number). What changes is
  fulfillment: **each seller ships their own items independently.** A single `Order` now produces
  **one `Shipment` per distinct seller** in that order, each tracked separately. Order-level
  status becomes a roll-up of its items' fulfillment states (see §4).
- **Payouts are computed, not automated.** No real seller bank-transfer integration exists (same
  reasoning as the Razorpay/Shiprocket stubs — no live credentials). Build a `SellerPayout`
  ledger: the seller dashboard shows running "amount owed," and admin can generate a payout
  record for a date range and mark it `paid` once they've transferred the money outside the
  system. This is honest scope — don't fake an automated bank transfer.

## 2. New/changed data model

New entities (add to `docs/DATA_MODEL.md` conceptually; migrations are the real source of truth):

- **Seller**: `id, businessName, email (unique), passwordHash, phone, gstNumber (nullable),
  status ('pending'|'approved'|'rejected'|'suspended'), commissionRateOverride (decimal, nullable
  — null means "use platform default"), payoutBankDetails (JSONB, nullable — account
  holder/number/IFSC, self-reported, never verified against a real bank API), rejectionReason
  (nullable), approvedAt (nullable), createdAt, updatedAt`.
- **SellerPayout**: `id, sellerId, periodStart, periodEnd, grossSales, commissionDeducted,
  netPayable, status ('pending'|'paid'), paidAt (nullable), notes (nullable), createdAt,
  updatedAt`.
- **Settings** (if one doesn't already exist as a generic key-value table — check
  `backend/src/database/models` first; add one if not): at minimum a
  `platform_commission_rate_percent` row (default e.g. `10`).

Changed entities:

- **Product**: add `sellerId INTEGER NOT NULL` (FK → sellers.id). Index it — the storefront and
  seller dashboard both filter by it constantly.
- **OrderItem**: add `sellerId INTEGER NOT NULL` (denormalized from the product/variant at
  checkout time — never joins back to Product for this, it's a snapshot like
  `productTitleSnapshot` already is), `commissionRate DECIMAL(5,2) NOT NULL`,
  `commissionAmount INTEGER NOT NULL` (paise), `sellerEarning INTEGER NOT NULL` (paise —
  `qty*unitPrice - commissionAmount`), `fulfillmentStatus` (reuse the existing `ShipmentStatus`
  enum values, defaulting `pending` — this is the per-item status that rolls up to Order status).
- **Shipment**: add `sellerId INTEGER NOT NULL`. An Order can now have multiple Shipment rows
  (one per seller); each Shipment's `trackingHistory` only covers that seller's items. Add a
  join or a `ShipmentItem` mapping table if a shipment needs to reference which specific
  `OrderItem` rows it covers (recommended — cleanest way to know what's in each seller's box).

## 3. Migration notes (there is live seed data — do not break it)

- Add a **new** migration file (`backend/src/database/migrations/`), never edit the already-run
  `20260101000000-create-core-schema.js`.
- Create `sellers` and `seller_payouts` tables first.
- **Seed a system seller** in the same migration or a follow-up seeder: e.g. `businessName:
  "PartsHub Direct"`, `status: 'approved'`, a placeholder email/password (seller login not
  expected to be used for it, but the row must exist and pass all the same constraints as a real
  seller). Use its id to backfill `sellerId` on every existing `Product` row **before** adding the
  `NOT NULL` constraint (classic "add nullable → backfill → alter to NOT NULL" migration
  sequence — do it in that order within the migration, not as three separate migrations, so the
  DB is never left in an invalid state between them).
- Same backfill approach for `OrderItem.sellerId`/`commissionRate`/`commissionAmount`/
  `sellerEarning` on any existing order rows (commissionRate = platform default at backfill time,
  commissionAmount computed from it) and for `Shipment.sellerId` (= the system seller, since all
  existing shipments are for the pre-marketplace catalog).
- Re-run `npm run db:migrate` against the live Postgres container (`spareparts-pg`, already
  running) and confirm the existing seeded products/orders from Phase 1+2 still read back
  correctly afterward — this is a real regression risk, verify it live, don't just trust the
  migration ran without erroring.

## 4. API contract additions

All new routes follow `docs/CODING_STANDARDS.md` (router→controller→service→repository→Zod).

**Seller auth** (new module, `FoundationalService/SellerManagement`, mirrors the existing admin
auth pattern exactly — separate JWT `type: 'seller'`, separate refresh cookie `sellerRefreshToken`
scoped to `/api/v1/seller/auth`):
- `POST /seller/auth/register` — public. `{businessName, email, password, phone, gstNumber?}` →
  creates a `pending` Seller, no tokens issued (they can't log in until approved). Returns a
  clear "submitted for review" message.
- `POST /seller/auth/login` — rejects with a specific error if `status !== 'approved'` (different
  message for `pending` vs `rejected` vs `suspended` — sellers need to know which).
- `POST /seller/auth/refresh`, `POST /seller/auth/logout`, `GET /seller/auth/me`.

**Seller self-service** (auth-gated as the logged-in seller; every query implicitly filtered to
`sellerId = req.seller.id`, enforced in the repository layer, not just the controller):
- `GET /seller/dashboard` — sales this month, pending payout amount, order count, low-stock count
  for their own products only.
- `GET/POST/PATCH /seller/products`, reusing as much of the existing
  `CommerceDomain/CatalogManagement` product service logic as possible rather than duplicating it
  — the cleanest approach is a shared internal method that both the admin product controller and
  a new seller product controller call, with the seller variant hard-coding `sellerId` from the
  authenticated seller instead of accepting it in the payload. Includes the existing bulk-CSV
  import and image-upload endpoints, reused as-is (they're already generic).
- `GET /seller/orders` — order **items** belonging to this seller across all orders (not full
  orders — a seller should never see another seller's items in a shared order), with the parent
  order's shipping address/customer contact needed for fulfillment.
- `PATCH /seller/orders/items/:orderItemId/fulfillment` — update this item's fulfillment status;
  when the seller marks their last item in an order as shipped, create/update their `Shipment`
  row for that order (`sellerId` + the relevant `OrderItem`s).
- `GET /seller/payouts` — their payout history + running pending balance.

**Admin additions** (`FoundationalService/SellerManagement` admin routes, gated
`requireOwner`/`CATALOG_MANAGER_ROLES` as appropriate — sellers are a business-sensitive area,
lean toward `requireOwner` for approve/reject/commission-rate changes):
- `GET /admin/sellers` (filterable by status), `GET /admin/sellers/:id`,
  `PATCH /admin/sellers/:id/approve`, `PATCH /admin/sellers/:id/reject` (with reason),
  `PATCH /admin/sellers/:id/suspend`, `PATCH /admin/sellers/:id/commission` (set/clear the
  override).
- `POST /admin/sellers/:id/payouts` — generate a payout record for a date range (compute from
  unpaid `OrderItem.sellerEarning` in that range), `PATCH /admin/payouts/:id/mark-paid`.
- Existing `POST /admin/products` gains a required `sellerId` field — update
  `docs/API_CONTRACT.md`'s product-create entry accordingly once implemented.

**Storefront-visible changes** (small): product detail / listing responses should include a
lightweight `seller: { id, businessName }` so the buyer knows who they're actually buying from —
standard marketplace transparency, and needed later if a "sold by" filter or seller storefront
page is ever added (not required this phase, just don't block it).

## 5. Frontend scope

- **New seller portal** at `/seller/*` (its own top-level route tree, its own layout — reuse the
  existing `AdminLayout` sidebar shell/pattern rather than inventing a new one, swap the nav items
  for seller-relevant ones: Dashboard, Products, Orders, Payouts, Profile).
- Seller registration page (public, `/seller/register`) and login page (`/seller/login`), plus a
  "pending review" / "rejected" / "suspended" state screen shown post-login-attempt with the
  server's specific reason.
- Seller dashboard: sales/orders/pending-payout stat cards (reuse the existing `StatCard`
  component), recent orders.
- Seller product management: reuse as much of the existing admin `AdminProductForm`,
  `BulkImportProducts`, and `ImageUploader` UI as is practical (same components, pointed at the
  `/seller/products` endpoints instead of `/admin/products` — a thin service-layer swap, not a
  rebuild) — no Seller-picker field on this form (implied by login).
- Seller order fulfillment view: list of order items belonging to them, with a status-update
  control per item (reuse `OrderStatusTimeline`/similar patterns from the existing admin order
  detail work where sensible).
- Seller payouts page: history table + current pending balance.
- **Admin additions**: a Sellers section (list with status filter, approve/reject/suspend actions,
  commission override field, payout generation) — new nav item in the existing `AdminLayout`
  sidebar. The existing admin product create/edit form gains a required Seller select.
- **Storefront**: show "Sold by {businessName}" on the product detail page (small addition, not a
  redesign) using the new `product.seller` field from §4.
- A logged-in customer's own header/nav is unaffected — sellers and customers are different login
  systems on different routes, exactly like admin already is.

## 6. Sequencing

Backend must land §2/§3 (schema + migration, verified live against the running Postgres) and the
seller-auth + seller-product endpoints before Frontend can build the seller portal against real
data — same dependency shape as Phase 2's image-upload endpoint. Admin-side seller-management
endpoints and the storefront `seller` field are lower priority and can land after the core seller
portal works. If Frontend reaches a task whose backend endpoint isn't committed yet, stub it with
a clear TODO and continue, then circle back — same rule as Phase 2.

Design should produce: seller portal visual direction (can closely follow the existing admin
dashboard's desktop-first pattern — this is a professional back-office tool, not a consumer
surface, so it doesn't need the storefront's polish/illustration treatment), a pending/rejected
account status screen, and the "Sold by" treatment on the PDP mockup. Low design-novelty phase —
most of the system already exists, reuse it.
