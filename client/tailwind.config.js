/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#090d16',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155'
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b'
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)' }
        }
      }
    }
  },
  plugins: []
};
