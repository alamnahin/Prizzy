// frontend/src/hooks/useVendorAI.js
// Calls the Prizzy Express backend (Gemini 2.5 Flash) — no Anthropic dependency
import { useState, useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export function useVendorAI() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const getInsight = useCallback(async (shopName, salesData) => {
    if (!shopName) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/vendor-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_name: shopName, salesData }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.message || parsed.error);

      setInsight(parsed);
    } catch (err) {
      console.error("Vendor AI error:", err);
      // Graceful fallback so the UI never crashes
      setInsight({
        headline: `Great day to grow ${shopName}!`,
        insights: [
          "Keep your product listings up to date with clear photos and descriptions.",
          "Respond to orders promptly to build strong seller ratings.",
          "Offer gift wrapping or personal message options to increase conversions.",
        ],
        occasionTip:
          "Eid season is approaching — stock up on premium gift boxes and festive packaging to capture seasonal demand.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { insight, loading, getInsight };
}

export function useVendorChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (userText, shopName, salesData) => {
      try {
        setLoading(true);
        setError(null);
        const newMessages = [...messages, { role: "user", content: userText }];
        setMessages(newMessages);

        const response = await fetch(`${API_BASE}/api/ai/vendor-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            shop_name: shopName,
            salesData,
          }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.message || data.error);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        setError(err.message);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't reach the AI right now. Please ensure the backend server is running.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages],
  );

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, reset };
}
