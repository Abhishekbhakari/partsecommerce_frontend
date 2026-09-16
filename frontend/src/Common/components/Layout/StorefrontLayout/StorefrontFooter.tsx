import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Undo2, Headphones } from "lucide-react";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Genuine Parts Guarantee" },
  { icon: Truck, label: "Pan-India Fast Shipping" },
  { icon: Undo2, label: "Easy Returns" },
  { icon: Headphones, label: "Expert Support" }
];

const FOOTER_LINKS: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Fitment Finder", to: "/fitment-finder" },
      { label: "Track an Order", to: "/account/orders" }
    ]
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/pages/about" },
      { label: "Contact", to: "/pages/contact" }
    ]
  },
  {
    heading: "Policies",
    links: [
      { label: "Shipping Policy", to: "/pages/shipping-policy" },
      { label: "Returns Policy", to: "/pages/returns-policy" },
      { label: "Terms of Service", to: "/pages/terms" },
      { label: "Privacy Policy", to: "/pages/privacy" }
    ]
  }
];

export function StorefrontFooter() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
        {TRUST_BADGES.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <badge.icon className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-xs font-semibold">{badge.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-extrabold text-primary">PartsHub</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Genuine automotive &amp; industrial spare parts, fitment-verified for your vehicle.
            </p>
          </div>
          {FOOTER_LINKS.map((section) => (
            <div key={section.heading}>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{section.heading}</p>
              <ul className="mt-2 space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PartsHub. All rights reserved.
      </div>
    </footer>
  );
}
