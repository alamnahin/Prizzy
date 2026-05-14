import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Store, LogOut, Package, MapPin } from 'lucide-react';
import { LOGO_URL, categories } from '../../mock';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '../ui/dropdown-menu';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { itemCount, wishlist } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?q=${encodeURIComponent(search)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top promo strip */}
      <div className="bg-brand-gradient text-white text-xs md:text-sm py-2 px-4 text-center font-medium">
        🎁 Free shipping on orders over ৳2000 • Use code <span className="font-bold">WELCOME20</span> for 20% off your first order
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src={LOGO_URL} alt="Prizzy" className="h-12 md:h-14 w-auto" />
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex max-w-2xl">
          <div className="flex w-full rounded-full border-2 border-brand-pink/20 focus-within:border-brand-pink overflow-hidden bg-white">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for gifts, flowers, chocolates..."
              className="flex-1 px-5 py-2.5 outline-none text-sm"
            />
            <button type="submit" className="px-6 bg-brand-gradient text-white flex items-center justify-center hover:opacity-90">
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Icons */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <Link to="/profile?tab=wishlist" className="relative p-2.5 rounded-full hover:bg-brand-pink/10 text-brand-dark">
            <Heart size={22} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-pink text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-brand-pink/10 text-brand-dark">
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-pink text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Account dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 p-2.5 rounded-full hover:bg-brand-pink/10 text-brand-dark">
                <User size={22} />
                <ChevronDown size={14} className="hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-brand-dark">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User size={16} className="mr-2" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=orders')} className="cursor-pointer">
                    <Package size={16} className="mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=addresses')} className="cursor-pointer">
                    <MapPin size={16} className="mr-2" /> Addresses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/seller/dashboard')} className="cursor-pointer">
                    <Store size={16} className="mr-2" /> Seller Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="cursor-pointer">
                    <Store size={16} className="mr-2" /> Admin Panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut size={16} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate('/login')} className="cursor-pointer">
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/register')} className="cursor-pointer">
                    Register
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/seller/dashboard')} className="cursor-pointer">
                    <Store size={16} className="mr-2" /> Become a Seller
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="md:hidden p-2 text-brand-dark" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex w-full rounded-full border-2 border-brand-pink/20 overflow-hidden bg-white">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for gifts..."
            className="flex-1 px-4 py-2 outline-none text-sm"
          />
          <button type="submit" className="px-5 bg-brand-gradient text-white">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Category pills */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link to="/products" className="shrink-0 px-4 py-1.5 text-sm font-semibold text-brand-pink rounded-full hover:bg-brand-pink/10">
              All Categories
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="shrink-0 px-4 py-1.5 text-sm font-medium text-gray-700 rounded-full hover:bg-brand-pink/10 hover:text-brand-pink whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="py-2 text-left font-medium text-red-600">Logout</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2 font-medium">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="py-2 font-medium">Register</Link>
              </>
            )}
            <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="py-2 font-medium">Become a Seller</Link>
            <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="py-2 font-medium">Admin Panel</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
