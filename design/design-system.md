# Design System — Spare Parts E-commerce Platform

Source of truth for visual language across storefront and admin. Frontend agent: implement these as Tailwind theme tokens (see `design/tailwind.tokens.js` — paste directly into `tailwind.config.js` `theme.extend`) and build the shared component library described in `design/COMPONENT_LIBRARY.md` from the specs below. Static reference mockups live in `design/mockups/*.html`.

Brand tone: **trustworthy, industrial/automotive spare-parts retailer.** Information-dense, fast-scanning, correct-fit confidence signals, generous touch targets (mobile users may be in a garage). Utility over decoration.

---

## 1. Color Palette

Two-hue system: **Deep Blue** (primary — trust, structure, navigation, links) + **Automotive Orange** (accent — CTAs, price emphasis, urgency). Neutral **Slate** grays for structure/text. Dedicated **status colors** for stock/order/success-error states (kept separate from brand hues so they never get confused with brand chrome).

### Primary — Deep Blue (`primary`)
| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#EFF4FB` | subtle backgrounds, selected-row tint |
| `primary-100` | `#DCE6F5` | hover backgrounds on light surfaces |
| `primary-200` | `#B7CCE9` | borders on light primary surfaces |
| `primary-300` | `#8DAEDA` | disabled primary text |
| `primary-400` | `#5A87C4` | icons, secondary links |
| `primary-500` | `#33619E` | — |
| `primary-600` | `#204A82` | hover state of primary-700 |
| `primary-700` | `#123B72` | **brand primary** — header, primary nav, primary buttons |
| `primary-800` | `#0D2C57` | active/pressed state, dark footer bg |
| `primary-900` | `#081D3B` | darkest, high-contrast text on light bg |

### Accent — Automotive Orange (`accent`)
| Token | Hex | Usage |
|---|---|---|
| `accent-50` | `#FFF3EB` | badge backgrounds ("Sale", "Fits your vehicle" hover) |
| `accent-100` | `#FFE1CC` | |
| `accent-300` | `#FFAD73` | |
| `accent-500` | `#F5730C` | — |
| `accent-600` | `#E2600A` | **CTA default** — Add to Cart, Buy Now, primary checkout actions |
| `accent-700` | `#C24E08` | CTA hover/active |
| `accent-800` | `#9C3E07` | CTA pressed / text-on-light emphasis |

### Neutral — Slate (`neutral`)
| Token | Hex | Usage |
|---|---|---|
| `neutral-0` | `#FFFFFF` | surfaces |
| `neutral-50` | `#F7F8FA` | app background |
| `neutral-100` | `#EEF0F3` | card/table zebra, input bg (disabled) |
| `neutral-200` | `#DFE3E8` | borders, dividers |
| `neutral-300` | `#C7CDD6` | input borders |
| `neutral-400` | `#9AA3B2` | placeholder text, disabled text |
| `neutral-500` | `#6B7385` | secondary/meta text (captions, timestamps) |
| `neutral-600` | `#4C5366` | body text (secondary emphasis) |
| `neutral-700` | `#333A4D` | body text (primary) |
| `neutral-800` | `#1F2433` | headings |
| `neutral-900` | `#121521` | max-contrast text, admin sidebar bg |

### Status
| Token | Hex | Usage |
|---|---|---|
| `success-50` | `#EAF9EF` | in-stock badge bg |
| `success-600` | `#1C9A4B` | in-stock text/icon, success toast |
| `success-700` | `#157A3B` | success button/hover |
| `warning-50` | `#FFF8E6` | low-stock badge bg |
| `warning-600` | `#B7791F` | low-stock text |
| `warning-700` | `#8F5D14` | |
| `danger-50` | `#FDECEC` | out-of-stock / error bg |
| `danger-600` | `#D5342E` | error text, destructive button |
| `danger-700` | `#AE2621` | destructive hover |
| `info-50` | `#EAF3FC` | informational banners |
| `info-600` | `#1E6FB8` | informational text/icon |

**Contrast rule:** body text on `neutral-0`/`neutral-50` uses `neutral-700`+ (≥4.5:1). Text on `primary-700`/`accent-600` fills uses `neutral-0` (white). Never place `accent` text directly on `primary` fill or vice versa — use white or neutral-50.

**Fitment signal:** "Fits your vehicle" badge = `success-50` bg / `success-700` text / check icon. "Check fitment" prompt (unconfirmed) = `info-50` bg / `info-600` text. "Does not fit" = `danger-50` bg / `danger-600` text.

---

## 2. Typography

**Font family:**
- UI/body: `Inter` (system fallback: `-apple-system, "Segoe UI", Roboto, sans-serif`) — clean, high legibility at small sizes.
- Part numbers / SKUs / prices in tables: `"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace` — fixed-width so digits/codes scan and align cleanly (returning customers scan part numbers fast).

Load both via Google Fonts in mockups (`Inter:400,500,600,700` + `JetBrains Mono:500,600`).

### Type scale
| Token | Size / Line-height | Weight | Usage |
|---|---|---|---|
| `text-xs` | 12px / 16px | 400–500 | meta text, captions, table labels |
| `text-sm` | 14px / 20px | 400–500 | body small, form labels, nav |
| `text-base` | 16px / 24px | 400 | body default |
| `text-lg` | 18px / 28px | 500–600 | card titles, section labels |
| `text-xl` | 20px / 28px | 600 | product title (listing) |
| `text-2xl` | 24px / 32px | 600–700 | product title (PDP), section headings |
| `text-3xl` | 30px / 36px | 700 | page headings |
| `text-4xl` | 36px / 40px | 700 | hero headline (mobile) |
| `text-5xl` | 48px / 52px | 800 | hero headline (desktop, `lg:`) |
| `text-price-sm` | 16px / mono-ish tabular-nums | 700 | price in cards |
| `text-price-lg` | 28px / tabular-nums | 800 | price on PDP |

Numeric fields (prices, part numbers, stock counts) always use `font-variant-numeric: tabular-nums` so columns of numbers align in tables.

---

## 3. Spacing Scale (4px base unit)

| Token | Value |
|---|---|
| `space-0` | 0 |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

Maps 1:1 to Tailwind's default spacing scale (`p-1`…`p-24` etc.) — no override needed beyond confirming defaults; included explicitly in tokens file for documentation.

**Touch targets:** minimum 44×44px for any tappable control on mobile (buttons, qty steppers, filter chips) per brief's "garage/workshop" mobile-use note.

---

## 4. Radius & Elevation

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | badges, chips, inputs |
| `radius-md` | 8px | buttons, cards (default) |
| `radius-lg` | 12px | modals, large cards, image containers |
| `radius-xl` | 16px | hero banner, bottom sheets |
| `radius-full` | 9999px | pills, avatar, qty stepper buttons |

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(18,21,33,0.06)` | input focus rest, list rows |
| `shadow-card` | `0 1px 3px rgba(18,21,33,0.08), 0 1px 2px rgba(18,21,33,0.04)` | product cards, panels |
| `shadow-md` | `0 4px 12px rgba(18,21,33,0.10)` | dropdowns, popovers, sticky bars |
| `shadow-lg` | `0 12px 32px rgba(18,21,33,0.16)` | modals, drawers |

---

## 5. Breakpoints (match `docs/DESIGN_BRIEF.md`, Tailwind defaults)

| Name | Min-width | Notes |
|---|---|---|
| base (mobile) | 0 | design baseline |
| `md` (tablet) | 768px | 2-col grids, side-by-side cart summary |
| `lg` (desktop) | 1024px | full nav, 3–4 col grids, sticky sidebar filters |
| `xl` (wide) | 1280px | max content width 1280px centered |

Admin dashboard: desktop-first (primary target `lg:` 1024px+), must degrade usably at `md:` 768px; mobile admin not required v1.

---

## 6. Iconography

- **Icon set:** [Lucide](https://lucide.dev) (MIT, tree-shakeable, consistent 24×24 grid, pairs well with Inter). Mockups use inline SVG copies of Lucide icons so files stay dependency-free.
- **Stroke weight:** 1.75–2px, consistent across the set.
- **Sizing:** 16px (inline with text-sm), 20px (default UI/buttons), 24px (nav/header).
- **Color:** icons inherit `currentColor`; use `neutral-500`/`neutral-600` for utility icons, `primary-700` or `accent-600` for emphasis, status colors for stock/success/error icons.
- **Core icon vocabulary:** search, filter (sliders), grid/list toggle, cart, user, heart (wishlist), truck (shipping), shield-check (fitment/warranty), map-pin (pincode), star (ratings), chevron (accordions/carousels), check-circle (in stock/success), alert-triangle (low stock/warning), x-circle (out of stock/error), package (order), upload (CSV import), download (export/invoice).

---

## 7. Component Specs

Full prop/variant tables live in `design/COMPONENT_LIBRARY.md`. This section defines visual states shared by all interactive components.

### Button
| Variant | Default | Hover | Active/Pressed | Disabled | Focus |
|---|---|---|---|---|---|
| Primary (CTA) | bg `accent-600`, text white | bg `accent-700` | bg `accent-800` | bg `neutral-200`, text `neutral-400` | 2px ring `accent-300` offset 2px |
| Secondary | bg `primary-700`, text white | bg `primary-600` | bg `primary-800` | bg `neutral-200`, text `neutral-400` | 2px ring `primary-300` |
| Outline | border `neutral-300`, text `neutral-700`, bg transparent | border `primary-700`, text `primary-700`, bg `primary-50` | bg `primary-100` | border `neutral-200`, text `neutral-400` | 2px ring `primary-300` |
| Ghost | text `neutral-700`, bg transparent | bg `neutral-100` | bg `neutral-200` | text `neutral-400` | 2px ring `neutral-300` |
| Destructive | bg `danger-600`, text white | bg `danger-700` | darker | bg `neutral-200` | 2px ring `danger-300` |

Sizes: `sm` (32px h, text-sm, px-3), `md` (40px h, text-sm, px-4 — default), `lg` (48px h, text-base, px-6 — primary mobile CTAs, min 44px touch target satisfied). Radius `radius-md`. Icon-only buttons are square (same height/width) with `radius-full` for compact contexts (qty stepper) or `radius-md` otherwise.

### Input / Select / Textarea
- Default: bg white, border `neutral-300` 1px, `radius-md`, text `neutral-700`, placeholder `neutral-400`, height 44px (touch-friendly), px-3.
- Hover: border `neutral-400`.
- Focus: border `primary-600`, ring 3px `primary-100`.
- Error: border `danger-600`, helper text `danger-600` below with alert-triangle icon.
- Disabled: bg `neutral-100`, text `neutral-400`, border `neutral-200`, cursor not-allowed.
- Label: `text-sm` `font-medium` `neutral-700`, `space-1` above input. Helper/error text `text-xs` below, `space-1` gap.

### Card (Product Card, Panel)
- bg white, `radius-md` (product cards) / `radius-lg` (panels), `shadow-card`, border `neutral-200` 1px (subtle, shadow does most of the work).
- Hover (interactive cards): `shadow-md`, border `neutral-300`, slight `translateY(-2px)` transition 150ms.
- Padding: `space-4` (mobile) / `space-5` (desktop) internal.

### Badge
- Shape: pill, `radius-full`, `text-xs` `font-semibold`, px-2.5 py-0.5, uppercase tracking-wide optional for status badges.
- Variants: `neutral` (bg `neutral-100`/text `neutral-600`), `primary` (bg `primary-50`/text `primary-700`), `success` (bg `success-50`/text `success-700`), `warning` (bg `warning-50`/text `warning-600`), `danger` (bg `danger-50`/text `danger-600`), `accent` (bg `accent-50`/text `accent-700`, e.g. "Sale −20%").

### Modal / Drawer
- Overlay: `neutral-900` at 50% opacity.
- Panel: bg white, `radius-lg` (modal, centered) or square-edged on the open side (drawer/bottom-sheet on mobile), `shadow-lg`, max-width 480px (modal), padding `space-6`.
- Mobile: filter/cart drawers slide from bottom or right, full-width, `radius-xl` on the exposed top corners for bottom sheets.

### Toast
- Positioned bottom-center (mobile) / bottom-right (desktop), `radius-md`, `shadow-lg`, px-4 py-3, icon + message, auto-dismiss 4s, manual close (x) icon.
- Variants use status colors: success (`success-600` icon, white bg, `success-200` border), error (`danger-600`), info (`info-600`), warning (`warning-600`).

---

## 8. Stock / Fitment Status Convention (used across listing, PDP, cart, admin)

| State | Badge text | Color | Icon |
|---|---|---|---|
| In stock | "In Stock" | success | check-circle |
| Low stock | "Only N left" | warning | alert-triangle |
| Out of stock | "Out of Stock" | danger | x-circle |
| Fits your vehicle | "Fits your vehicle" | success | shield-check |
| Fitment unconfirmed | "Check fitment" | info | help-circle |
| Does not fit | "Doesn't fit selected vehicle" | danger | alert-triangle |

---

## 9. Content/Data Conventions for Mockups

Placeholder data reflects `docs/DATA_MODEL.md` field names so Frontend can map straight across: `sku`, `partNumber`, `oemNumber`, `basePrice` (displayed as ₹, converted from paise), `gstRate`, `avgRating`/`reviewCount`, `FitmentCompatibility` (`make`/`model`/`yearFrom-yearTo`), variant labels, `Order.status` values, `Shipment.status` values.

Example part numbers used throughout: `OEM-4521-BP` (brake pads), `OEM-7731-AF` (air filter), `OEM-2290-CV` (CV joint), `OEM-1150-HB` (headlight bulb kit), `OEM-6602-SA` (shock absorber).

Phase 2 mockups additionally cross-reference the actual seed catalog in
`backend/src/database/seeders/run-seed.ts` where a mockup claims to show "real" data end-to-end:
Bosch **Front Brake Pad Set** (`BP-4521` / OEM `OEM-77123`, ₹1,299, fits Maruti Suzuki Swift
2018–2024), Generic **Front Shock Absorber** (`SA-9981` / OEM `OEM-55210`, ₹2,499, fits Hyundai i20
2015–2022), MRF **Engine Oil Filter** (`OF-1123` / OEM `OEM-33019`, ₹349, fits Tata Nexon
2017–2024). Both naming conventions (brief's illustrative `OEM-####-XX` codes and the seeder's real
`sku`/`partNumber`/`oemNumber` triplet) are valid placeholder content — use whichever fits the
mockup's point, but prefer the real seed items on any mockup meant to demonstrate an actual
frontend↔backend data path.

---

## 10. Elevation & Polish (Phase 2)

Addendum §4: give the app "actual personality within the existing palette — not a rebrand, an
elevation." Everything below builds on §1–§9 tokens; nothing here replaces them.

### 10.1 Shadow scale — when to use which

The base scale (`shadow-sm` / `shadow-card` / `shadow-md` / `shadow-lg`, §4) covers rest states.
Phase 2 adds two purpose-built shadows (also in `tailwind.tokens.js`):

| Token | Value | Use |
|---|---|---|
| `shadow-nav` | `0 -2px 8px rgba(18,21,33,0.06)` | Fixed mobile bottom nav and any sticky-bottom action bar (PDP add-to-cart, cart checkout bar, checkout step footer) — an *upward* shadow so these read as sitting above content. |
| `shadow-raised` | `0 8px 24px rgba(18,21,33,0.14)` | Hover-elevated state for cards/popovers that sit over a gradient or colored surface (e.g. a product card hovered inside the hero band), where `shadow-md` reads too faint against a dark background. |

General rule: elevation should track interaction state, not decorate at rest. Flat/rest → `card`.
Hover/focus-within on interactive surfaces → `md` (or `raised` on colored backgrounds). Overlays
(modal, drawer, dropdown) → `lg`. Fixed chrome (nav bars) → `nav`.

### 10.2 Gradients on hero/CTA surfaces

Two named gradients (`bg-hero-gradient`, `bg-cta-gradient` in `tailwind.tokens.js`
`backgroundImage`), built only from existing brand hex values — this is a depth cue, not a new
color:

- **`hero-gradient`** (`primary-700 → primary-600 → primary-800`, 135°): home hero band, PDP
  fitment-confidence banner, any full-bleed brand-colored section. Replaces flat `bg-primary-700`.
- **`cta-gradient`** (`accent-600 → accent-500`, 135°): reserved for *one* high-emphasis CTA per
  screen (e.g. the hero's "Find parts for my vehicle" button, PDP sticky Add-to-Cart on mobile).
  Ordinary buttons stay flat `accent-600` per §7 — gradient CTA is a scarce visual signal, not the
  default button treatment.

Never combine both gradients touching each other (orange-on-blue gradient edges get muddy) —
separate with white/neutral-50 space.

### 10.3 Micro-interactions

| State | Spec |
|---|---|
| Hover (desktop, pointer-fine) | Interactive cards: `shadow-card → shadow-md`, `translateY(-2px)`, 150ms ease-out (already in §7). Buttons: background step per §7 button table, 120ms. |
| Press/active (mouse or touch) | Scale `0.97`, 100ms ease-in, plus the button's `Active` background from §7. Applies to buttons, tappable cards, bottom-nav tab cells, qty stepper buttons — any primary tap target should visibly compress, not just recolor, so touch feels acknowledged on mobile. |
| Focus-visible | Existing 2px ring per component (§7) — unchanged, this is an accessibility requirement, not a polish item. |
| Skeleton loading | Replaces bare spinners for content that has a known shape (product cards, table rows, PDP gallery, order list). See `COMPONENT_LIBRARY.md` `SkeletonLoader`. Shimmer: a `neutral-200 → neutral-100 → neutral-200` gradient sweeping left-to-right, 1.5s linear infinite, `radius` matching the content it stands in for. |
| Toast enter/exit | Enter: slide-up + fade-in 200ms ease-out from its dock edge (bottom-center mobile / bottom-right desktop). Exit: fade-out 150ms, no slide (avoid drawing extra attention on dismiss). |
| Badge/count changes (cart badge) | Brief scale pulse (`1 → 1.25 → 1`, 200ms) when the count increments — reinforces "something was added" without a toast on every single add if the design later wants a lighter-weight confirmation. |

### 10.4 Empty-state illustrations

Addendum: replace plain text empty states with simple inline SVG illustrations — lightweight,
on-brand, not stock-art. House style:

- **Construction**: flat geometric line-art, 2px stroke, single accent detail. Base line color
  `neutral-300`, one small accent touch in `primary-300` or `accent-300` (never full-saturation
  brand color — these are low-emphasis, supporting graphics, not attention-grabbing).
  Viewbox `0 0 120 120`, rendered at 96–120px in the empty state.
  and `EmptyState` composite (§7/COMPONENT_LIBRARY.md).
- No literal photography, no stock illustration libraries, no drop shadows on the illustration
  itself (keep it flat/graphic, consistent with the icon language in §6).
- Four named variants ship in this phase (spec + inline SVG markup in `COMPONENT_LIBRARY.md`):
  **empty-cart** (outline shopping cart with a small dashed-circle "nothing here" mark),
  **no-orders** (outline package/box with a clock overlay), **no-search-results** (outline
  magnifier with a small "x"), **no-wishlist-items** (outline heart, unfilled/dashed).
- Copy pattern: bold `text-lg` title ("Your cart is empty") + `text-sm neutral-500` supporting line
  + one primary `Button` where a next action exists ("Browse Categories" / "Start Shopping" — never
  a dead end without a CTA if one is plausible).

### 10.5 Card hierarchy — imagery-first

Product/category cards should lead with imagery, not text density:

- Image area gets no less than 55% of card height (product cards keep the existing 1:1 image per
  §COMPONENT_LIBRARY `ProductCard`, this just confirms it stays dominant as other polish is added).
- Badges (stock/discount/new — §10.6) overlay the image directly (bottom-left stock/fitment,
  top-left discount/new, top-right wishlist heart) rather than living in the text block below, so
  the image band carries the at-a-glance signal and the text block underneath stays purely
  identifying (brand, title, part number, price, rating).
- Rating stars render as an actual 5-star glyph row (§10.7), never a bare "4.2" number alone — the
  number is a suffix, not the primary signal.

### 10.6 Badges: stock / discount / new

Extends §7 Badge and §8 stock convention with the two new commerce badges Phase 2 needs on cards:

| Badge | Placement | Style |
|---|---|---|
| Stock (`In Stock` / `Only N left` / `Out of Stock`) | Image bottom-left overlay | Per §8 — success/warning/danger pill on a semi-opaque white chip if contrast against the photo is a concern, else direct on white product-shot background. |
| Discount (`−N%` / `Sale`) | Image top-left overlay | `bg-accent-600 text-white`, pill, `text-[10px] font-bold`, e.g. `−13%`. Only shown when `originalPrice > price`; compute the percentage, don't hardcode "Sale". |
| New | Image top-left overlay (stacks below/beside discount if both apply — discount takes visual priority, New moves to top-right corner in that case) | `bg-primary-700 text-white`, pill, `text-[10px] font-bold uppercase tracking-wide`, "NEW". Applied to products where `createdAt` is within the last 30 days — a data rule for Frontend, not a manual flag. |

### 10.7 Rating stars — visual spec

Render as 5 inline star glyphs, not a numeric-only value:

- Full star: filled `warning-600` (matches the existing ★ color already used informally in
  mockups). Half star: use a clipped/half-filled glyph for `x.5` averages rather than rounding —
  correct-fit confidence is the whole brand promise, don't round away precision on the one social
  proof signal. Empty star: outline only, `neutral-300`.
- Size: 14px inline with `text-xs` contexts (cards), 16px inline with `text-sm` (PDP header), 20px
  in the PDP reviews-tab summary.
- Always paired with the count in parens: `★★★★☆ (128)`. On PDP, also show the numeric average
  (`4.3 out of 5`) next to the stars for screen readers / precision — the stars alone aren't
  sufficient for exact comparison.
