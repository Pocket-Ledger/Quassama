import { green, red } from 'react-native-reanimated/lib/typescript/Colors';

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./App.js', './components/**/*.{js,jsx,ts,tsx}', 'screens/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#34C759',
          500: '#34C759',
        },
        gray: {
          DEFAULT: '#00000040',
          200: '#00000033',
          250: '#00000040',
        },
        red: {
          DEFAULT: '#ff3b30',
          500: '#ff3b30',
        },
        primary: {
          DEFAULT: '#2979FF',
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2979FF',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
        text: {
          primary: 'rgba(0, 0, 0, 1)',
          secondary: 'rgba(0, 0, 0, 0.7)',
          disabled: 'rgba(0, 0, 0, 0.38)',
        },
        border: {
          light: 'rgba(0, 0, 0, 0.2)',
          medium: 'rgba(0, 0, 0, 0.38)',
        },
        error: {
          DEFAULT: '#FF3B30',
          light: '#FFEBEE',
        },
        placeholder: 'rgba(0, 0, 0, 0.2)',
      },
      fontFamily: {
        dmsans: ['DM Sans'],
        'dmsans-medium': ['DM Sans Medium'],
        'dmsans-bold': ['DM Sans Bold'],
      },
      fontSize: {
        title: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        subtitle: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        label: ['16px', { lineHeight: '20px', fontWeight: '400' }],
        button: ['16px', { lineHeight: '24px', fontWeight: '700' }],
      },
      spacing: {
        18: '72px',
        22: '88px',
      },
      borderRadius: {
        input: '8px',
        button: '8px',
      },
      boxShadow: {
        input: '0 1px 3px rgba(0, 0, 0, 0.1)',
        button: '0 2px 8px rgba(41, 121, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
