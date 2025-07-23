import baseConfig from './../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: ['./src/ProFeatures/**/*.{jsx,ts,tsx}'],
    theme: {
        ...baseConfig.theme,
        extend: {
            ...baseConfig.theme?.extend,
            fontFamily: {
                'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
                'inter': ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [
        ...(baseConfig.plugins || []),
        require('tailwind-scrollbar-hide')
    ]
};

export default updatedConfig;