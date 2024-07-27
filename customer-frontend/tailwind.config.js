/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      ocean: "#011829",
      deepOcean: "#030F1C",
      aqua: "#C0E6FF",
      cloud: "#FFFFFF",
      sea: "#4DA2FF",
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
  },
  plugins: [],
};