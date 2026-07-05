import React, { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Store,
  Star,
  MapPin,
  Clock,
  Package,
  Heart,
  Share2,
  ChevronRight,
  BadgeCheck,
  ArrowLeft,
  RefreshCw,
  Shield,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Sparkles,
} from "lucide-react";
import {
  useShopProfile,
  useShopFollow,
  useSellerProducts,
  useSellerReviews,
} from "../hooks/useSupabaseData";
import { useAuth } from "../context/AuthContext";
import { toast } from "../hooks/use-toast";
import ProductCard from "../components/product/ProductCard";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-BD", {
    month: "long",
    year: "numeric",
  });
}

function StarRow({ rating, size = 14 }) {
  const full = Math.floor(rating || 0);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < full
              ? "fill-yellow-400 text-yellow-400"
              : i === full && half
                ? "fill-yellow-400/40 text-yellow-400"
                : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </span>
  );
}

// ── Products tab ──────────────────────────────────────────────────────────────

const OCCASION_FILTERS = [
  "All",
  "Birthday",
  "Anniversary",
  "Wedding",
  "Eid",
  "Just Because",
];

function ProductsGrid({ sellerId }) {
  const { products, loading } = useSellerProducts(sellerId);
  const [activeFilter, setActiveFilter] = useState("All");
  const [sort, setSort] = useState("popular");

  const visible = useMemo(() => {
    let arr = [...products].filter(
      (p) => p.status !== "pending" && p.is_active !== false,
    );
    if (activeFilter !== "All") {
      arr = arr.filter((p) =>
        (p.occasion || []).some((o) =>
          o.toLowerCase().includes(activeFilter.toLowerCase()),
        ),
      );
    }
    if (sort === "price_asc")
      arr.sort(
        (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price),
      );
    else if (sort === "price_desc")
      arr.sort(
        (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price),
      );
    else if (sort === "newest")
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return arr;
  }, [products, activeFilter, sort]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter + sort bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 overflow-x-auto scrollbar-hide bg-gray-50/40">
        <div className="flex gap-2 flex-1">
          {OCCASION_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                activeFilter === cat
                  ? "bg-brand-gradient text-white border-transparent shadow-sm"
                  : "border-gray-200 text-gray-500 bg-white hover:border-brand-pink/40 hover:text-brand-pink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="shrink-0 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none text-gray-600 cursor-pointer"
        >
          <option value="popular">Popular</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="py-24 text-center text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No products found</p>
          <p className="text-xs mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews tab ───────────────────────────────────────────────────────────────

function ReviewsTab({ sellerId }) {
  const { reviews, loading } = useSellerReviews(sellerId);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-24 text-center text-gray-400">
        <Star size={48} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm font-medium">No reviews yet</p>
        <p className="text-xs mt-1">Be the first to buy and leave a review</p>
      </div>
    );
  }

  const avgRating =
    reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Rating summary */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100/60 rounded-2xl p-6 flex items-center gap-8">
        <div className="text-center shrink-0">
          <div className="text-5xl font-extrabold text-brand-dark leading-none">
            {avgRating.toFixed(1)}
          </div>
          <div className="mt-2">
            <StarRow rating={avgRating} size={18} />
          </div>
          <div className="text-xs text-gray-500 mt-1.5">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {dist.map(({ n, count }) => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-3 text-right">{n}</span>
              <Star
                size={10}
                className="fill-yellow-400 text-yellow-400 shrink-0"
              />
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gradient rounded-full transition-all"
                  style={{
                    width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-5 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="divide-y divide-gray-100">
        {reviews.map((r) => (
          <div key={r.id} className="py-5">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-brand-gradient-soft flex items-center justify-center text-sm font-bold text-brand-pink shrink-0">
                {(r.profiles?.name || "A")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-brand-dark">
                    {r.profiles?.name || "Anonymous"}
                  </p>
                  {r.products?.name && (
                    <Link
                      to={`/products/${r.products.slug}`}
                      className="text-xs text-brand-pink hover:underline line-clamp-1 max-w-[160px]"
                    >
                      {r.products.name}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRow rating={r.rating} size={12} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("en-BD")}
                  </span>
                </div>
              </div>
            </div>
            {r.comment && (
              <p className="text-sm text-gray-600 leading-relaxed ml-13 pl-1">
                {r.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── About tab ─────────────────────────────────────────────────────────────────

function AboutTab({ shop }) {
  const infoItems = [
    { icon: MapPin, label: "Location", value: "Bangladesh" },
    {
      icon: Calendar,
      label: "Member since",
      value: formatDate(shop.created_at),
    },
    {
      icon: Package,
      label: "Products listed",
      value: shop.total_products != null ? String(shop.total_products) : "—",
    },
    { icon: Clock, label: "Typical shipping", value: "1–3 business days" },
    { icon: RefreshCw, label: "Return window", value: "7 days" },
    { icon: Shield, label: "Buyer protection", value: "Prizzy guarantee" },
  ];

  return (
    <div className="p-6 space-y-6">
      {shop.description && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100/60 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-brand-dark mb-3 flex items-center gap-2">
            <Store size={15} className="text-brand-pink" /> About this shop
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {shop.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {infoItems.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl hover:border-brand-pink/20 hover:bg-pink-50/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-brand-pink" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                {label}
              </p>
              <p className="text-sm font-semibold text-brand-dark">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = ["Products", "Reviews", "About"];

export default function ShopProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shop, loading: shopLoading } = useShopProfile(sellerId);
  const {
    followed,
    count: followerCount,
    toggle: toggleFollow,
  } = useShopFollow(sellerId, user?.id);
  const { products } = useSellerProducts(sellerId);
  const { reviews } = useSellerReviews(sellerId);
  const [activeTab, setActiveTab] = useState("Products");

  const activeProducts = products.filter(
    (p) => p.status !== "pending" && p.is_active !== false,
  );
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      : null;
  const positiveRatingPct =
    avgRating != null ? `${Math.round(avgRating * 20)}%` : "—";

  const handleFollow = async () => {
    if (!user) {
      toast({ title: "Sign in to follow shops", variant: "destructive" });
      navigate("/login");
      return;
    }
    await toggleFollow();
    toast({ title: followed ? "Unfollowed shop" : "Now following this shop!" });
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: shop?.shop_name, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Shop link copied to clipboard!" });
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (shopLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-72 bg-gray-200 w-full" />
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gray-200" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-6 w-56 bg-gray-200 rounded" />
              <div className="h-4 w-80 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-pink/10 flex items-center justify-center mx-auto mb-5">
          <Store size={36} className="text-brand-pink opacity-50" />
        </div>
        <h2 className="text-2xl font-extrabold text-brand-dark mb-2">
          Shop not found
        </h2>
        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
          This shop may have been removed or the link is incorrect.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Browse all products →
        </Link>
      </div>
    );
  }

  const displayRating = avgRating ?? shop.rating ?? 0;
  const isBannerUrl = shop.shop_banner?.startsWith("http");
  const bannerStyle = isBannerUrl
    ? {
        backgroundImage: `url(${shop.shop_banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background:
          shop.shop_banner ||
          "linear-gradient(135deg, #FF2D78 0%, #6B21A8 100%)",
      };

  return (
    <div className="bg-white min-h-screen">
      {/* ── FULL-WIDTH HERO BANNER ─────────────────────────────────────────── */}
      <div className="relative w-full h-64 md:h-80 lg:h-96" style={bannerStyle}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back + breadcrumb */}
        <div className="absolute top-5 left-0 right-0 max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white text-xs font-medium transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Verified badge */}
          {shop.status === "active" && (
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-brand-pink shadow-sm">
              <BadgeCheck size={13} />
              Verified Seller
            </div>
          )}
        </div>

        {/* Shop name overlaid on banner (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/70 mb-3">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={10} />
            <Link to="/products" className="hover:text-white transition-colors">
              Products
            </Link>
            <ChevronRight size={10} />
            <span className="text-white font-semibold truncate max-w-[200px]">
              {shop.shop_name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── SHOP IDENTITY BAR (logo + name + actions) ─────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            {/* Logo — overlaps the banner seam */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0 -mt-10 md:-mt-12 ring-2 ring-gray-100">
              {shop.shop_logo ? (
                <img
                  src={shop.shop_logo}
                  alt={shop.shop_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-gradient flex items-center justify-center text-2xl md:text-3xl font-extrabold text-white">
                  {(shop.shop_name || "S")[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-brand-dark leading-tight truncate">
                  {shop.shop_name}
                </h1>
                {shop.category && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full shrink-0">
                    {shop.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {displayRating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <StarRow rating={displayRating} size={12} />
                    <span className="font-bold text-brand-dark text-xs">
                      {displayRating.toFixed(1)}
                    </span>
                    {reviews.length > 0 && (
                      <span className="text-gray-400 text-xs">
                        ({reviews.length})
                      </span>
                    )}
                  </span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={10} />
                  Bangladesh
                </span>
                {followerCount > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users size={10} />
                    {followerCount} followers
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleFollow}
                className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                  followed
                    ? "bg-pink-50 text-brand-pink border-2 border-brand-pink/30"
                    : "bg-brand-gradient text-white hover:opacity-90"
                }`}
              >
                <Heart
                  size={14}
                  className={followed ? "fill-brand-pink" : ""}
                />
                {followed ? "Following" : "Follow"}
              </button>
              {/* Mobile follow: icon only */}
              <button
                onClick={handleFollow}
                className={`sm:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  followed
                    ? "bg-pink-50 text-brand-pink border-2 border-brand-pink/30"
                    : "bg-brand-gradient text-white"
                }`}
                aria-label="Follow shop"
              >
                <Heart
                  size={16}
                  className={followed ? "fill-brand-pink" : ""}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-pink hover:border-brand-pink/30 transition-all"
                aria-label="Share shop"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>

          {/* Description snippet */}
          {shop.description && (
            <p className="text-sm text-gray-500 pb-3 leading-relaxed line-clamp-2 max-w-3xl">
              {shop.description}
            </p>
          )}
        </div>
      </div>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            {[
              {
                icon: Package,
                label: "Products",
                value:
                  activeProducts.length > 0
                    ? activeProducts.length
                    : (shop.total_products ?? "—"),
              },
              {
                icon: TrendingUp,
                label: "Orders fulfilled",
                value: shop.total_sales
                  ? shop.total_sales >= 1000
                    ? `${(shop.total_sales / 1000).toFixed(1)}K`
                    : shop.total_sales
                  : "—",
              },
              {
                icon: Award,
                label: "Positive rating",
                value: positiveRatingPct,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="py-5 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Icon size={15} className="text-brand-pink opacity-70" />
                </div>
                <div className="text-2xl font-extrabold text-brand-dark">
                  {value}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS + CONTENT ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 bg-white sticky top-[73px] z-10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === tab
                  ? "text-brand-pink"
                  : "text-gray-500 hover:text-brand-dark"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-gradient rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content — full width within the max-7xl container */}
        <div className="py-2">
          {activeTab === "Products" && <ProductsGrid sellerId={sellerId} />}
          {activeTab === "Reviews" && <ReviewsTab sellerId={sellerId} />}
          {activeTab === "About" && <AboutTab shop={shop} />}
        </div>
      </div>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <div className="bg-brand-gradient rounded-3xl p-8 md:p-10 text-center text-white shadow-brand-lg overflow-hidden relative">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4">
              <Sparkles size={13} />
              Discover More
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
              Love what you see?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6 text-sm">
              Explore hundreds of unique gift shops and find the perfect present
              for every occasion.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-brand-pink font-bold px-6 py-3 rounded-full hover:bg-brand-dark hover:text-white transition-colors"
            >
              Browse All Gifts →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
