import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    const c = localStorage.getItem('prizzy_cart');
    const w = localStorage.getItem('prizzy_wishlist');
    if (c) setItems(JSON.parse(c));
    if (w) setWishlist(JSON.parse(w));
  }, []);

  useEffect(() => {
    localStorage.setItem('prizzy_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('prizzy_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product, quantity = 1, personalMessage = '') => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i);
      }
      return [...prev, { product, quantity, personalMessage, price: product.discountPrice || product.price }];
    });
  };

  const updateQty = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => prev.includes(productId)
      ? prev.filter(id => id !== productId)
      : [...prev, productId]);
  };

  const inWishlist = (productId) => wishlist.includes(productId);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = items.length > 0 ? 60 : 0;
  const discount = coupon ? (coupon.discountType === 'percentage'
    ? Math.min(subtotal * coupon.discountValue / 100, coupon.maximumDiscount || Infinity)
    : coupon.discountValue) : 0;
  const total = subtotal + shippingFee - discount;
  const itemCount = items.reduce((c, i) => c + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, wishlist, coupon, setCoupon,
      addToCart, updateQty, removeFromCart, clearCart,
      toggleWishlist, inWishlist,
      subtotal, shippingFee, discount, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
