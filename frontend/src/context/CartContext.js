import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const c = localStorage.getItem("prizzy_cart");
      return c ? JSON.parse(c) : [];
    } catch (e) {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const w = localStorage.getItem("prizzy_wishlist");
      return w ? JSON.parse(w) : [];
    } catch (e) {
      return [];
    }
  });
  const [coupon, setCoupon] = useState(null);

  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem("prizzy_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem("prizzy_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product, quantity = 1, personalMessage = "") => {
    // stock === 0 means explicitly out-of-stock; undefined/null = no cap
    const maxStock =
      product.stock != null && product.stock > 0 ? product.stock : Infinity;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(quantity, maxStock),
          personalMessage,
          price: product.discountPrice || product.price,
        },
      ];
    });
  };

  const updateQty = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        const maxStock =
          i.product.stock != null && i.product.stock > 0
            ? i.product.stock
            : Infinity;
        return { ...i, quantity: Math.min(quantity, maxStock) };
      }),
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const inWishlist = (productId) => wishlist.includes(productId);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = items.length > 0 ? 60 : 0;

  // Use pre-calculated discount from Supabase RPC when available;
  // fall back to client-side calculation for edge cases.
  const discount = coupon
    ? coupon._calculatedDiscount !== undefined
      ? coupon._calculatedDiscount
      : coupon.discountType === "percentage"
        ? Math.min(
            (subtotal * coupon.discountValue) / 100,
            coupon.maximumDiscount != null ? coupon.maximumDiscount : Infinity,
          )
        : coupon.discountValue
    : 0;

  const total = subtotal + shippingFee - discount;
  const itemCount = items.reduce((c, i) => c + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        wishlist,
        coupon,
        setCoupon,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        inWishlist,
        subtotal,
        shippingFee,
        discount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
