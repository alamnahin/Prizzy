import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { useProducts } from "../../hooks/useSupabaseData";
import ProductCard from "../product/ProductCard";

// Compute how many seconds remain until the next midnight (00:00:00 local time).
// Persisting the end timestamp in localStorage means the countdown survives
// page refreshes and only resets when the sale actually ends.
function getFlashSaleEnd() {
  const stored = localStorage.getItem("prizzy_flash_end");
  if (stored) {
    const end = Number(stored);
    if (end > Date.now()) return end;
  }
  // Pin to the next midnight so the countdown is always ≤ 24 h
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const end = midnight.getTime();
  localStorage.setItem("prizzy_flash_end", String(end));
  return end;
}

function secondsUntil(ts) {
  return Math.max(0, Math.floor((ts - Date.now()) / 1000));
}

const FlashSale = () => {
  const { products, loading } = useProducts();
  const [endTs] = React.useState(getFlashSaleEnd);
  const [remaining, setRemaining] = React.useState(() => secondsUntil(endTs));

  useEffect(() => {
    const t = setInterval(() => {
      const left = secondsUntil(endTs);
      setRemaining(left);
      if (left === 0) {
        // Sale ended — clear stored end and pick the next midnight
        localStorage.removeItem("prizzy_flash_end");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [endTs]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  // Alias so the rest of the component still works
  const time = { h, m, s };

  if (loading) return null;

  // Uses live database data and safely checks discount percent
  const flashItems = products
    .filter((p) => (p.discountPercent || p.discount_percent || 0) >= 25)
    .slice(0, 8);

  const pad = (n) => String(n).padStart(2, "0");

  if (flashItems.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="bg-brand-gradient rounded-3xl p-5 md:p-8 shadow-brand-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Flame size={26} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                Flash Sale
              </h2>
              <p className="text-sm text-white/85">
                Hurry up! Limited time deals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-white text-sm font-medium hidden md:block">
              Ends in:
            </span>
            <div className="flex gap-1.5">
              {[
                { label: "HR", val: time.h },
                { label: "MIN", val: time.m },
                { label: "SEC", val: time.s },
              ].map((t, i) => (
                <React.Fragment key={t.label}>
                  <div className="bg-white rounded-xl px-2.5 md:px-3.5 py-1.5 md:py-2 min-w-[48px] md:min-w-[58px] text-center">
                    <div className="text-lg md:text-2xl font-extrabold text-brand-pink leading-none">
                      {pad(t.val)}
                    </div>
                    <div className="text-[9px] md:text-[10px] font-semibold text-gray-500">
                      {t.label}
                    </div>
                  </div>
                  {i < 2 && (
                    <span className="text-white font-bold self-center">:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <Link
              to="/products?sale=true"
              className="hidden md:inline-block ml-3 px-4 py-2 bg-white text-brand-pink font-semibold text-sm rounded-full hover:bg-brand-pink hover:text-white"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl p-4">
          <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-1">
            {flashItems.map((p) => (
              <div key={p.id} className="shrink-0 w-[160px] md:w-[200px]">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
