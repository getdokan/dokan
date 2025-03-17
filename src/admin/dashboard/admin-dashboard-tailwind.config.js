import baseConfig from '@dokan/root/base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './src/admin/dashboard/**/*.{jsx,ts,tsx}' ],
};

export default updatedConfig;
