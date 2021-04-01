<?php

namespace WeDevs\Dokan;

class Assets {

    /**
     * The constructor
     */
    public function __construct() {
        add_action( 'init', [ $this, 'register_all_scripts' ], 10 );
        add_filter( 'dokan_localized_args', [ $this, 'conditional_localized_args' ] );

        if ( is_admin() ) {
            add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ] );
        } else {
            add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_front_scripts' ] );
        }
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts( $hook ) {
        global $post;
        global $wp_version;

        // load vue app inside the parent menu only
        if ( 'toplevel_page_dokan' === $hook ) {
            $localize_script = $this->get_admin_localized_scripts();

            // Load common styles and scripts
            wp_enqueue_script( 'dokan-tinymce' );
            wp_enqueue_style( 'dokan-admin-css' );
            wp_enqueue_script( 'underscore' );
            wp_enqueue_media();

            wp_enqueue_script( 'dokan-tooltip' );
            wp_enqueue_script( 'dokan-admin' );

            // load styles
            wp_enqueue_style( 'dokan-vue-vendor' );
            wp_enqueue_style( 'dokan-vue-admin' );
            wp_enqueue_style( 'dokan-tinymce' );

            // load vue libraries and bootstrap the app
            wp_enqueue_script( 'dokan-accounting' );
            wp_enqueue_script( 'dokan-chart' );
            wp_enqueue_script( 'dokan-vue-vendor' );
            wp_localize_script( 'dokan-vue-vendor', 'dokan', $localize_script );
            wp_enqueue_script( 'dokan-vue-bootstrap' );
            $this->load_gmap_script();

            // allow other plugins to load scripts before the main app loads
            // @codingStandardsIgnoreLine
            do_action( 'dokan-vue-admin-scripts' );

            // fire the admin app
            wp_enqueue_script( 'dokan-vue-admin' );

            if ( version_compare( $wp_version, '5.3', '<' ) ) {
                wp_enqueue_style( 'dokan-wp-version-before-5-3' );
            }
        }

        if ( 'dokan_page_dokan-modules' === $hook ) {
            wp_enqueue_style( 'dokan-admin-css' );
            wp_enqueue_script( 'underscore' );
            wp_enqueue_media();
            wp_enqueue_script( 'dokan-tooltip' );
            wp_enqueue_script( 'dokan-admin' );
        }

        if ( get_post_type( $post ) === 'dokan_slider' ) {
            wp_enqueue_script( 'media-upload' );
            wp_enqueue_script( 'thickbox' );
            wp_enqueue_style( 'thickbox' );
        }

        if ( get_post_type( $post ) === 'post' || get_post_type( $post ) === 'page' ) {
            wp_enqueue_script( 'dokan-tooltip' );
            wp_enqueue_script( 'dokan-admin' );
        }

        if ( 'plugins.php' === $hook ) {
            wp_enqueue_style( 'dokan-plugin-list-css' );
        }

        do_action( 'dokan_enqueue_admin_scripts' );
    }

    public function get_localized_price() {
        return [
            'precision' => wc_get_price_decimals(),
            'symbol'    => html_entity_decode( get_woocommerce_currency_symbol() ),
            'decimal'   => esc_attr( wc_get_price_decimal_separator() ),
            'thousand'  => esc_attr( wc_get_price_thousand_separator() ),
            'format'    => esc_attr( str_replace( [ '%1$s', '%2$s' ], [ '%s', '%v' ], get_woocommerce_price_format() ) ), // For accounting JS
        ];
    }

    /**
     * SPA Routes
     *
     * @return array
     */
    public function get_vue_admin_routes() {
        $routes = [
            [
                'path'      => '/',
                'name'      => 'Dashboard',
                'component' => 'Dashboard',
            ],
            [
                'path'      => '/withdraw',
                'name'      => 'Withdraw',
                'component' => 'Withdraw',
            ],
            [
                'path'      => '/premium',
                'name'      => 'Premium',
                'component' => 'Premium',
            ],
            [
                'path'      => '/help',
                'name'      => 'Help',
                'component' => 'Help',
            ],
            [
                'path'      => '/settings',
                'name'      => 'Settings',
                'component' => 'Settings',
            ],
            [
                'path'      => '/vendors',
                'name'      => 'Vendors',
                'component' => 'Vendors',
            ],
            [
                'path'      => '/vendor-capabilities',
                'name'      => 'VendorCapabilities',
                'component' => 'VendorCapabilities',
            ],
            [
                'path'      => '/pro-modules',
                'name'      => 'ProModules',
                'component' => 'ProModules',
            ],
        ];

        // @codingStandardsIgnoreLine
        return apply_filters( 'dokan-admin-routes', $routes );
    }

    public function get_vue_frontend_routes() {
        $routes = [];

        // @codingStandardsIgnoreLine
        return apply_filters( 'dokan-frontend-routes', $routes );
    }

    /**
     * Register all Dokan scripts and styles
     */
    public function register_all_scripts() {
        $styles  = $this->get_styles();
        $scripts = $this->get_scripts();

        $this->register_styles( $styles );
        $this->register_scripts( $scripts );

        do_action( 'dokan_register_scripts' );
    }

    /**
     * Get registered styles
     *
     * @return array
     */
    public function get_styles() {
        $styles = [
            'dokan-style' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/style.css',
                'version' => filemtime( DOKAN_DIR . '/assets/css/style.css' ),
            ],
            'dokan-tinymce' => [
                'src'     => site_url( '/wp-includes/css/editor.css' ),
                'deps'    => [],
                'version' => time(),
            ],
            'jquery-ui' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/vendors/jquery-ui/jquery-ui-1.10.0.custom.css',
            ],
            'dokan-fontawesome' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/vendors/font-awesome/font-awesome.min.css',
            ],
            'dokan-magnific-popup' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/vendors/magnific/magnific-popup.css',
            ],
            'dokan-select2-css' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/vendors/select2/select2.css',
            ],
            'dokan-rtl-style' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/rtl.css',
            ],
            'dokan-plugin-list-css' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/plugin.css',
            ],
            'dokan-timepicker' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/vendors/jquery-ui/timepicker/timepicker.min.css',
            ],
            'dokan-admin-css' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/admin.css',
                'version' => filemtime( DOKAN_DIR . '/assets/css/admin.css' ),
            ],
            'dokan-vue-vendor' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/vue-vendor.css',
                'version' => filemtime( DOKAN_DIR . '/assets/css/vue-vendor.css' ),
            ],
            'dokan-vue-bootstrap' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/vue-bootstrap.css',
                'deps'    => [ 'dokan-vue-vendor' ],
                'version' => filemtime( DOKAN_DIR . '/assets/css/vue-bootstrap.css' ),
            ],
            'dokan-flaticon' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/font/flaticon.css',
                'version' => filemtime( DOKAN_DIR . '/assets/font/flaticon.css' ),
            ],
            'dokan-vue-admin' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/vue-admin.css',
                'deps'    => [ 'dokan-vue-vendor', 'dokan-vue-bootstrap', 'dokan-flaticon' ],
                'version' => filemtime( DOKAN_DIR . '/assets/css/vue-admin.css' ),
            ],
            'dokan-vue-frontend' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/vue-frontend.css',
                'version' => filemtime( DOKAN_DIR . '/assets/css/vue-frontend.css' ),
            ],
            'dokan-wp-version-before-5-3' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/css/wp-version-before-5-3.css',
                'version' => filemtime( DOKAN_DIR . '/assets/css/wp-version-before-5-3.css' ),
            ],
        ];

        return $styles;
    }

    /**
     * Get all registered scripts
     *
     * @return array
     */
    public function get_scripts() {
        global $wp_version;

        $suffix         = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
        $asset_url      = DOKAN_PLUGIN_ASSEST;
        $asset_path     = DOKAN_DIR . '/assets/';
        $bootstrap_deps = [ 'dokan-vue-vendor', 'dokan-i18n-jed' ];

        if ( version_compare( $wp_version, '5.0', '<' ) ) {
            $bootstrap_deps[] = 'dokan-wp-packages';
        } else {
            $bootstrap_deps[] = 'wp-hooks';
        }

        $scripts = [
            'jquery-tiptip' => [
                'src'       => WC()->plugin_url() . '/assets/js/jquery-tiptip/jquery.tipTip' . $suffix . '.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-i18n-jed' => [
                'src'       => $asset_url . '/vendors/i18n/jed.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-accounting' => [
                'src'       => WC()->plugin_url() . '/assets/js/accounting/accounting.min.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-tinymce' => [
                'src'       => site_url( '/wp-includes/js/tinymce/tinymce.min.js' ),
                'deps'      => [],
            ],
            'dokan-tinymce-plugin' => [
                'src'     => DOKAN_PLUGIN_ASSEST . '/vendors/tinymce/code/plugin.min.js',
                'deps'    => [ 'dokan-tinymce' ],
                'version' => time(),
            ],
            'dokan-moment' => [
                'src'       => $asset_url . '/vendors/moment/moment.min.js',
            ],
            'dokan-chart' => [
                'src'       => $asset_url . '/vendors/chart/Chart.min.js',
                'deps'      => [ 'dokan-moment', 'jquery' ],
            ],
            'dokan-tabs' => [
                'src'       => $asset_url . '/vendors/easytab/jquery.easytabs.min.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-popup' => [
                'src'       => $asset_url . '/vendors/magnific/jquery.magnific-popup.min.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-tooltip' => [
                'src'       => $asset_url . '/vendors/tooltips/tooltips.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-form-validate' => [
                'src'       => $asset_url . '/vendors/form-validate/form-validate.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-select2-js' => [
                'src'       => $asset_url . '/vendors/select2/select2.full.min.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-timepicker' => [
                'src'       => $asset_url . '/vendors/jquery-ui/timepicker/timepicker.min.js',
                'deps'      => [ 'jquery' ],
                'in_footer' => false,
            ],

            // customize scripts
            'customize-base' => [
                'src'       => site_url( 'wp-includes/js/customize-base.js' ),
                'deps'      => [ 'jquery', 'json2', 'underscore' ],
            ],
            'customize-model' => [
                'src'       => site_url( 'wp-includes/js/customize-models.js' ),
                'deps'      => [ 'underscore', 'backbone' ],
            ],

            // Register core scripts
            'dokan-flot' => [
                'src'       => $asset_url . '/js/flot-all.min.js',
                'deps'      => [ 'jquery' ],
            ],
            'speaking-url' => [
                'src'       => $asset_url . '/js/speakingurl.min.js',
                'deps'      => [ 'jquery' ],
            ],
            'dokan-admin' => [
                'src'       => $asset_url . '/js/dokan-admin.js',
                'deps'      => [ 'jquery', 'dokan-i18n-jed' ],
                'version'   => filemtime( $asset_path . '/js/dokan-admin.js' ),
            ],
            'dokan-vendor-registration' => [
                'src'       => $asset_url . '/js/vendor-registration.js',
                'deps'      => [ 'dokan-form-validate', 'jquery', 'speaking-url', 'dokan-i18n-jed' ],
                'version'   => filemtime( $asset_path . '/js/vendor-registration.js' ),
            ],
            'dokan-script' => [
                'src'       => $asset_url . '/js/dokan.js',
                'deps'      => [ 'imgareaselect', 'customize-base', 'customize-model', 'dokan-i18n-jed', 'jquery-tiptip' ],
                'version'   => filemtime( $asset_path . '/js/dokan.js' ),
            ],
            'dokan-vue-vendor' => [
                'src'       => $asset_url . '/js/vue-vendor.js',
                'version'   => filemtime( $asset_path . '/js/vue-vendor.js' ),
                'deps'      => [ 'dokan-i18n-jed', 'dokan-tinymce-plugin', 'dokan-chart' ],
            ],
            'dokan-vue-bootstrap' => [
                'src'       => $asset_url . '/js/vue-bootstrap.js',
                'deps'      => $bootstrap_deps,
                'version'   => filemtime( $asset_path . '/js/vue-bootstrap.js' ),
            ],
            'dokan-vue-admin' => [
                'src'       => $asset_url . '/js/vue-admin.js',
                'deps'      => [ 'jquery', 'jquery-ui-datepicker', 'dokan-i18n-jed', 'dokan-vue-vendor', 'dokan-vue-bootstrap' ],
                'version'   => filemtime( $asset_path . '/js/vue-admin.js' ),
            ],
            'dokan-vue-frontend' => [
                'src'       => $asset_url . '/js/vue-frontend.js',
                'deps'      => [ 'jquery', 'dokan-i18n-jed', 'dokan-vue-vendor', 'dokan-vue-bootstrap' ],
                'version'   => filemtime( $asset_path . '/js/vue-frontend.js' ),
            ],
            'dokan-wp-packages' => [
                'src'       => $asset_url . '/js/dokan-wp.js',
                'deps'      => [ 'jquery' ],
                'version'   => filemtime( $asset_path . '/js/dokan-wp.js' ),
            ],
            'dokan-login-form-popup' => [
                'src'       => $asset_url . '/js/login-form-popup.js',
                'deps'      => [ 'dokan-popup', 'dokan-i18n-jed' ],
                'version'   => filemtime( $asset_path . '/js/login-form-popup.js' ),
            ],
        ];

        return $scripts;
    }

    /**
     * Enqueue front-end scripts
     */
    public function enqueue_front_scripts() {
        if ( ! function_exists( 'WC' ) ) {
            return;
        }

        // load dokan style on every pages. requires for shortcodes in other pages
        if ( DOKAN_LOAD_STYLE ) {
            wp_enqueue_style( 'dokan-style' );
            wp_enqueue_style( 'dokan-fontawesome' );

            if ( is_rtl() ) {
                wp_enqueue_style( 'dokan-rtl-style' );
            }
        }

        $default_script = [
            'ajaxurl'            => admin_url( 'admin-ajax.php' ),
            'nonce'              => wp_create_nonce( 'dokan_reviews' ),
            'ajax_loader'        => DOKAN_PLUGIN_ASSEST . '/images/ajax-loader.gif',
            'seller'             => [
                'available'     => __( 'Available', 'dokan-lite' ),
                'notAvailable'  => __( 'Not Available', 'dokan-lite' ),
            ],
            'delete_confirm'     => __( 'Are you sure?', 'dokan-lite' ),
            'wrong_message'      => __( 'Something went wrong. Please try again.', 'dokan-lite' ),
            'vendor_percentage'  => dokan_get_seller_percentage( dokan_get_current_user_id() ),
            'commission_type'    => dokan_get_commission_type( dokan_get_current_user_id() ),
            'rounding_precision' => wc_get_rounding_precision(),
            'mon_decimal_point'  => wc_get_price_decimal_separator(),
            'product_types'      => apply_filters( 'dokan_product_types', [ 'simple' ] ),
        ];

        $localize_script     = apply_filters( 'dokan_localized_args', $default_script );
        $vue_localize_script = apply_filters(
            'dokan_frontend_localize_script', [
                'rest' => [
                    'root'    => esc_url_raw( get_rest_url() ),
                    'nonce'   => wp_create_nonce( 'wp_rest' ),
                    'version' => 'dokan/v1',
                ],
                'api'             => null,
                'libs'            => [],
                'routeComponents' => [ 'default' => null ],
                'routes'          => $this->get_vue_frontend_routes(),
                'urls'            => [
                    'assetsUrl' => DOKAN_PLUGIN_ASSEST,
                ],
            ]
        );

        $localize_data = array_merge( $localize_script, $vue_localize_script );

        wp_localize_script( 'dokan-i18n-jed', 'dokan', $localize_data );

        // load only in dokan dashboard and product edit page
        if ( ( dokan_is_seller_dashboard() || ( get_query_var( 'edit' ) && is_singular( 'product' ) ) ) || apply_filters( 'dokan_forced_load_scripts', false ) ) {
            $this->dokan_dashboard_scripts();
        }

        // store and my account page
        if (
            dokan_is_store_page()
            || dokan_is_store_review_page()
            || is_account_page()
            || is_product()
            || dokan_is_store_listing()
        ) {
            if ( DOKAN_LOAD_STYLE ) {
                wp_enqueue_style( 'dokan-select2-css' );
            }

            if ( DOKAN_LOAD_SCRIPTS ) {
                self::load_form_validate_script();
                $this->load_gmap_script();

                wp_enqueue_script( 'jquery-ui-sortable' );
                wp_enqueue_script( 'jquery-ui-datepicker' );
                wp_enqueue_script( 'dokan-tooltip' );
                wp_enqueue_script( 'dokan-form-validate' );
                wp_enqueue_script( 'speaking-url' );
                wp_enqueue_script( 'dokan-vendor-registration' );
                wp_enqueue_script( 'dokan-script' );
                wp_enqueue_script( 'dokan-select2-js' );
            }
        }

        wp_enqueue_script( 'dokan-login-form-popup' );

        do_action( 'dokan_enqueue_scripts' );
    }

    /**
     * Load form validate script args
     *
     * @since 2.5.3
     */
    public static function load_form_validate_script() {
        $form_validate_messages = [
            'required'        => __( 'This field is required', 'dokan-lite' ),
            'remote'          => __( 'Please fix this field.', 'dokan-lite' ),
            'email'           => __( 'Please enter a valid email address.', 'dokan-lite' ),
            'url'             => __( 'Please enter a valid URL.', 'dokan-lite' ),
            'date'            => __( 'Please enter a valid date.', 'dokan-lite' ),
            'dateISO'         => __( 'Please enter a valid date (ISO).', 'dokan-lite' ),
            'number'          => __( 'Please enter a valid number.', 'dokan-lite' ),
            'digits'          => __( 'Please enter only digits.', 'dokan-lite' ),
            'creditcard'      => __( 'Please enter a valid credit card number.', 'dokan-lite' ),
            'equalTo'         => __( 'Please enter the same value again.', 'dokan-lite' ),
            'maxlength_msg'   => __( 'Please enter no more than {0} characters.', 'dokan-lite' ),
            'minlength_msg'   => __( 'Please enter at least {0} characters.', 'dokan-lite' ),
            'rangelength_msg' => __( 'Please enter a value between {0} and {1} characters long.', 'dokan-lite' ),
            'range_msg'       => __( 'Please enter a value between {0} and {1}.', 'dokan-lite' ),
            'max_msg'         => __( 'Please enter a value less than or equal to {0}.', 'dokan-lite' ),
            'min_msg'         => __( 'Please enter a value greater than or equal to {0}.', 'dokan-lite' ),
        ];

        // @codingStandardsIgnoreLine
        wp_localize_script( 'dokan-form-validate', 'DokanValidateMsg', apply_filters( 'DokanValidateMsg_args', $form_validate_messages ) );
    }

    /**
     * Load Dokan Dashboard Scripts
     *
     * @since 2.5.3
     *
     * @global type $wp
     */
    public function dokan_dashboard_scripts() {
        global $wp;

        if ( DOKAN_LOAD_STYLE ) {
            wp_enqueue_style( 'jquery-ui' );
            wp_enqueue_style( 'dokan-magnific-popup' );
            wp_enqueue_style( 'woocommerce-general' );
            wp_enqueue_style( 'dokan-select2-css' );
            wp_enqueue_style( 'dokan-timepicker' );
        }

        if ( DOKAN_LOAD_SCRIPTS ) {
            self::load_form_validate_script();
            $this->load_gmap_script();

            wp_enqueue_script( 'jquery' );
            wp_enqueue_script( 'jquery-ui' );
            wp_enqueue_script( 'jquery-ui-autocomplete' );
            wp_enqueue_script( 'jquery-ui-datepicker' );
            wp_enqueue_script( 'underscore' );
            wp_enqueue_script( 'post' );
            wp_enqueue_script( 'dokan-tooltip' );
            wp_enqueue_script( 'dokan-form-validate' );
            wp_enqueue_script( 'dokan-tabs' );
            wp_enqueue_script( 'dokan-chart' );
            wp_enqueue_script( 'dokan-flot' );
            wp_enqueue_script( 'dokan-select2-js' );
            wp_enqueue_media();
            wp_enqueue_script( 'dokan-accounting' );
            wp_enqueue_script( 'serializejson' );
            wp_enqueue_script( 'dokan-popup' );
            wp_enqueue_script( 'wc-password-strength-meter' );
            wp_enqueue_script( 'dokan-script' );
        }

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] === 'store' ) {
            wp_enqueue_script( 'wc-country-select' );
            wp_enqueue_script( 'dokan-timepicker' );
        }
    }

    /**
     * Load google map script
     *
     * @since 2.5.3
     */
    public function load_gmap_script() {
        $script_src = null;
        $source     = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );

        if ( 'google_maps' === $source ) {
            $api_key = dokan_get_option( 'gmap_api_key', 'dokan_appearance', false );

            if ( $api_key ) {
                $query_args = apply_filters(
                    'dokan_google_maps_script_query_args', [
                        'key' => $api_key,
                    ]
                );

                $script_src = add_query_arg( $query_args, 'https://maps.googleapis.com/maps/api/js' );

                wp_enqueue_script( 'dokan-maps', $script_src, [], DOKAN_PLUGIN_VERSION, true );
            }
        } elseif ( 'mapbox' === $source ) {
            $access_token = dokan_get_option( 'mapbox_access_token', 'dokan_appearance', null );

            if ( $access_token ) {
                wp_enqueue_style( 'dokan-mapbox-gl', 'https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.css', [], DOKAN_PLUGIN_VERSION );
                wp_enqueue_style( 'dokan-mapbox-gl-geocoder', 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.2.0/mapbox-gl-geocoder.css', [ 'dokan-mapbox-gl' ], DOKAN_PLUGIN_VERSION );

                wp_enqueue_script( 'dokan-mapbox-gl-geocoder', 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.2.0/mapbox-gl-geocoder.min.js', [], DOKAN_PLUGIN_VERSION, true );
                wp_enqueue_script( 'dokan-maps', 'https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.js', [ 'dokan-mapbox-gl-geocoder' ], DOKAN_PLUGIN_VERSION, true );
            }
        }

        // Backward compatibility script handler
        wp_register_script( 'google-maps', DOKAN_PLUGIN_ASSEST . '/js/dokan-maps-compat.js', [ 'dokan-maps' ], DOKAN_PLUGIN_VERSION, true );
    }

    /**
     * Filter 'dokan' localize script's arguments
     *
     * @since 2.5.3
     *
     * @param array $default_args
     *
     * @return $default_args
     */
    public function conditional_localized_args( $default_args ) {
        if ( dokan_is_seller_dashboard()
            || ( get_query_var( 'edit' ) && is_singular( 'product' ) )
            || dokan_is_store_page()
            || is_account_page()
            || is_product()
            || dokan_is_store_listing()
            || apply_filters( 'dokan_force_load_extra_args', false )
        ) {
            $general_settings = get_option( 'dokan_general', [] );

            $locale          = localeconv();
            $decimal         = isset( $locale['decimal_point'] ) ? $locale['decimal_point'] : '.';
            $banner_width    = dokan_get_option( 'store_banner_width', 'dokan_appearance', 625 );
            $banner_height   = dokan_get_option( 'store_banner_height', 'dokan_appearance', 300 );
            $has_flex_width  = ! empty( $general_settings['store_banner_flex_width'] ) ? $general_settings['store_banner_flex_width'] : true;
            $has_flex_height = ! empty( $general_settings['store_banner_flex_height'] ) ? $general_settings['store_banner_flex_height'] : true;

            $custom_args = [
                'i18n_choose_featured_img'            => __( 'Upload featured image', 'dokan-lite' ),
                'i18n_choose_file'                    => __( 'Choose a file', 'dokan-lite' ),
                'i18n_choose_gallery'                 => __( 'Add Images to Product Gallery', 'dokan-lite' ),
                'i18n_choose_featured_img_btn_text'   => __( 'Set featured image', 'dokan-lite' ),
                'i18n_choose_file_btn_text'           => __( 'Insert file URL', 'dokan-lite' ),
                'i18n_choose_gallery_btn_text'        => __( 'Add to gallery', 'dokan-lite' ),
                'duplicates_attribute_messg'          => __( 'Sorry, this attribute option already exists, Try a different one.', 'dokan-lite' ),
                'variation_unset_warning'             => __( 'Warning! This product will not have any variations if this option is not checked.', 'dokan-lite' ),
                'new_attribute_prompt'                => __( 'Enter a name for the new attribute term:', 'dokan-lite' ),
                'remove_attribute'                    => __( 'Remove this attribute?', 'dokan-lite' ),
                'dokan_placeholder_img_src'           => wc_placeholder_img_src(),
                'add_variation_nonce'                 => wp_create_nonce( 'add-variation' ),
                'link_variation_nonce'                => wp_create_nonce( 'link-variations' ),
                'delete_variations_nonce'             => wp_create_nonce( 'delete-variations' ),
                'load_variations_nonce'               => wp_create_nonce( 'load-variations' ),
                'save_variations_nonce'               => wp_create_nonce( 'save-variations' ),
                'bulk_edit_variations_nonce'          => wp_create_nonce( 'bulk-edit-variations' ),
                /* translators: %d: max linked variation. */
                'i18n_link_all_variations'            => esc_js( sprintf( __( 'Are you sure you want to link all variations? This will create a new variation for each and every possible combination of variation attributes (max %d per run).', 'dokan-lite' ), defined( 'WC_MAX_LINKED_VARIATIONS' ) ? WC_MAX_LINKED_VARIATIONS : 50 ) ),
                'i18n_enter_a_value'                  => esc_js( __( 'Enter a value', 'dokan-lite' ) ),
                'i18n_enter_menu_order'               => esc_js( __( 'Variation menu order (determines position in the list of variations)', 'dokan-lite' ) ),
                'i18n_enter_a_value_fixed_or_percent' => esc_js( __( 'Enter a value (fixed or %)', 'dokan-lite' ) ),
                'i18n_delete_all_variations'          => esc_js( __( 'Are you sure you want to delete all variations? This cannot be undone.', 'dokan-lite' ) ),
                'i18n_last_warning'                   => esc_js( __( 'Last warning, are you sure?', 'dokan-lite' ) ),
                'i18n_choose_image'                   => esc_js( __( 'Choose an image', 'dokan-lite' ) ),
                'i18n_set_image'                      => esc_js( __( 'Set variation image', 'dokan-lite' ) ),
                'i18n_variation_added'                => esc_js( __( 'variation added', 'dokan-lite' ) ),
                'i18n_variations_added'               => esc_js( __( 'variations added', 'dokan-lite' ) ),
                'i18n_no_variations_added'            => esc_js( __( 'No variations added', 'dokan-lite' ) ),
                'i18n_remove_variation'               => esc_js( __( 'Are you sure you want to remove this variation?', 'dokan-lite' ) ),
                'i18n_scheduled_sale_start'           => esc_js( __( 'Sale start date (YYYY-MM-DD format or leave blank)', 'dokan-lite' ) ),
                'i18n_scheduled_sale_end'             => esc_js( __( 'Sale end date (YYYY-MM-DD format or leave blank)', 'dokan-lite' ) ),
                'i18n_edited_variations'              => esc_js( __( 'Save changes before changing page?', 'dokan-lite' ) ),
                'i18n_variation_count_single'         => esc_js( __( '%qty% variation', 'dokan-lite' ) ),
                'i18n_variation_count_plural'         => esc_js( __( '%qty% variations', 'dokan-lite' ) ),
                'i18n_no_result_found'                => esc_js( __( 'No Result Found', 'dokan-lite' ) ),
                'i18n_sales_price_error'              => esc_js( __( 'Please insert value less than the regular price!', 'dokan-lite' ) ),
                /* translators: %s: decimal */
                'i18n_decimal_error'                  => sprintf( __( 'Please enter with one decimal point (%s) without thousand separators.', 'dokan-lite' ), $decimal ),
                /* translators: %s: price decimal separator */
                'i18n_mon_decimal_error'              => sprintf( __( 'Please enter with one monetary decimal point (%s) without thousand separators and currency symbols.', 'dokan-lite' ), wc_get_price_decimal_separator() ),
                'i18n_country_iso_error'              => __( 'Please enter in country code with two capital letters.', 'dokan-lite' ),
                'i18n_sale_less_than_regular_error'   => __( 'Please enter in a value less than the regular price.', 'dokan-lite' ),
                'i18n_delete_product_notice'          => __( 'This product has produced sales and may be linked to existing orders. Are you sure you want to delete it?', 'dokan-lite' ),
                'i18n_remove_personal_data_notice'    => __( 'This action cannot be reversed. Are you sure you wish to erase personal data from the selected orders?', 'dokan-lite' ),
                'decimal_point'                       => $decimal,
                'mon_decimal_point'                   => wc_get_price_decimal_separator(),
                'variations_per_page'                 => absint( apply_filters( 'dokan_product_variations_per_page', 10 ) ),
                'store_banner_dimension'              => [
                    'width'       => $banner_width,
                    'height'      => $banner_height,
                    'flex-width'  => $has_flex_width,
                    'flex-height' => $has_flex_height,
                ],
                'selectAndCrop'                       => __( 'Select and Crop', 'dokan-lite' ),
                'chooseImage'                         => __( 'Choose Image', 'dokan-lite' ),
                'product_title_required'              => __( 'Product title is required', 'dokan-lite' ),
                'product_category_required'           => __( 'Product category is required', 'dokan-lite' ),
                'search_products_nonce'               => wp_create_nonce( 'search-products' ),
                'search_products_tags_nonce'          => wp_create_nonce( 'search-products-tags' ),
                'search_customer_nonce'               => wp_create_nonce( 'search-customer' ),
                'i18n_matches_1'                      => __( 'One result is available, press enter to select it.', 'dokan-lite' ),
                'i18n_matches_n'                      => __( '%qty% results are available, use up and down arrow keys to navigate.', 'dokan-lite' ),
                'i18n_no_matches'                     => __( 'No matches found', 'dokan-lite' ),
                'i18n_ajax_error'                     => __( 'Loading failed', 'dokan-lite' ),
                'i18n_input_too_short_1'              => __( 'Please enter 1 or more characters', 'dokan-lite' ),
                'i18n_input_too_short_n'              => __( 'Please enter %qty% or more characters', 'dokan-lite' ),
                'i18n_input_too_long_1'               => __( 'Please delete 1 character', 'dokan-lite' ),
                'i18n_input_too_long_n'               => __( 'Please delete %qty% characters', 'dokan-lite' ),
                'i18n_selection_too_long_1'           => __( 'You can only select 1 item', 'dokan-lite' ),
                'i18n_selection_too_long_n'           => __( 'You can only select %qty% items', 'dokan-lite' ),
                'i18n_load_more'                      => __( 'Loading more results&hellip;', 'dokan-lite' ),
                'i18n_searching'                      => __( 'Searching&hellip;', 'dokan-lite' ),
                'i18n_ok_text'                        => __( 'OK', 'dokan-lite' ),
                'i18n_cancel_text'                    => __( 'Cancel', 'dokan-lite' ),
                'i18n_date_format'                    => get_option( 'date_format' ),
                'dokan_banner_added_alert_msg'        => __( 'Are you sure? You have uploaded banner but didn\'t click the Update Settings button!', 'dokan-lite' ),
            ];

            $default_args = array_merge( $default_args, $custom_args );
        }

        return $default_args;
    }

    /**
     * Get file prefix
     *
     * @return string
     */
    public function get_prefix() {
        $prefix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

        return $prefix;
    }

    /**
     * Register scripts
     *
     * @param array $scripts
     *
     * @return void
     */
    public function register_scripts( $scripts ) {
        foreach ( $scripts as $handle => $script ) {
            $deps      = isset( $script['deps'] ) ? $script['deps'] : false;
            $in_footer = isset( $script['in_footer'] ) ? $script['in_footer'] : true;
            $version   = isset( $script['version'] ) ? $script['version'] : DOKAN_PLUGIN_VERSION;

            wp_register_script( $handle, $script['src'], $deps, $version, $in_footer );
        }
    }

    /**
     * Register styles
     *
     * @param array $styles
     *
     * @return void
     */
    public function register_styles( $styles ) {
        foreach ( $styles as $handle => $style ) {
            $deps    = isset( $style['deps'] ) ? $style['deps'] : false;
            $version = isset( $style['version'] ) ? $style['version'] : DOKAN_PLUGIN_VERSION;

            wp_register_style( $handle, $style['src'], $deps, $version );
        }
    }

    /**
     * Enqueue the scripts
     *
     * @param array $scripts
     *
     * @return void
     */
    public function enqueue_scripts( $scripts ) {
        foreach ( $scripts as $handle => $script ) {
            wp_enqueue_script( $handle );
        }
    }

    /**
     * Enqueue styles
     *
     * @param array $styles
     *
     * @return void
     */
    public function enqueue_styles( $styles ) {
        foreach ( $styles as $handle => $script ) {
            wp_enqueue_style( $handle );
        }
    }

    /**
     * Admin localized scripts
     *
     * @since 3.0.0
     *
     * @return array
     */
    public function get_admin_localized_scripts() {
        $general_settings = get_option( 'dokan_general', [] );
        $banner_width     = dokan_get_option( 'store_banner_width', 'dokan_appearance', 625 );
        $banner_height    = dokan_get_option( 'store_banner_height', 'dokan_appearance', 300 );
        $has_flex_width   = ! empty( $general_settings['store_banner_flex_width'] ) ? $general_settings['store_banner_flex_width'] : true;
        $has_flex_height  = ! empty( $general_settings['store_banner_flex_height'] ) ? $general_settings['store_banner_flex_height'] : true;
        $locale           = localeconv();
        $decimal          = isset( $locale['decimal_point'] ) ? $locale['decimal_point'] : '.';

        return apply_filters(
            'dokan_admin_localize_script', [
                'ajaxurl' => admin_url( 'admin-ajax.php' ),
                'nonce'   => wp_create_nonce( 'dokan_admin' ),
                'rest'    => [
                    'root'    => esc_url_raw( get_rest_url() ),
                    'nonce'   => wp_create_nonce( 'wp_rest' ),
                    'version' => 'dokan/v1',
                ],
                'api'             => null,
                'libs'            => [],
                'routeComponents' => [ 'default' => null ],
                'routes'          => $this->get_vue_admin_routes(),
                'currency'        => $this->get_localized_price(),
                'proNag'          => dokan()->is_pro_exists() ? 'hide' : get_option( 'dokan_hide_pro_nag', 'show' ),
                'hasPro'          => dokan()->is_pro_exists(),
                'proVersion'      => dokan()->is_pro_exists() ? dokan_pro()->version : '',
                'i18n'            => [ 'dokan-lite' => dokan_get_jed_locale_data( 'dokan-lite' ) ],
                'urls'            => [
                    'adminRoot'    => admin_url(),
                    'siteUrl'      => home_url( '/' ),
                    'storePrefix'  => dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ),
                    'assetsUrl'    => DOKAN_PLUGIN_ASSEST,
                    'buynowpro'    => dokan_pro_buynow_url(),
                    'upgradeToPro' => 'https://wedevs.com/dokan-lite-upgrade-to-pro/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
                ],
                'states'                 => WC()->countries->get_allowed_country_states(),
                'countries'              => WC()->countries->get_allowed_countries(),
                'current_time'           => current_time( 'mysql' ),
                'store_banner_dimension' => [
                    'width'       => $banner_width,
                    'height'      => $banner_height,
                    'flex-width'  => $has_flex_width,
                    'flex-height' => $has_flex_height,
                ],
                'ajax_loader'        => DOKAN_PLUGIN_ASSEST . '/images/spinner-2x.gif',
                /* translators: %s: decimal */
                'i18n_decimal_error'                  => sprintf( __( 'Please enter with one decimal point (%s) without thousand separators.', 'dokan-lite' ), $decimal ),
                /* translators: %s: price decimal separator */
                'i18n_mon_decimal_error'              => sprintf( __( 'Please enter with one monetary decimal point (%s) without thousand separators and currency symbols.', 'dokan-lite' ), wc_get_price_decimal_separator() ),
                'i18n_country_iso_error'              => __( 'Please enter in country code with two capital letters.', 'dokan-lite' ),
                'i18n_sale_less_than_regular_error'   => __( 'Please enter in a value less than the regular price.', 'dokan-lite' ),
                'i18n_delete_product_notice'          => __( 'This product has produced sales and may be linked to existing orders. Are you sure you want to delete it?', 'dokan-lite' ),
                'i18n_remove_personal_data_notice'    => __( 'This action cannot be reversed. Are you sure you wish to erase personal data from the selected orders?', 'dokan-lite' ),
                'decimal_point'                       => $decimal,
                'mon_decimal_point'                   => wc_get_price_decimal_separator(),
            ]
        );
    }
}
