# Coding Standards & Architecture Pattern

This project follows the same domain-driven modular pattern used in our existing PMS codebase
(reference projects extracted at `_ref/be` and `_ref/fe` — **do not copy their business logic**,
only their structure and conventions; delete `_ref/` once scaffolding is done).

## Backend (Node.js + TypeScript + Express + Sequelize/PostgreSQL)

### Folder structure
```
backend/src/
  APIGateway/            # health check, example/ping routes
  Common/
    config/              # module registry, app config
    database/
      config/            # sequelize.ts, database.ts
      models/            # index.ts (model registry)
      migrations/        # sequelize-cli migrations (schema is NOT auto-synced)
    middleware/           # TokenMiddleware (JWT), RBACMiddleware, uploadMiddleware
    logger/               # WinstonLogger
    httpErrorClasses/
    constants/            # HttpCode, HttpErrorMessage, HttpSuccessMessage, HttpMethod
    utils/                # ErrorHandler, JwtUtil, Pagination, response.ts, Normalize
    types/                # express.d.ts (req.user augmentation), index.ts
  FoundationalService/     # cross-cutting foundational domains
    IdentityAccessManagement/   # admin/staff auth, users, roles, permissions
    CustomerAccountManagement/  # customer OTP/email/Google auth, addresses, wishlist
    MasterManagement/           # categories, brands, coupons, banners, settings, bulk upload
  CommerceDomain/           # core e-commerce business domains
    CatalogManagement/        # products, variants, fitment compatibility, search
    CartAndCheckout/          # cart, checkout, orders
    PaymentManagement/        # payment gateway integration, webhooks, refunds
    ShippingManagement/       # shipment, tracking, courier integration
    ReviewManagement/         # product reviews & ratings
    NotificationManagement/   # email/SMS/WhatsApp, GST invoices
    ReportingAndAnalytics/    # admin dashboard stats/reports
  app.ts                   # express app, middleware wiring, route mounting
  server.ts                # http server bootstrap, DB connect, listen
```

### Per-feature slice (e.g. `api/products/`)
- `product.router.ts` — Express `Router`, mounts middleware (auth/RBAC/rate-limit) per route
- `product.controller.ts` — a `class ProductController` with `static async` handlers; each handler
  wraps its body in `try { ... } catch (error) { return ErrorHandler.commonErrorHandler(error, res); }`
- `product.service.ts` — business logic, calls repository, throws typed HTTP errors
- `repository/product.repository.ts` — Sequelize queries only, no business logic
- `validations/product.validation.ts` — Zod schemas (`XSchema.parse(req.body)` in the controller)
- `types/` — TypeScript interfaces/types for the module

### Conventions
- Response shape is always `{ success: boolean, message?: string, data?: ... }`.
- Validate request bodies with **Zod** schemas in the controller before calling the service.
- Auth: JWT access token (Bearer header) + httpOnly refresh-token cookie, rotation on refresh.
- RBAC via `RBACMiddleware` checking role/module permissions per route.
- Rate limiting via `express-rate-limit` on sensitive routes (login, OTP, password reset).
- All DB access goes through Sequelize models + repository layer — controllers/services never
  touch `sequelize` directly.
- Global error handler + Winston request logger wired once in `app.ts`.
- `helmet`, `cors` (explicit allow-list from env), `cookie-parser`, `express.json()` in `app.ts`.
- New feature routers are registered in `app.ts` under `/api/<resource>`.
- Migrations are the source of truth for schema (sequelize-cli) — never `sequelize.sync()` in
  production code paths.

## Frontend (React + TypeScript + Vite + Redux Toolkit + Tailwind)

### Folder structure
```
frontend/src/
  Common/
    components/          # shared UI (CrudTable, Pagination, Layout, ui/ primitives)
    config/               # brand.ts, labels.ts
    hooks/                # useAuth, useDebouncedValue, usePermissions, useCrudMaster
    lib/                  # api.ts (axios instance + interceptors), utils.ts, errors.ts
    types/                # shared TS types (api.ts, auth.ts, crud.ts)
    utils/                # formatters, exportToExcel
  redux/
    store.ts
    authSlice.ts, cartSlice.ts, ...
  FoundationalService/
    IdentityAccessManagement/    # admin login, users/roles/permissions masters
    CustomerAccountManagement/   # customer login/OTP, profile, addresses, wishlist
    MasterManagement/             # admin masters: categories, brands, coupons, banners
  CommerceDomain/
    CatalogManagement/            # storefront listing/PDP, fitment finder, admin product CRUD
    CartAndCheckout/               # cart, checkout, order confirmation
    PaymentManagement/             # payment UI, status pages
    ShippingManagement/            # order tracking UI
    ReviewManagement/              # review submission/display
    ReportingAndAnalytics/         # admin dashboard charts
  pages/                 # top-level route pages composing the above
  App.tsx, main.tsx, index.css
```

### Per-feature slice (e.g. `components/ProductListing/`)
- `index.tsx` — presentational component, minimal logic, imports its `.hook.ts`
- `index.hook.ts` — all state/data-fetching logic (`useProductListing()` hook), returned to the view
- `service/<name>.service.ts` — axios calls via the shared `api` client, one function per endpoint
- `types/<name>.types.ts` — request/response TS types matching `docs/API_CONTRACT.md`
- `validators/<name>/index.ts` — Zod/yup schemas for forms

### Conventions
- Single axios instance (`Common/lib/api.ts`) with a request interceptor (attach Bearer token)
  and a response interceptor (401 → silent refresh via `/auth/refresh`, queue concurrent
  requests while refreshing).
- Mobile-first Tailwind: base styles target mobile, then `sm:` / `md:` / `lg:` breakpoints layer
  up for tablet/desktop, per `docs/DESIGN_BRIEF.md`.
- Redux Toolkit slices only for cross-cutting state (auth session, cart); page/feature-local
  state stays in the `index.hook.ts` of that feature.
- Routes for each domain are declared in that domain's own `routes/index.tsx` and composed in
  `App.tsx` — keeps each domain self-contained.
- Reuse `Common/components/CrudTable` and `Common/components/ui` primitives for admin dashboard
  screens instead of building bespoke tables/forms per module.

## Naming
- PascalCase for domain/module folder names (`CatalogManagement`), camelCase for files within a
  feature slice (`product.controller.ts`), PascalCase for React component folders (`ProductCard/`).
- REST resource names are plural, kebab-case in URLs (`/api/product-variants`).

## Shared contract
Both sides must match `docs/API_CONTRACT.md` (endpoints) and `docs/DATA_MODEL.md` (entities).
Any deviation should be called out in a PR/commit message so the other agent can adjust.
