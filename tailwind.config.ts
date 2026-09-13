import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        civic: {
          navy: "#1E3A5F",
          teal: "#0D9488",
          amber: "#D97706",
          canvas: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        primary: {
          DEFAULT: "#1E3A5F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0D9488",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "IBM Plex Sans Arabic", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
