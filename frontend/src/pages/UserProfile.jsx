import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Package,
  Heart,
  Star,
  MapPin,
  Settings,
  Store,
  LogOut,
  ChevronRight,
  Home,
  Plus,
  Check,
  Truck,
  Clock,
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/product/ProductCard";
import {
  useUserOrders,
  useProductsByIds,
  useAddresses,
  updateProfile,
  useUserReviews,
} from "../hooks/useSupabaseData";
import { supabase } from "../lib/supabase";
import { toast } from "../hooks/use-toast";

const TABS = [
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "My Reviews", icon: Star },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const statusColors = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
};

const ORDER_STEPS = [
  {
    key: "placed",
    label: "Order Placed",
    icon: ShoppingBag,
    desc: "We've received your order",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: Check,
    desc: "Seller confirmed your order",
  },
  {
    key: "processing",
    label: "Processing",
    icon: RefreshCw,
    desc: "Your items are being prepared",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
    desc: "Your order is on the way",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: Package,
    desc: "Order delivered successfully",
  },
];
const STEP_INDEX = Object.fromEntries(ORDER_STEPS.map((s, i) => [s.key, i]));

function OrderTracker({ order }) {
  const isCancelled =
    order.orderStatus === "cancelled" || order.orderStatus === "refunded";
  const currentIdx = isCancelled ? -1 : (STEP_INDEX[order.orderStatus] ?? 0);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {isCancelled ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl text-sm font-semibold text-red-600">
          <X size={16} /> Order{" "}
          {order.orderStatus === "refunded" ? "Refunded" : "Cancelled"}
        </div>
      ) : (
        <div className="relative px-2">
          {/* Connecting rail */}
          <div className="absolute top-5 left-7 right-7 h-0.5 bg-gray-100 z-0 hidden sm:block" />
          <div
            className="absolute top-5 left-7 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 z-0 hidden sm:block transition-all duration-500"
            style={{
              right: `${((ORDER_STEPS.length - 1 - currentIdx) / (ORDER_STEPS.length - 1)) * 100}%`,
            }}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 relative z-10">
            {ORDER_STEPS.map((step, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all
                    ${done ? "bg-gradient-to-br from-pink-500 to-purple-600 border-transparent text-white shadow-md" : ""}
                    ${active ? "bg-white border-brand-pink text-brand-pink shadow-lg ring-4 ring-pink-100" : ""}
                    ${!done && !active ? "bg-white border-gray-200 text-gray-300" : ""}
                  `}
                  >
                    {done ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <div className="sm:text-center">
                    <p
                      className={`text-xs font-bold leading-tight
                      ${active ? "text-brand-pink" : done ? "text-brand-dark" : "text-gray-400"}`}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                        {step.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {order.shippingAddress && (
          <div className="bg-gray-50 rounded-xl p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
              <MapPin size={10} /> Delivery Address
            </p>
            <p className="font-semibold text-brand-dark text-xs">
              {order.shippingAddress.name || "—"}
            </p>
            <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
              {[
                order.shippingAddress.street || order.shippingAddress.address,
                order.shippingAddress.city,
                order.shippingAddress.district,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-gray-400 text-xs mt-0.5">
                {order.shippingAddress.phone}
              </p>
            )}
          </div>
        )}
        <div className="bg-gray-50 rounded-xl p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
            <CreditCard size={10} /> Payment
          </p>
          <p className="font-semibold text-brand-dark text-xs capitalize">
            {order.paymentMethod === "cod"
              ? "Cash on Delivery"
              : (order.paymentMethod || "").toUpperCase()}
          </p>
          <p
            className={`text-xs mt-0.5 capitalize font-medium ${
              order.paymentStatus === "paid"
                ? "text-green-600"
                : order.paymentStatus === "failed"
                  ? "text-red-500"
                  : "text-yellow-600"
            }`}
          >
            {order.paymentStatus || "pending"}
          </p>
          {order.estimatedDelivery && (
            <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1">
              <Clock size={10} /> Est. delivery:{" "}
              {new Date(order.estimatedDelivery).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "short",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mt-3 bg-gray-50 rounded-xl p-3.5 text-xs space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
          Price Breakdown
        </p>
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>৳{(order.subtotal || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>৳{(order.shippingFee || 0).toLocaleString()}</span>
        </div>
        {(order.discount || 0) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>−৳{(order.discount || 0).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-brand-dark border-t border-gray-200 pt-1.5 mt-1">
          <span>Total</span>
          <span className="text-brand-pink">
            ৳{(order.totalAmount || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

const UserProfile = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "orders";
  const { user, logout } = useAuth();
  const { wishlist } = useCart();

  // Live data hooks
  const { orders, loading: ordersLoading } = useUserOrders(user?.id);
  const { products: wishlistProducts, loading: wishlistLoading } =
    useProductsByIds(wishlist);
  const {
    addresses,
    loading: addressesLoading,
    addAddress,
    refetch: refetchAddresses,
  } = useAddresses(user?.id);
  const { reviews: userReviews, loading: reviewsLoading } = useUserReviews(
    user?.id,
  );

  const setTab = (t) => setParams({ tab: t });

  // AuthContext enriches user with profile data — use it directly
  const displayUser = user
    ? {
        name:
          user.name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User",
        email: user.email,
        phone: user.phone || user.user_metadata?.phone || "",
      }
    : { name: "Guest User", email: "guest@prizzy.com", phone: "" };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="flex items-center hover:text-brand-pink">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} />
        <span className="text-brand-dark font-medium">My Account</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-xl">
                {displayUser.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-brand-dark line-clamp-1">
                  {displayUser.name}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {displayUser.email}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-brand-pink/5 ${tab === t.id ? "text-brand-pink bg-brand-pink/5 border-l-4 border-brand-pink" : "text-gray-600 border-l-4 border-transparent"}`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
            <button
              onClick={() => setTab("seller")}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-brand-pink/5 border-l-4 border-transparent"
            >
              <Store size={16} /> Become a Seller
            </button>
            {user && (
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100"
              >
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === "orders" && (
            <OrdersTab orders={orders} loading={ordersLoading} />
          )}

          {tab === "wishlist" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-brand-dark mb-4">
                My Wishlist ({wishlistProducts.length})
              </h2>
              {wishlistLoading ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : wishlistProducts.length === 0 ? (
                <p className="text-gray-500 text-sm py-10 text-center">
                  Your wishlist is empty. Browse products and tap ♡ to save
                  items.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-brand-dark mb-4">
                My Reviews
              </h2>
              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
                </div>
              ) : !userReviews || userReviews.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  You haven't written any reviews yet. After your order is
                  delivered, you can share your experience here.
                </p>
              ) : (
                <div className="space-y-4">
                  {userReviews.map((r) => (
                    <div
                      key={r.id}
                      className="border border-gray-100 rounded-xl p-4 flex gap-4"
                    >
                      {r.products?.thumbnail && (
                        <img
                          src={r.products.thumbnail}
                          alt={r.products.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        {r.products?.name && (
                          <Link
                            to={`/products/${r.products.slug}`}
                            className="font-semibold text-sm text-brand-dark hover:text-brand-pink line-clamp-1"
                          >
                            {r.products.name}
                          </Link>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={
                                s <= r.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-200 fill-gray-200"
                              }
                            />
                          ))}
                        </div>
                        {r.comment && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                            {r.comment}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <AddressesTab
              userId={user?.id}
              addresses={addresses}
              loading={addressesLoading}
              addAddress={addAddress}
              refetch={refetchAddresses}
            />
          )}

          {tab === "settings" && (
            <SettingsTab user={displayUser} userId={user?.id} />
          )}

          {tab === "seller" && (
            <div className="bg-brand-gradient rounded-2xl p-8 text-white text-center">
              <Store size={36} className="mx-auto mb-3" />
              <h2 className="text-2xl font-extrabold mb-2">
                Become a Prizzy Seller
              </h2>
              <p className="text-white/90 max-w-md mx-auto mb-5 text-sm">
                Start selling your gift products to thousands of customers
                across Bangladesh.
              </p>
              <Link
                to="/seller/dashboard"
                className="inline-block bg-white text-brand-pink font-bold px-6 py-3 rounded-full hover:bg-brand-dark hover:text-white"
              >
                Go to Seller Dashboard →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Orders Tab with live tracking ──────────────────────────────────────────────
const OrdersTab = ({ orders, loading }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h2 className="text-xl font-bold text-brand-dark mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-500 mb-3">No orders yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 bg-brand-gradient text-white font-bold px-5 py-2.5 rounded-full text-sm hover:opacity-90"
          >
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isOpen = expandedId === o.id;
            return (
              <div
                key={o.id}
                className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-brand-pink/30 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}
              >
                {/* Order header row — always visible */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div>
                      <p className="font-bold text-brand-dark text-sm">
                        {o.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Placed on{" "}
                        {new Date(o.date).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[o.orderStatus] || "bg-gray-100 text-gray-600"}`}
                      >
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Item thumbnails */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
                    {(o.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 shrink-0"
                      >
                        <img
                          src={
                            item.product?.thumbnail ||
                            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80"
                          }
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="text-xs">
                          <p className="font-medium text-brand-dark line-clamp-1 max-w-[120px]">
                            {item.product?.name || "Product"}
                          </p>
                          <p className="text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm">
                      <strong className="text-brand-pink">
                        ৳{(o.totalAmount || 0).toLocaleString()}
                      </strong>
                      <span className="text-gray-400">
                        {" "}
                        · {(o.items || []).length} item
                        {(o.items || []).length !== 1 ? "s" : ""}
                      </span>
                    </span>
                    <button
                      onClick={() => setExpandedId(isOpen ? null : o.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-purple-600 transition-colors"
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp size={14} /> Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} /> Track Order
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable tracking section */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-50 bg-white">
                    <OrderTracker order={o} />
                    {o.orderStatus === "delivered" && (
                      <Link
                        to={`/products`}
                        className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-brand-pink hover:underline"
                      >
                        <Star size={12} /> Write a Review
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AddressesTab = ({ userId, addresses, loading, addAddress, refetch }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "Dhaka",
    district: "Dhaka",
    postalCode: "",
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Please log in first" });
      return;
    }
    setSaving(true);
    const { error } = await addAddress(userId, {
      ...form,
      isDefault: addresses.length === 0,
    });
    setSaving(false);
    if (!error) {
      toast({ title: "Address saved!" });
      setShowForm(false);
      setForm({
        name: "",
        phone: "",
        street: "",
        city: "Dhaka",
        district: "Dhaka",
        postalCode: "",
      });
    } else {
      toast({
        title: "Error saving address",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("addresses").delete().eq("id", id);
    refetch();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h2 className="text-xl font-bold text-brand-dark mb-4">
        Saved Addresses
      </h2>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {addresses.map((a) => (
              <div key={a.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-brand-dark">{a.label}</span>
                  {a.is_default && (
                    <span className="text-[10px] font-semibold bg-brand-pink/10 text-brand-pink px-2 py-0.5 rounded">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {a.name} • {a.phone}
                </p>
                <p className="text-sm text-gray-600">{a.street}</p>
                <p className="text-sm text-gray-600">
                  {a.city}, {a.district} {a.postal_code}
                </p>
                <div className="flex gap-3 mt-3 text-xs font-semibold">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showForm ? (
            <form
              onSubmit={handleAdd}
              className="border border-brand-pink/20 rounded-xl p-4 bg-brand-gradient-soft space-y-3"
            >
              <h3 className="font-semibold text-brand-dark">New Address</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Full Name", "name"],
                  ["Phone", "phone"],
                  ["Street Address", "street"],
                  ["City", "city"],
                  ["District", "district"],
                  ["Postal Code", "postalCode"],
                ].map(([label, key]) => (
                  <div
                    key={key}
                    className={key === "street" ? "col-span-2" : ""}
                  >
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      {label}
                    </label>
                    <input
                      required
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-pink text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-gradient text-white font-semibold rounded-full text-sm hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 border border-gray-200 rounded-full text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-white font-semibold rounded-full text-sm hover:opacity-90"
            >
              <Plus size={14} /> Add New Address
            </button>
          )}
        </>
      )}
    </div>
  );
};

const SettingsTab = ({ user, userId }) => {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);

  // Keep local state in sync when enriched user arrives
  useEffect(() => {
    setName(user.name || "");
    setPhone(user.phone || "");
  }, [user.name, user.phone]);

  const handleSave = async () => {
    setSaving(true);
    // Save to both the profiles table (primary) and auth metadata (secondary)
    const { error } = await updateProfile(userId, { name, phone });
    setSaving(false);
    if (!error) toast({ title: "✅ Settings saved!" });
    else
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h2 className="text-xl font-bold text-brand-dark mb-4">
        Account Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Email
          </label>
          <input
            value={user.email}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 px-5 py-2.5 bg-brand-gradient text-white font-semibold rounded-full text-sm hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
};

export default UserProfile;
