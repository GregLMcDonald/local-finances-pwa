/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#111111',
        card: '#1a1a1a',
        border: '#2a2a2a',
        muted: '#6b7280',
        accent: {
          green: '#22c55e',
          orange: '#f97316',
          red: '#ef4444',
          purple: '#a855f7',
          blue: '#3b82f6',
          yellow: '#eab308',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
