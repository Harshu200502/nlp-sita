/**
 * ResultCard.jsx — Displays the full analysis result for a single text
 */
import { useState } from "react";
import { Copy, CheckCheck, Zap, User, Clock, AlertTriangle, CheckCircle, Code2 } from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import HighlightedText from "./HighlightedText";
import toast from "react-hot-toast";

function InfoChip({ icon: Icon, label, value, color = "text-pastel-text" }) {
  return (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-bg-card2 border border-border shadow-sm">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-black/60" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${value ? "text-black" : "text-gray-400 italic"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function ResultCard({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.structured_instruction);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const abbrevCount = Object.keys(data.abbreviations_found || {}).length;

  return (
    <div className="animate-[slideUp_0.35s_cubic-bezier(0.22,1,0.36,1)] space-y-4 mt-4">

      {/* ── Clarity Score ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <ScoreGauge score={data.clarity_score} />
        <div className="bg-white border border-border px-4 py-2 rounded-xl shadow-sm">
           <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 block mb-1">Task Type</span>
           <span className="text-sm font-bold text-black">{data.task_type}</span>
        </div>
      </div>

      {/* ── Interpreted Text (only if abbreviations were expanded) ──────── */}
      {abbrevCount > 0 && (
        <div className="p-4 rounded-xl bg-bg-card2 border border-purple-500/20 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-700">
            <Code2 size={12} /> Interpreted Text ({abbrevCount} abbreviation{abbrevCount > 1 ? "s" : ""} expanded)
          </div>
          <p className="font-mono text-sm text-black leading-relaxed">{data.interpreted_text}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(data.abbreviations_found).map(([k, v]) => (
              <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-800 font-bold">
                <span className="font-bold">{k}</span> → {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Original text with highlights ──────────────────────────────── */}
      <div className="p-4 rounded-xl bg-bg-card2 border border-border space-y-2 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Original (Highlighted)</span>
        <div className="leading-7">
          <HighlightedText
            text={data.original_text}
            ambiguousWords={data.ambiguous_words}
            abbreviationsFound={data.abbreviations_found}
            entities={data.entities}
          />
        </div>
        <div className="flex gap-3 pt-1 text-xs text-black font-semibold">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded tag-VAGUE" /> Ambiguous</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded tag-ABBREV" /> Abbreviation</span>
        </div>
      </div>

      {/* ── Extracted Info ──────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">Instructions Extracted</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoChip icon={Zap}   label="Action"   value={data.extracted?.action} />
          <InfoChip icon={User}  label="Person"   value={data.extracted?.person} />
          <InfoChip icon={Clock} label="Deadline" value={data.extracted?.deadline} />
        </div>
        {data.extracted?.tech_terms?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.extracted.tech_terms.map(term => (
              <span key={term} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light">
                ⚙ {term}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Issues ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">Issues Detected</p>
        {data.issues.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-black font-semibold text-sm">
            <CheckCircle size={16} className="text-green-600" /> No issues detected — instruction is clear!
          </div>
        ) : (
          <ul className="space-y-2">
            {data.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-black font-semibold text-sm">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-red-600" />
                {issue}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Structured Output ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">1. Structured Output (Instruction)</p>
        <div className="p-4 rounded-xl bg-pastel-pink/10 border border-pastel-pink/30 border-l-4 border-l-pastel-pink">
          <p className="font-sans text-sm text-black font-semibold leading-relaxed">{data.structured_instruction}</p>
          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-pastel-pink/50 text-black hover:bg-pastel-pink/20 transition-all font-bold"
          >
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy instruction"}
          </button>
        </div>
      </div>

      {/* ── Generated Content ────────────────────────────────────── */}
      {data.generated_content && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">2. Generated Content ({data.generated_content.type})</p>
          <div className="p-5 rounded-xl bg-white border border-border shadow-md">
            <h4 className="font-serif font-bold text-xl text-black mb-2">{data.generated_content.title}</h4>
            <div className="w-10 h-1 bg-pastel-lavender mb-4 rounded-full"></div>
            <ul className="space-y-3 block">
              {data.generated_content.sections.map((section, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-black leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-pastel-lavender mt-1.5 flex-shrink-0"></span> 
                  <span className="font-medium">{section}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
