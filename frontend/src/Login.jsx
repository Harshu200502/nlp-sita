import { useState } from "react";
import { loginDemo } from "./api";
import { LogIn, Sparkles } from "lucide-react";

export default function Login({ setAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginDemo(username, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      setAuth(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f5] flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="relative z-10 w-full max-w-sm bg-white border border-gray-200 shadow-xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pastel-pink text-white mb-4 shadow-md">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight">SITA</h2>
          <p className="text-gray-600 text-xs mt-2 font-medium">Smart Instruction & Task Authoring</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20 transition placeholder-gray-400"
              placeholder="e.g. student"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20 transition placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-[#fff1f2] text-[#000000] text-xs px-4 py-2 rounded-lg border border-[#fecdd3] mt-2 mb-2 font-medium">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d8a7b1] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:translate-y-0 mt-4"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in…</>
            ) : (
              <><LogIn size={16} /> Login to SITA</>
            )}
          </button>
        </form>

        <div className="text-center text-[10px] text-gray-500 pt-4 border-t border-gray-100">
          Demo users: student / 1234 OR admin / admin123
        </div>
      </div>
    </div>
  );
}
