// frontend/src/components/ai/AiProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useCart } from "../../context/CartContext";

export default function AiProductCard({ product, matchScore, reason }) {
  const { addToCart } = useCart();

  const productUrl = `/products/${product.slug || product.id}`;
  const displayPrice = product.discountPrice || product.price || 0;
  const originalPrice = product.discountPercent > 0 ? product.originalPrice : null;
  const imageUrl = product.thumbnail || product.image;

  return (
    <Card className="group overflow-hidden border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      {/* Premium Match Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className="bg-gradient-to-r from-primary to-purple-600 border-none shadow-md gap-1">
          <Sparkles className="w-3 h-3" />
          {matchScore}% Match
        </Badge>
      </div>

      <Link
        to={productUrl}
        className="overflow-hidden relative block aspect-square bg-muted/30"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link to={productUrl}>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold">
            ৳{displayPrice.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* AI Insight Block */}
        <div className="mt-auto bg-primary/5 rounded-lg p-3 border border-primary/10 relative">
          <Sparkles className="w-4 h-4 text-primary absolute top-3 left-3 opacity-50" />
          <p className="text-sm text-muted-foreground italic pl-6 leading-snug">
            "{reason}"
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => addToCart(product)}
          className="w-full gap-2 transition-transform active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
