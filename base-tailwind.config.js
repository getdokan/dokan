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
                    info: {
                        DEFAULT: 'var(--dokan-info-background-color, #E9F9FF)',
                    },
                    success: {
                        DEFAULT:
                            'var(--dokan-success-background-color, #DAF8E6)',
                    },
                    warning: {
                        DEFAULT:
                            'var(--dokan-warning-background-color, #FFFBEB)',
                    },
                    danger: {
                        DEFAULT:
                            'var(--dokan-danger-background-color, #FEF3F3)',
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
                    info: {
                        DEFAULT: 'var(--dokan-info-text-color, #0B76B7)',
                    },
                    success: {
                        DEFAULT: 'var(--dokan-success-text-color, #004434)',
                    },
                    warning: {
                        DEFAULT: 'var(--dokan-warning-text-color, #9D5425)',
                    },
                    danger: {
                        DEFAULT: 'var(--dokan-danger-text-color, #BC1C21)',
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
                    info: {
                        DEFAULT: 'var(--dokan-info-border-color, #E9F9FFFF)',
                    },
                    success: {
                        DEFAULT: 'var(--dokan-success-border-color, #DAF8E6FF)',
                    },
                    warning: {
                        DEFAULT: 'var(--dokan-warning-border-color, #FFFBEBFF)',
                    },
                    danger: {
                        DEFAULT: 'var(--dokan-danger-border-color, #FEF3F3FF)',
                    },
                },
            },
            ringColor: {
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
                    info: {
                        DEFAULT: 'var(--dokan-info-border-color, #E9F9FFFF)',
                    },
                    success: {
                        DEFAULT: 'var(--dokan-success-border-color, #DAF8E6FF)',
                    },
                    warning: {
                        DEFAULT: 'var(--dokan-warning-border-color, #FFFBEBFF)',
                    },
                    danger: {
                        DEFAULT: 'var(--dokan-danger-border-color, #FEF3F3FF)',
                    },
                },
            },
            ringOffsetColor: {
                dokan: {
                    btn: 'var(--dokan-button-border-color, #7047EB)',
                    'btn-secondary': 'var(--dokan-button-secondary-border-color, var(--dokan-button-border-color, #7047EB))',
                    'btn-tertiary': 'var(--dokan-button-tertiary-border-color, #00000000)',
                    info: 'var(--dokan-info-border-color, #E9F9FFFF)',
                    success: 'var(--dokan-success-border-color, #DAF8E6FF)',
                    warning: 'var(--dokan-warning-border-color, #FFFBEBFF)',
                    danger: 'var(--dokan-danger-border-color, #FEF3F3FF)',
                },
            },
            outlineColor: {
                dokan: {
                    btn: 'var(--dokan-button-border-color, #7047EB)',
                    'btn-secondary': 'var(--dokan-button-secondary-border-color, var(--dokan-button-border-color, #7047EB))',
                    'btn-tertiary': 'var(--dokan-button-tertiary-border-color, #00000000)',
                    info: 'var(--dokan-info-border-color, #E9F9FFFF)',
                    success: 'var(--dokan-success-border-color, #DAF8E6FF)',
                    warning: 'var(--dokan-warning-border-color, #FFFBEBFF)',
                    danger: 'var(--dokan-danger-border-color, #FEF3F3FF)',
                },
            },
            colors: {
                primary: 'var(--dokan-button-background-color, #7047EB)',
                secondary: 'var(--dokan-button-secondary-background-color, #ffffff)',
                dokan: {
                    sidebar: 'var(--dokan-button-background-color, #322067)',
                    btn: 'var(--dokan-button-background-color, #7047EB)',
                    'btn-secondary': 'var(--dokan-button-secondary-background-color, #ffffff)',
                    'btn-tertiary': 'var(--dokan-button-tertiary-background-color, #00000000)',
                    info: 'var(--dokan-info-color, #0B76B7)',
                    success: 'var(--dokan-success-color, #004434)',
                    warning: 'var(--dokan-warning-color, #9D5425)',
                    danger: 'var(--dokan-danger-color, #BC1C21)',
                    'info-light': 'var(--dokan-info-light-color, #637381)',
                    'success-light': 'var(--dokan-success-light-color, #637381)',
                    'warning-light': 'var(--dokan-warning-light-color, #D0915C)',
                    'danger-light': 'var(--dokan-danger-light-color, #F56060)',
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
