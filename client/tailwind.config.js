/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#07111E',
          card: '#0D1B2A',
          cardLight: '#14253B',
          accent: '#E6C665',
          neon: '#00F0FF',
          blue: '#1E40AF',
        }
      }
    },
  },
  plugins: [],
}