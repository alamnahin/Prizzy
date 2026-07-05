import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, BadgeCheck, ShoppingBag } from "lucide-react";
import { supabase } from "../../lib/supabase"; // Import supabase directly

const SellerSpotlight = () => {
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    async function fetchSellers() {
      // Fetch actual data from your 'sellers' table
      const { data } = await supabase.from("sellers").select("*").limit(4);
      if (data) setTopSellers(data);
    }
    fetchSellers();
  }, []);

  if (topSellers.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark">
            Top Seller Shops
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Trusted sellers loved by our community
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm font-semibold text-brand-pink hover:underline"
        >
          Explore Shops →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topSellers.map((s) => (
          <div
            key={s.id}
            className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-pink/30 hover:shadow-brand flex flex-col items-center text-center"
          >
            <div className="relative">
              <img
                src={
                  s.shop_logo ||
                  "https://images.unsplash.com/photo-1559779080-6970e0186790?w=200&q=80"
                }
                alt={s.shop_name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-pink/10 group-hover:ring-brand-pink/30"
              />
              {s.verified && (
                <span className="absolute -bottom-1 -right-1 bg-brand-gradient text-white rounded-full p-1">
                  <BadgeCheck size={14} />
                </span>
              )}
            </div>
            <h3 className="font-bold text-brand-dark mt-3">{s.shop_name}</h3>
            <p className="text-xs text-gray-500 capitalize">
              {s.category || "Gifts"}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-brand-dark">
                {s.rating || 5.0}
              </span>
              <span className="text-gray-400">• Sales+</span>
            </div>
            <Link
              to={`/shop/${s.id}`}
              className="mt-4 w-full py-2 border-2 border-brand-pink text-brand-pink font-semibold text-sm rounded-full hover:bg-brand-pink hover:text-white transition-colors block"
            >
              Visit Shop
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SellerSpotlight;
