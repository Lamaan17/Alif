import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "ink" is the primary text — WHITE on the dark theme.
        ink: {
          DEFAULT: "#FFFFFF",
          soft: "#D4D4D4",
          muted: "#7A7A7A",
        },
        // "paper" is the surface. paper.deep is the true-black page bg;
        // paper.DEFAULT is a slightly-lifted black used for cards.
        paper: {
          DEFAULT: "#0A0A0A",
          deep: "#000000",
          warm: "#141414",
          line: "#262626",
        },
        // moss is a quiet accent — used for "interested", match, success state.
        // The 50/100 are dark-tinted backgrounds; 500/600/700 are bright
        // foreground green so badges like `bg-moss-50 text-moss-700` still
        // contrast on dark.
        moss: {
          50: "#0F1F15",
          100: "#1A2E1F",
          500: "#7AB58F",
          600: "#8EC6A2",
          700: "#A3D5B5",
        },
        // gold is rarely used — pending state, warm accent in dark-mode CTAs.
        gold: {
          50: "#1F1A0F",
          100: "#2E261A",
          500: "#D9B97D",
          600: "#E6CC95",
        },
      },
      fontFamily: {
        // Single font family — Inter — across the entire UI, weight does the work.
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Hairline + drop, calibrated for dark surfaces.
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 1px 2px 0 rgba(0,0,0,0.5)",
        cardHover:
          "0 0 0 1px rgba(255,255,255,0.10), 0 12px 28px -12px rgba(0,0,0,0.6)",
        ring: "0 0 0 4px rgba(122,181,143,0.20)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        "grid-faint":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
