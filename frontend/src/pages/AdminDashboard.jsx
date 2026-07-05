import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Tag,
  FolderTree,
  Check,
  X,
  Ban,
  Eye,
  Home,
  ChevronRight,
  TrendingUp,
  Search,
} from "lucide-react";
import { toast } from "../hooks/use-toast";
import {
  useAdminOverview,
  useAdminSellers,
  useAdminProducts,
  useAdminOrders,
  useAdminUsers,
  useAdminWithdrawals,
  useAdminCoupons,
  useCategories,
  updateOrderStatus,
  createCoupon,
  deleteCoupon,
} from "../hooks/useSupabaseData";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sellers", label: "Sellers", icon: Store },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "withdrawals", label: "Withdrawals", icon: DollarSign },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "coupons", label: "Coupons", icon: Tag },
];

const statusColors = {
  placed: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
};

const AdminDashboard = () => {
  const [tab, setTab] = useState("overview");
  const { stats } = useAdminOverview();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="flex items-center hover:text-brand-pink">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} />
        <span className="text-brand-dark font-medium">Admin Dashboard</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <aside className="lg:col-span-1">
          <div className="bg-brand-dark rounded-2xl p-5 text-white mb-4">
            <p className="text-xs font-semibold opacity-80">ADMIN PANEL</p>
            <p className="font-bold text-lg mt-1">Prizzy Control</p>
            <p className="text-xs opacity-70 mt-1">Manage platform</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`w-full flex items-center justify-between gap-3 px-5 py-3 text-sm font-medium hover:bg-brand-pink/5 ${tab === n.id ? "text-brand-pink bg-brand-pink/5 border-l-4 border-brand-pink" : "text-gray-600 border-l-4 border-transparent"}`}
              >
                <div className="flex items-center gap-3">
                  <n.icon size={16} /> {n.label}
                </div>
                {n.id === "sellers" && stats?.pendingApprovals?.sellers > 0 && (
                  <span className="text-[10px] font-bold bg-brand-pink text-white px-1.5 rounded-full">
                    {stats.pendingApprovals.sellers}
                  </span>
                )}
                {n.id === "products" &&
                  stats?.pendingApprovals?.products > 0 && (
                    <span className="text-[10px] font-bold bg-yellow-500 text-white px-1.5 rounded-full">
                      {stats.pendingApprovals.products}
                    </span>
                  )}
                {n.id === "withdrawals" &&
                  stats?.pendingApprovals?.withdrawals > 0 && (
                    <span className="text-[10px] font-bold bg-purple-500 text-white px-1.5 rounded-full">
                      {stats.pendingApprovals.withdrawals}
                    </span>
                  )}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-4 space-y-6">
          {tab === "overview" && <OverviewView stats={stats} />}
          {tab === "sellers" && <SellersView />}
          {tab === "products" && <ProductsApprovalView />}
          {tab === "orders" && <OrdersView />}
          {tab === "users" && <UsersView />}
          {tab === "withdrawals" && <WithdrawalsView />}
          {tab === "categories" && <CategoriesView />}
          {tab === "coupons" && <CouponsView />}
        </div>
      </div>
    </div>
  );
};

const OverviewView = ({ stats }) => (
  <>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={DollarSign}
        title="Total Revenue"
        value={stats ? `৳${(stats.totalRevenue / 100000).toFixed(1)}L` : "…"}
        change="+24%"
      />
      <StatCard
        icon={ShoppingCart}
        title="Total Orders"
        value={stats?.totalOrders ?? "…"}
        change="+18%"
      />
      <StatCard
        icon={Users}
        title="Total Users"
        value={stats?.totalUsers ?? "…"}
        change="+12%"
      />
      <StatCard
        icon={Store}
        title="Active Sellers"
        value={stats?.totalSellers ?? "…"}
        change="+6%"
      />
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-brand-dark text-lg mb-4">
        Pending Approvals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PendingCard
          icon={Store}
          title="New Seller Applications"
          count={stats?.pendingApprovals?.sellers ?? 0}
          accent="#FF2D78"
        />
        <PendingCard
          icon={Package}
          title="Product Approvals"
          count={stats?.pendingApprovals?.products ?? 0}
          accent="#EAB308"
        />
        <PendingCard
          icon={DollarSign}
          title="Withdrawal Requests"
          count={stats?.pendingApprovals?.withdrawals ?? 0}
          accent="#6B21A8"
        />
      </div>
    </div>
  </>
);

const StatCard = ({ icon: Icon, title, value, change }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-brand-gradient-soft flex items-center justify-center">
        <Icon size={18} className="text-brand-pink" />
      </div>
      <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
        <TrendingUp size={12} /> {change}
      </span>
    </div>
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-2xl font-extrabold text-brand-dark">{value}</p>
  </div>
);

const PendingCard = ({ icon: Icon, title, count, accent }) => (
  <div
    className="p-5 rounded-2xl"
    style={{ background: `${accent}10`, border: `1px solid ${accent}30` }}
  >
    <Icon size={24} style={{ color: accent }} />
    <p className="text-3xl font-extrabold mt-3" style={{ color: accent }}>
      {count}
    </p>
    <p className="text-xs text-gray-600 font-semibold">{title}</p>
  </div>
);

const SellersView = () => {
  const { sellers, loading, approveSeller, rejectSeller } =
    useAdminSellers(true);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-brand-dark text-lg mb-4">
        Pending Seller Approvals
      </h3>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : sellers.length === 0 ? (
        <p className="text-sm text-gray-500">No pending sellers.</p>
      ) : (
        <div className="space-y-3">
          {sellers.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl flex-wrap"
            >
              <img
                src={
                  s.shop_logo ||
                  "https://images.unsplash.com/photo-1559779080-6970e0186790?w=200&q=80"
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brand-dark">{s.shop_name}</p>
                <p className="text-xs text-gray-500">
                  {s.category} • Applied{" "}
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const result = await approveSeller(s.id);
                    if (result?.error) {
                      toast({
                        title: "Approval error",
                        description: result.error.message,
                        variant: "destructive",
                      });
                    } else {
                      toast({ title: "✅ Seller approved" });
                    }
                  }}
                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 hover:bg-green-600"
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  onClick={async () => {
                    await rejectSeller(s.id);
                    toast({ title: "Seller rejected" });
                  }}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 hover:bg-red-600"
                >
                  <X size={12} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductsApprovalView = () => {
  const { products, loading, approveProduct, rejectProduct } =
    useAdminProducts(true);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-brand-dark text-lg mb-4">
        Pending Product Approvals
      </h3>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">No pending products.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
            >
              <img
                src={p.thumbnail}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-brand-dark line-clamp-1">
                  {p.name}
                </p>
                <p className="text-xs text-gray-500">
                  by {p.sellers?.shop_name || "Seller"} • ৳
                  {p.discountPrice || p.price}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    approveProduct(p.id);
                    toast({ title: "✅ Approved" });
                  }}
                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <Check size={14} />
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => {
                    rejectProduct(p.id);
                    toast({ title: "Rejected" });
                  }}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ADMIN_ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const OrdersView = () => {
  const { orders, loading } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    const { error } = await updateOrderStatus(orderId, newStatus);
    setUpdating(null);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else toast({ title: `Order updated to ${newStatus}` });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="font-bold text-brand-dark text-lg flex-1">All Orders</h3>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3">
          <Search size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order..."
            className="py-2 bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">All Status</option>
          {ADMIN_ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
              <th className="py-3 font-semibold">Order</th>
              <th className="py-3 font-semibold">Date</th>
              <th className="py-3 font-semibold">Items</th>
              <th className="py-3 font-semibold">Amount</th>
              <th className="py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-gray-50">
                <td className="py-3 font-semibold text-brand-dark">
                  {o.orderNumber}
                </td>
                <td className="py-3 text-gray-600">
                  {new Date(o.date).toLocaleDateString()}
                </td>
                <td className="py-3 text-gray-600">{o.items?.length ?? 0}</td>
                <td className="py-3 font-bold text-brand-pink">
                  ৳{(o.totalAmount || 0).toLocaleString()}
                </td>
                <td className="py-3 flex items-center gap-2">
                  <select
                    value={o.orderStatus || "placed"}
                    disabled={updating === o.id}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs font-bold capitalize border border-gray-200 outline-none focus:border-brand-pink ${statusColors[o.orderStatus] || "bg-gray-100"}`}
                  >
                    {ADMIN_ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>

                  {/* 🔴 COURIER INTEGRATION BUTTON */}
                  {o.orderStatus === "processing" && (
                    <button
                      onClick={() => {
                        toast({
                          title: "Courier API linking required",
                          description: `Order ${o.orderNumber} is ready for Steadfast/Pathao integration.`,
                        });
                        // Future API call: fetch(`${API_BASE}/api/courier/create-consignment`, { body: o })
                      }}
                      className="px-2 py-1 bg-brand-dark text-white text-xs font-bold rounded hover:opacity-90"
                      title="Generate Courier Consignment"
                    >
                      <Truck size={12} className="inline mr-1" /> Ship
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const UsersView = () => {
  const { users, loading, toggleBan } = useAdminUsers();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-brand-dark text-lg mb-4">
        User Management
      </h3>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                {(u.name || u.email || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-brand-dark">
                  {u.name || "—"}
                </p>
                <p className="text-xs text-gray-500">
                  {u.email} • {u.role}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded ${u.is_banned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
              >
                {u.is_banned ? "BANNED" : "ACTIVE"}
              </span>
              <button
                onClick={() => {
                  toggleBan(u.id, !u.is_banned);
                  toast({
                    title: u.is_banned ? "User unbanned" : "User banned",
                  });
                }}
                className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full hover:bg-red-200 flex items-center gap-1"
              >
                <Ban size={12} /> {u.is_banned ? "Unban" : "Ban"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WithdrawalsView = () => {
  const { withdrawals, loading, processWithdrawal } = useAdminWithdrawals();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-brand-dark text-lg mb-4">
        Withdrawal Requests
      </h3>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : withdrawals.length === 0 ? (
        <p className="text-sm text-gray-500">No pending withdrawals.</p>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl flex-wrap"
            >
              <img
                src={
                  w.sellers?.shop_logo ||
                  "https://images.unsplash.com/photo-1559779080-6970e0186790?w=200&q=80"
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brand-dark">
                  {w.sellers?.shop_name || "Seller"}
                </p>
                <p className="text-xs text-gray-500">
                  Via {w.method} • {new Date(w.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xl font-extrabold text-brand-pink">
                ৳{(w.amount || 0).toLocaleString()}
              </p>
              {w.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      processWithdrawal(w.id, "completed");
                      toast({ title: "Withdrawal processed" });
                    }}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600"
                  >
                    Process
                  </button>
                  <button
                    onClick={() => {
                      processWithdrawal(w.id, "rejected");
                      toast({ title: "Rejected" });
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full"
                  >
                    Reject
                  </button>
                </div>
              )}
              {w.status !== "pending" && (
                <span className="text-xs font-bold capitalize text-gray-500">
                  {w.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoriesView = () => {
  const { categories, loading, refetch } = useCategories();
  const [localCategories, setLocalCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: "",
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      image: "",
      sort_order: localCategories.length + 1,
    });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image || "",
      sort_order: cat.sort_order || 0,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug =
      form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      id: editing ? editing.id : slug,
      name: form.name,
      slug,
      image: form.image,
      sort_order: Number(form.sort_order),
    };

    let error;
    let data;
    if (editing) {
      const res = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editing.id)
        .select();
      error = res.error;
      data = res.data;
    } else {
      const res = await supabase.from("categories").insert(payload).select();
      error = res.error;
      data = res.data;
    }
    setSaving(false);

    if (!error) {
      toast({ title: editing ? "Category updated!" : "Category created!" });
      setShowForm(false);

      if (data && data.length > 0) {
        if (editing) {
          setLocalCategories((prev) =>
            prev
              .map((c) => (c.id === editing.id ? data[0] : c))
              .sort((a, b) => a.sort_order - b.sort_order),
          );
        } else {
          setLocalCategories((prev) =>
            [...prev, data[0]].sort((a, b) => a.sort_order - b.sort_order),
          );
        }
      } else if (refetch) {
        refetch();
      }
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-brand-dark text-lg">
            Category Management
          </h3>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-brand-gradient text-white font-semibold text-sm rounded-full hover:opacity-90"
          >
            + Add Category
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-5 p-4 bg-brand-pink/5 rounded-xl border border-brand-pink/20 space-y-3">
            <h4 className="font-bold text-brand-dark text-sm">
              {editing ? `Edit: ${editing.name}` : "New Category"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ["Name *", "name", "text", "e.g. Flowers"],
                ["Slug", "slug", "text", "auto-generated if blank"],
                ["Image URL", "image", "text", "https://..."],
                ["Sort Order", "sort_order", "number", "1"],
              ].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder={ph}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-pink text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="px-5 py-2 bg-brand-gradient text-white font-bold text-sm rounded-full hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-gray-200 text-gray-600 font-semibold text-sm rounded-full hover:border-brand-pink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {localCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-brand-pink/20"
              >
                <img
                  src={
                    c.image ||
                    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=60"
                  }
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-brand-dark truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.count || 0} active products
                  </p>
                </div>
                <button
                  onClick={() => openEdit(c)}
                  className="text-xs font-semibold text-brand-pink hover:underline shrink-0"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EMPTY_COUPON = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  minimum_order_amount: "",
  maximum_discount: "",
  usage_limit: "",
  is_active: true,
};

const CouponsView = () => {
  const { coupons, loading } = useAdminCoupons();
  const [localCoupons, setLocalCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Mirror fetched coupons into local state so we can update without refetch
  React.useEffect(() => {
    setLocalCoupons(coupons);
  }, [coupons]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value) {
      toast({
        title: "Code and discount value are required",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const { data, error } = await createCoupon({
      code: form.code.trim().toUpperCase(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      minimum_order_amount: Number(form.minimum_order_amount) || 0,
      maximum_discount: form.maximum_discount
        ? Number(form.maximum_discount)
        : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      is_active: form.is_active,
    });
    setSaving(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "✅ Coupon created!" });
    setLocalCoupons((prev) => [data, ...prev]);
    setShowForm(false);
    setForm(EMPTY_COUPON);
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    setDeleting(code);
    const { error } = await deleteCoupon(code);
    setDeleting(null);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Coupon deleted" });
    setLocalCoupons((prev) => prev.filter((c) => c.code !== code));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-brand-dark text-lg">Coupon Management</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-brand-gradient text-white font-semibold text-sm rounded-full hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Create Coupon"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 bg-brand-pink/5 rounded-2xl border border-brand-pink/20 space-y-4"
        >
          <h4 className="font-bold text-brand-dark">New Coupon</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["Code *", "code", "text"],
              ["Description", "description", "text"],
              ["Discount Value *", "discount_value", "number"],
              ["Min Order (৳)", "minimum_order_amount", "number"],
              ["Max Discount (৳)", "maximum_discount", "number"],
              ["Usage Limit", "usage_limit", "number"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-pink text-sm"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Discount Type
              </label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm({ ...form, discount_type: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-pink text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (৳)</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="coupon_active"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="accent-brand-pink"
              />
              <label
                htmlFor="coupon_active"
                className="text-sm font-semibold text-brand-dark"
              >
                Active
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-gradient text-white font-bold rounded-full text-sm hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create Coupon"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {localCoupons.map((c) => (
            <div
              key={c.code}
              className="relative p-5 rounded-2xl bg-brand-gradient text-white overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="flex items-start justify-between">
                <Tag size={20} />
                <button
                  onClick={() => handleDelete(c.code)}
                  disabled={deleting === c.code}
                  className="text-white/60 hover:text-white transition-colors"
                  title="Delete coupon"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-2xl font-extrabold mt-2">{c.code}</p>
              <p className="text-xs opacity-90">{c.description}</p>
              <p className="text-[11px] opacity-70 mt-2">
                {c.discount_type === "percentage"
                  ? `${c.discount_value}% off`
                  : `৳${c.discount_value} off`}
                {c.minimum_order_amount > 0 &&
                  ` • Min ৳${c.minimum_order_amount}`}
              </p>
              <p className="text-[11px] opacity-60 mt-1">
                Used: {c.used_count}
                {c.usage_limit ? `/${c.usage_limit}` : ""}
                {!c.is_active && " • Inactive"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
