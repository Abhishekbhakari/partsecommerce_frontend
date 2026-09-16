# Phase 2 Addendum — Remaining Functionality, Mobile Bottom Nav, Design Polish

Written by the PM pass on top of Phase 1 (see `frontend/STATUS.md` and `backend/STATUS.md` for
what Phase 1 shipped and stubbed). This is the shared contract for Phase 2 — read this before
`docs/API_CONTRACT.md`/`docs/DATA_MODEL.md`, which it supplements, not replaces.

## 1. New backend contract: image upload

No image upload endpoint existed in Phase 1 — `Common/middleware/uploadMiddleware.ts` had an
`imageUpload` multer instance defined but never wired to a route. Backend must add:

- `POST /api/v1/admin/uploads/image` — `multipart/form-data`, field name `file`. Admin-auth +
  `CATALOG_MANAGER_ROLES` gated. Stores the file (local disk under `backend/uploads/`, served
  statically at `/uploads/<filename>` via `express.static` — no S3/Cloudinary credentials are
  available in this environment, so local disk is correct for now, but keep it behind a small
  `ImageStorage` interface like `OtpSender` so it's swappable later) and returns
  `{ url: string, filename: string }`.
- `DELETE /api/v1/admin/uploads/image/:filename` — removes the file. Best-effort; don't fail hard
  if the file is already gone.
- Reuse this one endpoint for **product images** (`Product.images: string[]`) and **banner images**
  (`Banner.imageUrl`) — frontend uploads first, gets a URL back, then includes that URL in the
  product/banner create-or-update payload as normal. No separate per-entity upload endpoint.
- Add `backend/uploads/` to `.gitignore` (keep a `.gitkeep`).

## 2. Backend gaps to close

- **Guest cart merge-on-login**: flagged in Phase 1 `backend/STATUS.md` as not implemented. When a
  guest with items in a session-keyed cart logs in (customer or registers), merge that cart into
  their user-keyed cart (sum quantities on overlapping variants, add the rest) instead of orphaning
  it. Implement in the login/OTP-verify/register service paths.
- Double-check `coupons`, `banners`, `staff` slices (router+controller+service+repository) are
  fully implemented end to end, not just routed — Phase 1 backend built these but Phase 1
  frontend only got as far as list-only screens, so they were never exercised. Fix anything that
  doesn't actually work under load from a real form submission (validation edge cases, etc).
- Verify `/products/:id/reviews`, `/shipments/:orderId/track`, `/catalog/autocomplete` (or
  wherever autocomplete lives per `docs/API_CONTRACT.md`) work correctly — these are about to get
  frontend UI for the first time.

## 3. Mobile navigation: bottom tab bar

Product decision: on mobile widths (<768px), the storefront's primary navigation moves to a
**fixed bottom tab bar** (native-app pattern — like Flipkart/Amazon/Myntra apps), not a hamburger-
only header. This is the single most important UX change in this phase.

- Tabs (storefront): **Home, Categories, Cart (with item-count badge), Account**. Consider a 5th
  **Search** tab vs. keeping search in the sticky top bar — Design agent decides and documents in
  `design/design-system.md` / a new `design/MOBILE_NAV.md`.
  the design system's icon language) and a short label; active tab highlighted with the primary
  brand color; safe-area padding for iOS home-indicator (`env(safe-area-inset-bottom)`).
- The existing header stays for logo + search on mobile, just drop the hamburger's role as primary
  nav — replace/supplement it with the bottom bar. Desktop/tablet (≥768px) keeps the current top
  nav header, no bottom bar.
- Every page needs bottom padding equal to the bar's height on mobile so content isn't hidden
  behind it (careful with the sticky add-to-cart bar on PDP and the checkout footer — those may
  need to replace the tab bar on those specific screens rather than stack under it).
- Admin dashboard is unaffected — desktop-first sidebar pattern stays as-is per the original
  design brief (staff use it on desktop/tablet, not phones).

## 4. Design: make it feel like a product, not a wireframe

Phase 1 mockups were functionally complete but plain. This phase should give the app actual
personality within the existing deep-blue/automotive-orange palette — not a rebrand, an elevation:

- Real depth: layered shadows, subtle gradients on hero/CTA surfaces, rounded-corner consistency,
  micro-interactions (hover/press states, button ripple or scale, skeleton loaders instead of bare
  spinners, toast animations).
- Empty states need simple SVG illustrations (empty cart, no orders yet, no search results, no
  wishlist items) instead of plain text — keep them lightweight/inline SVG, on-brand.
- Category cards, product cards: stronger visual hierarchy (imagery-first), badges for stock/
  discount/new, rating stars rendered visually not just as a number.
- Bottom nav bar spec (icons, active/inactive states, badge placement) — new `design/MOBILE_NAV.md`
  plus updated mockup HTML files showing it at mobile width.
- Deliver as updates to `design/design-system.md`, `design/tailwind.tokens.js` (only if new tokens
  are needed — don't churn existing ones the frontend already consumes), `design/COMPONENT_LIBRARY.md`
  and refreshed `design/mockups/*.html`.

## 5. Frontend: remaining P1 functionality to wire

All backend endpoints for these already exist except image upload (§1) — this is UI work:

- **Bulk CSV product import**: admin screen — file picker/drag-drop, upload to the existing bulk
  import endpoint, show a progress/result summary (rows created/updated/failed), a table of
  per-row errors if any, and let the admin download a CSV of just the failed rows if the backend
  supports it (check `docs/API_CONTRACT.md` / backend response shape first).
- **Product image upload**: in the admin product create/edit form, replace any raw image-URL text
  input with a real drag-drop/file-picker multi-image uploader using the new
  `/admin/uploads/image` endpoint — preview thumbnails, reorder, remove, set primary image.
- **Banner management**: full create/edit form (not just list) with image upload via the same
  endpoint, link field, placement, active toggle.
- **Coupon management**: full create/edit form (not just list) — code, type (percent/flat),
  value, min order, max discount, validity dates, active toggle.
- **Staff & roles**: invite staff (email/name/role), change role, remove — wire to `/admin/staff`.
- **Wishlist page**: customer-facing page listing saved products, remove/add-to-cart actions.
- **Order tracking timeline page**: visual timeline (placed → confirmed → packed → shipped →
  delivered) on its own page/route, linked from order detail.
- **Search autocomplete**: live suggestions dropdown under the header search box as the user
  types (debounced), using the existing autocomplete service method.
- **Razorpay checkout**: load the Razorpay Checkout.js SDK, open its modal at the payment step
  with the order created via the existing create-order endpoint, verify payment client-side
  round-trip per the documented verify endpoint, handle success/failure/dismiss.
- **Mobile bottom nav** (see §3) — implement once Design's spec/mockup lands; if it hasn't landed
  when you reach this, use sensible defaults (Home/Categories/Cart/Account icons) and reconcile
  once Design commits.
- **Visual design pass** (see §4) — apply the refreshed design system across existing pages:
  skeleton loaders instead of spinners, empty-state illustrations, card/badge polish. Don't
  rebuild pages from scratch — this is a styling/polish pass on top of Phase 1's working pages.

## Sequencing note for whoever reads this mid-build

Backend should land §1 (image upload) and §2 early — Frontend's bulk-upload and image-upload
tasks are blocked on it. Everything else is largely independent. If Frontend reaches the
image-upload task before Backend has committed the endpoint, stub it with a clear TODO and move on
to the next task, then circle back.
