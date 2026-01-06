import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs principales - Tafa Business
        primary: {
          dark: '#172554',      // Bleu foncé pour headers/footers
          medium: '#1e40af',    // Bleu moyen
          light: '#3b82f6',     // Bleu clair
          // Variantes Tailwind standard
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          yellow: '#facc15',        // Jaune pour boutons CTA
          'yellow-dark': '#eab308', // Jaune foncé pour hover
        },
        // Couleurs de texte
        text: {
          onDark: '#ffffff',    // Texte blanc sur fond sombre
          onLight: '#111827',   // Texte noir sur fond clair
          gray: '#6b7280',      // Texte gris
        },
        // Couleurs de fond
        bg: {
          white: '#ffffff',
          grayLight: '#f9fafb',
          gray: '#f3f4f6',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
export default config

