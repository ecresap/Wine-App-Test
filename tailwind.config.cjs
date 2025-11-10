const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          900: 'var(--wine-900)',
          800: 'var(--wine-800)',
          700: 'var(--wine-700)',
          600: 'var(--wine-600)',
          500: 'var(--wine-500)',
          400: 'var(--wine-400)',
          300: 'var(--wine-300)',
          200: 'var(--wine-200)',
          100: 'var(--wine-100)',
        },
      },
      fontFamily: {
        // Use Poppins as the primary sans font with fallbacks.
        sans: ['Poppins', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};