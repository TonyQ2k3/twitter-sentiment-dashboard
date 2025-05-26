/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eeeefe',
          100: '#d6d5fc',
          200: '#adabf9',
          300: '#8582f6',
          400: '#5D5CDE', // Primary color
          500: '#4241c3',
          600: '#33339d',
          700: '#252576',
          800: '#16164f',
          900: '#080827',
        }
      }
    },
  },
  plugins: [],
}