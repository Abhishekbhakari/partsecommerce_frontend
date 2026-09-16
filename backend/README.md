# Spare Parts E-commerce — Backend API

Node.js + TypeScript + Express + Sequelize/PostgreSQL backend for the spare parts marketplace.
Implements `docs/API_CONTRACT.md` under base path `/api/v1`. See `docs/CODING_STANDARDS.md` for
the architecture pattern this codebase follows, and `STATUS.md` for what's implemented vs stubbed.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (a running instance; the schema is created via migrations, not `sync()`)

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env — at minimum set DATABASE_*, JWT_SECRET, JWT_REFRESH_SECRET
```

### Environment variables

See `.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_HOST/PORT/NAME/USER/PASSWORD` | PostgreSQL connection |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Signing secrets for access/refresh tokens |
| `JWT_TOKEN_EXPIRY`, `JWT_REFRESH_TOKEN_EXPIRY` | Token lifetimes (defaults `15m` / `7d`) |
| `SUPER_ADMIN_EMAIL/PASSWORD/NAME` | Seeded owner-role admin account |
| `RAZORPAY_KEY_ID/KEY_SECRET/WEBHOOK_SECRET` | Payment gateway — safe to leave placeholder values until real keys are available |
| `COD_MAX_AMOUNT_PAISE` | Cash-on-delivery eligibility ceiling |

## Database

```bash
npm run db:migrate          # creates all tables (see src/database/migrations)
npm run db:seed             # seeds super-admin + sample categories/brands/products
npm run db:migrate:undo     # rollback last migration
npm run db:migrate:undo:all # rollback everything
```

Migrations are the source of truth for schema — the app never calls `sequelize.sync()`.

## Run

```bash
npm run dev      # ts-node-dev, hot reload, http://localhost:4000
npm run build    # tsc -> dist/
npm start        # node dist/server.js (production)
npm run typecheck
npm run lint
```

On boot, `server.ts` also auto-seeds a super-admin (`AuthService.seedDefaultSuperAdmin`) if one
doesn't already exist, using `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD` from `.env`.

## Folder structure

Mirrors `docs/CODING_STANDARDS.md`:

```
src/
  APIGateway/                 # health check
  Common/                     # config, database, logger, middleware, utils, httpErrorClasses, types
  database/                   # Sequelize models, migrations, seeders (schema source of truth)
  FoundationalService/
    IdentityAccessManagement/   # admin/staff auth + staff management
    CustomerAccountManagement/  # customer auth (OTP/email/Google), profile, addresses, wishlist, notifications
    MasterManagement/           # categories, brands, coupons, banners
  CommerceDomain/
    CatalogManagement/          # products, search, fitment finder, bulk CSV import/export
    CartAndCheckout/            # cart, checkout, orders
    PaymentManagement/          # Razorpay integration
    ShippingManagement/         # shipment stub + tracking
    ReviewManagement/           # product reviews
    ReportingAndAnalytics/      # admin sales/inventory reports
  app.ts / server.ts
```

Each feature slice follows `router -> controller -> service -> repository`, with Zod validation
schemas under `validations/`. See any slice (e.g. `CommerceDomain/CatalogManagement/api/products/`)
as a reference.

## API base URL & response envelope

- Base URL: `http://localhost:4000/api/v1`
- Every response is `{ success: boolean, message?: string, data?: ... }` on success, or
  `{ success: false, message, errors? }` on failure.
- Health check: `GET /health` (outside `/api/v1`).

Full endpoint list: `docs/API_CONTRACT.md`. See `STATUS.md` for the auth flow the frontend should
implement and any deviations from the contract.
