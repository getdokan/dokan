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
                            'var(--dokan-sidebar-background-color, #F05025)',
                        hover: 'var(--dokan-sidebar-hover-background-color, #F05025)',
                    },
                    btn: {
                        DEFAULT:
                            'var(--dokan-button-background-color, #F05025)',
                        hover: 'var(--dokan-button-hover-background-color, #F05025)',
                        secondary: {
                            DEFAULT:
                                'var(--dokan-button-secondary-background-color, var(--dokan-button-text-color, #ffffff))',
                            hover: 'var(--dokan-button-secondary-hover-background-color, var(--dokan-button-background-color, #F05025))',
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
                        DEFAULT: 'var(--dokan-sidebar-text-color, #CFCFCF)',
                        hover: 'var(--dokan-sidebar-hover-text-color, #ffffff)',
                    },
                    btn: {
                        DEFAULT: 'var(--dokan-button-text-color, #ffffff)',
                        hover: 'var(--dokan-button-hover-text-color, #ffffff)',
                        secondary: {
                            DEFAULT:
                                'var(--dokan-button-secondary-text-color, var(--dokan-button-background-color, #F05025))',
                            hover: 'var(--dokan-button-secondary-hover-text-color, var(--dokan-button-text-color, #ffffff))',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-text-color, var(--dokan-button-background-color, #F05025))',
                            hover: 'var(--dokan-button-tertiary-hover-text-color, var(--dokan-button-background-color, #F05025))',
                        },
                    },
                },
            },
            borderColor: {
                dokan: {
                    btn: {
                        DEFAULT: 'var(--dokan-button-border-color, #F05025)',
                        hover: 'var(--dokan-button-hover-border-color, #F05025)',
                        secondary: {
                            DEFAULT:
                                'var(--dokan-button-secondary-border-color, var(--dokan-button-border-color, #F05025))',
                            hover: 'var(--dokan-button-secondary-hover-border-color, var(--dokan-button-border-color, #F05025))',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-border-color, #00000000)',
                            hover: 'var(--dokan-button-tertiary-hover-border-color, var(--dokan-button-border-color, #F05025))',
                        },
                    },
                },
            },
            colors: {
                dokan: {
                    sidebar: 'var(--dokan-button-background-color, #1B233B)',
                    btn: 'var(--dokan-button-background-color, #F05025)',
                    primary: 'var(--dokan-button-background-color, #F05025)',
                    secondary: 'var(--dokan-button-secondary-background-color, var(--dokan-button-text-color, #ffffff))',
                    tertiary: 'var(--dokan-button-tertiary-background-color, #00000000)',
                },
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
