/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayush: {
          dark: '#064e3b',
          primary: '#0f766e',
          light: '#ccfbf1',
          accent: '#10b981',
          gold: '#d97706',
          danger: '#dc2626',
          bg: '#f8fafc',
          card: '#ffffff'
        }
      },
      fontSize: {
        'kiosk-xl': ['2.25rem', { lineHeight: '2.75rem' }],
        'kiosk-lg': ['1.75rem', { lineHeight: '2.25rem' }],
        'kiosk-base': ['1.25rem', { lineHeight: '1.75rem' }]
      }
    },
  },
  plugins: [],
};
