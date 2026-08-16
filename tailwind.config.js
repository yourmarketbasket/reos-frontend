/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf7',   // Cream/parchment background
          100: '#f7eedc',  // Very light champagne gold
          200: '#ebd7af',  // Light gold accent
          300: '#debfa2',  // Soft gold
          500: '#c9973f',  // Primary logo gold
          600: '#b58331',  // Mid gold hover
          700: '#9a6d23',  // Dark gold
          900: '#64430e',  // Deep amber/bronze
        },
        dark: '#1c1712',   // Rich charcoal dark brown (luxury feel)
      },
      fontFamily: {
        sans: ['Josefin Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Josefin Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
