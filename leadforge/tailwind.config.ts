import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "Outfit", "sans-serif"],
        mono: ["var(--font-mono)", "DM Mono", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#080808",
          surface: "#0f0f0f",
          raised: "#161616",
        },
        border: {
          DEFAULT: "#222222",
          hover: "#333333",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e8c96a",
          muted: "#6b5422",
          bg: "rgba(201,168,76,0.08)",
        },
        tx: {
          DEFAULT: "#f0f0f0",
          muted: "#666666",
          subtle: "#333333",
        },
        status: {
          new: "#5294e0",
          contacted: "#e0a052",
          qualified: "#52c07a",
          rejected: "#555555",
        },
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        "fade-up": "fade-up 0.5s ease forwards",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
