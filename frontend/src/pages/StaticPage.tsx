import { useParams } from "react-router-dom";
import { Breadcrumb } from "@/Common/components/ui/breadcrumb";

const CONTENT: Record<string, { title: string; body: string }> = {
  about: {
    title: "About PartsHub",
    body: "PartsHub connects garages, fleet operators, and everyday drivers with genuine, fitment-verified automotive and industrial spare parts — sourced directly from trusted brands and shipped pan-India."
  },
  contact: {
    title: "Contact Us",
    body: "Have a question about an order or a part's fitment? Reach our support team at support@partshub.example or call +91 1800-000-0000, Monday–Saturday, 9am–7pm IST."
  },
  terms: {
    title: "Terms of Service",
    body: "By using PartsHub, you agree to our terms covering order acceptance, pricing, returns, and acceptable use. Full legal terms will be published here."
  },
  privacy: {
    title: "Privacy Policy",
    body: "We collect only the information needed to process your orders and improve your experience, and never sell your data. Full policy details will be published here."
  },
  "shipping-policy": {
    title: "Shipping Policy",
    body: "We ship pan-India via trusted courier partners. Delivery timelines depend on your pincode and are shown at checkout via our serviceability check."
  },
  "returns-policy": {
    title: "Returns Policy",
    body: "Most parts can be returned within 7 days of delivery if unused and in original packaging. Start a return from your order detail page."
  }
};

/** One template covers every static content page (About/Contact/Terms/Privacy/Shipping/Returns)
 * per docs/DESIGN_BRIEF.md — the slug from the route param picks the copy. */
export default function StaticPage() {
  const { slug = "about" } = useParams();
  const page = CONTENT[slug] ?? { title: "Page", body: "Content coming soon." };

  return (
    <div className="container max-w-2xl py-8">
      <Breadcrumb items={[{ label: page.title }]} />
      <h1 className="mt-3 text-2xl font-extrabold">{page.title}</h1>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">{page.body}</p>
    </div>
  );
}
