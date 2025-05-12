/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'okx': {
          primary: '#121212',
          secondary: '#1E1E1E',
          accent: '#2EBD85',
          'accent-hover': '#259A6C',
          text: {
            primary: '#FFFFFF',
            secondary: '#848E9C',
            muted: '#5E6673'
          },
          border: '#2A2A2A',
          'hover': '#2A2A2A',
          'button': {
            primary: '#2EBD85',
            secondary: '#1E1E1E',
            danger: '#F6465D'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'okx': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
} 