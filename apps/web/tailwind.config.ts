import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#fffdf7",
        saffron: "#d97706",
        trust: "#075985",
        leaf: "#166534",
        danger: "#b91c1c"
      },
      boxShadow: {
        soft: "0 8px 20px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
