/**
 * HistoryPanel.jsx — Shows past analyzed instructions from localStorage
 */
import { Clock, Trash2, RotateCcw } from "lucide-react";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryPanel({ history, onRestore, onClear }) {
  if (!history.length) return (
    <div className="text-center py-16 text-pastel-subtext">
      <Clock size={32} className="mx-auto mb-3 opacity-40" />
      <p className="text-sm">No history yet. Analyze some instructions to see them here.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-pastel-subtext">{history.length} recent analyses</span>
        <button onClick={onClear} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 transition">
          <Trash2 size={12} /> Clear all
        </button>
      </div>
      {history.map((item, i) => (
        <div key={i} className="p-4 rounded-xl bg-bg-card border border-border hover:border-pastel-pink/50 transition group shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-pastel-text flex-1 line-clamp-2">"{item.text}"</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-bold ${item.result.clarity_score >= 70 ? "text-green-600" : item.result.clarity_score >= 40 ? "text-amber-500" : "text-red-500"}`}>
                {item.result.clarity_score}/100
              </span>
              <button onClick={() => onRestore(item.text)} title="Restore"
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-pastel-pink hover:bg-pastel-pink/10 transition">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-pastel-subtext">
            <span><Clock size={10} className="inline mr-1" />{timeAgo(item.ts)}</span>
            {item.result.extracted?.action && <span>Action: <em className="text-pastel-text">{item.result.extracted.action}</em></span>}
          </div>
        </div>
      ))}
    </div>
  );
}
