import React from 'react';
import HeroSlider from '../components/home/HeroSlider';
import Features from '../components/home/Features';
import CategoryGrid from '../components/home/CategoryGrid';
import FlashSale from '../components/home/FlashSale';
import FeaturedProducts from '../components/home/FeaturedProducts';
import OccasionSection from '../components/home/OccasionSection';
import SellerSpotlight from '../components/home/SellerSpotlight';

const Home = () => {
  return (
    <div className="bg-white">
      <HeroSlider />
      <Features />
      <CategoryGrid />
      <FlashSale />
      <FeaturedProducts />
      <OccasionSection title="Gifts for Birthday" subtitle="Make their day extra special" occasion="Birthday" accentEmoji="🎂" />
      <OccasionSection title="Gifts for Anniversary" subtitle="Romance, meet thoughtfulness" occasion="Anniversary" accentEmoji="💕" />
      <OccasionSection title="Eid Specials" subtitle="Festive treats for your loved ones" occasion="Eid" accentEmoji="🌙" />
      <SellerSpotlight />

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-brand-gradient rounded-3xl p-8 md:p-12 text-center text-white shadow-brand-lg overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Become a Prizzy Seller</h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-6 text-sm md:text-base">
              Join thousands of sellers across Bangladesh. List your gift products, reach more customers, and grow your business with Prizzy.
            </p>
            <a href="/seller/dashboard" className="inline-block bg-white text-brand-pink font-bold px-7 py-3 rounded-full hover:bg-brand-dark hover:text-white">Start Selling Today →</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
