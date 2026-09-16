# Component Library — Spare Parts E-commerce Platform

Reusable components the Frontend agent should implement once and reuse everywhere, instead of building ad-hoc per-screen markup. Visual states (colors, radii, shadows) reference `design/design-system.md` §7; Tailwind tokens are in `design/tailwind.tokens.js`. Live examples of most of these in context are in `design/mockups/*.html`.

Conventions below use a generic prop-table format (framework-agnostic — maps to React props, Vue props, etc.).

---

## Button

**Purpose:** all clickable actions that aren't plain navigation links.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `primary \| secondary \| outline \| ghost \| destructive` | see design-system.md §7 for exact colors per state |
| `size` | `sm \| md \| lg` | `lg` required for primary mobile CTAs (Add to Cart, Place Order) |
| `iconLeft` / `iconRight` | icon name | optional, 20px, `currentColor` |
| `iconOnly` | bool | renders square, `radius-full`, requires `aria-label` |
| `loading` | bool | shows spinner, disables interaction, keeps button width stable |
| `disabled` | bool | |
| `fullWidth` | bool | common on mobile forms/checkout |
| `as` | `button \| a` | render as link when navigating |

States: default / hover / active / disabled / focus-visible (2px ring, offset 2px) — see design-system.md.

---

## Input / TextArea / Select

| Prop | Type | Notes |
|---|---|---|
| `label` | string | always visible above field (no placeholder-as-label) |
| `type` | `text \| email \| tel \| number \| password \| search` (Input) | |
| `placeholder` | string | |
| `helperText` | string | below field, `text-xs` `neutral-500` |
| `error` | string | replaces helperText in `danger-600`, adds alert-triangle icon, red border |
| `disabled` | bool | |
| `required` | bool | shows `*` after label |
| `prefixIcon` / `suffixIcon` | icon name | e.g. search icon in search inputs, pincode map-pin |
| `size` | `md \| lg` | `lg` (48px) for primary search/pincode fields |

**Select** additionally: `options: {value, label}[]`, native `<select>` on mobile for OS-native picker UX, custom dropdown acceptable on desktop if it matches focus/keyboard behavior.

**OTP input** is a specialized variant: 6 boxed single-digit inputs, auto-advance focus, paste support, numeric keyboard on mobile (`inputmode="numeric"`).

---

## ProductCard

**Purpose:** grid item in listing, search results, related products, wishlist.

| Prop | Type | Notes |
|---|---|---|
| `image` | url | 1:1 aspect ratio, lazy-loaded |
| `title` | string | 2-line clamp |
| `brand` | string | small, above or below title |
| `partNumber` | string | mono font, `neutral-500`, e.g. `OEM-4521-BP` |
| `price` | number (paise) | render as ₹, `text-price-sm`, bold |
| `originalPrice` | number, optional | strikethrough `neutral-400` when on sale |
| `rating` | number 0-5 | star row + `(reviewCount)` |
| `stockStatus` | `in_stock \| low_stock \| out_of_stock` | badge, see design-system.md §8 |
| `fitmentStatus` | `fits \| unknown \| no_fit` | optional badge, only shown when a vehicle is selected via fitment finder |
| `onAddToCart` | fn | icon-button, bottom-right or full-width on mobile |
| `onWishlist` | fn | heart toggle, top-right of image |
| `href` | url | whole card links to PDP except interactive sub-elements |

Layout: 1 col (base, list mode) / 2 col (base, grid mode) / 3 col (`md`) / 4 col (`lg`) in listing grids.

---

## FilterSidebar

**Purpose:** category listing filters (category, brand, price range, fitment, stock).

| Prop | Type | Notes |
|---|---|---|
| `groups` | `{title, type: checkbox\|range\|radio, options}[]` | e.g. Category (checkbox tree), Brand (checkbox + search), Price (range slider + min/max inputs), Fitment (uses FitmentFinder mini-widget), Availability (in stock toggle) |
| `activeFilters` | `{key, label}[]` | rendered as removable chips above results on all breakpoints |
| `onChange` / `onClear` | fn | |
| `resultCount` | number | shown on mobile "Show N results" apply button |

Layout: **desktop/`lg`** — sticky left sidebar (~280px), always visible. **mobile/`md`-** — collapsed behind a "Filters" button that opens a bottom-sheet Modal containing the same groups, with sticky "Clear all" / "Show N results" footer bar.

---

## Badge

| Prop | Type | Notes |
|---|---|---|
| `variant` | `neutral \| primary \| success \| warning \| danger \| accent` | see design-system.md §7 |
| `icon` | icon name, optional | e.g. check-circle, shield-check |
| `text` | string | |

Used for: stock status, fitment status, order status, "Sale", "New", coupon type, admin role tags.

---

## DataTable

**Purpose:** admin lists (products, orders, customers, coupons) and account order history.

| Prop | Type | Notes |
|---|---|---|
| `columns` | `{key, label, align, sortable, render?}[]` | numeric columns right-aligned, `font-mono tabular-nums` |
| `rows` | array | |
| `selectable` | bool | checkbox column, enables bulk actions toolbar |
| `sortKey` / `sortDir` | string / `asc\|desc` | clickable header, chevron indicator |
| `pagination` | `{page, pageSize, total}` | uses Pagination component in footer |
| `loading` | bool | skeleton rows |
| `emptyState` | `{icon, title, description, action?}` | shown when `rows.length === 0` |
| `rowAction` | fn or menu def | trailing "..." kebab menu per row (edit/delete/view) |
| `stickyHeader` | bool | default true for long admin tables |

Zebra striping `neutral-50` on even rows optional; row hover `primary-50`.

---

## Modal

| Prop | Type | Notes |
|---|---|---|
| `open` | bool | |
| `title` | string | |
| `size` | `sm \| md \| lg` | max-width 400/480/640px |
| `onClose` | fn | overlay click + Esc key + explicit X button all call this |
| `footer` | node | typically Button row, right-aligned (Cancel ghost + primary action) |
| `variant` | `dialog \| drawer-right \| sheet-bottom` | sheet-bottom used for mobile filters/cart summary; drawer-right for cart preview on desktop |

Focus trap + return focus to trigger element on close (a11y requirement — note for Frontend implementation, not visual).

---

## Toast

| Prop | Type | Notes |
|---|---|---|
| `variant` | `success \| error \| info \| warning` | |
| `message` | string | |
| `action` | `{label, onClick}` optional | e.g. "Undo" on remove-from-cart |
| `duration` | ms, default 4000 | 0 = persistent until dismissed |

Stack multiple toasts vertically, newest on top/bottom depending on position; position bottom-center mobile, bottom-right desktop.

---

## Pagination

| Prop | Type | Notes |
|---|---|---|
| `page` | number | 1-indexed, matches API contract convention |
| `pageSize` | number | |
| `total` | number | |
| `onChange` | fn | |
| `variant` | `numbered \| loadmore` | storefront listing can use either; admin tables use `numbered` |

Mobile: condensed to Prev / "Page X of Y" / Next. Desktop: numbered with ellipsis truncation for long ranges.

---

## Breadcrumb

Simple `Home / Category / Subcategory / Product Title` trail, `text-sm`, `neutral-500` links with `neutral-800` current-page (non-link) last item, `chevron-right` 14px separators. Truncates middle items on mobile if too long (`Home / … / Product Title`).

---

## StatCard

**Purpose:** admin dashboard overview tiles (Total Sales, Orders Today, Low Stock Items, New Customers).

| Prop | Type | Notes |
|---|---|---|
| `label` | string | `text-sm` `neutral-500` |
| `value` | string/number | `text-2xl`/`text-3xl` bold, tabular-nums |
| `delta` | `{value, direction: up\|down}` optional | green up / red down, small arrow icon + percentage |
| `icon` | icon name, optional | top-right, in a tinted circle (`primary-50` bg) |
| `sparkline` | optional inline chart | for trend context, not required v1 |

---

## Supporting / composite components (built from the above)

- **FitmentFinder widget** — 3 chained `Select`s (Make → Model → Year), `lg` size, primary CTA "Find Parts" (`Button` primary). Used both embedded on home page and as full `/fitment` page hero.
- **QtyStepper** — `–` icon-button / numeric input (center, `w-12 text-center`) / `+` icon-button, all `radius-full`, min 44px tap targets, disables `–` at qty 1 and `+` at variant stock max.
- **PriceSummary** — label/value rows (Subtotal, Discount, Shipping, GST, Total) used identically in Cart and Checkout, `Total` row bold + divider above.
- **AddressCard** — used in address book, checkout address selection (radio-selectable variant), and order detail (read-only variant).
- **OrderStatusTimeline** — horizontal (desktop) / vertical (mobile) stepper: Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered, matches `Order.status` / `Shipment.status` enums in `docs/DATA_MODEL.md`.
- **CouponInput** — `Input` + inline `Button` ("Apply"), success state shows applied `Badge` + discount amount + "Remove" ghost link.
- **EmptyState** — icon (64px, `neutral-300`) + title + description + optional primary `Button`; reused for empty cart, empty wishlist, no search results, empty admin tables.

---

## BottomNav *(Phase 2)*

**Purpose:** primary storefront navigation on mobile (`<768px`). Full spec, decision rationale,
and which pages replace it: `design/MOBILE_NAV.md`. Not used in admin.

| Prop | Type | Notes |
|---|---|---|
| `tabs` | fixed 4: `home \| categories \| cart \| account` | Not configurable per-screen — same 4 tabs everywhere the bar appears. No Search tab (see `MOBILE_NAV.md` §1 for why). |
| `activeTab` | one of the above, or `none` | `none` when on a transient screen (e.g. search results) reached via the header, not one of the 4 destinations. |
| `cartCount` | number | Drives the badge on the Cart tab; badge hidden entirely at `0`, shows `9+` above 9. Must read from the same cart-count source as the header's own cart badge so the two never disagree. |

Visual states, sizing, safe-area handling, badge placement: `design/MOBILE_NAV.md` §2–§6.
Container shadow: `shadow-nav` (see `design-system.md` §10.1). Height token: `space-14` (56px) +
`env(safe-area-inset-bottom)`.

Reference markup: `design/mockups/home.html`, `cart.html`, `product-detail.html` (shows the
*replaced* state — sticky add-to-cart bar instead of the nav, per `MOBILE_NAV.md` §7).

---

## SkeletonLoader *(Phase 2)*

**Purpose:** loading placeholder for content with a known shape — replaces bare spinners per
`design-system.md` §10.3. Used anywhere a list/grid/detail view is fetching: product grids, PDP,
order history, admin tables (`DataTable`'s existing `loading` prop should render this, not a
spinner, going forward).

| Prop | Type | Notes |
|---|---|---|
| `variant` | `card \| row \| text \| circle \| image` | `card` = ProductCard-shaped block (image + 2 text lines + price line); `row` = DataTable row; `text` = single line, width configurable; `circle` = avatar/icon placeholder; `image` = gallery/hero placeholder, matches target aspect ratio. |
| `count` | number | how many skeleton instances to repeat (e.g. 8 skeleton `card`s while a product grid loads) |
| `width` / `height` | optional overrides | falls back to the shape's natural size (e.g. `card` variant matches `ProductCard` dimensions exactly, so swapping skeleton → real card causes no layout shift) |

Visual: `neutral-200 → neutral-100 → neutral-200` gradient sweep, 1.5s linear infinite (see
`design-system.md` §10.3), `border-radius` matches the shape it stands in for (`radius-md` for
cards, `radius-sm` for text lines/badges, `radius-full` for `circle`).

---

## EmptyState *(Phase 2 — expands the Phase 1 stub)*

**Purpose:** unified empty/zero-result pattern with an on-brand inline SVG illustration instead of
plain text (Phase 1 shipped this as icon-only; Phase 2 adds illustrations + named variants). Full
illustration style guide: `design-system.md` §10.4.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `empty-cart \| no-orders \| no-search-results \| no-wishlist-items \| generic` | selects the inline SVG illustration; `generic` falls back to a plain icon glyph for admin empty tables where a custom illustration isn't warranted |
| `title` | string | bold `text-lg` |
| `description` | string | `text-sm neutral-500` |
| `action` | `{label, onClick}` optional | primary `Button`, shown when a next step exists |

Named variants and their illustration motif (see `design-system.md` §10.4 for stroke/color rules —
all use `neutral-300` line + one small `primary-300`/`accent-300` accent, viewBox `0 0 120 120`):

- **empty-cart** — outline shopping-cart glyph with a small dashed circle beside it. Default copy:
  "Your cart is empty" / "Looks like you haven't added any parts yet." / action: "Browse
  Categories".
- **no-orders** — outline package box with a small clock overlay at the corner. Default copy: "No
  orders yet" / "Your order history will show up here once you place your first order." / action:
  "Start Shopping".
- **no-search-results** — outline magnifier with a small "x" mark. Default copy: "No results for
  '{query}'" / "Try a different part name, number, or check your spelling." / no forced action
  (search bar is already visible above it).
- **no-wishlist-items** — outline heart, dashed/unfilled. Default copy: "Your wishlist is empty" /
  "Save parts you're considering — they'll show up here." / action: "Browse Categories".

Reference markup (inline SVGs, ready to copy): `design/mockups/cart.html` (empty-cart variant).

---

## Rating stars *(Phase 2 — visual spec for the `rating` value used by `ProductCard` and PDP)*

Not a separate component prop table (it's a rendering rule for the existing `rating` field on
`ProductCard` and the PDP review summary) — full spec in `design-system.md` §10.7: 5 inline star
glyphs (full/half/empty), `warning-600` fill, sized 14px (cards) / 16px (PDP header) / 20px (PDP
review summary), always paired with `(reviewCount)`, numeric average shown alongside on PDP for
precision.

---

## Stock / discount / new badges *(Phase 2 — extends Badge, §above, for ProductCard overlays)*

Full placement/style rules: `design-system.md` §10.6. Summary:

| Badge | Trigger | Placement on card image |
|---|---|---|
| Stock status | always (In Stock / Only N left / Out of Stock) | bottom-left |
| Discount | `originalPrice > price` | top-left (computed `−N%`, not hardcoded "Sale") |
| New | `createdAt` within last 30 days | top-left (or top-right if Discount also present) |

---

## Implementation notes for Frontend

1. Build these as the first Week-2 deliverable (per `docs/PROJECT_PLAN.md`) before any screen-specific code — every mockup in `design/mockups/` is composed from this set.
2. Keep component APIs framework-idiomatic but preserve the prop names/semantics above so this doc stays the reference across screens.
3. All interactive components must meet the 44×44px minimum touch target on mobile (see design-system.md §7 Button sizes).
4. Icons: use Lucide (see design-system.md §6); mockups inline raw SVGs from that set as a dependency-free reference.
5. Phase 2 additions (`BottomNav`, `SkeletonLoader`, expanded `EmptyState`, badge/rating polish) are additive on top of this set — no Phase 1 component prop or token was renamed/removed, so existing screens keep working while these get layered in incrementally.
