/** Simple, dependency-free slugify used by Category/Brand/Product create flows. */
export const slugify = (value: string): string =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

/** Generates a human-readable, reasonably-unique order number, e.g. ORD-20260916-4F2A9C. */
export const generateOrderNumber = (): string => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${yyyy}${mm}${dd}-${rand}`;
};
