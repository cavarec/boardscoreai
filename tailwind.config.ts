import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "ui-serif",
          "Iowan Old Style",
          "Palatino Linotype",
          "Book Antiqua",
          "Georgia",
          "serif",
        ],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "Cascadia Mono",
          "Segoe UI Mono",
          "SFMono-Regular",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        paper: {
          DEFAULT: "var(--bg)",
          raised: "var(--bg-raised)",
          sunken: "var(--bg-sunken)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          faint: "var(--ink-faint)",
        },
        felt: {
          DEFAULT: "var(--felt)",
          strong: "var(--felt-strong)",
          tint: "var(--felt-tint)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          strong: "var(--amber-strong)",
          tint: "var(--amber-tint)",
        },
        brick: {
          DEFAULT: "var(--brick)",
          tint: "var(--brick-tint)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,20,0.06), 0 8px 24px rgba(20,22,20,0.07)",
      },
    },
  },
  plugins: [],
} satisfies Config;
