/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0f',
          raised: '#12121a',
          card: '#16161f',
          border: '#2a2a3a',
        },
        accent: {
          DEFAULT: '#6366f1',
          glow: '#818cf8',
          success: '#34d399',
          warning: '#fbbf24',
          danger: '#f87171',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-success': '0 0 30px rgba(52, 211, 153, 0.2)',
        'glow-danger': '0 0 30px rgba(248, 113, 113, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
