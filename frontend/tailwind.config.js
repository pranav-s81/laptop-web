/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#f8fafc',
        'on-surface': '#0f172a',
        'on-surface-variant': '#475569',
        'surface-container-low': '#f1f5f9',
        'surface-container-high': '#e2e8f0',
        'surface-container-lowest': '#ffffff',
        'outline': '#cbd5e1',
        'outline-variant': '#e2e8f0',
        'primary-dim': '#4338ca',
        'success-container': '#ecfdf5',
        'success': '#10b981',
        'error': '#ef4444',
      },
      fontFamily: {
        hanken: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
