import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Home,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  Store,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { validateCoupon } from "../hooks/useSupabaseData";
import { toast } from "../hooks/use-toast";

const Cart = () => {
  const {
    items,
    updateQty,
    removeFromCart,
    subtotal,
    shippingFee,
    discount,
    total,
    coupon,
    setCoupon,
  } = useCart();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  // Safely group items by seller
  const itemsBySeller = items.reduce((acc, item) => {
    const sid =
      item.product.seller_id || item.product.seller?.id || "unknown_seller";
    const sellerName =
      item.product.sellerName ||
      item.product.seller?.shop_name ||
      "Verified Seller";

    if (!acc[sid]) {
      acc[sid] = { seller: { id: sid, shop_name: sellerName }, items: [] };
    }
    acc[sid].items.push(item);
    return acc;
  }, {});

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setCouponLoading(true);
    const result = await validateCoupon(
      code.trim(),
      subtotal,
      user?.id || null,
    );
    setCouponLoading(false);

    if (!result.valid) {
      toast({
        title: "Invalid coupon",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    // Map Supabase snake_case to our CartContext camelCase shape
    const c = result.coupon;
    setCoupon({
      code: c.code,
      description: c.description,
      discountType: c.discount_type,
      discountValue: c.discount_value,
      minimumOrderAmount: c.minimum_order_amount,
      maximumDiscount: c.maximum_discount,
      // Pre-calculated discount from RPC
      _calculatedDiscount: result.discount,
    });
    toast({ title: "🎉 Coupon applied!", description: result.message });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-brand-gradient-soft flex items-center justify-center mb-5">
          <ShoppingBag size={40} className="text-brand-pink" />
        </div>
        <h1 className="text-3xl font-extrabold text-brand-dark mb-3">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-6">
          Looks like you haven't added any gifts yet. Let's find something
          perfect!
        </p>
        <Link
          to="/products"
          className="inline-block bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90"
        >
          Browse Gifts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="flex items-center hover:text-brand-pink">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} />
        <span className="text-brand-dark font-medium">Shopping Cart</span>
      </nav>

      <h1 className="text-3xl font-extrabold text-brand-dark mb-6">
        Shopping Cart{" "}
        <span className="text-base font-medium text-gray-500">
          ({items.length} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.values(itemsBySeller).map(
            ({ seller, items: sellerItems }) => (
              <div
                key={seller.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-3 bg-brand-gradient-soft border-b border-gray-100">
                  <Store size={16} className="text-brand-pink" />
                  <span className="font-semibold text-sm text-brand-dark">
                    {seller.shop_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    • Free shipping on orders over ৳2000
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {sellerItems.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4">
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="shrink-0"
                      >
                        <img
                          src={item.product.image || item.product.thumbnail}
                          alt={item.product.name}
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-semibold text-brand-dark hover:text-brand-pink line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.personalMessage && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{item.personalMessage}"
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full">
                            <button
                              onClick={() =>
                                updateQty(item.product.id, item.quantity - 1)
                              }
                              className="p-1.5 hover:text-brand-pink"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQty(item.product.id, item.quantity + 1)
                              }
                              className="p-1.5 hover:text-brand-pink"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-brand-pink">
                          ৳
                          {(
                            (item.discountPrice || item.price) * item.quantity
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          ৳{item.discountPrice || item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-44 self-start">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-bold text-lg text-brand-dark mb-4">
              Order Summary
            </h3>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3">
                  <Tag size={14} className="text-brand-pink mr-2" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent py-2 outline-none text-sm"
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !code.trim()}
                  className="px-4 bg-brand-gradient text-white font-semibold text-sm rounded-lg disabled:opacity-60"
                >
                  {couponLoading ? "…" : "Apply"}
                </button>
              </div>
              {coupon && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-600 font-semibold">
                    ✓ {coupon.code} applied
                  </p>
                  <button
                    onClick={() => {
                      setCoupon(null);
                      setCode("");
                    }}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="text-[11px] text-gray-400 mt-2">
                Try: PRIZZY10, WELCOME20, FLAT200
              </p>
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <Row label="Subtotal" value={`৳${subtotal.toLocaleString()}`} />
              <Row label="Shipping" value={`৳${shippingFee}`} />
              {discount > 0 && (
                <Row
                  label="Discount"
                  value={`-৳${discount.toLocaleString()}`}
                  accent
                />
              )}
            </div>
            <div className="flex items-baseline justify-between border-t border-gray-100 pt-4 mt-4">
              <span className="font-bold text-brand-dark">Total</span>
              <span className="text-2xl font-extrabold text-brand-pink">
                ৳{total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-5 bg-brand-gradient text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:opacity-90 shadow-brand"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              {["bKash", "Nagad", "Visa", "Mastercard", "COD"].map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-semibold"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <Link
            to="/products"
            className="block text-center text-sm text-brand-pink font-semibold mt-4 hover:underline"
          >
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, accent }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-500">{label}</span>
    <span
      className={`font-semibold ${accent ? "text-green-600" : "text-brand-dark"}`}
    >
      {value}
    </span>
  </div>
);

export default Cart;
