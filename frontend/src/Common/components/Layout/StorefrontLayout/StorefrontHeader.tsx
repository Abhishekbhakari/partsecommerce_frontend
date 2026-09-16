import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, Wrench } from "lucide-react";
import { useAppSelector } from "@/Common/hooks/useAppRedux";
import { useAuth } from "@/Common/hooks/useAuth";
import { Button } from "@/Common/components/ui/button";

const NAV_LINKS = [
  { label: "Shop All", to: "/products" },
  { label: "Fitment Finder", to: "/fitment-finder" },
  { label: "Brands", to: "/products?sort=brand" },
  { label: "Track Order", to: "/account/orders" }
];

export function StorefrontHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const itemCount = useAppSelector((s) => s.cart.itemCount);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

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

        <form onSubmit={handleSearch} className="ml-2 hidden flex-1 items-center lg:flex">
          <div className="relative w-full max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by part name, number, or OEM code…"
              className="h-10 w-full rounded-md border-0 bg-white/95 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

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

      <form onSubmit={handleSearch} className="container pb-3 lg:hidden">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts, part number, OEM code…"
            className="h-10 w-full rounded-md border-0 bg-white/95 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-primary lg:hidden">
          <div className="container flex flex-col gap-1 py-2 text-sm font-semibold">
            {NAV_LINKS.map((link) => (
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
