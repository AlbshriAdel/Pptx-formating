import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbf6ec",
        ink: "#1c2c50",
        burnt: "#c84b2c",
        leaf: "#2e7d4f",
        sand: "#f1e9d6",
        khaki: "#8a7a55",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,44,80,.06), 0 4px 16px rgba(28,44,80,.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
