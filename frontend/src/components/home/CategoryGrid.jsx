import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../mock';

const CategoryGrid = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark">Shop by Category</h2>
          <p className="text-sm text-gray-500 mt-1">Find the perfect gift for every occasion</p>
        </div>
        <Link to="/products" className="hidden md:inline-block text-sm font-semibold text-brand-pink hover:underline">View All →</Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="category-card group bg-white rounded-2xl p-3 border border-gray-100 hover:border-brand-pink/40 hover:shadow-brand flex flex-col items-center text-center"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-brand-gradient-soft">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110" style={{ transition: 'transform 0.5s ease' }} />
            </div>
            <h3 className="text-xs md:text-sm font-semibold text-brand-dark leading-tight line-clamp-2">{cat.name}</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{cat.count} items</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
