// frontend/src/hooks/useGiftAI.js
// Calls the Prizzy Express backend (Gemini 2.5 Flash) — no Anthropic dependency
import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

// ── Conversational Gift Advisor ─────────────────────────────────────────────
export function useGiftAI() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (userText, products = []) => {
    try {
      setLoading(true);
      setError(null);
      const newMessages = [...messages, { role: "user", content: userText }];
      setMessages(newMessages);

      const response = await fetch(`${API_BASE}/api/ai/gift-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, products }),
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
            "Sorry, I couldn't reach the AI right now. Please make sure the backend server is running and try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, reset };
}

// ── Guided Tap-Based Picker ─────────────────────────────────────────────────
export function useGuidedGift() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendations = async ({
    occasion,
    recipient,
    budgetMin = 0,
    budgetMax = 5000,
    products = [],
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/ai/gift-guided`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          recipient,
          budgetMin,
          budgetMax,
          products,
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.message || data.error);

      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult({ picks: [] });
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, getRecommendations };
}
