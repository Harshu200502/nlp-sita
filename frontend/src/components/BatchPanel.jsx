/**
 * BatchPanel.jsx — Batch analysis panel (up to 20 instructions)
 */
import { useState } from "react";
import { Plus, X, Layers, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { useBatchAnalyze } from "../hooks/useAnalyze";
import toast from "react-hot-toast";

function scoreColor(s) {
  if (s >= 70) return { badge: "bg-green-50 text-green-700 border-green-200", label: "Clear" };
  if (s >= 40) return { badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Moderate" };
  return    { badge: "bg-red-50 text-red-700 border-red-200", label: "Vague" };
}

export default function BatchPanel() {
  const [inputs, setInputs] = useState(["", ""]);
  const { batchResult, loading, error, runBatch } = useBatchAnalyze();

  const update = (i, val) => setInputs(prev => { const n=[...prev]; n[i]=val; return n; });
  const addRow = () => { if (inputs.length < 20) setInputs(prev => [...prev, ""]); };
  const removeRow = (i) => { if (inputs.length > 1) setInputs(prev => prev.filter((_,idx)=>idx!==i)); };

  const handleRun = () => {
    const valid = inputs.filter(t => t.trim());
    if (!valid.length) { toast.error("Enter at least one instruction."); return; }
    runBatch(inputs);
  };

  const exportCSV = () => {
    if (!batchResult) return;
    const rows = [["Text", "Action", "Person", "Deadline", "Issues", "Suggestion", "Score"]];
    batchResult.results.forEach(r => rows.push([
      `"${r.original_text}"`,
      r.extracted.action || "",
      r.extracted.person || "",
      r.extracted.deadline || "",
      `"${r.issues.join("; ")}"`,
      `"${r.suggestion}"`,
      r.clarity_score,
    ]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nlp_clarity_batch.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-bg-card border border-border shadow-sm">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-3">
          Instructions to analyze (up to 20)
        </label>
        <div className="space-y-2 mb-3">
          {inputs.map((val, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={val}
                onChange={e => update(i, e.target.value)}
                onKeyDown={e => e.key === "Enter" && i === inputs.length - 1 && addRow()}
                placeholder={`Instruction ${i + 1}…`}
                className="flex-1 bg-bg-card2 border border-border rounded-xl px-4 py-2.5 text-sm text-pastel-text placeholder-gray-400 focus:outline-none focus:border-pastel-pink focus:ring-1 focus:ring-pastel-pink/30 transition"
              />
              <button
                onClick={() => removeRow(i)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-gray-400 hover:text-red-500 hover:border-red-500/30 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addRow}
          disabled={inputs.length >= 20}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-pastel-subtext hover:border-pastel-pink hover:text-pastel-pink text-sm transition disabled:opacity-40"
        >
          <Plus size={14} /> Add instruction
        </button>
        <button
          onClick={handleRun}
          disabled={loading}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-pastel-pink text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:translate-y-0"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…</>
          ) : (
            <><Layers size={16} /> Analyze Batch</>
          )}
        </button>
        {error && (
          <p className="mt-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2">⚠ {error}</p>
        )}
      </div>

    {/* ── Results ──────────────────────────────────────────────────── */}
      {batchResult && (
        <div className="animate-[slideUp_0.35s_cubic-bezier(0.22,1,0.36,1)] space-y-3">
          {/* Summary bar */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-bg-card border border-border text-sm shadow-sm">
            <span className="text-pastel-subtext">
              Analyzed <strong className="text-pastel-text">{batchResult.total}</strong> instruction{batchResult.total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-pastel-subtext">
                Avg: <strong className={batchResult.avg_clarity >= 70 ? "text-green-600" : batchResult.avg_clarity >= 40 ? "text-amber-500" : "text-red-500"}>
                  {batchResult.avg_clarity}/100
                </strong>
              </span>
              <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-pastel-pink/50 text-pastel-text hover:bg-pastel-pink/10 transition">
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>

          {/* Individual results */}
          {batchResult.results.map((r, i) => {
            const { badge, label } = scoreColor(r.clarity_score);
            return (
              <div key={i} className="p-4 rounded-xl bg-bg-card border border-border hover:border-pastel-pink/50 transition shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm text-pastel-subtext italic flex-1">"{r.original_text}"</p>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge} whitespace-nowrap`}>
                    {label} · {r.clarity_score}/100
                  </span>
                </div>
                {r.issues.length === 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 mb-2"><CheckCircle size={12}/> No issues</div>
                ) : (
                  <div className="flex items-start gap-1.5 text-xs text-red-500 mb-2">
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    {r.issues.join(" · ")}
                  </div>
                )}
                <p className="font-sans text-xs text-pastel-text bg-pastel-pink/10 rounded-lg px-3 py-2 leading-relaxed">{r.suggestion}</p>
                
                {r.content_suggestions && r.content_suggestions.type !== "General task" && (
                  <div className="mt-3 p-3 bg-pastel-beige/20 rounded border border-pastel-beige shadow-sm">
                    <h5 className="font-serif font-bold text-sm text-pastel-text">{r.content_suggestions.title}</h5>
                    <ul className="mt-1 space-y-1 block">
                      {r.content_suggestions.sections.map((section, idx) => (
                        <li key={idx} className="flex items-center gap-1 text-[11px] text-pastel-text">
                           <span className="w-1 h-1 rounded-full bg-pastel-lavender flex-shrink-0"></span> {section}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
