import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Package, Home, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const { user } = useAuth();
  const hasSentEmail = useRef(false);

  useEffect(() => {
    // Helper to send the email
    const triggerEmail = async (orderData) => {
      if (hasSentEmail.current || !user?.email) return;
      hasSentEmail.current = true;
      try {
        await fetch(`${API_BASE}/api/emails/order-confirmation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: orderData.orderNumber,
            email: user.email,
            name: orderData.address.name || "Customer",
            totalAmount: orderData.total,
            items: orderData.items,
          }),
        });
      } catch (e) {
        console.error("Failed to send gateway email", e);
      }
    };

    const stored = localStorage.getItem("prizzy_last_order");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.orderNumber === orderNumber) {
          setOrder(parsed);
          localStorage.removeItem("prizzy_last_order");
          // If they paid online, trigger the email now!
          if (parsed.payment !== "cod") triggerEmail(parsed);
          return;
        }
      } catch (_) {
        /* ignore */
      }
    }

    // 2. Fallback: fetch from Supabase so returning to this URL always works.
    async function fetchFromDB() {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id, order_number, created_at, total_amount, payment_method,
          shipping_address,
          order_items (
            quantity, price_at_time, personal_message,
            products ( id, name, thumbnail )
          )
        `,
        )
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (error || !data) return;

      const formattedOrder = {
        orderNumber: data.order_number,
        date: data.created_at,
        total: data.total_amount,
        payment: data.payment_method,
        address: data.shipping_address || {},
        items: (data.order_items || []).map((it) => ({
          price: it.price_at_time,
          quantity: it.quantity,
          product: it.products || {
            id: it.product_id,
            name: "Product",
            thumbnail: "",
          },
        })),
      };

      setOrder(formattedOrder);
      // Trigger email if fetched from DB
      triggerEmail(formattedOrder);
    }

    fetchFromDB();
  }, [orderNumber, user]);

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

        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-2">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-gray-500 mb-1">
          Thank you for shopping with Prizzy.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          A confirmation email is on the way.
        </p>

        <div className="inline-flex items-center gap-2 bg-brand-gradient-soft border border-brand-pink/20 px-5 py-2.5 rounded-full mb-8">
          <Package size={16} className="text-brand-pink" />
          <span className="text-sm font-semibold text-brand-dark">
            Order #{orderNumber}
          </span>
        </div>

        {order && (
          <div className="text-left bg-gray-50 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-brand-dark">Order Summary</h3>
              <span className="text-xs text-gray-500">
                {new Date(order.date).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-2 mb-3">
              {(order.items || []).map((item, idx) => (
                <div
                  key={item.product?.id ?? idx}
                  className="flex items-center gap-3 text-sm"
                >
                  <img
                    src={
                      item.product?.thumbnail ||
                      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80"
                    }
                    alt=""
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="flex-1 text-gray-700 line-clamp-1">
                    {item.product?.name ?? "Product"} × {item.quantity}
                  </span>
                  <span className="font-semibold text-brand-dark">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-brand-dark">
              <span>Total</span>
              <span className="text-brand-pink">
                ৳{(order.total || 0).toLocaleString()}
              </span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p>
                <strong>Deliver to:</strong>{" "}
                {typeof order.address === "object"
                  ? `${order.address.name ?? ""}, ${order.address.street ?? order.address.address ?? ""}, ${order.address.city ?? ""}`
                  : order.address}
              </p>
              <p>
                <strong>Payment:</strong>{" "}
                {order.payment === "cod"
                  ? "Cash on Delivery"
                  : (order.payment || "").toUpperCase()}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/profile?tab=orders"
            className="px-6 py-3 border-2 border-brand-pink text-brand-pink font-bold rounded-full hover:bg-brand-pink hover:text-white flex items-center justify-center gap-2"
          >
            <Package size={16} /> Track Order
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 shadow-brand flex items-center justify-center gap-2"
          >
            <Home size={16} /> Continue Shopping
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 text-sm text-gray-500">
          <button
            className="flex items-center gap-1.5 hover:text-brand-pink"
            onClick={() => {
              const text = `I just placed order #${orderNumber} on Prizzy 🎁 Check out amazing gifts at prizzy.com`;
              window.open(
                `https://wa.me/?text=${encodeURIComponent(text)}`,
                "_blank",
              );
            }}
          >
            <MessageCircle size={14} /> Share on WhatsApp
          </button>
          <span>•</span>
          <button
            className="flex items-center gap-1.5 hover:text-brand-pink"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Prizzy Order",
                  text: `Order #${orderNumber} confirmed!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                // toast is not in scope here — use alert as fallback
                alert("Link copied to clipboard!");
              }
            }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
