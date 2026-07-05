// frontend/src/components/ai/AiInsightPanel.jsx
import React, { useEffect } from "react";
import { Sparkles, TrendingUp, Lightbulb } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { useVendorAI } from "../../hooks/useVendorAI";

export default function AiInsightPanel({ shop_name, salesData }) {
  const { insight, loading, getInsight } = useVendorAI();

  useEffect(() => {
    getInsight(shop_name, salesData);
  }, [shop_name, salesData, getInsight]);

  if (loading || !insight) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-600/5 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            AI Morning Digest
          </h2>
        </div>

        <h3 className="text-lg font-semibold text-primary mb-3">
          "{insight.headline}"
        </h3>

        <ul className="space-y-3 mb-6">
          {insight.insights.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="bg-secondary/50 rounded-lg p-4 border border-secondary flex gap-3 items-start">
          <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Upcoming Opportunity
            </span>
            <p className="text-sm">{insight.occasionTip}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
