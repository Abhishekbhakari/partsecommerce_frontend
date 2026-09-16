# Spare Parts E-commerce — Frontend

React + TypeScript + Vite + Tailwind CSS + Redux Toolkit + React Router storefront, customer
account area, and admin dashboard for the spare parts marketplace. Structure and conventions
follow `docs/CODING_STANDARDS.md` (domain-driven module folders, `index.tsx` / `index.hook.ts`
split per feature, one axios client with interceptors, Redux Toolkit reserved for cross-cutting
state).

## Requirements

- Node.js 20+ (developed/tested on Node 20.0.0) and npm 9+

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # then edit VITE_API_BASE_URL if your backend runs elsewhere
npm run dev             # starts Vite dev server on http://localhost:5173
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000/api/v1` | Base URL the axios client (`src/Common/lib/api.ts`) targets. Must match wherever `backend` is running/mounted (see `docs/API_CONTRACT.md`, base path `/api/v1`). |

The backend does not need to be running to browse the UI — every data-fetching hook fails
gracefully (empty state + a toast/inline message) if a request errors out, per the scaffolding
brief.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc --noEmit`) then production build (`vite build`) into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint over `src/**/*.{ts,tsx}` |

## Project layout

```
src/
  Common/                      # shared layer — see docs/CODING_STANDARDS.md
    components/ui/             # Button, Input, Select, Card, Badge, Modal, Pagination, DataTable, ...
    components/Layout/         # StorefrontLayout (header/nav/footer), AdminLayout (sidebar), route guards
    components/ProductCard.tsx # shared storefront product tile
    hooks/                     # useAuth, useAppRedux, useDebouncedValue
    lib/                       # api.ts (axios + interceptors), utils.ts (cn, formatMoney, formatDate)
    types/                     # entities.ts (mirrors docs/DATA_MODEL.md), auth.ts, api.ts
  redux/                       # store.ts, authSlice.ts, cartSlice.ts (cross-cutting state only)
  CommerceDomain/
    CatalogManagement/         # Home, ProductListing, ProductDetail, FitmentFinder, SearchResults,
                                # + admin product list/create/edit
    CartAndCheckout/           # Cart, Checkout, OrderConfirmation, + admin order list/detail
    ReportingAndAnalytics/     # Admin dashboard overview
  FoundationalService/
    CustomerAccountManagement/ # Login (OTP/email), Profile, Addresses, Order history/detail,
                                # + admin customer list/detail
    IdentityAccessManagement/  # Admin login, staff management (stub)
    MasterManagement/          # Admin category/brand management, coupons/banners/reviews (stubs)
  pages/                       # StaticPage (About/Contact/Terms/Privacy/Shipping/Returns), NotFound
  App.tsx                      # composes each domain's routes/index.tsx under Storefront/Admin shells
  main.tsx                     # React root, Redux Provider, Toaster
```

Each domain owns its own `routes/index.tsx` and exports the route objects it needs (storefront
routes and/or admin routes); `App.tsx` only composes them under `StorefrontLayout` or `AdminLayout`
— no domain's routes file imports another domain's pages directly.

## Design tokens

Tailwind is configured against `/design/tailwind.tokens.js` (sourced from
`/design/design-system.md`): primary blue `#123B72`, accent orange `#E2600A`, neutral grays, Inter
font. `frontend/tailwind.config.js` imports that file and layers semantic aliases (`bg-primary`,
`text-muted-foreground`, `border-border`, etc.) on top so the shared UI primitives can reference
consistent names. If the Design agent updates the token file's hex values, no other change should
be needed here — just re-run `npm run build` to confirm nothing broke.

## Notes / known gaps

See `frontend/STATUS.md` for the full list of what's implemented, what's stubbed, and the
assumptions made where `docs/API_CONTRACT.md` didn't cover a screen (e.g. admin login, admin
category/brand CRUD).
