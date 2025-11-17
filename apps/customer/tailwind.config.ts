import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
          '100%': { transform: 'translateY(0)' }
        },
        floatReverse: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(12px)' },
          '100%': { transform: 'translateY(0)' }
        },
        floatRandom1: {
          '0%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(12px,-8px)' },
          '50%': { transform: 'translate(0,-16px)' },
          '75%': { transform: 'translate(-12px,-8px)' },
          '100%': { transform: 'translate(0,0)' }
        },
        floatRandom2: {
          '0%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(-10px,-6px)' },
          '50%': { transform: 'translate(0,-14px)' },
          '75%': { transform: 'translate(10px,-6px)' },
          '100%': { transform: 'translate(0,0)' }
        },
        floatRandom3: {
          '0%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(8px,-10px)' },
          '50%': { transform: 'translate(0,-18px)' },
          '75%': { transform: 'translate(-8px,-10px)' },
          '100%': { transform: 'translate(0,0)' }
        },
        floatRandom4: {
          '0%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(-8px,-12px)' },
          '50%': { transform: 'translate(0,-20px)' },
          '75%': { transform: 'translate(8px,-12px)' },
          '100%': { transform: 'translate(0,0)' }
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '70%': { transform: 'scale(1.2)', opacity: '0' },
          '100%': { transform: 'scale(1.2)', opacity: '0' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4.5s ease-in-out infinite',
        'float-slow-reverse': 'floatReverse 7s ease-in-out infinite',
        'float-medium-reverse': 'floatReverse 5s ease-in-out infinite',
        'float-random-1': 'floatRandom1 18s ease-in-out infinite',
        'float-random-2': 'floatRandom2 22s ease-in-out infinite',
        'float-random-3': 'floatRandom3 20s ease-in-out infinite',
        'float-random-4': 'floatRandom4 24s ease-in-out infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards'
      }
    },
  },
  plugins: [],
};
export default config;
