/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'matrix-bg': '#0a0a0a',
        'matrix-glass': 'rgba(23, 23, 23, 0.6)',
        'matrix-accent': '#A8C7FA',
        'matrix-text': '#ececec',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        'matrix': '16px',
      },
    },
  },
  plugins: [],
};
