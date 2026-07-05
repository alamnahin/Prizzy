// frontend/src/components/ai/AiGiftFinder.jsx
import React, { useState } from "react";
import { useGuidedGift } from "../../hooks/useGiftAI";
import { useProducts } from "../../hooks/useSupabaseData";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import AiProductCard from "./AiProductCard";

export default function AiGiftFinder() {
  const { result, loading, getRecommendations } = useGuidedGift();
  const { products } = useProducts();
  const [formData, setFormData] = useState({
    occasion: "",
    recipient: "",
    budgetMin: 500,
    budgetMax: 5000,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass real products from Supabase to the AI
    getRecommendations({ ...formData, products });
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardHeader>
          <CardTitle>Find the Perfect Gift Instantly</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Occasion</label>
              <Select
                onValueChange={(val) =>
                  setFormData({ ...formData, occasion: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Birthday">Birthday</SelectItem>
                  <SelectItem value="Anniversary">Anniversary</SelectItem>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                  <SelectItem value="Eid">Eid</SelectItem>
                  <SelectItem value="Just Because">Just Because</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient</label>
              <Select
                onValueChange={(val) =>
                  setFormData({ ...formData, recipient: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Him">Him</SelectItem>
                  <SelectItem value="Her">Her</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                  <SelectItem value="Parents">Parents</SelectItem>
                  <SelectItem value="Colleague">Colleague</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Budget (৳)</label>
              <Input
                type="number"
                value={formData.budgetMax}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetMax: Number(e.target.value),
                  })
                }
                min={100}
                step={100}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.occasion || !formData.recipient}
              className="w-full"
            >
              {loading ? "Curating…" : "Find Gifts"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && result.picks && result.picks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">
              AI Top Picks for You
            </h3>
            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {result.picks.length} Matches Found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {result.picks.map((pick) => {
              // Map AI's returned productId back to the actual product from Supabase
              const productDetail = products.find(
                (p) => p.id === pick.productId,
              );
              if (!productDetail) return null;

              return (
                <AiProductCard
                  key={pick.productId}
                  product={productDetail}
                  matchScore={pick.matchScore}
                  reason={pick.reason}
                />
              );
            })}
          </div>
        </div>
      )}

      {result && result.picks && result.picks.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No matching products found. Try adjusting your budget or occasion.
        </p>
      )}
    </div>
  );
}
