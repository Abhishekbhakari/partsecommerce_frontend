# Design Agent — Status

## What's done

- **`design/design-system.md`** — full design system: color palette (deep-blue primary `#123B72` + automotive-orange accent `#E2600A`, neutral slate scale, dedicated success/warning/danger/info status colors), typography scale (Inter for UI, JetBrains Mono for part numbers/prices/SKUs), 4px spacing scale, radius/elevation tokens, breakpoints (matches `docs/DESIGN_BRIEF.md`: base/`md` 768/`lg` 1024/`xl` 1280), iconography approach (Lucide, inlined as raw SVG in mockups), component visual-state specs (Button, Input, Card, Badge, Modal, Toast), and the stock/fitment badge convention used everywhere.
- **`design/tailwind.tokens.js`** — a ready-to-paste `theme.extend` object (colors, fontFamily, fontSize, spacing, borderRadius, boxShadow, screens, maxWidth) matching design-system.md 1:1. Import it in `tailwind.config.js` and spread into `theme.extend`.
- **`design/COMPONENT_LIBRARY.md`** — prop/variant tables for the reusable component set: Button, Input/Select/TextArea (+ OTP input), ProductCard, FilterSidebar, Badge, DataTable, Modal, Toast, Pagination, Breadcrumb, StatCard, plus composite components (FitmentFinder widget, QtyStepper, PriceSummary, AddressCard, OrderStatusTimeline, CouponInput, EmptyState).
- **`design/mockups/*.html`** — 10 self-contained, dependency-free (Tailwind CDN + Google Fonts only, no build step) mobile-first mockups, each responsive across the brief's three widths via Tailwind breakpoint classes (no separate files per width):
  - `home.html` — hero, category shortcuts, fitment finder widget, featured products, trust badges, brand strip
  - `listing.html` — category/listing page with desktop sticky filter sidebar + mobile filter bottom-sheet pattern, sort, grid/list toggle, pagination
  - `product-detail.html` — image gallery, variant selector, price/GST display, fitment badge + checker, specs/fitment/reviews tabs, related products, sticky mobile add-to-cart bar
  - `fitment-finder.html` — standalone make/model/year flow (same widget as embedded on home), selected-vehicle state, matching categories/products
  - `cart.html` — line items with qty stepper, coupon input, pincode check, order summary, empty-cart state reference
  - `checkout.html` — 4-step flow (address, shipping method, payment method incl. COD eligibility, review), guest-checkout banner
  - `account.html` — combined pattern set: login/OTP entry, profile, order history, address book, wishlist, and a generic empty-state pattern (reused for empty wishlist/no search results/404 per brief)
  - `admin-dashboard.html` — sidebar nav (collapses to icon rail at `md`, full at `lg`), stat cards, sales trend chart, top products, low-stock alert table
  - `admin-products.html` — product list/table with bulk-select, filters, export/import CSV actions, plus a create/edit product form pattern
  - `admin-orders.html` — status-tab filtered order list/table, search/date filters, plus an order-detail/status-update panel pattern

## What a Frontend dev should read first

1. `design/design-system.md` — start here for the "why" behind every token.
2. `design/tailwind.tokens.js` — paste into `tailwind.config.js` before writing any component.
3. `design/COMPONENT_LIBRARY.md` — build this shared component set first (per `docs/PROJECT_PLAN.md` Week 2), before any screen-specific code.
4. `design/mockups/*.html` — open directly in a browser (no server needed) as the pixel/spacing/interaction-state reference per screen. Resize the browser to ~375px / 768px / 1024px+ to see the mobile-first responsive behavior in place.

## Scope notes / deviations from `docs/DESIGN_BRIEF.md`

- This run's task brief asked for admin screens (dashboard overview, product list, order list) as full HTML mockups rather than the brief's suggested written-spec-only approach (`ADMIN_SCREENS.md`) — delivered as HTML (`admin-dashboard.html`, `admin-products.html`, `admin-orders.html`) to give Frontend a closer pixel reference; other admin screens listed in `DESIGN_BRIEF.md` (coupons, banners/CMS, reviews moderation, staff/roles, reports) are covered structurally by the same shell/DataTable/StatCard patterns in these three files and `COMPONENT_LIBRARY.md`, not built as individual files.
- `NOTIFICATION_TEMPLATES.md` (email/SMS/WhatsApp copy) is explicitly lower priority, due Week 8 per the brief — not built in this pass.
- File naming: this run's task used lowercase `design-system.md` (vs. brief's `DESIGN_SYSTEM.md`) and `account.html` covers the account/order-history pattern set as one file, consistent with the brief's own suggestion to cover login/profile/addresses/wishlist/orders "as one pattern set."

## Not yet done (Phase 1 carry-over)

- `ADMIN_SCREENS.md` written specs for the remaining admin modules (coupons, banners/CMS, reviews moderation, staff/roles, reports) — recommend a follow-up pass before Week 7 per `PROJECT_PLAN.md`.
- `NOTIFICATION_TEMPLATES.md` — due Week 8.

---

## Phase 2 — mobile bottom nav, elevation/polish pass (this run)

Scope: `docs/PHASE2_ADDENDUM.md` §3 (mobile bottom nav) and §4 (visual design polish). No backend
or frontend application code touched — design docs, tokens, and static mockups only, additive on
top of Phase 1 (nothing renamed or removed, so the frontend already built against Phase 1 tokens
keeps working unchanged).

### New

- **`design/MOBILE_NAV.md`** — full bottom tab bar spec. Decision: **4 tabs (Home, Categories,
  Cart, Account), no dedicated Search tab** — search instead gets an always-visible field in the
  mobile sticky header (justification in the doc §1). Covers icon set, active/inactive/pressed
  states, cart badge placement, height (56px + `env(safe-area-inset-bottom)`), and which pages
  replace the bar instead of stacking under it (PDP sticky add-to-cart bar, Cart's sticky checkout
  bar, Checkout's sticky step footer, Order confirmation has no bottom bar at all).

### Updated

- **`design/tailwind.tokens.js`** — additive only: `spacing[14]` (56px, bottom-nav height),
  `boxShadow.nav` (upward shadow for fixed bottom bars) and `boxShadow.raised` (elevated state over
  colored/gradient surfaces), `backgroundImage['hero-gradient' | 'cta-gradient']` (named gradients
  built from existing brand hex values, no new colors introduced). Nothing existing was touched.
- **`design/design-system.md`** — new §10 "Elevation & Polish (Phase 2)": shadow-scale usage rules,
  gradient usage on hero/CTA surfaces, micro-interaction states (hover/press/skeleton
  loading/toast/badge-pulse), empty-state illustration house style (flat line-art, `neutral-300` +
  one small accent touch, four named motifs), imagery-first card hierarchy, stock/discount/new
  badge placement rules, and the rating-stars rendering spec (full/half/empty glyphs, not a bare
  number). Also added a note pointing mockups at the real seed catalog
  (`backend/src/database/seeders/run-seed.ts`) for any mockup meant to demonstrate a real
  frontend↔backend data path.
- **`design/COMPONENT_LIBRARY.md`** — added `BottomNav`, `SkeletonLoader`, an expanded `EmptyState`
  with four named variants (`empty-cart`, `no-orders`, `no-search-results`, `no-wishlist-items`),
  the rating-stars visual spec, and the stock/discount/new badge placement table.
- **Mockups refreshed**: `home.html` (hero gradient + shadow-raised, mobile search row replacing
  the old search-icon-only pattern, discount/new badges on product cards, finalized 4-tab bottom
  nav with badge/active-indicator/safe-area), `product-detail.html` (sticky add-to-cart bar now
  uses `shadow-nav` + safe-area padding + CTA gradient; part numbers/prices aligned to the real
  seed product — Bosch `BP-4521` / `OEM-77123`, ₹1,299), `cart.html` (sticky checkout bar same
  treatment; empty-cart state now has the real inline SVG illustration instead of a bare cart
  icon), `listing.html` (bottom nav and its shadow token brought in line with the finalized 4-tab
  spec — it already had an earlier draft nav), `checkout.html` (sticky step footer gets
  `shadow-nav` + safe-area + CTA gradient for consistency with the other replaced-bar screens).

### What the Frontend agent should pick up

1. Read `design/MOBILE_NAV.md` first — it's the authoritative spec for §3 of the addendum,
   supersedes the placeholder Home/Search/Cart/Account bar that shipped inline in the Phase 1
   mockups (that draft had a Search tab and no badge/safe-area handling; the finalized spec drops
   Search in favor of the header field and adds both).
2. Pull the two new tokens (`spacing[14]`, `boxShadow.nav`/`raised`, `backgroundImage` gradients)
   into `tailwind.config.js` alongside the Phase 1 set — same merge process as before, purely
   additive.
3. Build `BottomNav`, `SkeletonLoader`, and the expanded `EmptyState` (with its 4 named variants) as
   shared components per `COMPONENT_LIBRARY.md` — `SkeletonLoader` in particular should replace
   every bare spinner currently in the Phase 1 frontend build, not just new screens.
4. Apply the badge/rating/card-hierarchy polish (§10.5–10.7 of `design-system.md`) to existing
   `ProductCard` usages — this is a styling pass on top of working pages, not a rebuild, consistent
   with addendum §5's framing.
5. The four pages that replace the bottom nav (PDP, Cart, Checkout, Order Confirmation) need their
   own sticky-bar safe-area handling even without the shared nav present — see `MOBILE_NAV.md` §7.

### Not yet done (Phase 2)

- Bottom nav / mobile search row was not added to `account.html` or `fitment-finder.html` mockups
  in this pass (only `home.html`, `listing.html`, `product-detail.html`, `cart.html`,
  `checkout.html` were touched, per the addendum's "most important mockups... at minimum" scope) —
  Frontend should apply the same `BottomNav` component to those routes; the pattern is identical to
  `home.html`'s, just a copy-paste of the nav block plus the standard mobile search row from the
  header spec in `MOBILE_NAV.md` §5.
- Loading/error/skeleton states are now specced (`SkeletonLoader` in `COMPONENT_LIBRARY.md`,
  micro-interactions in `design-system.md` §10.3) but not illustrated as a separate mockup file —
  Frontend should implement per the component prop spec, same note carried over from Phase 1.
