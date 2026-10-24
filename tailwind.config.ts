import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        'deep-red': '#C41E3A',
        gold: '#FFD700',
        cream: '#FFF8E7',
        'dark-brown': '#5D4037',
        maroon: '#800000',
        'light-pink': '#FFB6C1',
        turquoise: '#40E0D0',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        serif: ['Cinzel Decorative', 'serif'],
        malayalam: ['Noto Sans Malayalam', 'sans-serif'],
      },
      animation: {
        'sacred-light': 'sacredLight 2s ease-out',
        'flame-flicker': 'flameFlicker 3s ease-in-out infinite',
        'lotus-bloom': 'lotusBloom 1.5s ease-out',
        'float-up': 'floatUp 0.8s ease-out forwards',
        'rotate': 'rotate 60s linear infinite',
      },
      keyframes: {
        sacredLight: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8)',
            filter: 'brightness(0.5)',
          },
          '50%': {
            opacity: '0.7',
            filter: 'brightness(1.2)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
            filter: 'brightness(1)',
          },
        },
        flameFlicker: {
          '0%, 100%': {
            opacity: '0.8',
            transform: 'scale(1)',
          },
          '25%': {
            opacity: '1',
            transform: 'scale(1.05)',
          },
          '50%': {
            opacity: '0.9',
            transform: 'scale(0.95)',
          },
          '75%': {
            opacity: '1',
            transform: 'scale(1.02)',
          },
        },
        lotusBloom: {
          '0%': {
            transform: 'scale(0) rotate(-180deg)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
        floatUp: {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        rotate: {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
