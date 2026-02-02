import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--wrbt-bg)",
        surface: "var(--wrbt-surface)",
        text: "var(--wrbt-text)",
        muted: "var(--wrbt-muted)",
        accent: "var(--wrbt-accent)",
        border: "var(--wrbt-border)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["SFMono-Regular", "ui-monospace", "SFMono", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
