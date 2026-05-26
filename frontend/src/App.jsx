/**
 * App.jsx — SITA — Smart Instruction & Task Authoring Assistant — Main Application Shell
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
import { Sparkles, Layers, Clock, Send, RotateCcw, Zap, LogOut, User, BookOpen } from "lucide-react";

import Login from "./Login";

import { useAnalyze } from "./hooks/useAnalyze";
import ResultCard   from "./components/ResultCard";
import BatchPanel   from "./components/BatchPanel";
import HistoryPanel from "./components/HistoryPanel";
import ResearchPanel from "./components/ResearchPanel";


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
  { id: "single",   label: "Generate Content", icon: Sparkles },
  { id: "batch",    label: "Batch Process",  icon: Layers },
  { id: "research", label: "Research Writing", icon: BookOpen },
  { id: "history",  label: "History",        icon: Clock },
];

function MainApp({ auth, handleLogout }) {
  const [activeTab, setActiveTab] = useState("single");
  const [userType, setUserType] = useState("Professional");
  const [inputText, setInputText] = useState("");
  const [realtimeOn, setRealtimeOn] = useState(true);
  const textareaRef = useRef(null);

  const { result, loading, error, history, analyze, analyzeDebounced, clearResult, clearHistory } = useAnalyze();

  // ── Input change handler ─────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setInputText(val);
    if (realtimeOn) analyzeDebounced(val, userType);
  }, [realtimeOn, analyzeDebounced, userType]);

  // ── Example click ────────────────────────────────────────────────────────
  const setExample = (text) => {
    setInputText(text);
    textareaRef.current?.focus();
    if (realtimeOn) analyzeDebounced(text, userType);
  };

  // ── Restore from history ─────────────────────────────────────────────────
  const restoreFromHistory = (text) => {
    setInputText(text);
    setActiveTab("single");
    analyze(text, userType);
    textareaRef.current?.focus();
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleAnalyze = () => analyze(inputText, userType);

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
        <header className="relative text-center mb-10">
          <div className="absolute right-0 top-0 flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-bg-card border border-border shadow-sm rounded-xl px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-black capitalize">
                <User size={12} /> {auth.username}
              </span>
              <div className="w-px h-3 bg-border"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold transition"
              >
                <LogOut size={12} /> Logout
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-border shadow-sm rounded-xl px-2 py-1">
              <label className="text-[10px] font-bold uppercase text-black">Mode:</label>
              <select 
                value={userType} 
                onChange={(e) => setUserType(e.target.value)}
                className="bg-transparent text-xs font-bold text-black focus:outline-none cursor-pointer"
              >
                <option value="Professional">Professional</option>
                <option value="Student">Student</option>
                <option value="Researcher">Researcher</option>
              </select>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-pastel-beige/30 border border-pastel-beige rounded-full px-4 py-1.5 text-xs font-semibold text-black uppercase tracking-wider mb-5 mt-8 md:mt-0">
            <span className="w-1.5 h-1.5 rounded-full bg-pastel-pink animate-[pulseDot_2s_ease-in-out_infinite]" />
            SITA — Content Generation Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight leading-tight mb-4 text-black">
            SITA
          </h1>
          <p className="text-black max-w-lg mx-auto text-sm leading-loose font-bold">
            Smart Instruction & Task Authoring Assistant
          </p>
          <p className="text-black max-w-lg mx-auto text-sm leading-loose">
            Directly generate structured content for your tasks.
            Clear, actionable, and domain-aware.
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
            RESEARCH WRITING PANEL
        ════════════════════════════════════════════════════════ */}
        {activeTab === "research" && <ResearchPanel />}

        {/* ════════════════════════════════════════════════════════
            HISTORY PANEL
        ════════════════════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border shadow-card">
            <HistoryPanel history={history} onRestore={restoreFromHistory} onClear={clearHistory} />
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="text-center mt-14 text-xs text-pastel-subtext space-x-3">
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-pastel-pink transition">Swagger UI</a>
          <span>·</span>
          <a href="http://localhost:8000/redoc" target="_blank" rel="noreferrer" className="hover:text-pastel-pink transition">ReDoc</a>
          <span>·</span>
          <span>SITA v2.0</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    return token ? { access_token: token, username } : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setAuth(null);
  };

  if (!auth) {
    return <Login setAuth={setAuth} />;
  }

  return <MainApp auth={auth} handleLogout={handleLogout} />;
}
