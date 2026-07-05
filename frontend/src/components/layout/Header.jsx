import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Store,
  LogOut,
  Package,
  MapPin,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../hooks/useSupabaseData";
import { supabase } from "../../lib/supabase"; // 🔴 ADDED: Supabase client
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_d5d8da0f-075b-46d5-becb-685b2238c006/artifacts/7ozor44k_image.png";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { itemCount, wishlist } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();

  // 🔴 ADDED: Notifications State & Real-time Subscription
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // 1. Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    };
    fetchNotifications();

    // 2. Subscribe to new real-time notifications
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 10));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?q=${encodeURIComponent(search)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top promo strip */}
      <div className="bg-brand-gradient text-white text-xs md:text-sm py-2 px-4 text-center font-medium">
        🎁 Free shipping on orders over ৳2000 • Use code{" "}
        <span className="font-bold">WELCOME20</span> for 20% off your first
        order
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-6">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={LOGO_URL}
            alt="Prizzy"
            className="h-12 md:h-14 w-auto rounded-xl"
          />
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 hidden md:flex max-w-2xl"
        >
          <div className="flex w-full rounded-full border-2 border-brand-pink/20 focus-within:border-brand-pink overflow-hidden bg-white">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for gifts, flowers, chocolates..."
              className="flex-1 px-5 py-2.5 outline-none text-sm"
            />
            <button
              type="submit"
              className="px-6 bg-brand-gradient text-white flex items-center justify-center hover:opacity-90"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Icons */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* 🔴 ADDED: Notifications Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 rounded-full hover:bg-brand-pink/10 text-brand-dark">
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-brand-pink text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-brand-dark">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-brand-pink font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) markAsRead(n.id);
                          if (n.link) navigate(n.link);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors mt-1 ${
                          n.is_read
                            ? "opacity-70 hover:bg-gray-50"
                            : "bg-brand-pink/5 hover:bg-brand-pink/10"
                        }`}
                      >
                        <p className="text-sm font-semibold text-brand-dark flex items-start gap-2">
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-brand-pink mt-1.5 shrink-0" />
                          )}
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 pl-4 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link
            to="/profile?tab=wishlist"
            className="relative p-2.5 rounded-full hover:bg-brand-pink/10 text-brand-dark"
          >
            <Heart size={22} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-pink text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full hover:bg-brand-pink/10 text-brand-dark"
          >
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
                    <p className="text-sm font-semibold text-brand-dark">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User size={16} className="mr-2" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile?tab=orders")}
                    className="cursor-pointer"
                  >
                    <Package size={16} className="mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile?tab=addresses")}
                    className="cursor-pointer"
                  >
                    <MapPin size={16} className="mr-2" /> Addresses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/seller/dashboard")}
                    className="cursor-pointer"
                  >
                    <Store size={16} className="mr-2" />
                    {user.role === "seller"
                      ? "Seller Dashboard"
                      : "Become a Seller"}
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/admin/dashboard")}
                      className="cursor-pointer"
                    >
                      <Store size={16} className="mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    className="cursor-pointer"
                  >
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/register")}
                    className="cursor-pointer"
                  >
                    Register
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/seller/dashboard")}
                    className="cursor-pointer"
                  >
                    <Store size={16} className="mr-2" /> Become a Seller
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="md:hidden p-2 text-brand-dark"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form
          onSubmit={handleSearch}
          className="flex w-full rounded-full border-2 border-brand-pink/20 overflow-hidden bg-white"
        >
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
            <Link
              to="/products"
              className="shrink-0 px-4 py-1.5 text-sm font-semibold text-brand-pink rounded-full hover:bg-brand-pink/10"
            >
              All Categories
            </Link>
            {(categories || []).map((cat) => (
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
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="py-2 text-left font-medium text-red-600"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 font-medium"
                >
                  Register
                </Link>
              </>
            )}
            <Link
              to="/seller/dashboard"
              onClick={() => setMobileOpen(false)}
              className="py-2 font-medium"
            >
              {user?.role === "seller" ? "Seller Dashboard" : "Become a Seller"}
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="py-2 font-medium"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
