/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
    corePlugins: {
        preflight: false,
    },
    content: [
        './src/admin/components/Commission/CategoryBasedCommission.vue',
        './src/admin/components/CombineInput.vue',
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
