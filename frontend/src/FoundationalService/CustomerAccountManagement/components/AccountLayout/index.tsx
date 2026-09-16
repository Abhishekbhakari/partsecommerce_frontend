import { NavLink, Outlet } from "react-router-dom";
import { User, MapPin, Package } from "lucide-react";
import { cn } from "@/Common/lib/utils";

const TABS = [
  { label: "Profile", to: "/account/profile", icon: User },
  { label: "Addresses", to: "/account/addresses", icon: MapPin },
  { label: "Orders", to: "/account/orders", icon: Package }
];

/** Shell for the customer account area — tabbed nav (sidebar on desktop, horizontal scroller on
 * mobile) wraps each /account/* screen via <Outlet/>. */
export default function AccountLayout() {
  return (
    <div className="container py-6">
      <h1 className="text-xl font-extrabold sm:text-2xl">My Account</h1>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                )
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
