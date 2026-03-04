/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0055A4',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
      },
    },
  },
  plugins: [],
}
