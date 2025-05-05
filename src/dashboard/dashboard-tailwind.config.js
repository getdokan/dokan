import baseConfig from '../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ ...baseConfig.content, './src/dashboard/**/*.{js,jsx,ts,tsx}' ],
};

export default updatedConfig;
