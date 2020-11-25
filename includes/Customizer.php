<?php

namespace WeDevs\Dokan;

use WP_Customize_Control;
use WP_Customize_Manager;

/**
 * Dokan Customiezr
 */
class Customizer {

    /**
     * Settings capability
     *
     * @var string
     */
    private $capability = 'manage_options';

    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'customize_register', [ $this, 'add_sections' ] );
        add_action( 'customize_controls_enqueue_scripts', [ $this, 'enqueue_control_scripts' ] );
        add_action( 'customize_preview_init', [ $this, 'enqueue_preview_scripts' ] );
    }

    /**
     * Enequeue customize scripts for previewer
     *
     * @return void
     */
    public function enqueue_preview_scripts() {
        wp_enqueue_script( 'dokan-customize-preview', DOKAN_PLUGIN_ASSEST . '/js/customize-preview.js', [ 'customize-preview', 'customize-selective-refresh' ], '20201123', true );
    }

    /**
     * Enqueue customize scripts for controls
     *
     * @return void
     */
    public function enqueue_control_scripts() {
        wp_enqueue_script( 'dokan-customize-conrol', DOKAN_PLUGIN_ASSEST . '/js/customize-controls.js', [ 'jquery', 'customize-controls' ], '20201123', true );
    }

    /**
     * Add settings to the customizer.
     */
    public function add_sections( WP_Customize_Manager $wp_customize ) {
        $wp_customize->add_panel(
            'dokan',
            [
                'priority'   => 200,
                'capability' => $this->capability,
                'title'      => __( 'Dokan', 'dokan-lite' ),
            ]
        );

        $this->add_store_section( $wp_customize );
    }

    /**
     * Add store sections
     *
     * @return void
     */
    protected function add_store_section( WP_Customize_Manager $wp_customize ) {
        $wp_customize->add_section(
            'dokan_store',
            [
                'title'    => __( 'Store Page', 'dokan-lite' ),
                'priority' => 10,
                'panel'    => 'dokan',
            ]
        );

        $wp_customize->add_setting(
            'store_layout',
            [
                'default'    => 'left',
                'capability' => $this->capability,
            ]
        );

        $wp_customize->add_control(
            new Customizer\RadioImageControl(
                $wp_customize,
                'store_layout',
                [
                    'settings' => 'store_layout',
                    'section'  => 'dokan_store',
                    'label'    => __( 'Page Layout', 'dokan-lite' ),
                    'priority' => 1,
                    'choices'  => [
                        'left'  => [
                            'label' => __( 'Left Sidebar', 'dokan-lite' ),
                            'svg'   => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 50"><defs/><g fill="none" fill-rule="evenodd" stroke="#3498DB"><rect width="67" height="49" x=".5" y=".5" rx="3"/><rect width="34" height="35" x="28.5" y="7.5" rx="3"/><rect width="16" height="35" x="6.5" y="7.5" fill="#3498DB" rx="3"/></g></svg>',
                        ],
                        'right'  => [
                            'label' => __( 'Right Sidebar', 'dokan-lite' ),
                            'svg'   => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 50"><defs/><g fill="none" fill-rule="evenodd" stroke="#3498DB"><rect width="67" height="49" x=".5" y=".5" rx="3"/><rect width="34" height="35" x="7.5" y="7.5" rx="3"/><rect width="16" height="35" x="46.5" y="7.5" fill="#3498DB" rx="3"/></g></svg>',
                        ],
                        'full'  => [
                            'label' => __( 'No Sidebar', 'dokan-lite' ),
                            'svg'   => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 50"><defs/><g fill="none" fill-rule="evenodd" stroke="#3498DB"><rect width="67" height="49" x=".5" y=".5" rx="3"/><rect width="49" height="35" x="10.5" y="7.5" fill="#3498DB" rx="3"/></g></svg>',
                        ],
                    ],
                ]
            )
        );

        $wp_customize->add_setting(
            'dokan_appearance[enable_theme_store_sidebar]',
            [
                'default'              => 'off',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => [ $this, 'bool_to_on_off' ],
                'sanitize_js_callback' => [ $this, 'on_off_to_bool' ],
            ]
        );

        $wp_customize->add_control(
            'enable_theme_sidebar',
            [
                'label'           => __( 'Use theme sidebar', 'dokan-lite' ),
                'section'         => 'dokan_store',
                'priority'        => 2,
                'settings'        => 'dokan_appearance[enable_theme_store_sidebar]',
                'type'            => 'checkbox',
                'active_callback' => function () {
                    return 'full' !== get_theme_mod( 'store_layout' );
                },
            ]
        );

        $wp_customize->add_setting(
            'dokan_appearance[store_header_template]',
            [
                'default'              => 'on',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'transport'            => 'postMessage',
            ]
        );

        $wp_customize->add_control(
            new Customizer\RadioImageControl(
                $wp_customize,
                'store_header_template',
                [
                    'settings' => 'dokan_appearance[store_header_template]',
                    'section'  => 'dokan_store',
                    'label'    => __( 'Header Template', 'dokan-lite' ),
                    'priority' => 3,
                    'choices'  => [
                        'default'  => [
                            'label' => __( 'Default Layout', 'dokan-lite' ),
                            'svg'   => '<svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="0 0 352 192"><defs/><g data-name="Group 11 Copy" transform="translate(1 1)"><path fill="#fff" stroke="#e5e5e5" stroke-miterlimit="10" stroke-width="2" d="M0 0h350v190H0z" data-name="Rectangle Copy 37"/><path fill="#0272ad" d="M26 20h133v150H26z" data-name="Rectangle Copy 38"/><circle cx="20.5" cy="20.5" r="20.5" fill="#fff" transform="translate(72 39)"/><rect width="50" height="5" fill="#fff" rx="2.5" transform="translate(68 88)"/><rect width="50" height="3" fill="#fff" data-name="Rectangle Copy 25" rx="1.5" transform="translate(60 116)"/><rect width="60" height="3" fill="#fff" data-name="Rectangle Copy 30" rx="1.5" transform="translate(60 126)"/><rect width="5" height="5" fill="#fff" data-name="Rectangle Copy 27" rx="2.5" transform="translate(49 115)"/><rect width="5" height="5" fill="#fff" data-name="Rectangle Copy 36" rx="2.5" transform="translate(49 125)"/><rect width="40" height="3" fill="#fff" data-name="Rectangle Copy 43" rx="1.5" transform="translate(60 136)"/><rect width="5" height="5" fill="#fff" data-name="Rectangle Copy 41" rx="2.5" transform="translate(49 135)"/><path fill="#dcdcdc" d="M306 152h18v18h-18z" data-name="Rectangle Copy 39"/><path fill="#dcdcdc" d="M254 152h18v18h-18z" data-name="Rectangle Copy 40"/><path fill="#dcdcdc" d="M280 152h18v18h-18z" data-name="Rectangle Copy 42"/><path fill="#dcdcdc" d="M214 96.667l20-25.5 14.286 17.028 20-25.528 25.714 34z"/></g></svg>',
                        ],
                        'layout1'  => [
                            'label' => __( 'Layout 2', 'dokan-lite' ),
                            'svg'   => '<svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="0 0 352 192"><defs/><g data-name="Group 20 Copy" transform="translate(1 1)"><path fill="#fff" stroke="#e5e5e5" stroke-miterlimit="10" stroke-width="2" d="M0 0h350v190H0z" data-name="Rectangle Copy 37"/><path fill="rgba(220,220,220,0.2)" stroke="#e5e5e5" stroke-miterlimit="10" stroke-width="2" d="M0 0h350v118H0z" data-name="Rectangle Copy 37"/><path fill="#0272ad" d="M26 77h85v86H26z" data-name="Rectangle Copy 38"/><rect width="50" height="5" fill="#0272ad" rx="2.5" transform="translate(129 101)"/><rect width="70" height="5" fill="#0272ad" data-name="Rectangle Copy 44" rx="2.5" transform="translate(129 91)"/><rect width="50" height="3" fill="#0272ad" data-name="Rectangle Copy 25" rx="1.5" transform="translate(140 131)"/><rect width="60" height="3" fill="#0272ad" data-name="Rectangle Copy 30" rx="1.5" transform="translate(140 141)"/><rect width="5" height="5" fill="#0272ad" data-name="Rectangle Copy 27" rx="2.5" transform="translate(129 130)"/><rect width="5" height="5" fill="#0272ad" data-name="Rectangle Copy 36" rx="2.5" transform="translate(129 140)"/><rect width="40" height="3" fill="#0272ad" data-name="Rectangle Copy 43" rx="1.5" transform="translate(140 151)"/><rect width="5" height="5" fill="#0272ad" data-name="Rectangle Copy 41" rx="2.5" transform="translate(129 150)"/><path fill="#dcdcdc" d="M306 85h18v18h-18z" data-name="Rectangle Copy 39"/><path fill="#dcdcdc" d="M254 85h18v18h-18z" data-name="Rectangle Copy 40"/><path fill="#dcdcdc" d="M280 85h18v18h-18z" data-name="Rectangle Copy 42"/><path fill="#dcdcdc" d="M190 59l17.5-22.5L220 51.525 237.5 29 260 59z"/></g></svg>',
                        ],
                        'layout2'  => [
                            'label' => __( 'Layout 3', 'dokan-lite' ),
                            'svg'   => '<svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="0 0 352 192"><defs/><g data-name="Group 19 Copy" transform="translate(1 1)"><path fill="#fff" stroke="#e5e5e5" stroke-miterlimit="10" stroke-width="2" d="M0 0h350v190H0z" data-name="Rectangle Copy 45"/><path fill="rgba(220,220,220,0.2)" stroke="#e5e5e5" stroke-miterlimit="10" stroke-width="2" d="M0 0h350v98H0z" data-name="Rectangle Copy 46"/><rect width="43.185" height="44" fill="#0272ad" data-name="Rectangle Copy 47" rx="21.593" transform="translate(153 69)"/><rect width="80" height="5" fill="#0272ad" data-name="Rectangle Copy 48" rx="2.5" transform="translate(135 124)"/><g fill="#0272ad" data-name="Group 14"><g data-name="Group 12" transform="translate(95 138)"><rect width="30" height="3" data-name="Rectangle Copy 50" rx="1.5" transform="translate(11 1)"/><rect width="5" height="5" data-name="Rectangle Copy 52" rx="2.5"/></g><g data-name="Group 12 Copy" transform="translate(155 138)"><rect width="30" height="3" data-name="Rectangle Copy 50" rx="1.5" transform="translate(11 1)"/><rect width="5" height="5" data-name="Rectangle Copy 52" rx="2.5"/></g><g data-name="Group 12 Copy 2" transform="translate(215 138)"><rect width="30" height="3" data-name="Rectangle Copy 50" rx="1.5" transform="translate(11 1)"/><rect width="5" height="5" data-name="Rectangle Copy 52" rx="2.5"/></g></g><g fill="#dcdcdc" data-name="Group 13"><path d="M192 153h18v18h-18z" data-name="Rectangle Copy 56"/><path d="M140 153h18v18h-18z" data-name="Rectangle Copy 57"/><path d="M166 153h18v18h-18z" data-name="Rectangle Copy 58"/></g><path fill="#dcdcdc" d="M145 47l15-19.5 10.714 13.022 15-19.522L205 47z" data-name="Path Copy 3"/></g></svg>',
                        ],
                        'layout3'  => [
                            'label' => __( 'Layout 4', 'dokan-lite' ),
                            'svg'   => '<svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="0 0 352 192"><defs/><g data-name="Group 18 Copy"><path fill="#fff" stroke="#e5e5e5" stroke-miterlimit="10" stroke-width="2" d="M1 1h350v190H1z" data-name="Rectangle Copy 37"/><g fill="#0272ad" data-name="Group 17" transform="translate(44 63)"><circle cx="30" cy="30" r="30"/><g data-name="Group 16" transform="translate(77 3)"><rect width="70" height="5" rx="2.5"/><rect width="50" height="5" data-name="Rectangle Copy 49" rx="2.5" transform="translate(0 12)"/></g><g data-name="Group 15" transform="translate(77 42)"><rect width="50" height="3" data-name="Rectangle Copy 25" rx="1.5" transform="translate(16 1)"/><rect width="60" height="3" data-name="Rectangle Copy 30" rx="1.5" transform="translate(16 11)"/><rect width="5" height="5" data-name="Rectangle Copy 27" rx="2.5"/><rect width="5" height="5" data-name="Rectangle Copy 36" rx="2.5" transform="translate(0 10)"/><rect width="40" height="3" data-name="Rectangle Copy 43" rx="1.5" transform="translate(16 21)"/><rect width="5" height="5" data-name="Rectangle Copy 41" rx="2.5" transform="translate(0 20)"/></g></g><path fill="#dcdcdc" d="M307 153h18v18h-18z" data-name="Rectangle Copy 39"/><path fill="#dcdcdc" d="M255 153h18v18h-18z" data-name="Rectangle Copy 40"/><path fill="#dcdcdc" d="M281 153h18v18h-18z" data-name="Rectangle Copy 42"/><path fill="#dcdcdc" d="M254 97.667l17.75-22.5 12.679 15.025 17.75-22.525 22.821 30z"/></g></svg>',
                        ],
                    ],
                ]
            )
        );

        $wp_customize->add_control(
            new Customizer\HeadingControl(
                $wp_customize,
                'hide_info',
                [
                    'section'  => 'dokan_store',
                    'label'    => __( 'Vendor Info', 'dokan-lite' ),
                    'settings' => [],
                ]
            )
        );

        $wp_customize->add_setting(
            'dokan_appearance[hide_vendor_info][email]',
            [
                'default'              => '',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => [ $this, 'bool_to_string' ],
                'sanitize_js_callback' => [ $this, 'empty_to_bool' ],
                // 'transport'            => 'postMessage',
            ]
        );

        $wp_customize->add_control(
            'hide_vendor_email',
            [
                'label'    => __( 'Hide email address', 'dokan-lite' ),
                'section'  => 'dokan_store',
                'settings' => 'dokan_appearance[hide_vendor_info][email]',
                'type'     => 'checkbox',
            ]
        );

        $wp_customize->add_setting(
            'dokan_appearance[hide_vendor_info][phone]',
            [
                'default'              => '',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => [ $this, 'bool_to_string' ],
                'sanitize_js_callback' => [ $this, 'empty_to_bool' ],
                // 'transport'            => 'postMessage',
            ]
        );

        $wp_customize->add_control(
            'hide_vendor_phone',
            [
                'label'    => __( 'Hide phone number', 'dokan-lite' ),
                'section'  => 'dokan_store',
                'settings' => 'dokan_appearance[hide_vendor_info][phone]',
                'type'     => 'checkbox',
            ]
        );

        $wp_customize->add_setting(
            'dokan_appearance[hide_vendor_info][address]',
            [
                'default'              => '',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => [ $this, 'bool_to_string' ],
                'sanitize_js_callback' => [ $this, 'empty_to_bool' ],
                // 'transport'            => 'postMessage',
            ]
        );

        $wp_customize->add_control(
            'hide_vendor_address',
            [
                'label'    => __( 'Hide store address', 'dokan-lite' ),
                'section'  => 'dokan_store',
                'settings' => 'dokan_appearance[hide_vendor_info][address]',
                'type'     => 'checkbox',
            ]
        );

        if ( isset( $wp_customize->selective_refresh ) ) {
            $wp_customize->selective_refresh->add_partial(
                'store_header_template',
                [
                    'selector'            => '.dokan-profile-frame-wrapper',
                    'container_inclusive' => true,
                    'settings'            => [
                        'dokan_appearance[store_header_template]',
                    ],
                    'render_callback'     => function () {
                        dokan_get_template_part( 'store-header' );
                    },
                ]
            );
        }

        $wp_customize->add_control(
            new Customizer\HeadingControl(
                $wp_customize,
                'sidebar_heading',
                [
                    'section'         => 'dokan_store',
                    'label'           => __( 'Sidebar Widgets', 'dokan-lite' ),
                    'settings'        => [],
                    'active_callback' => [ $this, 'should_display_widget_controls' ],
                ]
            )
        );

        $wp_customize->add_setting(
            'dokan_appearance[store_map]',
            [
                'default'              => 'on',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => [ $this, 'bool_to_on_off' ],
                'sanitize_js_callback' => [ $this, 'on_off_to_bool' ],
                'transport'            => 'postMessage',
            ]
        );

        $wp_customize->add_control(
            'store_map',
            [
                'label'           => __( 'Show store map', 'dokan-lite' ),
                'section'         => 'dokan_store',
                'settings'        => 'dokan_appearance[store_map]',
                'type'            => 'checkbox',
                'active_callback' => [ $this, 'should_display_widget_controls' ],
            ]
        );

        $wp_customize->add_setting(
            'dokan_appearance[contact_seller]',
            [
                'default'              => 'on',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => [ $this, 'bool_to_on_off' ],
                'sanitize_js_callback' => [ $this, 'on_off_to_bool' ],
                'transport'            => 'postMessage',
            ]
        );

        $wp_customize->add_control(
            'contact_seller',
            [
                'label'           => __( 'Show vendor contact form', 'dokan-lite' ),
                'section'         => 'dokan_store',
                'settings'        => 'dokan_appearance[contact_seller]',
                'type'            => 'checkbox',
                'active_callback' => [ $this, 'should_display_widget_controls' ],
            ]
        );

        $wp_customize->add_setting(
            'dokan_appearance[store_open_close]',
            [
                'default'              => 'on',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => [ $this, 'bool_to_on_off' ],
                'sanitize_js_callback' => [ $this, 'on_off_to_bool' ],
            ]
        );

        $wp_customize->add_control(
            'store_open_close',
            [
                'label'           => __( 'Show store opening/closing Time', 'dokan-lite' ),
                'section'         => 'dokan_store',
                'settings'        => 'dokan_appearance[store_open_close]',
                'type'            => 'checkbox',
                'active_callback' => [ $this, 'should_display_widget_controls' ],
            ]
        );

        /*
         * Do selective refresh based on the jQuery selectors
         */
        if ( isset( $wp_customize->selective_refresh ) ) {
            $wp_customize->selective_refresh->add_partial(
                'store_map',
                [
                    'selector'            => '.dokan-store-location',
                    'container_inclusive' => true,
                    'fallback_refresh'    => true,
                    'settings'            => [
                        'dokan_appearance[store_map]',
                    ],
                    'render_callback'     => function () {
                        dokan_store_location_widget();
                    },
                ]
            );

            $wp_customize->selective_refresh->add_partial(
                'store_open_close',
                [
                    'selector'            => '.dokan-store-widget.dokan-store-open-close',
                    'container_inclusive' => true,
                    'fallback_refresh'    => true,
                    'settings'            => [
                        'dokan_appearance[store_open_close]',
                    ],
                    'render_callback'     => function () {
                        dokan_store_time_widget();
                    },
                ]
            );

            $wp_customize->selective_refresh->add_partial(
                'contact_seller',
                [
                    'selector'            => '.dokan-store-contact',
                    'container_inclusive' => true,
                    'fallback_refresh'    => true,
                    'settings'            => [
                        'dokan_appearance[contact_seller]',
                    ],
                    'render_callback'     => function () {
                        dokan_store_contact_widget();
                    },
                ]
            );
        }
    }

    /**
     * Activate/deactivate controls if store sidebar is enabled
     *
     * When the theme sidebar is enabled, we need to deactivate the
     * sidebar widget controls. It's been done instantly from JS in
     * the `customize-controls.js` file, but when the preview
     * refreshes, it appears again because customizer values are set
     * again when it does. So based on the settings chosen from the
     * customizer, we need to activate/deactivate from the PHP side
     * as well.
     *
     * @return bool
     */
    public function should_display_widget_controls( WP_Customize_Control $control ) {
        $setting = $control->manager->get_setting( 'dokan_appearance[enable_theme_store_sidebar]' );

        if ( ! $setting ) {
            return true;
        }

        return 'on' !== $setting->value() && 'full' !== get_theme_mod( 'store_layout' );
    }

    /**
     * Converts a boolean value to a 'on' or 'off'.
     *
     * @param bool $bool
     *
     * @return string
     */
    public function bool_to_on_off( $bool ) {
        if ( ! is_bool( $bool ) ) {
            $bool = $this->on_off_to_bool( $bool );
        }

        return true === $bool ? 'on' : 'off';
    }

    /**
     * Convert a 'on' or 'off' to boolean
     *
     * @param string $value
     *
     * @return bool
     */
    public function on_off_to_bool( $value ) {
        return $value === 'on' ? true : false;
    }

    /**
     * Convert an empty value to boolean
     *
     * @param string $value
     *
     * @return bool
     */
    public function empty_to_bool( $value ) {
        return empty( $value ) ? false : true;
    }

    /**
     * Convert a boolean value to empty/string
     *
     * @param string $value
     *
     * @return bool
     */
    public function bool_to_string( $value, $obj ) {
        $id_data = $obj->id_data();

        // assuming it's a multi dimentional array, like: dokan_appearance[hide_vendor_info][email]
        // here: keys[0] = hide_vendor_info, keys[1]: email
        $name = isset( $id_data['keys'][1] ) ? $id_data['keys'][1] : $id_data['keys'][0];

        return is_bool( $value ) && $value ? $name : '';
    }
}
