import React from 'react';
import { Link } from 'react-router-dom';
import { getProductsByOccasion } from '../../mock';
import ProductCard from '../product/ProductCard';

const OccasionSection = ({ title, subtitle, occasion, accentEmoji }) => {
  const items = getProductsByOccasion(occasion).slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="bg-brand-gradient-soft rounded-3xl p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-brand-dark flex items-center gap-2">
              <span>{accentEmoji}</span> {title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
          <Link to={`/products?occasion=${occasion}`} className="text-sm font-semibold text-brand-pink hover:underline">View All →</Link>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2">
          {items.map(p => (
            <div key={p.id} className="shrink-0 w-[160px] md:w-[200px]">
              <ProductCard product={p} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionSection;
