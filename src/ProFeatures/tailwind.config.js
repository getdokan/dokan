import baseConfig from './../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './src/ProFeatures/**/*.{jsx,ts,tsx}' ],
    theme: {
        ...baseConfig.theme,
    },
    plugins: [
        ...( baseConfig.plugins || [] ),
        require( 'tailwind-scrollbar-hide' ),
    ],
};

export default updatedConfig;
