/**
 * useAnalyze.js — Custom React hook for NLP analysis state
 * Handles loading, error, debounced real-time analysis, and history.
 */
import { useState, useRef, useCallback } from "react";
import { analyzeText, analyzeBatch } from "../api";

const getHistoryKey = () => `nlp_history_${localStorage.getItem("username") || "default"}`;
const MAX_HISTORY = 20;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(getHistoryKey()) || "[]"); }
  catch { return []; }
}
function saveHistory(items) {
  localStorage.setItem(getHistoryKey(), JSON.stringify(items.slice(0, MAX_HISTORY)));
}

export function useAnalyze() {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [history, setHistory] = useState(loadHistory);

  const debounceRef = useRef(null);

  // ── Single analysis ──────────────────────────────────────────────────────
  const analyze = useCallback(async (text, userType = "Professional") => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeText(text, userType);
      setResult(data);
      // Prepend to history
      setHistory(prev => {
        const next = [{ text, result: data, ts: Date.now() }, ...prev.filter(h => h.text !== text)];
        saveHistory(next);
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced real-time analysis (500ms) ─────────────────────────────────
  const analyzeDebounced = useCallback((text, userType = "Professional") => {
    clearTimeout(debounceRef.current);
    if (text.trim().length < 5) return;
    debounceRef.current = setTimeout(() => analyze(text, userType), 500);
  }, [analyze]);

  const clearResult = () => { setResult(null); setError(null); };
  const clearHistory = () => { setHistory([]); saveHistory([]); };

  return { result, loading, error, history, analyze, analyzeDebounced, clearResult, clearHistory };
}

// ── Batch hook ────────────────────────────────────────────────────────────────
export function useBatchAnalyze() {
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const runBatch = useCallback(async (texts) => {
    const valid = texts.filter(t => t.trim());
    if (!valid.length) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeBatch(valid);
      setBatchResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Batch analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { batchResult, loading, error, runBatch };
}
