import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Display', 'SF Pro Text', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        white: '#FFFFFF',
        black: '#111111',
        gray: {
          50: '#FAFAFA',
          100: '#F9F9F9',
          200: '#F0F0F0',
          300: '#E5E5E5',
          400: '#CCCCCC',
          500: '#999999',
          600: '#666666',
          700: '#555555',
          800: '#333333',
          900: '#111111',
        },
        accent: {
          400: '#6366F1',
          500: '#4F46E5',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        success: {
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4', letterSpacing: '0em' }],
        sm: ['14px', { lineHeight: '1.5', letterSpacing: '0em' }],
        base: ['16px', { lineHeight: '1.6', letterSpacing: '0em' }],
        lg: ['18px', { lineHeight: '1.6', letterSpacing: '0em' }],
        xl: ['20px', { lineHeight: '1.5', letterSpacing: '0em' }],
        '2xl': ['24px', { lineHeight: '1.3', letterSpacing: '0em' }],
        '3xl': ['36px', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        '4xl': ['48px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        '5xl': ['56px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
      },
      spacing: {
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        none: '0',
        sm: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
        md: '0 4px 12px rgba(0, 0, 0, 0.12)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        focus: '0 0 0 3px rgba(79, 70, 229, 0.1)',
      },
      transitionDuration: {
        150: '150ms',
        300: '300ms',
        500: '500ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require('tailwindcss/plugin')],
};

export default config;
