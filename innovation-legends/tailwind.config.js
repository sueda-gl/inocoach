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
        'deep-space': '#121212', // Dark black
        'midnight-navy': '#1E1E1E', // Slightly lighter black
        'cosmic-slate': '#2A2A2A', // Dark gray
        
        // Accent colors
        'electric-blue': '#4A4A4A', // Medium gray
        'teal-pulse': '#757575', // Light gray
        'amethyst': '#A0A0A0', // Silver gray
        'coral-energy': '#C0C0C0', // Very light gray
        
        // Text colors
        'pure-white': '#FFFFFF', // White
        'soft-silver': '#E0E0E0', // Light gray/almost white
        'ghost-gray': '#9E9E9E', // Medium gray for less important text
        
        // New projection accent colors
        'projection-current': '#71717A', // Dark slate gray
        'projection-future': '#4F46E5', // Indigo shade (subtle)
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