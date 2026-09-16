import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/Common/components/ui/button";
import { cn } from "@/Common/lib/utils";

interface Slide {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  bg: string;
  accent: "accent" | "primary";
}

/** Multi-slide auto-rotating promo carousel — the pattern every major storefront (Amazon,
 * Flipkart, Myntra) uses for the top fold instead of one static banner: rotate 3-4 offers,
 * keep the copy short, one clear CTA per slide, dots + arrows, pause on hover/focus so it
 * never fights a reading user. */
const SLIDES: Slide[] = [
  {
    eyebrow: "Genuine Parts, Right Fit",
    title: "5,000+ spare parts, verified for your exact vehicle.",
    subtitle:
      "Search by part number, OEM code, or your vehicle's make, model and year — every listing shows verified fitment before you buy.",
    cta: { label: "Shop All Parts", to: "/products" },
    secondaryCta: { label: "Find Parts for My Vehicle", to: "/fitment-finder" },
    bg: "bg-hero-gradient",
    accent: "accent"
  },
  {
    eyebrow: "Limited-Time Offer",
    title: "Up to 30% off Brakes & Suspension.",
    subtitle: "Top-rated brands like Bosch and MRF, in stock and ready to ship pan-India.",
    cta: { label: "Shop the Sale", to: "/products?category=brakes" },
    bg: "bg-gradient-to-br from-accent-700 via-accent-600 to-[#C24E08]",
    accent: "primary"
  },
  {
    eyebrow: "Fast & Reliable",
    title: "Same-day dispatch, doorstep in 2-5 days.",
    subtitle: "Real-time order tracking from warehouse to your doorstep, every time.",
    cta: { label: "Track an Order", to: "/account/orders" },
    secondaryCta: { label: "Browse Catalog", to: "/products" },
    bg: "bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700",
    accent: "accent"
  }
];

const AUTOPLAY_MS = 5500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((i: number) => setIndex((i + SLIDES.length) % SLIDES.length), []);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) (delta < 0 ? next : prev)();
    touchStartX.current = null;
  };

  return (
    <section
      className="relative overflow-hidden text-primary-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured offers"
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.title}
            className={cn("w-full shrink-0", slide.bg)}
            aria-hidden={i !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}`}
          >
            <div className="container flex min-h-[340px] flex-col justify-center py-12 sm:min-h-[400px] sm:py-16 lg:min-h-[440px]">
              <div className="max-w-2xl">
                <p
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    slide.accent === "accent" ? "text-accent-300" : "text-primary-foreground/70"
                  )}
                >
                  {slide.eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{slide.title}</h1>
                <p className="mt-4 max-w-lg text-sm text-primary-foreground/80 sm:text-base">{slide.subtitle}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to={slide.cta.to}>
                    <Button variant="accent" size="lg">
                      {slide.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  {slide.secondaryCta && (
                    <Link to={slide.secondaryCta.to}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white/30 bg-white/5 text-primary-foreground backdrop-blur-sm hover:bg-white/15 hover:text-primary-foreground"
                      >
                        {slide.secondaryCta.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows — hidden on touch-first mobile widths where swipe already works, shown from sm+ */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/20 p-2 text-white transition hover:bg-black/40 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/20 p-2 text-white transition hover:bg-black/40 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-accent" : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </section>
  );
}
