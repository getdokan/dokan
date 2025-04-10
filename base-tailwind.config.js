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
                                'var(--dokan-button-secondary-background-color, #ffffff)',
                            hover: 'var(--dokan-button-secondary-hover-background-color, #ffffff)',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-background-color, #00000000)',
                            hover: 'var(--dokan-button-tertiary-hover-background-color, #DACEFF)',
                        },
                        info: {
                            DEFAULT: 'var(--dokan-button-info-background-color, #0B76B7)',
                            hover: 'var(--dokan-button-info-hover-background-color, #E9F9FF)',
                        },
                        success: {
                            DEFAULT:
                                'var(--dokan-button-success-background-color, #004434)',
                            hover: 'var(--dokan-button-success-hover-background-color, #DAF8E6)',
                        },
                        warning: {
                            DEFAULT:
                                'var(--dokan-button-warning-background-color, #9D5425)',
                            hover: 'var(--dokan-button-warning-hover-background-color, #FFFBEB)',
                        },
                        danger: {
                            DEFAULT:
                                'var(--dokan-button-danger-background-color, #BC1C21)',
                            hover: 'var(--dokan-button-danger-hover-background-color, #FEF3F3)',
                        },
                    },
                    info: {
                        DEFAULT: 'var(--dokan-info-background-color, #E9F9FF)',
                        hover: 'var(--dokan-info-text-color, #0B76B7)',
                    },
                    success: {
                        DEFAULT:
                            'var(--dokan-success-background-color, #DAF8E6)',
                        hover: 'var(--dokan-success-text-color, #004434)',
                    },
                    warning: {
                        DEFAULT:
                            'var(--dokan-warning-background-color, #FFFBEB)',
                        hover: 'var(--dokan-warning-text-color, #9D5425)',
                    },
                    danger: {
                        DEFAULT:
                            'var(--dokan-danger-background-color, #FEF3F3)',
                        hover: 'var(--dokan-danger-text-color, #BC1C21)',
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
                                'var(--dokan-button-secondary-text-color, #7047EB)',
                            hover: 'var(--dokan-button-secondary-hover-text-color, #DACEFF)',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-text-color, var(--dokan-button-background-color, #7047EB))',
                            hover: 'var(--dokan-button-tertiary-hover-text-color, var(--dokan-button-background-color, #7047EB))',
                        },
                        info: {
                            DEFAULT: 'var(--dokan-button-info-text-color, #ffffff)',
                            hover: 'var(--dokan-button-info-hover-text-color, #0B76B7)',
                        },
                        success: {
                            DEFAULT: 'var(--dokan-button-success-text-color, #ffffff)',
                            hover: 'var(--dokan-button-success-hover-text-color, #004434)',
                        },
                        warning: {
                            DEFAULT: 'var(--dokan-button-warning-text-color, #ffffff)',
                            hover: 'var(--dokan-button-warning-hover-text-color, #9D5425)',
                        },
                        danger: {
                            DEFAULT: 'var(--dokan-button-danger-text-color, #ffffff)',
                            hover: 'var(--dokan-button-danger-hover-text-color, #BC1C21)',
                        },
                    },
                    link: {
                        DEFAULT: 'var(--dokan-link-color, var(--dokan-button-background-color, #7047EB))',
                        hover: 'var(--dokan-link-hover-color, var(--dokan-sidebar-background-color, #322067))',
                    },
                    info: {
                        DEFAULT: 'var(--dokan-info-text-color, #0B76B7)',
                        hover: 'var(--dokan-info-background-color, #E9F9FF)',
                        light: 'var(--dokan-info-light-text-color, #637381)',
                    },
                    success: {
                        DEFAULT: 'var(--dokan-success-text-color, #004434)',
                        hover: 'var(--dokan-success-background-color, #DAF8E6)',
                        light: 'var(--dokan-success-light-text-color, #637381)',
                    },
                    warning: {
                        DEFAULT: 'var(--dokan-warning-text-color, #9D5425)',
                        hover: 'var(--dokan-warning-background-color, #FFFBEB)',
                        light: 'var(--dokan-warning-light-text-color, #D0915C)',
                    },
                    danger: {
                        DEFAULT: 'var(--dokan-danger-text-color, #BC1C21)',
                        hover: 'var(--dokan-danger-background-color, #FEF3F3)',
                        light: 'var(--dokan-danger-light-text-color, #F56060)',
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
                            hover: 'var(--dokan-button-secondary-hover-border-color, #DACEFF)',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-border-color, #00000000)',
                            hover: 'var(--dokan-button-tertiary-hover-border-color, var(--dokan-button-border-color, #7047EB))',
                        },
                        info: {
                            DEFAULT: 'var(--dokan-button-info-border-color, #0B76B7)',
                            hover: 'var(--dokan-button-info-hover-border-color, #E9F9FFFF)',
                        },
                        success: {
                            DEFAULT: 'var(--dokan-button-success-border-color, #004434)',
                            hover: 'var(--dokan-button-success-hover-border-color, #DAF8E6FF)',
                        },
                        warning: {
                            DEFAULT: 'var(--dokan-button-warning-border-color, #9D5425)',
                            hover: 'var(--dokan-button-warning-hover-border-color, #FFFBEBFF)',
                        },
                        danger: {
                            DEFAULT: 'var(--dokan-button-danger-border-color, #BC1C21)',
                            hover: 'var(--dokan-button-danger-hover-border-color, #FEF3F3FF)',
                        },
                    },
                    link: {
                        DEFAULT: 'var(--dokan-link-color, var(--dokan-button-background-color, #7047EB))',
                        hover: 'var(--dokan-link-hover-color, var(--dokan-sidebar-background-color, #322067))',
                    },
                    info: {
                        DEFAULT: 'var(--dokan-info-border-color, #E9F9FFFF)',
                        hover: 'var(--dokan-info-text-color, #0B76B7)',
                    },
                    success: {
                        DEFAULT: 'var(--dokan-success-border-color, #DAF8E6FF)',
                        hover: 'var(--dokan-success-text-color, #004434)',
                    },
                    warning: {
                        DEFAULT: 'var(--dokan-warning-border-color, #FFFBEBFF)',
                        hover: 'var(--dokan-warning-text-color, #9D5425)',
                    },
                    danger: {
                        DEFAULT: 'var(--dokan-danger-border-color, #FEF3F3FF)',
                        hover: 'var(--dokan-danger-text-color, #BC1C21)',
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
                            hover: 'var(--dokan-button-secondary-hover-border-color, #DACEFF)',
                        },
                        tertiary: {
                            DEFAULT:
                                'var(--dokan-button-tertiary-border-color, #00000000)',
                            hover: 'var(--dokan-button-tertiary-hover-border-color, var(--dokan-button-border-color, #7047EB))',
                        },
                        info: {
                            DEFAULT: 'var(--dokan-button-info-border-color, #0B76B7)',
                            hover: 'var(--dokan-button-info-hover-border-color, #E9F9FFFF)',
                        },
                        success: {
                            DEFAULT: 'var(--dokan-button-success-border-color, #004434)',
                            hover: 'var(--dokan-button-success-hover-border-color, #DAF8E6FF)',
                        },
                        warning: {
                            DEFAULT: 'var(--dokan-button-warning-border-color, #9D5425)',
                            hover: 'var(--dokan-button-warning-hover-border-color, #FFFBEBFF)',
                        },
                        danger: {
                            DEFAULT: 'var(--dokan-button-danger-border-color, #BC1C21)',
                            hover: 'var(--dokan-button-danger-border-color, #FEF3F3FF)',
                        },
                    },
                    link: {
                        DEFAULT: 'var(--dokan-link-color, var(--dokan-button-background-color, #7047EB))',
                        hover: 'var(--dokan-link-hover-color, var(--dokan-sidebar-background-color, #322067))',
                    },
                    info: {
                        DEFAULT: 'var(--dokan-info-border-color, #E9F9FFFF)',
                        hover: 'var(--dokan-info-text-color, #0B76B7)',
                    },
                    success: {
                        DEFAULT: 'var(--dokan-success-border-color, #DAF8E6FF)',
                        hover: 'var(--dokan-success-text-color, #004434)',
                    },
                    warning: {
                        DEFAULT: 'var(--dokan-warning-border-color, #FFFBEBFF)',
                        hover: 'var(--dokan-warning-text-color, #9D5425)',
                    },
                    danger: {
                        DEFAULT: 'var(--dokan-danger-border-color, #FEF3F3FF)',
                        hover: 'var(--dokan-danger-text-color, #BC1C21)',
                    },
                },
            },
            ringOffsetColor: {
                dokan: {
                    btn: 'var(--dokan-button-border-color, #7047EB)',
                    'btn-secondary': 'var(--dokan-button-secondary-border-color, var(--dokan-button-border-color, #7047EB))',
                    'btn-tertiary': 'var(--dokan-button-tertiary-border-color, #00000000)',
                    link: 'var(--dokan-link-color, var(--dokan-button-background-color, #7047EB))',
                    'link-hover': 'var(--dokan-link-hover-color, var(--dokan-sidebar-background-color, #322067))',
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
                    link: 'var(--dokan-link-color, var(--dokan-button-background-color, #7047EB))',
                    'link-hover': 'var(--dokan-link-hover-color, var(--dokan-sidebar-background-color, #322067))',
                    info: 'var(--dokan-info-border-color, #E9F9FFFF)',
                    success: 'var(--dokan-success-border-color, #DAF8E6FF)',
                    warning: 'var(--dokan-warning-border-color, #FFFBEBFF)',
                    danger: 'var(--dokan-danger-border-color, #FEF3F3FF)',
                },
            },
            colors: {
                dokan: {
                    sidebar: 'var(--dokan-button-background-color, #322067)',
                    btn: 'var(--dokan-button-background-color, #7047EB)',
                    primary: 'var(--dokan-button-background-color, #7047EB)',
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
