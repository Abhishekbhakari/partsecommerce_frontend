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
