/**
 * ResearchPanel.jsx — Research Writing Assistant UI
 */
import React, { useState, useEffect } from "react";
import { useResearchWriting } from "../hooks/useResearchWriting";
import { BookOpen, Sparkles, CheckCircle, Info, ArrowRight } from "lucide-react";

export default function ResearchPanel() {
  const [text, setText] = useState("");
  const { result, loading, error, analyzeDebounced } = useResearchWriting();

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    analyzeDebounced(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Editor Section ── */}
      <div className="bg-white border border-border shadow-card rounded-2xl p-6 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-pastel-pink" size={18} />
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">Research Writing Editor</h2>
          {loading && (
            <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-pastel-pink">
              <span className="w-2 h-2 rounded-full bg-pastel-pink animate-pulse" />
              ANALYZING...
            </div>
          )}
        </div>

        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Start writing your research paper here... (e.g. 'I think this paper is kinda about a lot of things...')"
          className="w-full h-64 bg-[#fcfcfc] border border-border rounded-xl px-4 py-4 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-pastel-pink focus:ring-4 focus:ring-pastel-pink/10 transition-all resize-none shadow-inner leading-relaxed"
        />
        <div className="flex justify-between mt-2 px-1">
          <p className="text-[10px] text-gray-400 font-medium">Character Count: {text.length}</p>
          <p className="text-[10px] text-gray-400 font-medium italic">Supports real-time academic tone correction</p>
        </div>
      </div>

      {/* ── Results Section ── */}
      {result && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Corrected Text Column (PRIMARY) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#f0fff4] border-2 border-green-200 rounded-2xl p-5 shadow-sm h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-200 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase text-green-700 tracking-tighter">Recommended</div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Corrected Text</h3>
              </div>
              <div className="bg-white/90 rounded-xl p-4 border border-green-50 text-sm text-black font-medium leading-relaxed shadow-sm min-h-[120px]">
                {result.corrected_text}
              </div>
              <button 
                onClick={() => setText(result.corrected_text)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 hover:-translate-y-0.5 transition-all shadow-sm"
              >
                Apply Corrected Text <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Suggestions Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#fff9f9] border border-pastel-pink/20 rounded-2xl p-5 shadow-sm h-full max-h-[400px] flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-pastel-pink" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Fixes & Suggestions</h3>
              </div>
              <ul className="space-y-2.5 overflow-y-auto pr-2 custom-scrollbar">
                {result.suggestions.map((s, idx) => (
                  <li key={idx} className="flex gap-2 text-[10px] leading-normal text-black bg-white/70 border border-pastel-pink/10 rounded-lg p-2.5 shadow-sm">
                    <span className="text-pastel-pink font-bold shrink-0">✔</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improved Version Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#f5f9ff] border border-blue-100 rounded-2xl p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Academic Version</h3>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-blue-50 text-sm italic text-black leading-relaxed shadow-sm min-h-[120px]">
                {result.improved_version}
              </div>
              <button 
                onClick={() => setText(result.improved_version)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-blue-200 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-all"
              >
                Apply Academic Version
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
          <Info size={14} /> {error}
        </div>
      )}

      {!result && !loading && !text && (
        <div className="text-center py-12 opacity-40">
          <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">Your academic writing assistant awaits...</p>
        </div>
      )}
    </div>
  );
}
