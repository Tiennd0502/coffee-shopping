import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/components/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        primary: ['var(--font-primary)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
