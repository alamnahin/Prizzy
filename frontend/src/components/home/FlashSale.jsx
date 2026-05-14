import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { products } from '../../mock';
import ProductCard from '../product/ProductCard';

const FlashSale = () => {
  const [time, setTime] = useState({ h: 8, m: 42, s: 17 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((p) => {
        let { h, m, s } = p;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const flashItems = products.filter(p => p.discountPercent >= 25).slice(0, 8);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="bg-brand-gradient rounded-3xl p-5 md:p-8 shadow-brand-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Flame size={26} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">Flash Sale</h2>
              <p className="text-sm text-white/85">Hurry up! Limited time deals</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-white text-sm font-medium hidden md:block">Ends in:</span>
            <div className="flex gap-1.5">
              {[
                { label: 'HR', val: time.h },
                { label: 'MIN', val: time.m },
                { label: 'SEC', val: time.s },
              ].map((t, i) => (
                <React.Fragment key={t.label}>
                  <div className="bg-white rounded-xl px-2.5 md:px-3.5 py-1.5 md:py-2 min-w-[48px] md:min-w-[58px] text-center">
                    <div className="text-lg md:text-2xl font-extrabold text-brand-pink leading-none">{pad(t.val)}</div>
                    <div className="text-[9px] md:text-[10px] font-semibold text-gray-500">{t.label}</div>
                  </div>
                  {i < 2 && <span className="text-white font-bold self-center">:</span>}
                </React.Fragment>
              ))}
            </div>
            <Link to="/products?sale=true" className="hidden md:inline-block ml-3 px-4 py-2 bg-white text-brand-pink font-semibold text-sm rounded-full hover:bg-brand-pink hover:text-white">
              View All
            </Link>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl p-4">
          <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-1">
            {flashItems.map(p => (
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
