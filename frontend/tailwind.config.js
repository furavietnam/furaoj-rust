/** @type {import('tailwindcss').Config} */
// Logic: Configures Tailwind CSS utility framework design tokens, theme extensions, and content paths.
// Input: Tailwind CSS configuration object.
// Output: Resolved Tailwind configuration module.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        verdict: {
          ac: '#10b981',
          wa: '#f43f5e',
          tle: '#f59e0b',
          mle: '#a855f7',
          ole: '#ec4899',
          ce: '#06b6d4',
          rte: '#ef4444',
          qu: '#3b82f6',
          g: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
};
