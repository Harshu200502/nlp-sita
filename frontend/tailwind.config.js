/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "serif"],
        mono: ["Fira Code", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#F5F5F5",
          card: "#FFFFFF",
          card2: "#FCFCFC",
        },
        pastel: {
          beige: "#E8D5C4",
          lavender: "#C9C1D9",
          pink: "#D8A7B1",
          text: "#333333",
          subtext: "#666666",
        },
        border: {
          DEFAULT: "#E5E7EB",
          glow: "#C9C1D9",
        },
        accent: {
          DEFAULT: "#D8A7B1",
          light: "#E8D5C4",
          cyan: "#22d3ee",
          green: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      animation: {
        "float":    "float 18s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.35s cubic-bezier(0.22,1,0.36,1)",
        "pulse-dot":"pulseDot 2s ease-in-out infinite",
        "spin-slow":"spin 0.7s linear infinite",
      },
      keyframes: {
        float:    { "0%": { transform: "translate(0,0) scale(1)" }, "100%": { transform: "translate(40px,30px) scale(1.08)" } },
        slideUp:  { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseDot: { "0%,100%": { opacity: 1, transform: "scale(1)" }, "50%": { opacity: 0.5, transform: "scale(0.8)" } },
      },
      boxShadow: {
        card: "0 4px 32px rgba(0,0,0,0.5)",
        glow: "0 0 40px rgba(99,102,241,0.18)",
        btn:  "0 8px 24px rgba(99,102,241,0.45)",
      },
    },
  },
  plugins: [],
};
