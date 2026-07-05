// frontend/src/components/home/FeaturedProducts.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { useProducts } from "../../hooks/useSupabaseData";

export default function FeaturedProducts() {
  const { products, loading } = useProducts();

  return (
    <section className="py-12 md:py-20 bg-gray-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-sm font-bold mb-4">
              <Sparkles size={16} />
              <span>Handpicked for you</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mb-4">
              Trending Gifts This Week
            </h2>
            <p className="text-gray-500 text-lg">
              Discover our most loved and highly-rated products curated by
              expert gift advisors.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-bold text-brand-pink hover:text-brand-dark transition-colors group"
          >
            View all products
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-full h-[350px] bg-gray-200 animate-pulse rounded-2xl"
              ></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-semibold">No products yet.</p>
            <p className="text-sm mt-1">Add products via the Seller Dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
