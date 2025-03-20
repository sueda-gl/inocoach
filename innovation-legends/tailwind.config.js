/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds
        'deep-space': '#0A0E17',
        'midnight-navy': '#121A29',
        'cosmic-slate': '#1E2A45',
        
        // Accent colors
        'electric-blue': '#2D7FF9',
        'teal-pulse': '#05D8C6',
        'amethyst': '#9D5CFF',
        'coral-energy': '#FF5C87',
        
        // Text colors
        'pure-white': '#FFFFFF',
        'soft-silver': '#D1D5DB',
        'ghost-gray': '#8491A7',
      },
      // Animation definitions
      keyframes: {
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        'spin-slow': 'spin-slow 30s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      }
    }
  },
  plugins: [],
} 