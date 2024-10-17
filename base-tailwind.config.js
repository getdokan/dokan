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
                    },
                },
            },
            borderColor: {
                dokan: {
                    btn: {
                        DEFAULT: 'var(--dokan-button-border-color, #F05025)',
                        hover: 'var(--dokan-button-hover-border-color, #F05025)',
                    },
                },
            },
            colors: {
                primary: 'var(--dokan-button-background-color, #F05025)',
                dokan: {
                    sidebar: 'var(--dokan-button-background-color, #1B233B)',
                    btn: 'var(--dokan-button-background-color, #F05025)',
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
    ],
};

module.exports = baseConfig;
