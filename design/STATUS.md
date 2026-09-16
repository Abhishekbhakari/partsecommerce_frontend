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

## Not yet done

- `ADMIN_SCREENS.md` written specs for the remaining admin modules (coupons, banners/CMS, reviews moderation, staff/roles, reports) — recommend a follow-up pass before Week 7 per `PROJECT_PLAN.md`.
- `NOTIFICATION_TEMPLATES.md` — due Week 8.
- Loading/error/skeleton states are described in `COMPONENT_LIBRARY.md` (DataTable `loading` prop, Toast, EmptyState) but not illustrated as separate mockup states — Frontend should implement per the component prop specs.
