/**
 * App.jsx — NLP Clarity Assistant — Main Application Shell
 *
 * Layout:
 *   ┌─ Ambient background (orbs)
 *   ├─ Header (logo + badge + subtitle)
 *   ├─ Tab bar: Single | Batch | History
 *   ├─ Single Panel: textarea + examples + real-time highlight + result card
 *   ├─ Batch Panel: dynamic inputs + results + CSV export
 *   └─ History Panel: localStorage history + restore
 */
import { useState, useRef, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { Sparkles, Layers, Clock, Send, RotateCcw, Zap } from "lucide-react";

import { useAnalyze } from "./hooks/useAnalyze";
import ResultCard   from "./components/ResultCard";
import BatchPanel   from "./components/BatchPanel";
import HistoryPanel from "./components/HistoryPanel";
import SmartPromptBuilder from "./components/SmartPromptBuilder";

// ─── Example instructions ──────────────────────────────────────────────────
const EXAMPLES = [
  "Send report EOD ASAP",
  "Push code to repo ASAP and send update EOD",
  "Email John the budget by Friday",
  "Deploy PR to prod before COB",
  "Finish the task quickly and FYI the team",
  "Merge MR after CR and notify SPOC",
  "Update the dashboard urgently",
  "Schedule kickoff meeting TBD",
];

// ─── Tab definition ────────────────────────────────────────────────────────
const TABS = [
  { id: "single",  label: "Single Analyze", icon: Sparkles },
  { id: "batch",   label: "Batch Analyze",  icon: Layers },
  { id: "history", label: "History",        icon: Clock },
  { id: "prompt",  label: "Smart Prompt Builder", icon: Zap },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("single");
  const [inputText, setInputText] = useState("");
  const [realtimeOn, setRealtimeOn] = useState(true);
  const textareaRef = useRef(null);

  const { result, loading, error, history, analyze, analyzeDebounced, clearResult, clearHistory } = useAnalyze();

  // ── Input change handler ─────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setInputText(val);
    if (realtimeOn) analyzeDebounced(val);
  }, [realtimeOn, analyzeDebounced]);

  // ── Example click ────────────────────────────────────────────────────────
  const setExample = (text) => {
    setInputText(text);
    textareaRef.current?.focus();
    if (realtimeOn) analyzeDebounced(text);
  };

  // ── Restore from history ─────────────────────────────────────────────────
  const restoreFromHistory = (text) => {
    setInputText(text);
    setActiveTab("single");
    analyze(text);
    textareaRef.current?.focus();
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleAnalyze = () => analyze(inputText);

  return (
    <div className="min-h-screen bg-bg text-pastel-text font-sans overflow-x-hidden">
      <Toaster position="top-right" toastOptions={{
        style: { background: "#FFFFFF", color: "#333333", border: "1px solid #E5E7EB" }
      }} />

      {/* ── Ambient orbs ── */}
      <div aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 pb-24">

        {/* ── Header ── */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pastel-beige/30 border border-pastel-beige rounded-full px-4 py-1.5 text-xs font-semibold text-pastel-text uppercase tracking-wider mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-pastel-pink animate-[pulseDot_2s_ease-in-out_infinite]" />
            spaCy · FastAPI · Rule-Based NLP
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight leading-tight mb-4 text-pastel-text">
            NLP Clarity Assistant
          </h1>
          <p className="text-pastel-subtext max-w-lg mx-auto text-sm leading-loose">
            Paste a vague instruction — get instant clarity. Abbreviations expanded,
            ambiguities flagged, and a structured rewrite generated automatically.
          </p>
        </header>

        {/* ── Tabs ── */}
        <div className="flex gap-1.5 bg-bg-card border border-border rounded-xl p-1.5 mb-6 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-pastel-pink text-white shadow-sm"
                  : "text-pastel-subtext hover:text-pastel-text hover:bg-gray-50"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════
            SINGLE PANEL
        ════════════════════════════════════════════════════════ */}
        {activeTab === "single" && (
          <div>
            <div className="p-5 rounded-2xl bg-bg-card border border-border shadow-card space-y-4">

              {/* Example chips */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text- pastel-subtext mb-2">Try an example:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setExample(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-pastel-lavender/30 border border-pastel-lavender/50 text-pastel-text hover:bg-pastel-lavender/60 hover:-translate-y-0.5 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label htmlFor="instruction-input" className="block text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-1.5">
                  Instruction to analyze
                </label>
                <textarea
                  id="instruction-input"
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleChange}
                  onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze(); }}
                  placeholder="e.g. Send report EOD ASAP to John..."
                  maxLength={2000}
                  rows={4}
                  className="w-full bg-bg-card2 border border-border rounded-xl px-4 py-3 text-sm text-pastel-text placeholder-gray-400 focus:outline-none focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20 resize-y min-h-[100px] transition font-sans"
                />
                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-2 text-xs text-pastel-subtext cursor-pointer select-none">
                    <input type="checkbox" checked={realtimeOn} onChange={e => setRealtimeOn(e.target.checked)}
                      className="accent-pastel-pink" />
                    Real-time analysis
                  </label>
                  <span className="text-xs text-pastel-subtext">{inputText.length} / 2000</span>
                </div>
              </div>

              {/* Analyze button */}
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || !inputText.trim()}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-pastel-pink text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…</>
                ) : (
                  <><Send size={16} /> Analyze Clarity</>
                )}
              </button>
              <p className="text-center text-[11px] text-pastel-subtext">Tip: Ctrl+Enter to analyze quickly</p>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">⚠ {error}</p>
              )}

              {/* Clear button */}
              {(result || inputText) && (
                <button onClick={() => { setInputText(""); clearResult(); }}
                  className="flex items-center gap-1.5 text-xs text-pastel-subtext hover:text-pastel-text transition mx-auto">
                  <RotateCcw size={11} /> Clear
                </button>
              )}
            </div>

            {/* Result */}
            {result && <ResultCard data={result} />}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            BATCH PANEL
        ════════════════════════════════════════════════════════ */}
        {activeTab === "batch" && <BatchPanel />}

        {/* ════════════════════════════════════════════════════════
            HISTORY PANEL
        ════════════════════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border shadow-card">
            <HistoryPanel history={history} onRestore={restoreFromHistory} onClear={clearHistory} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            SMART PROMPT BUILDER
        ════════════════════════════════════════════════════════ */}
        {activeTab === "prompt" && <SmartPromptBuilder />}

        {/* ── Footer ── */}
        <footer className="text-center mt-14 text-xs text-pastel-subtext space-x-3">
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-pastel-pink transition">Swagger UI</a>
          <span>·</span>
          <a href="http://localhost:8000/redoc" target="_blank" rel="noreferrer" className="hover:text-pastel-pink transition">ReDoc</a>
          <span>·</span>
          <span>NLP Clarity Assistant v2.0</span>
        </footer>
      </div>
    </div>
  );
}
