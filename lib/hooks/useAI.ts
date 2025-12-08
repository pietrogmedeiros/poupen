import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type {
  SpendingForecast,
  FinancialInsights,
  TransactionAnalysis,
} from "@/lib/gemini";

export function useSpendingForecast() {
  const { user } = useAuth();
  const [forecast, setForecast] = useState<SpendingForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchForecast = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/ai/forecast", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch forecast");
        const data = await response.json();
        setForecast(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [user]);

  return { forecast, loading, error };
}

export function useFinancialInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<FinancialInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/ai/insights", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch insights");
        const data = await response.json();
        setInsights(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  return { insights, loading, error };
}

export function useTransactionAnalysis(month?: number, year?: number) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "x-user-id": user.id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month, year }),
      });

      if (!response.ok) throw new Error("Failed to analyze transactions");
      const data = await response.json();
      setAnalysis(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, analyze };
}
