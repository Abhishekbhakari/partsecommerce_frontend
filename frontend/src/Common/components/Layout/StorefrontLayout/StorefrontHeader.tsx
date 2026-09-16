import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShoppingCart, User, Wrench } from "lucide-react";
import { useAppSelector } from "@/Common/hooks/useAppRedux";
import { useAuth } from "@/Common/hooks/useAuth";
import { Button } from "@/Common/components/ui/button";
import { SearchAutocomplete } from "./SearchAutocomplete";

const NAV_LINKS = [
  { label: "Shop All", to: "/products" },
  { label: "Fitment Finder", to: "/fitment-finder" },
  { label: "Brands", to: "/products?sort=brand" },
  { label: "Track Order", to: "/account/orders" }
];

/** Mobile hamburger (<768px): secondary links only, per design/MOBILE_NAV.md §5 — primary nav
 * moved to the bottom tab bar, so this no longer duplicates Home/Categories/Cart/Account. */
const MOBILE_SECONDARY_LINKS = [
  { label: "Fitment Finder", to: "/fitment-finder" },
  { label: "Track Order", to: "/account/orders" },
  { label: "Wishlist", to: "/account/wishlist" },
  { label: "Help & Contact", to: "/pages/contact" }
];

export function StorefrontHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const itemCount = useAppSelector((s) => s.cart.itemCount);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center gap-3">
        <button
          className="p-1 lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <Wrench className="h-6 w-6 text-accent" />
          <span className="text-lg">PartsHub</span>
        </Link>

        <div className="ml-2 hidden max-w-xl flex-1 lg:block">
          <SearchAutocomplete
            placeholder="Search by part name, number, or OEM code…"
            inputClassName="h-10 w-full rounded-md border-0 bg-white/95 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-semibold lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "text-accent" : "hover:text-accent")}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-4">
          <Link to={isAuthenticated ? "/account/profile" : "/login"}>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" aria-label="Account">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Always-visible search row on mobile (not double-sticky — scrolls with the page), per
       * design/MOBILE_NAV.md §5: bottom tab bar replaced the hamburger as primary nav, so search
       * needs to stay one tap away rather than hidden behind the (now secondary-links-only) menu. */}
      <div className="container pb-3 lg:hidden">
        <SearchAutocomplete
          placeholder="Search part name, number or OEM code…"
          inputClassName="h-11 w-full rounded-md border-0 bg-white/95 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-primary lg:hidden">
          <div className="container flex flex-col gap-1 py-2 text-sm font-semibold">
            {MOBILE_SECONDARY_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `rounded-md px-2 py-2.5 ${isActive ? "bg-white/10 text-accent" : "hover:bg-white/5"}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
