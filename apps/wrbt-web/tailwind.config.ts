import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)"
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)"
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)"
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)"
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)"
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)"
        },
        border: "var(--color-border)",
        input: {
          DEFAULT: "var(--color-input)",
          background: "var(--color-input-background)"
        },
        ring: "var(--color-ring)",
        chart: {
          "1": "var(--color-chart-1)",
          "2": "var(--color-chart-2)",
          "3": "var(--color-chart-3)",
          "4": "var(--color-chart-4)",
          "5": "var(--color-chart-5)"
        },
        // Keep legacy colors for backward compatibility
        bg: "var(--wrbt-bg)",
        surface: "var(--wrbt-surface)",
        text: "var(--wrbt-text)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)"
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
