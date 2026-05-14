import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BadgeCheck, ShoppingBag } from 'lucide-react';
import { sellers } from '../../mock';

const SellerSpotlight = () => {
  const top = sellers.slice(0, 4);
  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark">Top Seller Shops</h2>
          <p className="text-sm text-gray-500 mt-1">Trusted sellers loved by our community</p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-brand-pink hover:underline">Explore Shops →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {top.map(s => (
          <div key={s.id} className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-pink/30 hover:shadow-brand flex flex-col items-center text-center">
            <div className="relative">
              <img src={s.shopLogo} alt={s.shopName} className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-pink/10 group-hover:ring-brand-pink/30" />
              {s.verified && (
                <span className="absolute -bottom-1 -right-1 bg-brand-gradient text-white rounded-full p-1">
                  <BadgeCheck size={14} />
                </span>
              )}
            </div>
            <h3 className="font-bold text-brand-dark mt-3">{s.shopName}</h3>
            <p className="text-xs text-gray-500">{s.category}</p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-brand-dark">{s.rating}</span>
              <span className="text-gray-400">• {s.sales}+ sales</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <ShoppingBag size={12} /> {s.products} products
            </div>
            <button className="mt-4 w-full py-2 border-2 border-brand-pink text-brand-pink font-semibold text-sm rounded-full hover:bg-brand-pink hover:text-white">
              Visit Shop
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SellerSpotlight;
