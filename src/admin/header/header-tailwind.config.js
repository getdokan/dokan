import baseConfig from '../../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './src/admin/header/**/*.{js,jsx,ts,tsx}' ],
};

export default updatedConfig;