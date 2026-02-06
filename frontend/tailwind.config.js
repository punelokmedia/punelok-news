/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'abp-red': '#d61f26',
        'abp-dark-red': '#8B0000', // Adjusted to be a rich dark red, original was very dark
        'abp-darker-red': '#2b0a0d', // The top bar color
        'footer-bg': '#1a0505',
        'premium': '#5c3b9f',
        'gold': '#ffcc00',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      maxWidth: {
        'container': '1200px',
      }
    },
  },
  plugins: [],
}
