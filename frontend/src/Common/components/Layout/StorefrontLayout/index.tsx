import { Outlet, useLocation } from "react-router-dom";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";
import { BottomTabNav, pathReplacesBottomNav } from "./BottomTabNav";

/** Shell for all customer-facing routes — header nav + footer wrap the routed page via
 * <Outlet/>, per docs/CODING_STANDARDS.md Layout convention. On mobile (<768px) a fixed bottom
 * tab bar (Home/Categories/Cart/Account) is the primary nav, per design/MOBILE_NAV.md — content
 * gets bottom padding so it isn't hidden behind the bar, except on pages that replace it with
 * their own sticky action bar (PDP, cart, checkout, order confirmation). */
export default function StorefrontLayout() {
  const location = useLocation();
  const showBottomNav = !pathReplacesBottomNav(location.pathname);

  return (
    <div className={`flex min-h-screen flex-col bg-background ${showBottomNav ? "pb-bottom-nav" : ""}`}>
      <StorefrontHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StorefrontFooter />
      <BottomTabNav />
    </div>
  );
}
