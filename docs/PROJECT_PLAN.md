# Project Plan — Spare Parts E-commerce Platform

**Timeline:** 9 weeks | **Budget:** ₹25,000 (dev) | **Repo:** spare-parts-ecommerce

This plan maps the 12 client-proposal modules to a sprint-by-sprint schedule across the three build agents (Design, Backend, Frontend) plus PM. It exists so the three agents can work in parallel with minimal collisions: Design must land specs before Frontend builds the matching screen, and Backend must publish the API contract before Frontend integrates against it.

## Guiding rules for parallel work

1. **Design leads by ~3-5 days on any given screen.** Frontend should not start pixel-level build of a screen until its spec/mockup exists in `/design`. Frontend may build scaffolding/routing/state ahead of specs, but not final layout.
2. **API contract is frozen after Week 2.** Backend and Frontend both build against `docs/API_CONTRACT.md`. Any change after Week 2 requires a note in that file's Changelog section and a heads-up to Frontend.
3. **Data model is frozen after Week 1.** `docs/DATA_MODEL.md` is the single source of truth for entity shapes; Backend implements schema/migrations from it, Frontend types its API clients from it.
4. Each agent owns its folder (`/backend`, `/frontend`, `/design`) but reads `/docs` as the shared contract layer.

## Sprint Breakdown

### Week 1 — Discovery, Planning & Foundations (Module 1)
| Owner | Deliverables |
|---|---|
| PM | Finalize PROJECT_PLAN, API_CONTRACT, DATA_MODEL, DESIGN_BRIEF, BACKLOG (this set of docs) |
| Design | Sitemap, information architecture, brand direction (colors/type/tone), low-fi wireframes for home + PDP + listing |
| Backend | Repo scaffolding (NestJS), DB provisioning (PostgreSQL), environment config, CI skeleton, auth strategy decision (OTP/email/Google) |
| Frontend | Repo scaffolding (Next.js + Tailwind), design tokens placeholder, routing skeleton, API client scaffolding |

**Dependency:** Frontend scaffolding does not block on Design; layout work does.

### Week 2 — Data Model, API Contract & Core Design System (Modules 1, 3, 4)
| Owner | Deliverables |
|---|---|
| Design | High-fidelity design system doc (components: buttons, cards, forms, nav), home page + category/listing mockups |
| Backend | Finalize `DATA_MODEL.md` schema as migrations; scaffold Auth module (OTP/email/Google) and Product/Category/Brand entities; publish `API_CONTRACT.md` v1 |
| Frontend | Build shared UI components (buttons, inputs, nav, footer) per design system; consume auth contract stub |
| PM | Review & freeze API contract + data model |

**Dependency:** API contract frozen end of this week — gates all Frontend data integration from Week 3 on.

### Week 3 — Storefront Shell + Catalog Backend (Modules 2, 3)
| Owner | Deliverables |
|---|---|
| Design | Product detail page, fitment finder UI, search/filter UI specs |
| Backend | Product Catalog APIs (list/detail/search/autocomplete), CSV bulk import/export, fitment compatibility model + endpoints |
| Frontend | Home page build (real data), category/listing page (real data), global search bar UI |
| PM | Mid-sprint check-in; risk log update |

### Week 4 — Product Detail, Fitment Finder, Accounts (Modules 3, 4)
| Owner | Deliverables |
|---|---|
| Design | Account pages (login/OTP, profile, address book, wishlist, order history), cart/checkout mockups |
| Backend | Auth complete (OTP+email+Google), Address/Profile/Wishlist APIs, fitment finder search endpoint |
| Frontend | Product detail page, fitment finder widget, login/OTP flow, profile & address pages |

### Week 5 — Cart, Checkout, Coupons & Offers (Module 5)
| Owner | Deliverables |
|---|---|
| Design | Cart/checkout final specs (if not done), empty states, error/loading states |
| Backend | Cart APIs, guest checkout, pincode serviceability check, coupon engine, GST calculation, shipping rule engine |
| Frontend | Cart page, checkout flow (address, pincode check, coupon apply, order summary) |

### Week 6 — Payments & Order Management (Modules 6, 7)
| Owner | Deliverables |
|---|---|
| Design | Order confirmation, order tracking, returns/cancellation flow screens |
| Backend | Payment gateway integration (Razorpay primary; UPI/cards/netbanking/wallets/COD), webhooks, refunds, order workflow states, Shiprocket integration for shipping/tracking |
| Frontend | Payment UI integration, order confirmation page, order tracking page, cancellation/return request UI |

### Week 7 — Admin Dashboard (Module 8)
| Owner | Deliverables |
|---|---|
| Design | Admin dashboard screens: analytics, product/inventory mgmt, order/customer mgmt, coupons, banners/CMS, reviews moderation, staff roles |
| Backend | Admin APIs (products, inventory, orders, coupons, banners, reports, staff roles/RBAC) |
| Frontend | Admin dashboard build (all screens above) |

### Week 8 — Notifications, GST Invoicing, SEO, Reviews (Modules 9, 10)
| Owner | Deliverables |
|---|---|
| Backend | Notification service (email/SMS/WhatsApp), auto GST invoice generation, reviews API, SEO endpoints (sitemap, schema data), image optimization/CDN hookup, security hardening (SSL, backups) |
| Frontend | Reviews UI, SEO meta/structured data wiring, notification preference UI, performance pass (image lazy-load, code-split) |
| Design | Notification templates (email/SMS/WhatsApp copy + layout), reviews UI polish |

### Week 9 — Testing, QA, Deployment, Handover (Modules 11, 12)
| Owner | Deliverables |
|---|---|
| Backend + Frontend | End-to-end QA, bug fixes, load/security testing, production deployment |
| PM | UAT coordination, sign-off checklist |
| Design | Final visual QA pass across breakpoints |
| PM | Training materials, documentation handover, support plan |

## Cross-Agent Dependency Summary

- Design spec → Frontend screen build (per-screen, ~3-5 day lead)
- Backend `API_CONTRACT.md` (frozen Week 2) → Frontend integration
- Backend `DATA_MODEL.md` (frozen Week 1) → Backend migrations, Frontend TypeScript types
- Backend Auth complete (Week 4) → Frontend account pages functional
- Backend Payment/Shipping (Week 6) → Frontend checkout goes live
- Backend Admin APIs (Week 7) → Frontend admin dashboard functional

## Risks & Mitigation

| Risk | Mitigation |
|---|---|
| 5,000+ SKU catalog import delays search/listing work | Backend prioritizes CSV import + basic search by end of Week 3, even before full search relevance tuning |
| Payment gateway sandbox/KYC delays | Start Razorpay test account setup in Week 1, not Week 6 |
| No Figma access slows Design→Frontend handoff | Design ships HTML mockups + a written component spec doc (see DESIGN_BRIEF.md) instead of Figma files |
| Budget (₹25,000) constrains third-party services | Prefer free/low-cost tiers (Razorpay test mode, Shiprocket starter, email via free SMTP tier) during build; document paid upgrades needed at launch |
