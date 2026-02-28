import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-rubik)', 'sans-serif'],
        rubik: ['var(--font-rubik)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#131f35', // Tafa Blue (Footer/Header)
          light: '#2a4165',
          dark: '#0a1120',
        },
        secondary: {
          DEFAULT: '#FF9900', // Tafa Orange (CTA)
          light: '#ffb347',
          dark: '#e68a00',
        },
        text: {
          main: '#707070',    // Tafa Gray (Text)
          dark: '#131f35',    // Headings
          light: '#9ca3af',
        },
        bg: {
          light: '#f5f7fa',   // Off-white premium
          white: '#ffffff',
        }
      },
    },
  },
  plugins: [],
}
export default config

