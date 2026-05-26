/**
 * ScoreGauge.jsx — Animated clarity score bar + label
 */
import { useEffect, useRef, useState } from "react";

function scoreColor(score) {
  if (score >= 70) return { text: "text-accent-green", bar: "#10b981", label: "✓ Clear" };
  if (score >= 40) return { text: "text-accent-amber", bar: "#f59e0b", label: "~ Moderate" };
  return { text: "text-accent-red", bar: "#ef4444", label: "✗ Vague" };
}

export default function ScoreGauge({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef(null);
  const { text, label } = scoreColor(score);

  useEffect(() => {
    let current = 0;
    const step = score / 40;
    cancelAnimationFrame(frameRef.current);
    const tick = () => {
      current = Math.min(current + step, score);
      setDisplayed(Math.round(current));
      if (current < score) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [score]);

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card2 border border-border">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-pastel-subtext">Clarity Score</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            score >= 70 ? "bg-green-50 text-green-700 border border-green-200" :
            score >= 40 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-red-50 text-red-700 border border-red-200"
          }`}>{label}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full score-bar-fill rounded-full"
            style={{ width: `${displayed}%` }}
          />
        </div>
      </div>
      <span className={`text-3xl font-black min-w-[56px] text-right ${text.replace('accent-green','green-600').replace('accent-amber','amber-500').replace('accent-red','red-500')}`}>
        {displayed}
      </span>
    </div>
  );
}
