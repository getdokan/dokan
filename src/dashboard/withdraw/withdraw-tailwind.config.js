import baseConfig from '@dokan/root/base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [
        ...baseConfig.content,
        './src/dashboard/withdraw/**/*.{js,jsx,ts,tsx}',
    ],
};

export default updatedConfig;
