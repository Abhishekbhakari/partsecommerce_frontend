import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useAppSelector } from "@/Common/hooks/useAppRedux";

/** Mobile bottom tab bar (<768px), per design/MOBILE_NAV.md — replaces the hamburger as primary
 * nav on the storefront. Admin dashboard is untouched (desktop-first sidebar). */
const TABS = [
  { label: "Home", to: "/", icon: Home, match: (p: string) => p === "/" },
  {
    label: "Categories",
    to: "/products",
    icon: LayoutGrid,
    match: (p: string) => p.startsWith("/products") || p.startsWith("/category") || p.startsWith("/fitment-finder")
  },
  { label: "Cart", to: "/cart", icon: ShoppingCart, match: (p: string) => p.startsWith("/cart") },
  {
    label: "Account",
    to: "/account/profile",
    icon: User,
    match: (p: string) => p.startsWith("/account") || p.startsWith("/login")
  }
] as const;

/** Routes where a page-specific sticky action bar (add-to-cart, checkout footer, ...) replaces
 * the tab bar instead of stacking under it, per design/MOBILE_NAV.md §7. */
export function pathReplacesBottomNav(pathname: string): boolean {
  return (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-confirmation") ||
    pathname.startsWith("/cart") ||
    /^\/products\/[^/]+$/.test(pathname) // PDP (not the /products listing)
  );
}

export function BottomTabNav() {
  const location = useLocation();
  const itemCount = useAppSelector((s) => s.cart.itemCount);

  if (pathReplacesBottomNav(location.pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card shadow-nav md:hidden"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      {TABS.map(({ label, to, icon: Icon, match }) => {
        const active = match(location.pathname);
        return (
          <NavLink
            key={label}
            to={to}
            className="relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 active:bg-primary-50"
            aria-current={active ? "page" : undefined}
          >
            {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary-700" />}
            <span className="relative">
              <Icon
                strokeWidth={2}
                className={active ? "h-[22px] w-[22px] text-primary-700" : "h-[22px] w-[22px] text-neutral-500"}
              />
              {label === "Cart" && itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] leading-3 ${active ? "font-semibold text-primary-700" : "font-medium text-neutral-500"}`}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
