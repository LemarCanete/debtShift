/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // DebtShift Design System (Constitution III)
        background: '#0A0A0B',
        surface: '#141416',
        primary: '#F59E0B',
        'primary-light': '#FBBF24',
        success: '#10B981',
        'success-light': '#34D399',
        danger: '#EF4444',
        warning: '#F59E0B',
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
        border: '#27272A',
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        hero: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        title: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        subtitle: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-bold': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        small: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
