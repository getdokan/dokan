import baseConfig from './../../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './src/admin/dashboard/**/*.{jsx,ts,tsx}' ],
    theme: {
        ...baseConfig?.theme,
        extend: {
            ...baseConfig?.theme?.extend,
            backgroundImage: {
                ...( baseConfig?.theme?.extend?.backgroundImage ?? {} ),
                'upgrade-popup-pattern':
                    "url('../../../assets/src/images/upgrade-popup-bg.png')",
                'upgrade-popup-crown':
                    "url('../../../assets/src/images/upgrade-popup-crown.png')",
                'upgrade-popup-saving':
                    "url('../../../assets/src/images/upgrade-popup-saving.png')",
                'upgrade-popup-money':
                    "url('../../../assets/src/images/upgrade-popup-money.png')",
                'close-icon':
                    "url('../../../assets/src/images/close-icon.png')",
            },
        },
    },
};

export default updatedConfig;
