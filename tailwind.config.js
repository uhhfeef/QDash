/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Your custom colors
        primary: '#4CAF50',
        'primary-dark': '#45a049',
      },
    },
  },
  plugins: [],
}

