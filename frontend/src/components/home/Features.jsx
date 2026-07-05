import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Same-day delivery in Dhaka' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: 'SSLCommerz & bKash protected' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help you' },
];

const Features = () => (
  <section className="max-w-7xl mx-auto px-4 mt-14">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {features.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-center gap-3 bg-white border border-gray-100 hover:border-brand-pink/30 rounded-2xl p-4 hover:shadow-brand">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-gradient-soft flex items-center justify-center">
            <Icon size={22} className="text-brand-pink" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-brand-dark">{title}</h4>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
