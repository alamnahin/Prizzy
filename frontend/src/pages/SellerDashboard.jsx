import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Plus,
  ShoppingCart,
  Star,
  Settings,
  DollarSign,
  TrendingUp,
  Clock,
  Boxes,
  Home,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  Lightbulb,
  Store,
  Upload,
  ImageIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  useSellerProfile,
  useSellerProducts,
  useSellerOrders,
  useSellerStats,
  useSellerReviews,
  useSellerRevenueChart,
  useCategories,
  createProduct,
  updateProduct,
  updateOrderStatus,
} from "../hooks/useSupabaseData";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "../hooks/use-toast";
import { useVendorAI } from "../hooks/useVendorAI";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "My Products", icon: Package },
  { id: "add", label: "Add New Product", icon: Plus },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "shop", label: "Shop Settings", icon: Settings },
];

const statusColors = {
  placed: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
};

const SellerDashboard = () => {
  const [tab, setTab] = useState("dashboard");
  const { user } = useAuth();
  const { seller, loading: sellerLoading } = useSellerProfile(user?.id);
  const { orders, refetch: refetchOrders } = useSellerOrders(seller?.id);
  const stats = useSellerStats(seller?.id, orders);

  if (sellerLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-dark mb-3">
          Please log in to access your seller dashboard.
        </h1>
        <Link
          to="/login"
          className="inline-block bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full"
        >
          Login
        </Link>
      </div>
    );
  }

  // If not a seller yet, show onboarding
  if (!seller) {
    return <SellerOnboarding userId={user.id} />;
  }

  // Seller exists but is awaiting admin approval
  if (!seller.is_approved && seller.status !== "active") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-100 flex items-center justify-center mb-4">
            <Clock size={28} className="text-yellow-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-dark mb-2">
            Application Under Review
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Your seller application for <strong>{seller.shop_name}</strong> has
            been submitted and is awaiting admin approval. You'll be notified
            once it's approved — usually within 24 hours.
          </p>
          <Link
            to="/"
            className="inline-block bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
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
        <span className="text-brand-dark font-medium">Seller Dashboard</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <aside className="lg:col-span-1">
          <div className="bg-brand-gradient rounded-2xl p-5 text-white mb-4 shadow-brand">
            <p className="text-xs font-semibold opacity-90">SELLER ACCOUNT</p>
            <p className="font-bold text-lg mt-1">{seller.shop_name}</p>
            <p className="text-xs opacity-80">
              {seller.is_verified ? "Verified • " : ""}★{" "}
              {seller.rating || "New"}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-brand-pink/5 transition-colors ${tab === n.id ? "text-brand-pink bg-brand-pink/5 border-l-4 border-brand-pink" : "text-gray-600 border-l-4 border-transparent"}`}
              >
                <n.icon size={16} />
                {n.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-4 space-y-6">
          {tab === "dashboard" && (
            <DashboardView seller={seller} stats={stats} orders={orders} />
          )}
          {tab === "products" && (
            <ProductsView sellerId={seller.id} setTab={setTab} />
          )}
          {tab === "add" && (
            <AddProductView
              sellerId={seller.id}
              onSuccess={() => setTab("products")}
            />
          )}
          {tab === "orders" && (
            <OrdersView orders={orders} refetchOrders={refetchOrders} />
          )}
          {tab === "reviews" && <ReviewsView sellerId={seller.id} />}
          {tab === "earnings" && <EarningsView stats={stats} seller={seller} />}
          {tab === "shop" && <ShopSettingsView seller={seller} />}
        </div>
      </div>
    </div>
  );
};

const SellerOnboarding = ({ userId }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shop_name: "",
    category: "Gifts",
    description: "",
    phone: "",
    bkash_number: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("sellers")
      .insert({ user_id: userId, ...form });
    setLoading(false);
    if (!error) {
      toast({
        title: "Application submitted!",
        description: "Awaiting admin approval.",
      });
      // Navigate to same page — SellerDashboard will re-fetch useSellerProfile
      // and show the pending-approval screen instead of this form.
      navigate(0); // React Router v6: navigate(0) = refresh current route
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-gradient flex items-center justify-center mb-4">
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-dark">
            Become a Prizzy Seller
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Fill in your shop details to get started
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[
            ["Shop Name", "shop_name"],
            ["Phone", "phone"],
            ["bKash Number", "bkash_number"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                {label}
              </label>
              <input
                required
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm"
            >
              {[
                "Gifts",
                "Flowers",
                "Cakes",
                "Chocolates",
                "Accessories",
                "Electronics",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Shop Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 shadow-brand disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Apply to Become a Seller"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AiInsightPanel = ({ shop_name, salesData }) => {
  const { insight, loading, getInsight } = useVendorAI();

  useEffect(() => {
    if (shop_name) getInsight(shop_name, salesData);
  }, [shop_name, salesData, getInsight]);

  if (loading || !insight) {
    return (
      <div className="bg-white border border-brand-pink/20 rounded-2xl p-6 mb-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-4" />
        <div className="h-4 bg-gray-100 rounded-lg w-full mb-3" />
        <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-pink/20 rounded-2xl p-6 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-gradient text-white rounded-xl shadow-brand">
            <Sparkles size={20} />
          </div>
          <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">
            AI Morning Digest
          </h2>
        </div>
        <h3 className="text-lg font-bold text-brand-pink mb-4">
          "{insight.headline}"
        </h3>
        <ul className="space-y-3 mb-6">
          {insight.insights.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-gray-600 font-medium"
            >
              <TrendingUp
                size={16}
                className="text-brand-pink mt-0.5 flex-shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="bg-brand-gradient-soft rounded-xl p-4 border border-brand-pink/20 flex gap-3 items-start">
          <Lightbulb
            size={20}
            className="text-brand-pink flex-shrink-0 mt-0.5"
          />
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-pink block mb-1">
              Upcoming Opportunity
            </span>
            <p className="text-sm text-brand-dark font-medium">
              {insight.occasionTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ seller, stats, orders }) => {
  // FIX: use real revenue chart data derived from actual orders
  const revenueChartData = useSellerRevenueChart(orders);

  const ordersByStatus = ["placed", "processing", "shipped", "delivered"].map(
    (status) => ({
      status,
      count: orders.filter((o) => o.orders?.status === status).length,
    }),
  );

  return (
    <>
      <AiInsightPanel shop_name={seller.shop_name} salesData={stats} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          title="Total Sales"
          value={stats.totalSales}
          change="+12%"
        />
        <StatCard
          icon={DollarSign}
          title="Revenue"
          value={`৳${(stats.totalRevenue / 1000).toFixed(1)}K`}
          change="+18%"
        />
        <StatCard
          icon={Clock}
          title="Pending Orders"
          value={stats.pendingOrders}
          change=""
          warn
        />
        <StatCard
          icon={Boxes}
          title="Total Sold"
          value={seller.total_sales || stats.totalSales || 0}
          change=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-brand-dark mb-4">
            Revenue — Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#999"
                fontSize={11}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                stroke="#999"
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #FFE5EF" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF2D78"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-brand-dark mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByStatus}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="status"
                stroke="#999"
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#999"
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="count" fill="#6B21A8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mt-6 shadow-sm">
        <h3 className="font-bold text-brand-dark mb-4">Recent Orders</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="py-3 font-semibold">Order</th>
                <th className="py-3 font-semibold">Product</th>
                <th className="py-3 font-semibold">Amount</th>
                <th className="py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-b border-gray-50">
                  <td className="py-3 font-semibold text-brand-dark">
                    {o.orders?.order_number || "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          o.products?.thumbnail ||
                          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80"
                        }
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="text-xs line-clamp-1 max-w-[120px]">
                        {o.products?.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-brand-pink">
                    ৳
                    {(
                      (o.price_at_time || 0) * (o.quantity || 1)
                    ).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold capitalize ${statusColors[o.orders?.status] || "bg-gray-100"}`}
                    >
                      {o.orders?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

const StatCard = ({ icon: Icon, title, value, change, warn }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${warn ? "bg-yellow-100" : "bg-brand-gradient-soft"}`}
      >
        <Icon
          size={18}
          className={warn ? "text-yellow-700" : "text-brand-pink"}
        />
      </div>
      {change && (
        <span
          className={`text-xs font-bold flex items-center gap-0.5 ${warn ? "text-yellow-700" : "text-green-600"}`}
        >
          <TrendingUp size={12} /> {change}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 font-medium">{title}</p>
    <p className="text-2xl font-extrabold text-brand-dark mt-0.5">{value}</p>
  </div>
);

const ProductsView = ({ sellerId, setTab }) => {
  const { products, loading, refetch } = useSellerProducts(sellerId);
  const { categories } = useCategories();
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const openEdit = (p) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      price: p.originalPrice || p.price,
      discountPrice: p.discountPrice !== p.price ? p.discountPrice : "",
      stock: p.stock,
      description: p.shortDescription || "",
      occasion: p.occasion || [],
      giftFor: p.giftFor || [],
      isCustomizable: p.isCustomizable || false,
      deliveryTime: p.deliveryTime || "2-3 days",
      thumbnail: p.thumbnail || "",
    });
    setEditCategory(p.category || "");
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditForm(null);
  };

  const toggleArr = (key, val) =>
    setEditForm((f) => ({
      ...f,
      [key]: f[key].includes(val)
        ? f[key].filter((x) => x !== val)
        : [...f[key], val],
    }));

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editCategory) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await updateProduct(
      editingProduct.id,
      editForm,
      editCategory,
    );
    setSaving(false);
    if (!error) {
      toast({ title: "✅ Product updated!" });
      closeEdit();
      refetch();
    } else
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    refetch();
    toast({ title: "Product deleted" });
  };

  if (editingProduct && editForm) {
    return (
      <form
        onSubmit={handleSaveEdit}
        className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-brand-dark text-lg">Edit Product</h3>
          <button
            type="button"
            onClick={closeEdit}
            className="text-gray-400 hover:text-brand-pink"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Product Name"
            value={editForm.name}
            onChange={(v) => setEditForm({ ...editForm, name: v })}
          />
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Category
            </label>
            <select
              required
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm bg-white"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Price (৳)"
            type="number"
            value={editForm.price}
            onChange={(v) => setEditForm({ ...editForm, price: v })}
          />
          <Field
            label="Discount Price (৳)"
            type="number"
            value={editForm.discountPrice}
            onChange={(v) => setEditForm({ ...editForm, discountPrice: v })}
          />
          <Field
            label="Stock Quantity"
            type="number"
            value={editForm.stock}
            onChange={(v) => setEditForm({ ...editForm, stock: v })}
          />
          <Field
            label="Delivery Time"
            value={editForm.deliveryTime}
            onChange={(v) => setEditForm({ ...editForm, deliveryTime: v })}
          />
          <div className="md:col-span-2">
            <Field
              label="Thumbnail URL"
              value={editForm.thumbnail}
              onChange={(v) => setEditForm({ ...editForm, thumbnail: v })}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Description
          </label>
          <textarea
            rows={4}
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-2 block">
            Occasion Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {["Birthday", "Anniversary", "Wedding", "Eid", "Valentine"].map(
              (o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => toggleArr("occasion", o)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${editForm.occasion.includes(o) ? "bg-brand-pink text-white border-brand-pink" : "bg-white text-gray-600 border-gray-200 hover:border-brand-pink"}`}
                >
                  {o}
                </button>
              ),
            )}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-2 block">
            Gift For
          </label>
          <div className="flex flex-wrap gap-2">
            {["Him", "Her", "Kids", "Parents"].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => toggleArr("giftFor", g)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${editForm.giftFor.includes(g) ? "bg-brand-pink text-white border-brand-pink" : "bg-white text-gray-600 border-gray-200 hover:border-brand-pink"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={editForm.isCustomizable}
            onChange={(e) =>
              setEditForm({ ...editForm, isCustomizable: e.target.checked })
            }
            className="w-4 h-4 accent-brand-pink"
          />
          <span className="text-sm font-semibold text-brand-dark">
            Allow personal message
          </span>
        </label>
        <div className="flex gap-3 pt-5 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 shadow-brand disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={closeEdit}
            className="px-8 py-3 border border-gray-200 rounded-full font-semibold text-gray-600 hover:border-brand-pink hover:text-brand-pink"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-bold text-brand-dark text-lg">
          My Products ({products.length})
        </h3>
        <button
          onClick={() => setTab("add")}
          className="px-5 py-2.5 bg-brand-gradient text-white font-semibold text-sm rounded-full flex items-center gap-2 hover:opacity-90 shadow-brand"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500 py-10 text-center">
          No products yet. Add your first product!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="py-3 font-semibold">Product</th>
                <th className="py-3 font-semibold">Price</th>
                <th className="py-3 font-semibold">Stock</th>
                <th className="py-3 font-semibold">Sold</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail}
                        alt=""
                        className="w-10 h-10 rounded object-cover border border-gray-100"
                      />
                      <span className="font-medium text-brand-dark line-clamp-1 max-w-[180px]">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-brand-pink">
                    ৳{p.discountPrice || p.price}
                  </td>
                  <td className="py-3">{p.stock}</td>
                  <td className="py-3">{p.sold}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {p.is_active ? "ACTIVE" : "PENDING"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${p.slug}`}
                        className="p-1.5 text-gray-400 hover:text-brand-pink"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-brand-pink"
                        title="Edit product"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AddProductView = ({ sellerId, onSuccess }) => {
  const { categories } = useCategories();
  const [form, setForm] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stock: "",
    description: "",
    occasion: [],
    giftFor: [],
    isCustomizable: false,
    deliveryTime: "2-3 days",
    thumbnail: "",
  });
  const [saving, setSaving] = useState(false);

  const toggleArr = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val)
        ? f[key].filter((x) => x !== val)
        : [...f[key], val],
    }));

  const [selectedCategory, setSelectedCategory] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast({ title: "Please select a category" });
      return;
    }
    setSaving(true);
    const { error } = await createProduct(sellerId, form, selectedCategory);
    setSaving(false);
    if (!error) {
      toast({
        title: "✨ Product submitted!",
        description: "Awaiting admin approval.",
      });
      onSuccess();
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm"
    >
      <h3 className="font-bold text-brand-dark text-lg">Add New Product</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label="Product Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Category
          </label>
          <select
            required
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm bg-white"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Price (৳)"
          type="number"
          value={form.price}
          onChange={(v) => setForm({ ...form, price: v })}
        />
        <Field
          label="Discount Price (৳)"
          type="number"
          value={form.discountPrice}
          onChange={(v) => setForm({ ...form, discountPrice: v })}
        />
        <Field
          label="Stock Quantity"
          type="number"
          value={form.stock}
          onChange={(v) => setForm({ ...form, stock: v })}
        />
        <Field
          label="Delivery Time"
          placeholder="e.g. 2-3 days"
          value={form.deliveryTime}
          onChange={(v) => setForm({ ...form, deliveryTime: v })}
        />
        <div className="md:col-span-2">
          <Field
            label="Thumbnail URL"
            placeholder="https://..."
            value={form.thumbnail}
            onChange={(v) => setForm({ ...form, thumbnail: v })}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
          Description
        </label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm resize-none"
          placeholder="Describe your product…"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 mb-2 block">
          Occasion Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {["Birthday", "Anniversary", "Wedding", "Eid", "Valentine"].map(
            (o) => (
              <button
                type="button"
                key={o}
                onClick={() => toggleArr("occasion", o)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${form.occasion.includes(o) ? "bg-brand-pink text-white border-brand-pink" : "bg-white text-gray-600 border-gray-200 hover:border-brand-pink"}`}
              >
                {o}
              </button>
            ),
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 mb-2 block">
          Gift For
        </label>
        <div className="flex flex-wrap gap-2">
          {["Him", "Her", "Kids", "Parents"].map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => toggleArr("giftFor", g)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${form.giftFor.includes(g) ? "bg-brand-pink text-white border-brand-pink" : "bg-white text-gray-600 border-gray-200 hover:border-brand-pink"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isCustomizable}
          onChange={(e) =>
            setForm({ ...form, isCustomizable: e.target.checked })
          }
          className="w-4 h-4 accent-brand-pink"
        />
        <span className="text-sm font-semibold text-brand-dark">
          Allow personal message
        </span>
      </label>

      <div className="flex gap-3 pt-5 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 shadow-brand disabled:opacity-60"
        >
          {saving ? "Submitting…" : "Submit for Approval"}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="px-8 py-3 border border-gray-200 rounded-full font-semibold text-gray-600 hover:border-brand-pink hover:text-brand-pink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm"
    />
  </div>
);

const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// FIX: useSellerOrders returns order_items rows where o.orders is the parent order.
// We must use o.orders.id (the actual orders table PK) for updateOrderStatus, and
// use o.id (the order_item PK) for the local `updating` spinner key.
const OrdersView = ({ orders, refetchOrders }) => {
  const [updating, setUpdating] = useState(null);

  const handleStatusChange = async (orderItemId, ordersTableId, newStatus) => {
    if (!ordersTableId) {
      toast({
        title: "Cannot update: order ID missing",
        variant: "destructive",
      });
      return;
    }
    setUpdating(orderItemId);
    const { error } = await updateOrderStatus(ordersTableId, newStatus);
    setUpdating(null);
    if (error)
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: `Order marked as ${newStatus}` });
      if (refetchOrders) refetchOrders();
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-brand-dark text-lg mb-4">Orders</h3>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl flex-wrap gap-4"
            >
              <div>
                <p className="font-bold text-brand-dark">
                  {o.orders?.order_number || "—"}
                </p>
                <p className="text-xs text-gray-500">
                  {o.created_at
                    ? new Date(o.created_at).toLocaleDateString()
                    : "—"}{" "}
                  • Qty: {o.quantity}
                </p>
              </div>
              {/* FIX: use o.id (order_item id) as the spinner key, and o.orders?.id as the DB target */}
              <select
                value={o.orders?.status || "placed"}
                disabled={updating === o.id}
                onChange={(e) =>
                  handleStatusChange(o.id, o.orders?.id, e.target.value)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize border border-gray-200 outline-none focus:border-brand-pink ${statusColors[o.orders?.status] || "bg-gray-100"}`}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <p className="font-extrabold text-brand-pink text-lg">
                ৳{((o.price_at_time || 0) * (o.quantity || 1)).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewsView = ({ sellerId }) => {
  const { reviews, loading } = useSellerReviews(sellerId);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-brand-dark text-lg mb-4">
          Customer Reviews
        </h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-extrabold text-brand-pink">
              {avgRating}
            </div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={
                    s <= Math.round(avgRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200 fill-gray-200"
                  }
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {reviews.length} reviews
            </p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right font-medium text-gray-600">
                    {stars}
                  </span>
                  <Star
                    size={11}
                    className="text-yellow-400 fill-yellow-400 shrink-0"
                  />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <Star
            size={36}
            className="mx-auto text-gray-200 fill-gray-200 mb-3"
          />
          <p className="text-gray-500 text-sm">
            No reviews yet. Reviews will appear here once customers leave
            feedback on your products.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
          {reviews.map((r) => (
            <div key={r.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(r.profiles?.name || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-brand-dark text-sm">
                      {r.profiles?.name || "Customer"}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-0.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= r.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    ))}
                  </div>
                  {r.products && (
                    <p className="text-xs text-gray-400 mb-1.5">
                      on{" "}
                      <span className="text-brand-pink font-medium">
                        {r.products.name}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600">{r.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EarningsView = ({ stats, seller }) => {
  const [amount, setAmount] = useState("");
  const [requesting, setRequesting] = useState(false);

  const requestWithdrawal = async () => {
    const num = Number(amount);
    if (!num || num < 500) {
      toast({ title: "Minimum withdrawal is ৳500", variant: "destructive" });
      return;
    }

    const bkashNumber = seller.bkash_number;
    if (!bkashNumber) {
      toast({
        title: "bKash number missing",
        description: "Please add a bKash number in your Shop Settings first.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);

    // Call the secure Postgres function instead of inserting directly
    const { data, error } = await supabase.rpc("request_withdrawal", {
      p_seller_id: seller.id,
      p_amount: num,
      p_method: "bkash",
      p_account_number: bkashNumber,
    });

    setRequesting(false);

    if (!error) {
      toast({
        title: "✅ Withdrawal requested!",
        description: "Admin will process it within 2 business days.",
      });
      setAmount("");
    } else {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`৳${(stats.totalRevenue || 0).toLocaleString()}`}
          change="+18%"
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.totalSales}
          change=""
        />
        <StatCard
          icon={Clock}
          title="Pending Orders"
          value={stats.pendingOrders}
          change=""
          warn
        />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-brand-dark text-lg mb-1">
          Request Withdrawal
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Minimum ৳500. Processed via bKash to{" "}
          <strong>{seller.bkash_number || "your account"}</strong> within 2
          business days.
        </p>
        <div className="flex gap-3 max-w-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
              ৳
            </span>
            <input
              type="number"
              min={500}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm"
            />
          </div>
          <button
            onClick={requestWithdrawal}
            disabled={requesting}
            className="px-6 py-2.5 bg-brand-gradient text-white font-bold rounded-full text-sm hover:opacity-90 shadow-brand disabled:opacity-60"
          >
            {requesting ? "Requesting…" : "Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ShopSettingsView = ({ seller }) => {
  const [form, setForm] = useState({
    shop_name: seller.shop_name || "",
    description: seller.description || "",
    phone: seller.phone || "",
    bkash_number: seller.bkash_number || "",
    shop_logo: seller.shop_logo || "",
    shop_banner: seller.shop_banner || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // ── image upload helper ──────────────────────────────────────
  const uploadImage = async (file, type) => {
    const setUploading =
      type === "logo" ? setUploadingLogo : setUploadingBanner;
    setUploading(true);

    // Validate
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      setUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5 MB", variant: "destructive" });
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `sellers/${seller.id}/${type}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("shop-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      // Bucket might not exist yet — fall back to object URL so the UI still works
      if (
        uploadError.message?.includes("Bucket not found") ||
        uploadError.statusCode === "404"
      ) {
        toast({
          title: "Storage bucket missing",
          description:
            "Create a public bucket named 'shop-images' in Supabase Storage, then try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
      }
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("shop-images").getPublicUrl(path);
    const field = type === "logo" ? "shop_logo" : "shop_banner";
    setForm((f) => ({ ...f, [field]: data.publicUrl }));
    toast({ title: `${type === "logo" ? "Logo" : "Cover photo"} uploaded!` });
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("sellers")
      .update(form)
      .eq("id", seller.id);
    setSaving(false);
    if (!error) toast({ title: "✅ Shop updated!" });
    else
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
  };

  // ── reusable image upload card ────────────────────────────────
  const ImageUploadCard = ({ field, label, aspect, uploading }) => {
    const value = form[field];
    const type = field === "shop_logo" ? "logo" : "banner";
    return (
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-2 block flex items-center gap-1.5">
          <ImageIcon size={12} /> {label}
        </label>
        {/* Preview */}
        {value ? (
          <div
            className={`relative rounded-xl overflow-hidden border border-gray-200 mb-2 ${aspect}`}
          >
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setForm((f) => ({ ...f, [field]: "" }))}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div
            className={`rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 mb-2 ${aspect}`}
          >
            <div className="text-center text-gray-400">
              <ImageIcon size={28} className="mx-auto mb-1 opacity-40" />
              <p className="text-xs">No image set</p>
            </div>
          </div>
        )}
        {/* Upload button */}
        <label
          className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer transition-colors
          ${uploading ? "opacity-50 pointer-events-none" : "hover:border-brand-pink/50 hover:text-brand-pink hover:bg-pink-50/30"}`}
        >
          {uploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />{" "}
              Uploading…
            </>
          ) : (
            <>
              <Upload size={13} /> Upload {label}
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) =>
              e.target.files?.[0] && uploadImage(e.target.files[0], type)
            }
          />
        </label>
        {/* Or paste URL */}
        <input
          type="url"
          placeholder="…or paste an image URL"
          value={value}
          onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
          className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-xs text-gray-500 placeholder-gray-300"
        />
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
      <h3 className="font-bold text-brand-dark text-lg">Shop Settings</h3>

      {/* ── Image section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ImageUploadCard
          field="shop_logo"
          label="Shop Logo"
          aspect="h-36"
          uploading={uploadingLogo}
        />
        <ImageUploadCard
          field="shop_banner"
          label="Cover Photo"
          aspect="h-36"
          uploading={uploadingBanner}
        />
      </div>

      <p className="text-[11px] text-gray-400 -mt-2">
        Recommended: Logo 200×200 px · Cover photo 1200×400 px. Max 5 MB each.{" "}
        Requires a public Supabase Storage bucket named{" "}
        <code className="bg-gray-100 px-1 rounded">shop-images</code>.
      </p>

      {/* ── Text fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          ["Shop Name", "shop_name"],
          ["Phone", "phone"],
          ["bKash Number", "bkash_number"],
        ].map(([label, key]) => (
          <Field
            key={key}
            label={label}
            value={form[key]}
            onChange={(v) => setForm({ ...form, [key]: v })}
          />
        ))}
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
          Description
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm resize-none"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-8 py-3 bg-brand-gradient text-white font-bold rounded-full text-sm hover:opacity-90 shadow-brand disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
};

export default SellerDashboard;
