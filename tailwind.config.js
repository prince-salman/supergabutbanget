/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mpl: {
          maroon: '#680008',
          maroonDark: '#4A0006',
          maroonHover: '#82000C',
          red: '#d32f2f',
          redDark: '#b71c1c',
          gold: '#f1c40f',
          goldDark: '#d4af37',
          blue: '#0070ba',
          bgLight: '#f8f9fa',
          bgCard: '#ffffff',
          darkBg: '#0f141d',
          cardDark: '#18202c',
          cardBorder: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        heading: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'float-trophy': 'floatTrophy 3s infinite ease-in-out',
        'talk-glow': 'talkGlow 1.5s infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.7)' },
          '70%': { boxShadow: '0 0 0 12px rgba(211, 47, 47, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
        },
        floatTrophy: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        talkGlow: {
          'from': { boxShadow: '0 0 5px rgba(241, 196, 15, 0.3)' },
          'to': { boxShadow: '0 0 16px rgba(241, 196, 15, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
