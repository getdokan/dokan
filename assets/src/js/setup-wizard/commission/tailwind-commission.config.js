/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
    corePlugins: {
        preflight: false,
    },
    content: [
        './assets/src/js/setup-wizard/commission/**/*.{php,js,jsx,vue,ts,tsx}',
    ],
    theme: {
        extend: {
            screens: {
                ...defaultTheme.screens,
                'd-xs': '360px',
            }
        }
    },
    plugins: [],
};
