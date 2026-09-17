# Seller Portal — Design Notes (Phase 3)

Per `docs/PHASE3_ADDENDUM.md` §5's closing paragraph: this is a **low design-novelty phase**. The
seller portal is a professional back-office tool, not a consumer surface — it should read as "the
same admin dashboard, re-skinned for a seller's scope," not a new visual language. Everything below
confirms what's reused as-is vs. what's new, so Frontend isn't guessing.

New mockups in `design/mockups/`: `seller-register.html`, `seller-login.html`,
`seller-pending.html`, `seller-dashboard.html`, `admin-sellers.html`. Also updated:
`product-detail.html` (Sold by line), and the sidebar nav in `admin-dashboard.html`,
`admin-products.html`, `admin-orders.html` (added a "Sellers" nav item so the shared AdminLayout
shell stays consistent across all admin screens, not just the new one).

## Reused as-is (no new tokens/components needed)

- **Full color/type/spacing/radius/shadow system** (`design-system.md` §1–§4) — zero new tokens.
  All seller/admin-sellers screens use the existing `primary`/`accent`/`neutral`/status palette
  and `tailwind.tokens.js` verbatim.
- **AdminLayout shell** — dark `neutral-900` sidebar (icon rail at `md`, full width `lg`), sticky
  white topbar, `neutral-50` content area. `seller-dashboard.html` and `admin-sellers.html` copy
  this markup structure exactly from `admin-dashboard.html`/`admin-products.html` (same header
  height, padding, breakpoints) — only the nav items and brand label change.
- **StatCard** — seller dashboard's 4 stat tiles (Sales, Pending Payout, Orders, Low Stock) are the
  same card markup as `admin-dashboard.html`'s stat cards, just retitled/re-icon'd. No new prop
  needed; `icon` + tinted circle background already supports the accent-tinted "Pending Payout"
  variant used here (`bg-accent-50`/`text-accent-700`, same pattern as `warning`/`primary` tints
  already in the spec).
- **DataTable pattern** — `admin-sellers.html`'s seller list and `seller-dashboard.html`'s recent
  orders table reuse the exact table markup/zebra-hover/pagination footer from
  `admin-products.html` (search bar + segmented status filter replaces the two `<select>` filters,
  same visual treatment as the existing filter bar).
- **Form field pattern** — `seller-register.html`/`seller-login.html` inputs, labels, helper text
  and the commission-override field in `admin-sellers.html` all use the existing Input spec
  (`design-system.md` §7: 44px height, `neutral-300` border, `primary-600` focus ring) — no new
  input variant.
- **Badge** — existing `neutral/primary/success/warning/danger/accent` pill variants cover every
  seller status shown (see below — no new badge component was needed, just new copy/variant
  mappings, listed under "New" since it's a mapping addition worth calling out explicitly).
- **Button variants** — primary/secondary/outline/destructive all reused unchanged (e.g. Approve =
  a `success`-toned solid button — see "Component additions needed" below, this is the one gap).

## New (small, scoped additions)

1. **Seller status → Badge variant mapping** (not in `COMPONENT_LIBRARY.md` yet — add this table):

   | Seller.status | Badge variant | Text |
   |---|---|---|
   | `pending` | `warning` | "Pending" / "Pending Review" |
   | `approved` | `success` | "Approved" |
   | `rejected` | `danger` | "Rejected" |
   | `suspended` | `neutral` | "Suspended" |

   This is a direct reuse of the existing 5-variant Badge (`design-system.md` §7) — no new colors,
   just documenting the enum mapping so Frontend doesn't invent a 6th variant or reuse the wrong
   one (e.g. don't reuse the stock-status `danger` = "Out of Stock" semantics for `rejected`; they
   happen to share a color but are different enums).

2. **`success` solid Button variant** — `COMPONENT_LIBRARY.md`'s Button table only lists
   `primary | secondary | outline | ghost | destructive`. `admin-sellers.html`'s inline "Approve"
   action needs a solid green button (`bg-success-600`, hover `success-700`, white text) distinct
   from `destructive` (used for "Reject"). This is a one-line addition to the Button variant enum,
   using colors already defined in the status palette (`success-600`/`700`) — not a new color
   token, just a new Button variant name. Recommend adding it to `COMPONENT_LIBRARY.md`'s Button
   prop table: `variant: primary | secondary | outline | ghost | destructive | success`.

3. **Seller account-status screen** (`seller-pending.html`) — new composite, not in
   `COMPONENT_LIBRARY.md`. It's a single status-driven template (one file, three content blocks
   toggled by `Seller.status`), not three screens — matches the addendum's suggestion. Built from
   existing primitives only (icon-in-circle, Badge, key/value summary panel, Button) — no new
   component, just a new page composition. Worth adding a one-line entry to
   `COMPONENT_LIBRARY.md`'s "Supporting/composite components" list (`AccountStatusScreen` or
   similar) so Frontend knows it's a reusable pattern in case a future login-gated role (e.g. a
   future partner/affiliate account type) needs the same shape.

4. **"Sold by" PDP line** — `product-detail.html`, small addition under the rating/SKU row: a
   store icon + "Sold by {businessName}" linking out (to a future seller storefront page, out of
   scope this phase — link currently goes nowhere, matches addendum §4's "not required this phase,
   just don't block it"). Uses the same icon already introduced for the Sellers nav item
   (storefront/shop glyph) for visual consistency between admin, seller portal, and storefront.

## Nothing else needed

No new colors, radii, shadows, breakpoints, icons (beyond the one shop/storefront glyph used for
Sellers nav + "Sold by"), or type scale entries. No empty-state illustration was added for
`admin-sellers.html`'s table — it reuses the existing `generic` `EmptyState` variant (icon-only)
per `COMPONENT_LIBRARY.md`, same as any other empty admin table.
