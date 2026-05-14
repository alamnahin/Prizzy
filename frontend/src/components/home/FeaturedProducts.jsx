import React from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../../mock';
import ProductCard from '../product/ProductCard';

const FeaturedProducts = () => {
  const featured = getFeaturedProducts();
  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark">Top Picks for You</h2>
          <p className="text-sm text-gray-500 mt-1">Handpicked gifts loved by our customers</p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-brand-pink hover:underline">View All →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
        {featured.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

export default FeaturedProducts;
