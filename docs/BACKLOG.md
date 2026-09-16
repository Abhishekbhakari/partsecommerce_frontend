# Backlog — Spare Parts E-commerce Platform

Flat task list by team, organized by the 12 client-proposal modules. Each agent should work top-to-bottom within their section as priority order (P0 = must do first, blocks other work; P1 = core scope; P2 = can slip late if needed).

Reference: `PROJECT_PLAN.md` for sprint timing, `API_CONTRACT.md` / `DATA_MODEL.md` for shared shapes.

## Design Tasks

**Module 1 — Discovery, Planning & UI/UX Design**
- [ ] P0: Sitemap + information architecture
- [ ] P0: Brand direction — color palette, typography, logo treatment (if any)
- [ ] P0: `DESIGN_SYSTEM.md` — component specs (buttons, inputs, cards, nav, badges, modals, toasts) with all states

**Module 2 — Customer Storefront**
- [ ] P0: Home page mockup
- [ ] P0: Category/listing page mockup (filters, sort, grid/list)
- [ ] P1: Static page template (About/Contact/Terms/Privacy/Shipping/Returns)
- [ ] P1: Empty states (empty cart, empty wishlist, no results, 404)

**Module 3 — Product Catalog & Smart Search**
- [ ] P0: Product detail page mockup (gallery, variants, specs, reviews tab)
- [ ] P0: Fitment finder widget mockup
- [ ] P1: Search results page + autocomplete dropdown mockup

**Module 4 — Customer Accounts**
- [ ] P1: Login/OTP entry screen
- [ ] P1: Profile, address book, wishlist, order history mockups

**Module 5 — Cart, Checkout & Offers**
- [ ] P0: Cart page mockup
- [ ] P0: Checkout flow mockup (address, shipping, payment, review, guest path)

**Module 6 — Payment Gateway Integration**
- [ ] P1: Payment method selection UI states (success/failure/pending)

**Module 7 — Order Management & Shipping**
- [ ] P1: Order confirmation page
- [ ] P1: Order tracking page (shipment timeline)
- [ ] P2: Cancellation/return request flow

**Module 8 — Admin Dashboard**
- [ ] P1: `ADMIN_SCREENS.md` — analytics/overview
- [ ] P1: Product/inventory management screens
- [ ] P1: Order/customer management screens
- [ ] P1: Coupon management screens
- [ ] P2: Banner/CMS management screens
- [ ] P2: Reviews moderation screen
- [ ] P2: Staff & roles management screen

**Module 9 — Notifications & GST Invoicing**
- [ ] P2: `NOTIFICATION_TEMPLATES.md` — email/SMS/WhatsApp copy + layout
- [ ] P2: GST invoice PDF layout

**Module 10 — SEO, Performance & Security**
- [ ] P2: Provide alt-text/meta guidance per page type (support, not a screen)

**Module 11-12 — Testing/QA/Training**
- [ ] P2: Final visual QA pass across breakpoints (Week 9)

## Backend Tasks

**Module 1 — Discovery, Planning**
- [ ] P0: Repo scaffolding (NestJS), env config, CI skeleton
- [ ] P0: PostgreSQL provisioning + connection setup
- [ ] P0: Finalize schema/migrations from `DATA_MODEL.md`

**Module 3 — Product Catalog & Smart Search**
- [ ] P0: Category, Brand, Product, ProductVariant CRUD + migrations
- [ ] P0: Product list/filter/search endpoints
- [ ] P0: Autocomplete endpoint
- [ ] P0: FitmentCompatibility model + `/fitment/lookup`, `/fitment/options` endpoints
- [ ] P1: Bulk CSV import/export (5,000+ SKU scale — batch/streamed processing)

**Module 4 — Customer Accounts**
- [ ] P0: OTP auth (request/verify) — phone and/or email
- [ ] P0: Email/password auth
- [ ] P0: Google OAuth
- [ ] P1: Profile, Address CRUD endpoints
- [ ] P1: Wishlist endpoints
- [ ] P1: Order history endpoint

**Module 5 — Cart, Checkout & Offers**
- [ ] P0: Cart + CartItem endpoints (guest session + logged-in)
- [ ] P0: Pincode serviceability check endpoint
- [ ] P0: Coupon engine (apply/validate/remove)
- [ ] P0: GST calculation logic
- [ ] P0: Checkout endpoint (guest + logged-in) creating Order from Cart
- [ ] P1: Shipping rule engine (fee calc by pincode/weight)

**Module 6 — Payment Gateway Integration**
- [ ] P0: Razorpay integration — create intent, verify signature
- [ ] P1: UPI/cards/netbanking/wallets via Razorpay checkout
- [ ] P1: COD eligibility logic
- [ ] P1: Webhook handler (signed, idempotent)
- [ ] P1: Refund endpoint

**Module 7 — Order Management & Shipping**
- [ ] P0: Order status workflow (state machine: pending→confirmed→packed→shipped→delivered / cancelled / returned)
- [ ] P1: Shiprocket integration — create shipment, fetch tracking
- [ ] P1: Shipment webhook handler
- [ ] P1: Cancellation endpoint
- [ ] P2: Return request endpoint

**Module 8 — Admin Dashboard (backend)**
- [ ] P0: AdminUser + role-based auth guard (RBAC)
- [ ] P0: Admin product/inventory endpoints
- [ ] P0: Admin order/customer endpoints
- [ ] P1: Admin coupon endpoints
- [ ] P1: Admin banner/CMS endpoints
- [ ] P1: Admin reports endpoints (sales, inventory)
- [ ] P2: Admin reviews moderation endpoints
- [ ] P2: Admin staff management endpoints

**Module 9 — Notifications & GST Invoicing**
- [ ] P1: Notification service — email (SMTP/provider), SMS, WhatsApp integration
- [ ] P1: Order lifecycle triggers (placed/shipped/delivered → notification)
- [ ] P1: Auto GST invoice PDF generation
- [ ] P2: Admin broadcast endpoint

**Module 10 — SEO, Performance & Security**
- [ ] P1: Sitemap.xml generation endpoint
- [ ] P1: SSL setup on hosting
- [ ] P1: Image optimization/CDN hookup
- [ ] P1: Automated backups
- [ ] P2: Rate limiting, input sanitization audit

**Module 11 — Testing, QA & Deployment**
- [ ] P0: Unit tests for auth, cart, checkout, payment logic
- [ ] P0: Production deployment (API + DB)
- [ ] P1: Load test catalog/search endpoints at 5,000+ SKU scale

**Module 12 — Training, Documentation & Support**
- [ ] P1: API documentation handover (can auto-generate from `API_CONTRACT.md` + code)
- [ ] P1: Admin ops runbook (deploy, rollback, DB backup/restore)

## Frontend Tasks

**Module 1 — Discovery, Planning**
- [ ] P0: Repo scaffolding (Next.js + Tailwind), routing skeleton
- [ ] P0: Shared UI component library per `DESIGN_SYSTEM.md` (once available)
- [ ] P0: API client scaffolding (typed from `API_CONTRACT.md`)

**Module 2 — Customer Storefront**
- [ ] P0: Home page (real data)
- [ ] P0: Category/listing page (filters, sort, pagination)
- [ ] P1: Static pages
- [ ] P1: Empty/error/404 states
- [ ] P1: Responsive QA across breakpoints

**Module 3 — Product Catalog & Smart Search**
- [ ] P0: Product detail page
- [ ] P0: Fitment finder widget (home + standalone page)
- [ ] P0: Search results page + autocomplete UI

**Module 4 — Customer Accounts**
- [ ] P0: Login/OTP flow, email login, Google login button
- [ ] P1: Profile, address book, wishlist, order history pages

**Module 5 — Cart, Checkout & Offers**
- [ ] P0: Cart page (qty edit, coupon, pincode check)
- [ ] P0: Checkout flow (address, shipping, payment method, review, guest path)

**Module 6 — Payment Gateway Integration**
- [ ] P0: Razorpay checkout UI integration + callback handling
- [ ] P1: Payment success/failure/pending states
- [ ] P1: COD option in checkout

**Module 7 — Order Management & Shipping**
- [ ] P0: Order confirmation page
- [ ] P1: Order tracking page
- [ ] P2: Cancellation/return request UI

**Module 8 — Admin Dashboard**
- [ ] P0: Admin auth + protected routing
- [ ] P0: Analytics/overview dashboard
- [ ] P0: Product/inventory management screens (incl. CSV import UI)
- [ ] P0: Order/customer management screens
- [ ] P1: Coupon management screens
- [ ] P1: Banner/CMS management screens
- [ ] P2: Reviews moderation screen
- [ ] P2: Staff & roles management screen

**Module 9 — Notifications & GST Invoicing**
- [ ] P1: Notification preferences UI, in-app notification list
- [ ] P1: Invoice download link on order detail

**Module 10 — SEO, Performance & Security**
- [ ] P1: SEO meta tags, structured data (schema.org Product) per page
- [ ] P1: Image lazy-loading, code-splitting pass
- [ ] P2: Lighthouse performance pass

**Module 11 — Testing, QA & Deployment**
- [ ] P0: Component/integration tests for cart, checkout, auth flows
- [ ] P0: Production deployment (storefront + admin)
- [ ] P1: Cross-browser/device QA

**Module 12 — Training, Documentation & Support**
- [ ] P1: Admin dashboard user guide (screenshots + walkthroughs)

## PM Tasks (ongoing, all weeks)

- [ ] Weekly check-in / risk log update
- [ ] Keep `API_CONTRACT.md` and `DATA_MODEL.md` change log current if either changes post-freeze
- [ ] Coordinate UAT in Week 9
- [ ] Compile training/handover documentation (Module 12)
- [ ] Track budget vs. third-party service costs (Razorpay, Shiprocket, SMS/WhatsApp provider, hosting, CDN)
