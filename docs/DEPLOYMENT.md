# Deployment — Render (backend + DB) + Vercel (frontend)

Three real bugs were found while diagnosing the "not working" deploy on 2026-09-18 — two are
fixed in code (this commit), one is a dashboard setting only you can change (I don't have login
access to your Render/Vercel accounts). Fix the dashboard setting, redeploy both, then verify with
the checklist at the bottom.

## Bug 1 (fixed in code): backend never actually started

`server.ts` only called `server.listen()` **after** a successful DB connection. If the DB
connection failed for any reason, the server never opened its port at all — no error page, no
404, nothing. From outside, every request just hung forever with zero bytes back (exactly what
`curl` showed: TLS handshake to Render's edge succeeds, then silence). This is now fixed: the
server always starts listening immediately, DB connection happens after and independently, and
`/health` reports real DB connectivity (`{"database": "connected"}` or `{"database":
"unreachable", "databaseError": "..."}`) so a broken DB connection is now visible and diagnosable
instead of an invisible hang.

## Bug 2 (fixed in code, but needs a Render env var): DB connection itself

The most likely reason the DB connection was failing:

1. **Render's managed Postgres requires SSL**, and the app's Sequelize config didn't request it.
   Fixed — SSL now turns on automatically in production (or via `DATABASE_SSL=true`).
2. **Render gives you one `DATABASE_URL` connection string**, not five separate
   host/port/user/password/database fields. The app previously only understood the five-field
   form. Fixed — it now uses `DATABASE_URL` directly when that env var is set.

### What to set on Render (Backend service → Environment)

Open your Render Postgres database's page → copy its **Internal Database URL** (not the External
one — the backend and DB are in the same Render network, so Internal is faster and doesn't count
against external bandwidth) → set it as a single env var on the **backend web service**:

| Key | Value |
|---|---|
| `DATABASE_URL` | *(paste the Internal Database URL from your Render Postgres page)* |
| `NODE_ENV` | `production` |
| `PORT` | leave unset — Render injects this automatically and the app already reads `process.env.PORT` |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | any long random strings (not the `.env.example` placeholders) |
| `ALLOWED_ORIGINS` | `https://frontend-ten-green-21.vercel.app` (your Vercel URL — **no trailing slash**) |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | your real admin login (not the `.env.example` defaults, if this is going anywhere real people can reach) |

Everything else in `backend/.env.example` (Razorpay/Shiprocket/Google/OTP keys) can stay unset for
now — those features are still stubbed, per `backend/STATUS.md`.

**Build command:** `npm install --include=dev && npm run build && npm run db:migrate`
**Start command:** `npm start`

The `--include=dev` matters: Render sets `NODE_ENV=production` automatically for the build step,
and npm's default under that is to skip `devDependencies` — which is where `typescript` and every
`@types/*` package live. Without it, `npm run build` fails with a wall of
`TS7016: Could not find a declaration file for module 'express'` (and similar) errors, `dist/`
never gets created, and `npm start` has nothing to run — this was the actual root cause of the
backend never coming up, confirmed from a real Render build log. A `backend/.npmrc` with
`production=false` is also committed as a belt-and-suspenders fix, but set `--include=dev`
explicitly on the build command regardless — it isn't sensitive to which npm version Render runs.

(`npm run build` compiles TypeScript to `dist/`, which `npm start` runs — if Render's build
command was only `npm install`, `dist/server.js` wouldn't exist and the service would crash-loop
immediately, which produces the exact same symptom from outside: connects, then nothing. Double
check this in Render's dashboard under the service's Settings.)

**`npm run db:migrate` must run at least once** against the Render DB, or every table will be
missing and every DB-backed request will 500 even once the connection itself works. Running it as
part of the build command (above) means every deploy re-applies any new migrations automatically;
alternatively run it once manually from Render's Shell tab.

## Bug 3 (dashboard setting only — I cannot fix this myself): Vercel's API URL is missing `/api/v1`

I inspected the deployed frontend's JS bundle directly: `VITE_API_BASE_URL` is baked in as
`https://partsecommerce-backend.onrender.com` with **no path**. Every backend route lives under
`/api/v1` (`backend/src/app.ts`), so even once the backend is healthy, every API call from the
live frontend will hit the wrong URL and 404.

**Fix**: Vercel project → Settings → Environment Variables → set
`VITE_API_BASE_URL` = `https://partsecommerce-backend.onrender.com/api/v1` (use your actual Render
URL, with the `/api/v1` suffix) → **Redeploy** (Vercel bakes env vars in at build time, so changing
the value alone does nothing until you trigger a new build).

## Bug 4 (fixed in code): Vercel 404s on every route except `/`

Vercel serves the built static files with no knowledge that this is a client-side-routed React
app — `/cart`, `/products`, etc. all 404'd because Vercel was looking for literal files at those
paths. Added `frontend/vercel.json` with a rewrite so every path serves `index.html` and React
Router takes over. This needs a Vercel redeploy to take effect (it's picked up automatically on
your next push/deploy — no dashboard setting needed for this one).

## Verify after redeploying both

```bash
# 1. Backend is listening and DB is connected
curl https://partsecommerce-backend.onrender.com/health
# expect: {"success":true, ..., "data":{"uptime":..., "database":"connected"}}

# 2. A real API route works
curl https://partsecommerce-backend.onrender.com/api/v1/categories
# expect: a JSON array of categories, not a 404 or a hang

# 3. Frontend loads a deep link directly (not just the homepage)
curl -o /dev/null -w "%{http_code}\n" https://frontend-ten-green-21.vercel.app/cart
# expect: 200
```

Then open the Vercel URL in a real browser and check the Network tab — API calls should go to
`.../api/v1/...` and return data, not CORS errors or 404s. If you see a CORS error specifically,
double check `ALLOWED_ORIGINS` on Render exactly matches your Vercel URL (protocol + host, no
trailing slash, no path).


## Image storage in production (required for product photos AND dispatch/delivery proofs)

Render's web-service filesystem is **ephemeral**: everything written to local disk (which is where
uploads go by default) is wiped on every redeploy and restart. That would silently delete product
photos and — worse — the seller's proof-of-dispatch/delivery photos, which are dispute evidence.

The backend switches to Cloudinary automatically when these three env vars are set on the Render
service (free tier is plenty to start; sign up at cloudinary.com, they're on the dashboard):

| Key | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your API key |
| `CLOUDINARY_API_SECRET` | your API secret |

With them unset the app still works, but logs a loud warning at boot in production and uploads
will not survive a redeploy. Images uploaded *before* you set these (they live on Render's disk)
are already gone or will be on the next restart — re-upload them once Cloudinary is configured.


## Shipping cost (per-seller, from the buyer's pincode)

Delivery is priced per seller parcel: each seller ships their own items from their own pickup
pincode, so a cart with items from two sellers is two parcels and two freight charges. The cost
comes from chargeable weight (the larger of real weight and L x W x H / 5000, in 500 g slabs),
the zone between the two pincodes, and COD (a handling fee). Sellers set their pickup address
under Seller Portal > Profile, and enter weight (and optionally box size) on every product.

It works out of the box with an **estimate table** (`ZoneTableRateProvider.ts` - illustrative
numbers, tune them to your real rate card). Set these on the Render service to switch to **live
Shiprocket rates** for the cheapest available courier:

| Key | Value |
|---|---|
| `SHIPROCKET_EMAIL` | email of a Shiprocket **API user** (Shiprocket > Settings > API) |
| `SHIPROCKET_PASSWORD` | that API user's password |
| `SHIPROCKET_RATE_INCLUDES_GST` | leave unset (we add 18% GST). Set `true` if your first invoice shows GST already inside the quoted rate. |
| `DEFAULT_PICKUP_PINCODE` | origin assumed for a seller who hasn't set a pickup address yet (default `110001`) |
| `FREE_SHIPPING_THRESHOLD_PAISE` | optional promo: waive shipping above this order value, e.g. `99900` for INR 999. Default `0` = never. **The platform absorbs the real freight when this is on.** |

If a live Shiprocket call fails, checkout falls back to the estimate table instead of breaking.
Live rates were built against Shiprocket's public API docs but could not be tested against a real
account - check the first few quotes against the Shiprocket dashboard.

Orders snapshot the per-seller breakdown that was charged (`orders.shippingBreakdown`), so later
rate changes never rewrite history.
