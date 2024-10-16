/** @type {import('tailwindcss').Config} */

const { Colors } = require('./constants/Colors');

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
    extend: {
      backgroundColor: {
        'primary-dark': Colors.dark.backgroundPrimary,
        'primary-light': Colors.light.backgroundPrimary,
        'secondary-dark': Colors.dark.backgroundSecondary,
        'secondary-light': Colors.light.backgroundSecondary,
      },
      colors: {
        theme: '#3939ff',
      },
    },
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
