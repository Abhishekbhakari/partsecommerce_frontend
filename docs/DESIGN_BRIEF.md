# Design Brief — Spare Parts E-commerce Platform

For the Design agent. Goal: produce specs the Frontend agent can build screens from directly, with no Figma access in this workflow.

## Output format decision

**No Figma access, so Design ships two things instead:**

1. **HTML mockup artifacts** for key customer-facing screens (home, listing, PDP, fitment finder, cart, checkout) — real markup/CSS the Frontend agent can view in a browser and reference for exact spacing, layout, and interaction states. Store these under `/design/mockups/*.html`.
2. **A written design system doc** (`/design/DESIGN_SYSTEM.md`) covering: color palette (with hex values), typography scale, spacing scale, and component specs (buttons, inputs, cards, nav, badges, modals, toasts) with states (default/hover/active/disabled/error). This is what Frontend implements as the shared Tailwind config + component library.

Admin dashboard screens (higher screen count, lower visual-novelty) can be spec'd as **written component/layout specs** in `/design/ADMIN_SCREENS.md` rather than full HTML mockups, to conserve time — reuse the same design system.

## Pages / Screens Needed

### Storefront (customer-facing)
- Home page (hero/banner carousel, category shortcuts, featured products, brand strip, trust badges)
- Category / listing page (filters: category, brand, price range, fitment; sort; pagination; grid/list toggle)
- Product detail page (image gallery, variant selector, price/GST display, fitment compatibility checker, add-to-cart, specs tab, reviews tab, related products)
- Fitment finder (make/model/year selector — standalone widget usable on home page and as a full search flow)
- Search results page (with autocomplete dropdown component)
- Cart page (line items, qty edit, coupon field, order summary, pincode check)
- Checkout flow (address selection/entry, shipping method, payment method selection, order review, guest checkout path)
- Order confirmation page
- Order tracking page (shipment status timeline)
- Account pages: login/OTP entry, profile, address book, wishlist, order history, order detail/returns
- Static pages: About, Contact, Terms, Privacy, Shipping Policy, Returns Policy (simple content template, one spec covers all)
- 404 / empty states (empty cart, empty wishlist, no search results)

### Admin Dashboard
- Login
- Analytics/overview dashboard (sales summary, top products, low stock alerts)
- Product management (list, create/edit form, bulk CSV import UI)
- Inventory management (stock levels, low-stock report)
- Order management (list, filter by status, detail view, status update actions)
- Customer management (list, detail with order history)
- Coupon management (list, create/edit form)
- Banner/CMS management (list, create/edit, image upload, placement/scheduling)
- Reviews moderation (list pending, approve/reject)
- Staff & roles management (invite staff, assign role)
- Reports (sales, inventory — simple charts + export)

## Mobile-First Requirement

All screens designed mobile-first, then adapted upward. Breakpoints (align to Tailwind defaults so Frontend can map directly):

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px (`base`) | Primary design target — most storefront traffic expected on mobile |
| Tablet | ≥ 768px (`md`) | 2-column listing grids, side-by-side cart summary |
| Desktop | ≥ 1024px (`lg`) | Full nav, multi-column listing (3-4 cols), sticky filters sidebar |
| Wide | ≥ 1280px (`xl`) | Max content width ~1280px, centered, extra whitespace |

Admin dashboard can be desktop-first (≥1024px primary) but must remain usable at tablet width (768px) for on-the-go staff use; mobile admin is not required for v1.

## Brand Tone

**Trustworthy, industrial/automotive spare-parts retailer.** Design should communicate:
- **Reliability & expertise** — this is a business customers trust for correct-fit parts, not a generic marketplace. Use clear fitment/compatibility signals prominently (badges like "Fits your vehicle").
- **Utility over decoration** — clean, information-dense layouts (spec tables, part numbers, stock status) rather than heavy lifestyle photography. Automotive/industrial customers want facts fast.
- **Approachable, not intimidating** — despite technical content, use plain language, clear CTAs, and generous touch targets (mobile users may be in a garage/workshop, not at a desk).
- **Color direction:** a confident primary (suggest deep blue or automotive red/orange as accent — Design to finalize and document exact hex values in DESIGN_SYSTEM.md), neutral grays for structure, a clear green/red for stock status and success/error states.
- **Typography:** a clean sans-serif, strong hierarchy for prices and part numbers (these are scanned quickly by returning customers who know what they want).

## Deliverable Checklist for Design Agent

- [ ] `/design/DESIGN_SYSTEM.md` — colors, type scale, spacing, component specs w/ states
- [ ] `/design/mockups/home.html`
- [ ] `/design/mockups/listing.html`
- [ ] `/design/mockups/product-detail.html`
- [ ] `/design/mockups/fitment-finder.html`
- [ ] `/design/mockups/cart.html`
- [ ] `/design/mockups/checkout.html`
- [ ] `/design/mockups/account.html` (covers login/profile/addresses/wishlist/orders as one pattern set)
- [ ] `/design/ADMIN_SCREENS.md` — written specs for all admin screens listed above
- [ ] `/design/NOTIFICATION_TEMPLATES.md` — email/SMS/WhatsApp copy + layout (needed by Week 8, lower priority)

Deliver storefront mockups/design system by end of Week 2-4 per `PROJECT_PLAN.md` sprint schedule (screen-by-screen, staying ~3-5 days ahead of the Frontend agent's build of that same screen).
