import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        // Design System Core Colors (from DESIGN.md)
        aubergine: {
          DEFAULT: "#4a154b",
          deep: "#481a54",
          press: "#611f69",
          tint: "#592466",
          dark: "#19081a",
          darker: "#120513",
          surface: "#240d25",
          border: "rgba(217, 189, 222, 0.2)",
          mute: "#d9bdde",
        },
        brand: {
          primary: "#4a154b",
          "primary-deep": "#481a54",
          "primary-press": "#611f69",
          "primary-tint": "#592466",
          ink: "#1d1d1d",
          "ink-mute": "#696969",
          "link-blue": "#1264a3",
          "link-hover": "#3860be",
          canvas: "#ffffff",
          "canvas-cream": "#f4ede4",
          "canvas-lavender": "#f9f0ff",
          hairline: "#e6e6e6",
          error: "#cc4117",
          success: "#007a5a",
          mauve: "#d9bdde",
        },
        slate: {
          850: "#181824",
          900: "#130914",
          950: "#0c040d",
        },
      },
      borderRadius: {
        pill: "90px",
        xl: "16px",
        xxl: "48px",
      },
      letterSpacing: {
        "tight-xxl": "-0.768px",
        "tight-xl": "-0.464px",
        "tight-lg": "-0.6px",
        "tight-md": "-0.256px",
        "tight-sm": "-0.096px",
        "micro-cap": "0.96px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
