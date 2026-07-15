/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#ffe3e5',
          200: '#ffcbd1',
          300: '#ffa1ac',
          400: '#ff6b7d',
          500: '#ff385c',
          600: '#e00d23',
          700: '#d70018',
          800: '#b30010',
          900: '#8a0008',
        },
      }
    },
  },
  plugins: [],
}
