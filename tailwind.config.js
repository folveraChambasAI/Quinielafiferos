/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        ink: "#0a0a0a",
        cream: "#f5f1e8",
        signal: "#ff3d00",
        grass: "#1a4d2e",
        gold: "#d4a574",
      },
    },
  },
  plugins: [],
};
