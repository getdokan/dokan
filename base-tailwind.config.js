import {
    scopedPreflightStyles,
    isolateInsideOfContainer,
} from 'tailwindcss-scoped-preflight';

const rootClass = '.dokan-layout'; //We will use this class to scope the styles.

/** @type {import('tailwindcss').Config} */
const baseConfig = {
    important: rootClass,
    content: [ './src/**/*.{js,jsx,ts,tsx}', '!./**/*.asset.php' ],
    theme: {
        extend: {
            backgroundColor: {
                dokan: {
                    sidebar: {
                        DEFAULT:
                            'var(--dokan-sidebar-background-color, #322067)',
                        hover: 'var(--dokan-sidebar-hover-background-color, #7047EB)',
                    },
                    btn: {
                        DEFAULT:
                            'var(--dokan-button-background-color, #7047EB)',
                        hover: 'var(--dokan-button-hover-background-color, #502BBF)',
                        secondary: {
                            DEFAULT:
                                'var(--dokan-button-secondary-background-color, var(--dokan-button-text-color, #ffffff))',
                            hover: 'var(--dokan-button-secondary-hover-background-color, var(--dokan-button-background-color, #7047EB))',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-background-color, #00000000)',
                            hover: 'var(--dokan-button-tertiary-hover-background-color, var(--dokan-button-text-color, #ffffff))',
                        },
                    },
                },
            },
            textColor: {
                dokan: {
                    sidebar: {
                        DEFAULT: 'var(--dokan-sidebar-text-color, #DACEFF)',
                        hover: 'var(--dokan-sidebar-hover-text-color, #ffffff)',
                    },
                    btn: {
                        DEFAULT: 'var(--dokan-button-text-color, #ffffff)',
                        hover: 'var(--dokan-button-hover-text-color, #ffffff)',
                        secondary: {
                            DEFAULT:
                                'var(--dokan-button-secondary-text-color, var(--dokan-button-background-color, #7047EB))',
                            hover: 'var(--dokan-button-secondary-hover-text-color, var(--dokan-button-text-color, #ffffff))',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-text-color, var(--dokan-button-background-color, #7047EB))',
                            hover: 'var(--dokan-button-tertiary-hover-text-color, var(--dokan-button-background-color, #7047EB))',
                        },
                    },
                },
            },
            borderColor: {
                dokan: {
                    btn: {
                        DEFAULT: 'var(--dokan-button-border-color, #7047EB)',
                        hover: 'var(--dokan-button-hover-border-color, #370EB1)',
                        secondary: {
                            DEFAULT:
                                'var(--dokan-button-secondary-border-color, var(--dokan-button-border-color, #7047EB))',
                            hover: 'var(--dokan-button-secondary-hover-border-color, var(--dokan-button-border-color, #7047EB))',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-border-color, #00000000)',
                            hover: 'var(--dokan-button-tertiary-hover-border-color, var(--dokan-button-border-color, #7047EB))',
                        },
                    },
                },
            },
            colors: {
                primary: 'var(--dokan-button-background-color, #7047EB)',
                dokan: {
                    sidebar: 'var(--dokan-button-background-color, #322067)',
                    btn: 'var(--dokan-button-background-color, #7047EB)',
                },
            },
            backgroundImage: {
                'upgrade-popup-pattern':
                    "url('/assets/src/images/upgrade-popup-bg.png')",
                'upgrade-popup-crown':
                    "url('/assets/src/images/upgrade-popup-crown.png')",
                'upgrade-popup-saving':
                    "url('/assets/src/images/upgrade-popup-saving.png')",
                'upgrade-popup-money':
                    "url('/assets/src/images/upgrade-popup-money.png')",
                'close-icon':
                    "url('/assets/src/images/close-icon.png')",
            },
        },
    },
    plugins: [
        scopedPreflightStyles( {
            isolationStrategy: isolateInsideOfContainer( rootClass, {} ),
        } ),
        require( '@tailwindcss/typography' ),
        require( '@tailwindcss/forms' ),
        require( '@tailwindcss/container-queries' ),
    ],
};

export default baseConfig;
