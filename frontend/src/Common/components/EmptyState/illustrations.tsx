/** Lightweight inline-SVG empty-state illustrations, on-brand (primary blue / accent orange),
 * per docs/PHASE2_ADDENDUM.md §4 — kept simple/flat so they stay legible at small sizes and don't
 * need an image asset pipeline. */

export function EmptyCartIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
      <circle cx="60" cy="60" r="54" className="fill-primary-50" />
      <path d="M32 40h8l6 40h34l6-26H44" stroke="#123B72" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="50" cy="88" r="5" className="fill-primary-700" />
      <circle cx="78" cy="88" r="5" className="fill-primary-700" />
      <path d="M62 50l14 14M76 50l-14 14" stroke="#E2600A" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function NoOrdersIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
      <circle cx="60" cy="60" r="54" className="fill-primary-50" />
      <rect x="38" y="34" width="44" height="56" rx="4" stroke="#123B72" strokeWidth="4" fill="white" />
      <path d="M48 48h24M48 58h24M48 68h14" stroke="#123B72" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="78" cy="78" r="12" className="fill-accent-600" />
      <path d="M73 78h10M78 73v10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function NoSearchResultsIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
      <circle cx="60" cy="60" r="54" className="fill-primary-50" />
      <circle cx="54" cy="54" r="20" stroke="#123B72" strokeWidth="4" fill="none" />
      <path d="M69 69l14 14" stroke="#123B72" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 54h16" stroke="#E2600A" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyWishlistIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
      <circle cx="60" cy="60" r="54" className="fill-primary-50" />
      <path
        d="M60 82s-24-14-24-32a14 14 0 0124-9 14 14 0 0124 9c0 18-24 32-24 32z"
        stroke="#E2600A"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
