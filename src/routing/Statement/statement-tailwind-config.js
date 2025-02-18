import baseConfig from '../../../base-tailwind.config';

export default {
    ...baseConfig,
    content: [
        ...baseConfig.content,
        './src/routing/Statement/**/*.{js,jsx,ts,tsx}',
    ],
};
