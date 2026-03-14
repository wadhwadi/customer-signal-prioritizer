import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0B0E14",
        "bg-surface": "#141820",
        "border-main": "#1E2532",
        accent: "#22D3EE",
        "text-primary": "#E2E8F0",
        "text-muted": "#7B8BA3",
      },
    },
  },
  plugins: [],
};

export default config;
