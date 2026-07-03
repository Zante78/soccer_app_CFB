/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================
        // CFB Brand Kit — die einzige Wahrheitsquelle für Farben
        // Vollständig dokumentiert in docs/brand-kit-cfb.md
        // ============================================================

        // Vereinsblau — primäre Marken-Farbe
        primary: {
          DEFAULT: '#004A9F',
          dark:    '#003479',
          light:   '#1A6ACC',
        },

        // Rheingrün — Success/Health-Signal (max ~3% Farb-Ratio)
        accent: {
          DEFAULT: '#2D9B5A',
          dark:    '#1F7A45',
          light:   '#3DB870',
        },

        // Neutrals mit warmen Blau-Stich (nicht neutrale Greys)
        surface: {
          0: '#F7F9FC',
          1: '#EDF1F7',
          2: '#DDE5F0',
        },
        ink: {
          DEFAULT: '#111820',
          soft:    '#4A5568',
        },
        dark: {
          DEFAULT: '#0A1520',
          alt:     '#0F1F30',
        },

        // Zustands-Farben (bewusst begrenzt)
        error: '#B91C1C',
        amber: {
          DEFAULT: '#D97706',
          light:   '#FEF3C7',
          bg:      '#FFFBEB',
          dark:    '#92400E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        accent:  ['var(--font-accent)', 'sans-serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        sans:    ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
