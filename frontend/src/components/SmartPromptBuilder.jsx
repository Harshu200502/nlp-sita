import { useState } from "react";
import { Send, FileText, Briefcase, Zap, List } from "lucide-react";
import { buildPrompt } from "../api";
import { toast } from "react-hot-toast";

const COMMON_TASKS = {
  Student: ["Report", "Assignment", "Coding Task", "General Task"],
  "Working Professional": ["Email", "Report", "Coding Task", "Meeting", "General Task"]
};

export default function SmartPromptBuilder() {
  const [userType, setUserType] = useState("Student");
  const [taskType, setTaskType] = useState("Report");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setTaskType(COMMON_TASKS[type][0]); // reset task type
  };

  const handleBuild = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter a task description first.");
      return;
    }
    setLoading(true);
    try {
      const data = await buildPrompt(inputText, userType, taskType);
      setResult(data);
      toast.success("Smart prompt generated!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to generate prompt. Backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-bg-card border border-border shadow-card space-y-5 flex flex-col">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-2">User Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleUserTypeChange("Student")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-all ${userType === "Student" ? "bg-pastel-pink text-white shadow-sm font-semibold" : "bg-bg-card2 border border-border text-pastel-subtext hover:border-pastel-pink/50"}`}
              >
                <FileText size={14} /> Student
              </button>
              <button
                onClick={() => handleUserTypeChange("Working Professional")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-all ${userType === "Working Professional" ? "bg-pastel-pink text-white shadow-sm font-semibold" : "bg-bg-card2 border border-border text-pastel-subtext hover:border-pastel-pink/50"}`}
              >
                <Briefcase size={14} /> Professional
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-2">Task Type</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TASKS[userType].map(type => (
                <button
                  key={type}
                  onClick={() => setTaskType(type)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${taskType === type ? "bg-pastel-lavender border border-pastel-lavender/50 text-pastel-text font-bold" : "bg-bg-card2 border border-border text-pastel-subtext hover:border-pastel-lavender/50"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Text */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-2">Task Description</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleBuild(); }}
            placeholder="e.g. Create a machine learning report on sentiment analysis..."
            rows={3}
            className="w-full bg-bg-card2 border border-border rounded-xl px-4 py-3 text-sm text-pastel-text placeholder-gray-400 focus:outline-none focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20 resize-y transition font-sans"
          />
        </div>

        <button
          onClick={handleBuild}
          disabled={loading || !inputText.trim()}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-pastel-pink text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:translate-y-0 mt-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
          ) : (
            <><Zap size={16} /> Generate Prompts</>
          )}
        </button>
      </div>

      {result && (
        <div className="p-6 rounded-2xl bg-bg-card border border-border shadow-card space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-bold text-pastel-text flex items-center gap-2">
              <Zap className="text-amber-400" size={24} /> Prompt Generated Successfully
            </h3>
          </div>

          <div className="space-y-4">
            <div className="bg-bg border border-border rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-2 flex items-center gap-1.5">
                1. Structural Layout
              </p>
              <ul className="list-disc pl-5 text-sm text-pastel-text space-y-1">
                {result.content_structure.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-pastel-lavender/10 border border-pastel-lavender/30 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-2 flex items-center gap-1.5">
                2. Structured Instruction
              </p>
              <p className="text-sm text-pastel-text font-medium">{result.structured_prompt}</p>
            </div>

            <div className="bg-pastel-pink/5 border border-pastel-pink/20 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-2 flex items-center gap-1.5">
                3. Detailed Expanded Prompt
              </p>
              <p className="text-sm text-pastel-text leading-relaxed">{result.detailed_prompt}</p>
            </div>

            <div className="bg-bg border border-border rounded-xl p-4 relative group">
              <p className="text-[10px] font-bold uppercase tracking-widest text-pastel-subtext mb-2 flex items-center gap-1.5">
                <List size={14} /> 4. Ready-to-Use Prompt (For External Tools)
              </p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg text-gray-800 font-mono text-xs whitespace-pre-wrap selection:bg-pastel-pink selection:text-white border border-gray-200">
                {result.ai_ready_prompt}
              </p>
              <button
                className="absolute top-4 right-4 bg-white border border-border px-2 py-1 rounded text-[10px] uppercase font-bold text-pastel-subtext opacity-0 group-hover:opacity-100 transition hover:bg-gray-50"
                onClick={() => {
                  navigator.clipboard.writeText(result.ai_ready_prompt);
                  toast.success("Copied to clipboard");
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
