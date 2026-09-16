# Mobile Bottom Navigation — Spec

Applies to the **storefront only**, widths `<768px` (below Tailwind `md`). Admin dashboard keeps its
desktop-first sidebar unchanged (per `docs/PHASE2_ADDENDUM.md` §3) — nothing here touches
`admin-*.html`.

---

## 1. Tab set decision: 4 tabs, no dedicated Search tab

**Tabs: Home · Categories · Cart · Account.**

Rationale (addendum asked us to pick and justify):

- Search stays reachable in exactly one tap from *every* screen via the sticky header, which is
  more discoverable than burying it behind a bottom tab that only appears on non-nav screens.
  A 5th tab pushes every tab's hit target from ~92px down to ~74px wide on a 360px-wide phone —
  still above the 44px minimum, but it thins out the highest-frequency actions (Cart, Account) for
  a feature that has a better home already.
- Reference apps in the same category (Amazon, Flipkart) treat search as a persistent header
  element, not a bottom tab, precisely because search is a *global* action available from
  everywhere, whereas the bottom bar's job is switching between the 4 *destinations* a returning
  customer actually toggles between (browse home, browse by category, check cart, manage
  account/orders).
- To compensate for not having a Search tab, the mobile header changes from "icon that expands to
  search" to an **always-visible search field** in the sticky header row (see §5) — search is one
  tap away, not two.

If usage data later shows search is being missed, promoting it to a 5th tab is a small, isolated
change to the nav component — it does not require touching this decision's downstream token/CSS
work.

---

## 2. Anatomy

```
┌─────────────────────────────────────────────┐
│   🏠 Home      🗂 Categories   🛒 Cart(3)  👤 Account │  ← 56px content row
├─────────────────────────────────────────────┤
│         safe-area-inset-bottom padding        │  ← iOS home-indicator clearance
└─────────────────────────────────────────────┘
```

- **Container**: `position: fixed; bottom: 0; inset-inline: 0; z-index: 40`. `bg-neutral-0`,
  `border-t border-neutral-200`, `shadow-nav` (new token, §6 below — a soft *upward* shadow so the
  bar reads as sitting above page content rather than blending into it).
- **Content row height**: `56px` fixed (new `space-14` token = 56px, added to
  `tailwind.tokens.js`).
- **Safe area**: `padding-bottom: max(8px, env(safe-area-inset-bottom))` on the container, added
  *outside* the 56px content row so the icons/labels never sit in the inset zone. Total rendered
  height on notched iPhones ≈ 56px + ~34px.
- **4 equal-width flex items** (`flex-1`), each a full-height tap target (56px, exceeds the 44px
  minimum), `flex-col items-center justify-center gap-0.5`.
- **Icon**: 22px, Lucide set (matches header icon sizing conventions), `stroke-width: 2`.
- **Label**: `10px/12px` (below `text-xs`, mobile-nav-specific — small deliberately, icon carries
  primary recognition), `font-medium`.

---

## 3. States

| State | Icon/label color | Notes |
|---|---|---|
| Active | `primary-700` | Icon fills or switches to solid variant is optional (keep stroke for consistency with rest of icon set); label `font-semibold`. A 2px `primary-700` indicator bar (`w-8 rounded-full`) centered above the icon reinforces active state without relying on color alone (contrast/colorblind safety). |
| Inactive | `neutral-500` | |
| Pressed (tap) | `primary-600`, background `primary-50` full tap-cell, 100ms | Gives immediate tactile feedback — pairs with the micro-interaction pass in `design-system.md` §10. |
| Disabled (n/a here — all 4 tabs always reachable) | — | |

Route matching: tab is "active" when the current route falls under that section (e.g.
`/category/:slug`, `/search` results also count as Categories territory only if arrived at via
category browse — plain header search results land on a results page with **no** tab active,
since it's not one of the 4 destinations; that's fine, it's a transient screen reached from the
header, not the bar).

---

## 4. Cart badge

- Small circular badge, `bg-accent-600`, `text-white`, `text-[10px] font-bold`, positioned
  `absolute -top-1 -right-1.5` relative to the cart icon (not the whole tab cell).
- Min size `16px` diameter, pill-shape grows horizontally for 2+ digits (`min-w-4 px-1
  rounded-full`).
- Shows item count (sum of line-item quantities, matches header cart icon badge — both must stay
  in sync via the same cart-count store/selector). `9+` when count exceeds 9.
- Hidden entirely when cart is empty (no `0` badge — badge presence itself signals "you have
  something in cart").

---

## 5. Header changes (mobile, `<768px`)

- Logo row stays as-is (hamburger menu icon **removed** as primary nav trigger — its job is fully
  replaced by the bottom bar; if a hamburger remains it should only hold secondary links: Help,
  Track Order, Contact, Language/region — not primary navigation).
- Below the logo row, add a **second sticky row**: full-width search input (44px height, same
  visual spec as `Input` `lg` size minus label), placeholder `"Search part name, number or OEM
  code…"`, `prefixIcon` search glyph. This row scrolls away with the page (not double-sticky) —
  only the top logo row and the bottom nav are position-fixed, to avoid stacking two fixed bars and
  eating vertical space on small phones.
- Wishlist icon moves from the header icon cluster into the Account section (account page /
  desktop nav) on mobile — one less header icon now that Cart/Account live in the bottom bar too;
  keeps the header uncluttered.

---

## 6. New tokens required (added to `tailwind.tokens.js`, additive only)

| Token | Value | Purpose |
|---|---|---|
| `spacing[14]` | `56px` | bottom nav content-row height (Tailwind's own default 14-scale value, now declared explicitly since our spacing object enumerates its scale) |
| `boxShadow.nav` | `0 -2px 8px rgba(18,21,33,0.06)` | upward shadow so the fixed bottom bar reads as elevated above page content |

See `design-system.md` §4/§10 for the rest of the elevation-pass tokens (not nav-specific).

---

## 7. Pages that replace the bar instead of stacking under it

The bottom nav is a **destination switcher**; on screens with a single dominant next-action, that
action bar *replaces* the nav rather than competing with it for the bottom 56px:

| Page | Replaces bar with | Why |
|---|---|---|
| Product Detail (PDP) | Sticky **Add to Cart bar** (price + qty + Add to Cart button) | The PDP's one job is converting — the nav would just be a second, competing bottom bar |
| Cart | Sticky **order-summary / Proceed to Checkout bar** (total + CTA) | Same reasoning — checkout is the single next step |
| Checkout (all steps) | Sticky **step footer** (Back / Continue / Place Order) | Checkout is a focused linear flow; destination-switching is actively undesirable mid-flow |
| Order confirmation | No bottom bar at all (page ends with "Continue Shopping" / "View Order" buttons inline) | Terminal screen, avoid encouraging further nav away before the user has registered the order succeeded |

Every other storefront screen (Home, Category Listing, Fitment Finder, Search Results, Account,
Order History, Order Tracking, Wishlist) keeps the standard 4-tab bar. Replaced pages must still
reserve the same bottom safe-area handling in their own sticky bar (`env(safe-area-inset-bottom)`)
so their CTA isn't flush against the iOS home indicator either.

## 8. Content bottom padding

Every page that keeps the bar needs `padding-bottom` on its scrollable content equal to the bar's
*rendered* height (56px + safe-area-inset-bottom), not a hardcoded `pb-14`, so content is never
clipped. Implementation note for Frontend: a CSS custom property set once
(`--bottom-nav-h: calc(56px + env(safe-area-inset-bottom))`) applied as `padding-bottom:
var(--bottom-nav-h)` on the page's scroll container is more robust than a fixed Tailwind spacer div
per page (mockups in `design/mockups/` use the spacer-div approach only because they're static
files without a shared layout wrapper — production code should centralize this in the storefront
layout shell instead of repeating it per page).
