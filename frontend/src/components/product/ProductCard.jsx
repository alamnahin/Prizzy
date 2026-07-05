import React from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { toast } from "../../hooks/use-toast";

const ProductCard = ({ product, compact = false }) => {
  const { addToCart, toggleWishlist, inWishlist } = useCart();
  const wished = inWishlist(product.id);

  const discountPercent =
    product.discountPercent || product.discount_percent || 0;
  const sellerDisplayName =
    product.seller?.shopName ||
    product.seller?.shop_name ||
    product.sellerName ||
    "Verified Seller";
  const imageToUse = product.thumbnail || product.image;
  const currentPrice = product.discountPrice || product.price || 0;
  const oldPrice = product.originalPrice || product.price;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast({ title: "Added to cart", description: product.name });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="product-card group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-pink/30 hover:shadow-brand relative flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 shrink-0">
        <img
          src={imageToUse}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105"
          style={{ transition: "transform 0.5s ease" }}
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-brand-pink text-white text-[11px] font-bold px-2 py-1 rounded-md shadow">
            -{discountPercent}%
          </span>
        )}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${wished ? "bg-brand-pink text-white shadow-md" : "bg-white/90 text-gray-600 hover:text-brand-pink"}`}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>

        {/* Quick Add to Cart on hover */}
        <button
          onClick={handleAdd}
          className="absolute left-2 right-2 bottom-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 bg-brand-gradient text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg"
          style={{ transition: "opacity 0.25s ease, transform 0.25s ease" }}
        >
          <ShoppingBag size={14} /> Add to Cart
        </button>
      </div>

      {/* Info */}
      <div
        className={`p-3 flex flex-col flex-1 ${compact ? "space-y-1" : "space-y-1.5"}`}
      >
        <h3 className="text-sm font-medium text-brand-dark line-clamp-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-auto">
          <div className="flex items-center gap-0.5 bg-brand-pink/10 px-1.5 py-0.5 rounded">
            <Star size={11} className="text-brand-pink fill-brand-pink" />
            <span className="text-[11px] font-semibold text-brand-pink">
              {product.rating || 0}
            </span>
          </div>
          <span className="text-[11px] text-gray-500">
            ({product.numReviews || product.num_reviews || 0})
          </span>
          <span className="text-[11px] text-gray-400 ml-auto">
            {product.sold || 0}+ sold
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-brand-pink">
            ৳{currentPrice.toLocaleString()}
          </span>
          {discountPercent > 0 && oldPrice && (
            <span className="text-xs text-gray-400 line-through">
              ৳{oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {!compact && (
          <p className="text-[11px] text-gray-500 truncate mt-1">
            by {sellerDisplayName}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
