import baseConfig from '../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './src/intelligence/**/*.{js,jsx,ts,tsx}' ],
};

export default updatedConfig;
