// frontend/src/components/home/HeroSlider.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Hardcoded static marketing banners directly into the component
const heroBanners = [
  {
    id: 1,
    title: "Gifts for Every Moment",
    subtitle: "Discover thoughtful gifts for everyone you love",
    cta: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&q=80",
    badge: "New Collection",
    link: "/products",
  },
  {
    id: 2,
    title: "Mega Eid Sale",
    subtitle: "Up to 50% off on Eid special gift hampers",
    cta: "Explore Deals",
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1600&q=80",
    badge: "Limited Time",
    link: "/products?occasion=Eid",
  },
  {
    id: 3,
    title: "Wedding Season Specials",
    subtitle: "Premium gift sets, curated for unforgettable moments",
    cta: "View Collection",
    image:
      "https://images.unsplash.com/photo-1544639044-4f142ceb6a2b?w=1600&q=80",
    badge: "Featured",
    link: "/products?occasion=Wedding",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % heroBanners.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  const goTo = (i) => setCurrent((i + heroBanners.length) % heroBanners.length);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-4">
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-[260px] md:h-[420px] bg-gray-100">
        {heroBanners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={{ transition: "opacity 0.8s ease" }}
          >
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/85 via-brand-pink/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-2xl px-6 md:px-12 text-white">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-semibold rounded-full mb-3 md:mb-4">
                  {b.badge}
                </span>
                <h1 className="text-3xl md:text-6xl font-extrabold leading-tight mb-2 md:mb-4 drop-shadow-md">
                  {b.title}
                </h1>
                <p className="text-sm md:text-lg mb-4 md:mb-6 text-white/90 max-w-md">
                  {b.subtitle}
                </p>
                <Link
                  to={b.link}
                  className="inline-flex items-center gap-2 bg-white text-brand-pink font-bold px-5 md:px-7 py-2.5 md:py-3 rounded-full hover:bg-brand-pink hover:text-white shadow-lg text-sm md:text-base"
                >
                  {b.cta} →
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={() => goTo(current - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-brand-dark flex items-center justify-center shadow"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => goTo(current + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-brand-dark flex items-center justify-center shadow"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full ${i === current ? "bg-white w-8" : "bg-white/50 w-2"}`}
              style={{
                transition: "width 0.3s ease, background-color 0.3s ease",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
