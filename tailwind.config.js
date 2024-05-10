/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,vue}"
  ],
  theme: {
    extend: {
      screens: {
        'd-xs': '360px',
        ...defaultTheme.screens,
      }
    },
  },
  plugins: [],
}
