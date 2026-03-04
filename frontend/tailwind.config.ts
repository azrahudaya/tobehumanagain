/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Nunito", "sans-serif"],
        caveat: ["Caveat", "cursive"],
      },
      colors: {
        ink: "#4d3a3f",
        accent: "#fb8968",
        softBlue: "#7f8fbe",
        paper: "#eeefea",
      },
      boxShadow: {
        glow: "0 20px 40px rgba(77, 58, 63, 0.16)",
      },
    },
  },
  plugins: [],
};
