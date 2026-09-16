import { Outlet } from "react-router-dom";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";

/** Shell for all customer-facing routes — header nav (with mobile hamburger) + footer wrap the
 * routed page via <Outlet/>, per docs/CODING_STANDARDS.md Layout convention. */
export default function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StorefrontHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  );
}
