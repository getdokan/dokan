import baseConfig from './../../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './src/admin/banner/**/*.{jsx,ts,tsx}' ],
};

export default updatedConfig;
