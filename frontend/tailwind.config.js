/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617', // Deep Navy
        surface: '#0f172a',
        border: 'rgba(14, 165, 233, 0.1)',
        primary: {
          DEFAULT: '#0ea5e9',
          hover: '#0284c7',
        },
        secondary: '#6366f1',
        accent: {
          green: '#10b981',
          red: '#ef4444',
        }
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
