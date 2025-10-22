import baseConfig from '../../../base-tailwind.config';
export default {
    ...baseConfig,
    content: [
        ...baseConfig.content,
        './src/vendor-dashboard/layout/**/*.{js,jsx,ts,tsx}',
    ],
};
