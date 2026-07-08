import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#18DB4E",
          dark: "#13A93C",
        },
        danger: "#FF5A52",
        info: "#2F86EB",
        surface: {
          DEFAULT: "#171B10",
          hover: "#212615",
        },
        neutral: {
          100: "#0B0D08",
          200: "#1D2216",
          300: "#262B1D",
          400: "#3A4130",
          500: "#5B6350",
          600: "#98A187",
          700: "#C3CBB5",
          900: "#F4F6EE",
        },
      },
      fontFamily: {
        display: [
          "ui-rounded",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 10px rgba(0, 0, 0, 0.4)",
        lift: "0 12px 28px rgba(0, 0, 0, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
