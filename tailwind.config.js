/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './common/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './constants/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-muted': {
          color: '#6c757d', // Default light mode color
        },
        '.dark .text-muted': {
          color: '#adb5bd !important', // Dark mode color
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
