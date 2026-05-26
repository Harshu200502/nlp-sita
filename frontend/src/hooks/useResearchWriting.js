/**
 * useResearchWriting.js — Hook for research writing assistance
 */
import { useState, useRef, useCallback } from "react";
import { improveWriting } from "../api";

export function useResearchWriting() {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const debounceRef = useRef(null);

  const analyze = useCallback(async (text) => {
    if (!text.trim()) {
        setResult(null);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await improveWriting(text);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Improvement failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeDebounced = useCallback((text) => {
    clearTimeout(debounceRef.current);
    if (text.trim().length < 5) {
        setResult(null);
        return;
    }
    debounceRef.current = setTimeout(() => analyze(text), 600);
  }, [analyze]);

  return { result, loading, error, analyze, analyzeDebounced };
}
