/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
    corePlugins: {
        preflight: false,
    },
    content: [
        './assets/src/js/setup-wizard/commission/**/*.{php,js,jsx,vue,ts,tsx}',
        './src/admin/components/Commission/CategoryBasedCommission.vue',
        './src/admin/components/CombineInput.vue'
    ],
    theme: {
        extend: {
            screens: {
                'xs': '360px',
                ...defaultTheme.screens,
            }
        }
    },
    plugins: [],
};
