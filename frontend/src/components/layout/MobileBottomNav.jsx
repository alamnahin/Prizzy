import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/products', icon: Search, label: 'Shop' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: itemCount },
    { to: '/profile?tab=wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/profile', icon: User, label: 'Account' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-5">
        {links.map(({ to, icon: Icon, label, badge }) => {
          const active = location.pathname === to.split('?')[0];
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center py-2 gap-0.5 ${active ? 'text-brand-pink' : 'text-gray-500'}`}
            >
              <div className="relative">
                <Icon size={20} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-pink text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{badge}</span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
