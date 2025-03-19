import baseConfig from './../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './src/Status/**/*.{jsx,ts,tsx}' ],
};

export default updatedConfig;
