import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// Helper to safely parse stringified arrays from the database
const safeParseArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const formatProduct = (p) => ({
  ...p,
  category: String(p.category || "")
    .toLowerCase()
    .trim(),
  image: p.thumbnail,
  sellerName: p.sellers?.shop_name || "Verified Seller",
  // Expose full seller object so ProductDetail can use logo, rating etc.
  seller: p.sellers || null,
  price: p.discount_price ? p.discount_price : p.price || 0,
  originalPrice: p.discount_price ? p.price : null,
  discountPrice: p.discount_price || p.price || 0,
  discountPercent: p.discount_percent || 0,
  giftFor: safeParseArray(p.gift_for),
  occasion: safeParseArray(p.occasion),
  images: safeParseArray(p.images),
  shortDescription: p.short_description || "",
  deliveryTime: p.delivery_time || "",
  isCustomizable: p.is_customizable || false,
  numReviews: p.num_reviews || 0,
  rating: p.rating || 0,
  sold: p.sold || 0,
  stock: p.stock || 0,
});

// ============================================================
// 1. PUBLIC CATALOGUE (storefront — only is_active products)
// ============================================================

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`*, sellers(shop_name, shop_logo, rating, total_sales)`)
        .eq("is_active", true);

      if (!error && data) {
        setProducts(data.map(formatProduct));
      } else {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return { products, loading };
}

export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) {
        setLoading(false);
        return;
      }
      // FIX: fetch full seller data (shop_logo, rating, total_sales) so ProductDetail
      // doesn't fall back to hardcoded placeholder values.
      const { data, error } = await supabase
        .from("products")
        .select(`*, sellers(shop_name, shop_logo, rating, total_sales)`)
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product:", error);
        setError(error);
      } else if (data) {
        setProduct(formatProduct(data));
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*, products(id, is_active)")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setCategories(
          data.map((c) => {
            const activeProductsCount = c.products
              ? c.products.filter((p) => p.is_active).length
              : 0;

            return {
              ...c,
              id: String(c.id).toLowerCase().trim(),
              count: activeProductsCount,
            };
          }),
        );
      } else {
        console.error("Error fetching categories:", error);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return { categories, loading };
}

// Fetch a specific set of products by id (e.g. for a wishlist)
export function useProductsByIds(ids = []) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify([...ids].sort());

  useEffect(() => {
    async function run() {
      if (!ids || ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`*, sellers(shop_name, shop_logo, rating, total_sales)`)
        .in("id", ids);
      if (!error && data) setProducts(data.map(formatProduct));
      setLoading(false);
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { products, loading };
}

// ============================================================
// 2. ORDERS (customer-facing)
// ============================================================

const formatOrder = (o) => ({
  id: o.id,
  orderNumber: o.order_number,
  date: o.created_at,
  orderStatus: o.status,
  paymentMethod: o.payment_method,
  paymentStatus: o.payment_status,
  subtotal: o.subtotal,
  shippingFee: o.shipping_fee,
  discount: o.discount_amount,
  totalAmount: o.total_amount,
  shippingAddress: o.shipping_address,
  estimatedDelivery: o.estimated_delivery,
  items: (o.order_items || []).map((it) => ({
    quantity: it.quantity,
    price: it.price_at_time,
    personalMessage: it.personal_message,
    product: it.products
      ? {
          id: it.products.id,
          name: it.products.name,
          thumbnail: it.products.thumbnail,
          slug: it.products.slug,
        }
      : { id: it.product_id, name: "Product", thumbnail: "" },
  })),
});

export function useUserOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items(*, products(id, name, thumbnail, slug))`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data.map(formatOrder));
    else if (error) console.error("Error fetching orders:", error);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, refetch };
}

// ============================================================
// 3. ADDRESSES
// ============================================================

export function useAddresses(userId) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (!error && data) setAddresses(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addAddress = async (userId, addr) => {
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        label: addr.label || "Home",
        name: addr.name,
        phone: addr.phone,
        street: addr.street,
        city: addr.city,
        district: addr.district,
        postal_code: addr.postalCode,
        is_default: addr.isDefault || false,
      })
      .select()
      .single();
    if (!error) await refetch();
    return { data, error };
  };

  return { addresses, loading, refetch, addAddress };
}

// ============================================================
// 4. COUPONS — server-validated via RPC, never trust client math
// ============================================================

export async function validateCoupon(code, subtotal, userId) {
  const { data, error } = await supabase.rpc("validate_coupon", {
    p_code: code,
    p_subtotal: subtotal,
    p_user_id: userId || null,
  });
  if (error) return { valid: false, message: error.message };
  return data; // { valid, coupon, discount, message }
}

// ============================================================
// 5. PLACE ORDER — atomic, server-side via the place_order() RPC.
// ============================================================

export async function placeOrder(cartItems, totals, shippingInfo, opts = {}) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const items = cartItems.map((item) => {
      const product = item.product || item;
      return {
        product_id: product.id,
        seller_id: product.seller_id || product.sellerId,
        quantity: item.quantity,
        price:
          item.price ||
          item.discountPrice ||
          product.discountPrice ||
          product.price,
        personal_message: item.personalMessage || null,
      };
    });

    const { data, error } = await supabase.rpc("place_order", {
      p_user_id: userId,
      p_items: items,
      p_shipping_address: {
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
      },
      p_phone: shippingInfo.phone,
      p_payment_method: opts.paymentMethod || "cod",
      p_coupon_code: opts.couponCode || null,
      p_subtotal: totals.subtotal,
      p_shipping_fee: totals.shippingFee,
      p_discount: totals.discount,
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.message || "Order failed");

    return {
      success: true,
      orderId: data.order_id,
      orderNumber: data.order_number,
    };
  } catch (error) {
    console.error("Checkout failed:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 6. SELLER DASHBOARD DATA
// ============================================================

export function useSellerProfile(userId) {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!userId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (!error) setSeller(data);
      setLoading(false);
    }
    run();
  }, [userId]);

  return { seller, loading };
}

export function useSellerProducts(sellerId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!sellerId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data.map(formatProduct));
    setLoading(false);
  }, [sellerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, refetch };
}

export function useSellerOrders(sellerId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!sellerId) {
      setLoading(false);
      return;
    }
    // order_items already scoped to this seller via RLS
    const { data, error } = await supabase
      .from("order_items")
      .select(
        `*, products(name, thumbnail), orders(id, order_number, status, created_at, total_amount)`,
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  }, [sellerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, refetch };
}

export function useSellerStats(sellerId, sellerOrders) {
  // Derived client-side from order_items the seller is allowed to see (RLS-scoped)
  const totalSales = sellerOrders?.length || 0;
  const totalRevenue = (sellerOrders || []).reduce(
    (sum, o) => sum + (o.price_at_time || 0) * (o.quantity || 0),
    0,
  );
  const pendingOrders = (sellerOrders || []).filter(
    (o) => o.orders?.status === "placed" || o.orders?.status === "confirmed",
  ).length;

  return { totalSales, totalRevenue, pendingOrders };
}

// ============================================================
// 6b. SELLER — real revenue chart data (last 30 days)
// ============================================================

export function useSellerRevenueChart(sellerOrders) {
  // Group delivered order_item revenue by day for the last 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  const revenueByDay = {};
  days.forEach((d) => {
    revenueByDay[d] = 0;
  });

  (sellerOrders || []).forEach((o) => {
    const day = (o.created_at || "").slice(0, 10);
    if (revenueByDay[day] !== undefined) {
      revenueByDay[day] += (o.price_at_time || 0) * (o.quantity || 0);
    }
  });

  return days.map((d) => ({
    day: d.slice(5), // MM-DD for display
    revenue: revenueByDay[d],
  }));
}

export async function createProduct(sellerId, form, categoryId) {
  const slug =
    form.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: sellerId,
      name: form.name,
      slug,
      category: categoryId,
      thumbnail:
        form.thumbnail ||
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
      images: form.images || [],
      short_description: form.description?.slice(0, 150) || "",
      description: form.description || "",
      price: Number(form.price) || 0,
      discount_price: form.discountPrice ? Number(form.discountPrice) : null,
      discount_percent:
        form.price && form.discountPrice
          ? Math.round(((form.price - form.discountPrice) / form.price) * 100)
          : 0,
      stock: Number(form.stock) || 0,
      occasion: form.occasion || [],
      gift_for: form.giftFor || [],
      delivery_time: form.deliveryTime || "2-3 days",
      is_customizable: !!form.isCustomizable,
      is_active: false, // pending admin approval
    })
    .select()
    .single();

  return { data, error };
}

// ============================================================
// 7. ADMIN DASHBOARD DATA
// ============================================================

export function useAdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        const [
          { count: totalOrders },
          { count: totalUsers },
          { count: totalSellers },
          { data: revData },
        ] = await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase
            .from("sellers")
            .select("*", { count: "exact", head: true })
            .eq("is_approved", true),
          supabase.from("orders").select("total_amount"),
        ]);

        const totalRevenue = (revData || []).reduce(
          (s, o) => s + Number(o.total_amount || 0),
          0,
        );

        const [
          { count: pendingSellers },
          { count: pendingProducts },
          { count: pendingWithdrawals },
        ] = await Promise.all([
          supabase
            .from("sellers")
            .select("*", { count: "exact", head: true })
            .eq("is_approved", false),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("is_active", false),
          supabase
            .from("seller_withdrawals")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

        setStats({
          totalOrders: totalOrders || 0,
          totalUsers: totalUsers || 0,
          totalSellers: totalSellers || 0,
          totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
          pendingApprovals: {
            sellers: pendingSellers || 0,
            products: pendingProducts || 0,
            withdrawals: pendingWithdrawals || 0,
          },
        });
      } catch (err) {
        console.error("useAdminOverview error:", err);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  return { stats, loading };
}

export function useAdminSellers(filterPending = true) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });
    if (filterPending) q = q.eq("is_approved", false);
    const { data, error } = await q;
    if (!error) setSellers(data || []);
    setLoading(false);
  }, [filterPending]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const approveSeller = async (id) => {
    const { data: seller, error: fetchError } = await supabase
      .from("sellers")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("approveSeller: could not fetch seller", fetchError);
      return { error: fetchError };
    }

    const { error: sellerUpdateError } = await supabase
      .from("sellers")
      .update({ is_approved: true, status: "active" })
      .eq("id", id);

    if (sellerUpdateError) {
      console.error(
        "approveSeller: sellers table update failed",
        sellerUpdateError,
      );
      return { error: sellerUpdateError };
    }

    if (seller?.user_id) {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ role: "seller" })
        .eq("id", seller.user_id);

      if (profileUpdateError) {
        // Non-fatal: seller is approved but role sync failed.
        // The user's realtime subscription will re-fetch their profile on next login.
        console.warn(
          "approveSeller: profiles role update failed (check RLS / service-role key):",
          profileUpdateError,
        );
      }
    }

    await refetch();
    return { error: null };
  };

  const rejectSeller = async (id) => {
    await supabase.from("sellers").update({ status: "suspended" }).eq("id", id);
    await refetch();
  };

  return { sellers, loading, refetch, approveSeller, rejectSeller };
}

export function useAdminProducts(filterPending = true) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("products")
      .select(`*, sellers(shop_name)`)
      .order("created_at", { ascending: false });
    if (filterPending) q = q.eq("is_active", false);
    const { data, error } = await q;
    if (!error) setProducts((data || []).map(formatProduct));
    setLoading(false);
  }, [filterPending]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const approveProduct = async (id) => {
    await supabase.from("products").update({ is_active: true }).eq("id", id);
    await refetch();
  };
  const rejectProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    await refetch();
  };

  return { products, loading, refetch, approveProduct, rejectProduct };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items(*)`)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setOrders(data.map(formatOrder));
      setLoading(false);
    }
    run();
  }, []);

  return { orders, loading };
}

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error) setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toggleBan = async (id, banned) => {
    await supabase.from("profiles").update({ is_banned: banned }).eq("id", id);
    await refetch();
  };

  return { users, loading, refetch, toggleBan };
}

export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seller_withdrawals")
      .select(`*, sellers(shop_name, shop_logo)`)
      .order("created_at", { ascending: false });
    if (!error) setWithdrawals(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const processWithdrawal = async (id, status) => {
    await supabase
      .from("seller_withdrawals")
      .update({ status, processed_at: new Date().toISOString() })
      .eq("id", id);
    await refetch();
  };

  return { withdrawals, loading, refetch, processWithdrawal };
}

export function useAdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setCoupons(data || []);
      setLoading(false);
    }
    run();
  }, []);

  return { coupons, loading };
}

// ============================================================
// 8. REVIEWS
// ============================================================

export function useProductReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(name, avatar_url)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reviews, loading, refetch };
}

export function useUserReviews(userId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!userId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(id, name, thumbnail, slug)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setReviews(data);
      setLoading(false);
    }
    run();
  }, [userId]);

  return { reviews, loading };
}

export async function submitReview(
  productId,
  userId,
  orderId,
  rating,
  comment,
) {
  // Upsert so a user can update their existing review
  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        product_id: productId,
        user_id: userId,
        order_id: orderId || null,
        rating,
        comment,
      },
      { onConflict: "product_id,user_id" },
    )
    .select()
    .single();
  return { data, error };
}

export function useSellerReviews(sellerId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!sellerId) {
        setLoading(false);
        return;
      }
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", sellerId);

      if (!products || products.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }
      const productIds = products.map((p) => p.id);
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "*, products(name, thumbnail, slug), profiles(name, avatar_url)",
        )
        .in("product_id", productIds)
        .order("created_at", { ascending: false });
      if (!error && data) setReviews(data);
      setLoading(false);
    }
    run();
  }, [sellerId]);

  return { reviews, loading };
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
  }

  return { data, error };
}

// ============================================================
// 9. SELLER — update an existing product
// ============================================================

export async function updateProduct(productId, form, categoryId) {
  const payload = {
    name: form.name,
    category: categoryId,
    thumbnail:
      form.thumbnail ||
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
    short_description: form.description?.slice(0, 150) || "",
    description: form.description || "",
    price: Number(form.price) || 0,
    discount_price: form.discountPrice ? Number(form.discountPrice) : null,
    discount_percent:
      form.price && form.discountPrice
        ? Math.round(
            ((Number(form.price) - Number(form.discountPrice)) /
              Number(form.price)) *
              100,
          )
        : 0,
    stock: Number(form.stock) || 0,
    occasion: form.occasion || [],
    gift_for: form.giftFor || [],
    delivery_time: form.deliveryTime || "2-3 days",
    is_customizable: !!form.isCustomizable,
    // Keep is_active as-is; re-approval only needed for new listings
  };

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select()
    .single();

  return { data, error };
}

// ============================================================
// 10. ADMIN — update order status
// ============================================================

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .maybeSingle(); // ← was .single() which throws 406 when RLS returns 0 rows
  return { data, error };
}

// ============================================================
// 11. ADMIN — coupon CRUD
// ============================================================

export async function createCoupon(payload) {
  const { data, error } = await supabase
    .from("coupons")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function deleteCoupon(code) {
  const { error } = await supabase.from("coupons").delete().eq("code", code);
  return { error };
}

// ============================================================
// 12. ADMIN — delete a category
// ============================================================

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  return { error };
}

// ============================================================
// 13. PUBLIC SHOP PROFILE — fetch seller by seller row id
// ============================================================

export function useShopProfile(sellerId) {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!sellerId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", sellerId)
        .maybeSingle();
      if (!error) setShop(data);
      else console.error("useShopProfile:", error);
      setLoading(false);
    }
    run();
  }, [sellerId]);

  return { shop, loading };
}

// ============================================================
// 14. SHOP FOLLOW — follow/unfollow a seller
//     Uses a `shop_follows` table with (user_id, seller_id).
//     Gracefully degrades if the table does not yet exist.
// ============================================================

export function useShopFollow(sellerId, userId) {
  const [followed, setFollowed] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function run() {
      if (!sellerId) return;
      // Get follower count
      const { count: cnt } = await supabase
        .from("shop_follows")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId);
      setCount(cnt || 0);

      // Check if current user follows
      if (userId) {
        const { data } = await supabase
          .from("shop_follows")
          .select("id")
          .eq("seller_id", sellerId)
          .eq("user_id", userId)
          .maybeSingle();
        setFollowed(!!data);
      }
    }
    run();
  }, [sellerId, userId]);

  const toggle = useCallback(async () => {
    if (!userId || !sellerId) return;
    if (followed) {
      await supabase
        .from("shop_follows")
        .delete()
        .eq("seller_id", sellerId)
        .eq("user_id", userId);
      setFollowed(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase
        .from("shop_follows")
        .insert({ seller_id: sellerId, user_id: userId });
      setFollowed(true);
      setCount((c) => c + 1);
    }
  }, [followed, sellerId, userId]);

  return { followed, count, toggle };
}
