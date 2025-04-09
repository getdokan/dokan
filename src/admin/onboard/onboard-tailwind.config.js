import baseConfig from '../../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [
        ...baseConfig.content,
        './src/admin/onboard/**/*.{js,jsx,ts,tsx}',
    ],
};

export default updatedConfig;
