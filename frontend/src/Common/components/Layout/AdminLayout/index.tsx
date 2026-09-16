import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  Users,
  Tag,
  Image,
  Star,
  UserCog,
  Menu,
  X,
  LogOut,
  Wrench
} from "lucide-react";
import { cn } from "@/Common/lib/utils";
import { useAuth } from "@/Common/hooks/useAuth";
import { Button } from "@/Common/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Orders", to: "/admin/orders", icon: ListOrdered },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Categories & Brands", to: "/admin/masters", icon: Tag },
  { label: "Coupons", to: "/admin/coupons", icon: Tag },
  { label: "Banners", to: "/admin/banners", icon: Image },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
  { label: "Staff & Roles", to: "/admin/staff", icon: UserCog }
];

/** Sidebar shell for /admin/* — separate from StorefrontLayout per docs/CODING_STANDARDS.md
 * ("separate sidebar layout for admin"). Desktop-first but collapses to a drawer under lg. */
export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 -translate-x-full transform border-r border-border bg-primary text-primary-foreground transition-transform lg:static lg:translate-x-0",
          drawerOpen && "translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5 font-extrabold">
          <Wrench className="h-5 w-5 text-accent" />
          PartsHub Admin
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-white/10 text-accent" : "text-primary-foreground/80 hover:bg-white/5 hover:text-primary-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {drawerOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)} />}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background px-4">
          <button className="p-1 lg:hidden" aria-label="Toggle menu" onClick={() => setDrawerOpen((o) => !o)}>
            {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              {admin?.name ?? "Admin"} · <span className="capitalize">{admin?.role?.replace("_", " ")}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
