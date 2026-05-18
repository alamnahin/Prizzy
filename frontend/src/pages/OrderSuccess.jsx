import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Package, Home, MessageCircle, Share2 } from 'lucide-react';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('prizzy_last_order');
    if (stored) setOrder(JSON.parse(stored));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 text-center shadow-brand">
        {/* Animated checkmark */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-brand-gradient rounded-full animate-pulse-soft" />
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center animate-fade-in">
              <Check size={36} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-2">Order Placed Successfully! 🎉</h1>
        <p className="text-gray-500 mb-1">Thank you for shopping with Prizzy.</p>
        <p className="text-sm text-gray-500 mb-6">A confirmation email is on the way.</p>

        <div className="inline-flex items-center gap-2 bg-brand-gradient-soft border border-brand-pink/20 px-5 py-2.5 rounded-full mb-8">
          <Package size={16} className="text-brand-pink" />
          <span className="text-sm font-semibold text-brand-dark">Order #{orderNumber}</span>
        </div>

        {order && (
          <div className="text-left bg-gray-50 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-brand-dark">Order Summary</h3>
              <span className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div className="space-y-2 mb-3">
              {order.items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 text-sm">
                  <img src={item.product.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                  <span className="flex-1 text-gray-700 line-clamp-1">{item.product.name} × {item.quantity}</span>
                  <span className="font-semibold text-brand-dark">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-brand-dark">
              <span>Total</span>
              <span className="text-brand-pink">৳{order.total.toLocaleString()}</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p><strong>Deliver to:</strong> {order.address.name}, {order.address.street}, {order.address.city}</p>
              <p><strong>Payment:</strong> {order.payment === 'cod' ? 'Cash on Delivery' : order.payment.toUpperCase()}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/profile?tab=orders" className="px-6 py-3 border-2 border-brand-pink text-brand-pink font-bold rounded-full hover:bg-brand-pink hover:text-white flex items-center justify-center gap-2">
            <Package size={16} /> Track Order
          </Link>
          <Link to="/" className="px-6 py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 shadow-brand flex items-center justify-center gap-2">
            <Home size={16} /> Continue Shopping
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 text-sm text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-brand-pink"><MessageCircle size={14} /> Share on WhatsApp</button>
          <span>•</span>
          <button className="flex items-center gap-1.5 hover:text-brand-pink"><Share2 size={14} /> Share</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
