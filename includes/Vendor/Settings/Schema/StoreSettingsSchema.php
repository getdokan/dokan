<?php

namespace WeDevs\Dokan\Vendor\Settings\Schema;

use WeDevs\Dokan\CatalogMode\Helper as CatalogModeHelper;

/**
 * Vendor Store Settings flat-array schema.
 *
 * Builds the flat `SettingsElement[]` list (page → subpage → sections → fields)
 * consumed by the plugin-ui `<Settings>` engine on the vendor dashboard Store
 * settings page. Field values are populated inline from the vendor's
 * `dokan_profile_settings` user meta — the storage keys and value shapes stay
 * byte-identical to the legacy store form (see plugin-internal-tasks#2115).
 *
 * Conditional blocks are gated server-side with the same checks the legacy
 * `templates/settings/store-form.php` used, so the schema never contains a
 * field the vendor is not allowed to edit.
 *
 * Extension point (mirrors `dokan_get_admin_settings_schema` on the admin side):
 *
 *     apply_filters( 'dokan_get_vendor_settings_schema', $elements, $vendor_id )
 *
 * @since DOKAN_SINCE
 */
class StoreSettingsSchema {

    /**
     * Build the flat schema with populated values for a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return array Flat list of settings elements.
     */
    public static function get_schema( int $vendor_id ): array {
        $info = (array) dokan_get_store_info( $vendor_id );

        $elements = array_merge(
            self::structure(),
            self::store_details( $info ),
            self::address( $info ),
            self::map( $info ),
            self::schedule( $info ),
            self::terms_and_conditions( $info ),
            self::catalog_mode( $vendor_id )
        );

        /**
         * Filter the vendor Store settings schema.
         *
         * Pro modules append their sections/fields here and keep persisting
         * through the legacy `dokan_store_profile_settings_args` /
         * `dokan_store_profile_saved` seams. A field element may declare a
         * string `legacy_key` to control which `dokan_profile_settings` key
         * its value lands in (defaults to the field id).
         *
         * @since DOKAN_SINCE
         *
         * @param array $elements  Flat schema elements with values.
         * @param int   $vendor_id Vendor user ID.
         */
        return apply_filters( 'dokan_get_vendor_settings_schema', $elements, $vendor_id );
    }

    /**
     * Page and subpage skeleton the sections hang from.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected static function structure(): array {
        return [
            [
                'id'    => 'store',
                'type'  => 'page',
                'title' => __( 'Store', 'dokan-lite' ),
            ],
            [
                'id'      => 'store_settings',
                'type'    => 'subpage',
                'page_id' => 'store',
                'title'   => __( 'Store', 'dokan-lite' ),
            ],
        ];
    }

    /**
     * Store identity card: banner, profile picture, name, phone, email visibility.
     *
     * @since DOKAN_SINCE
     *
     * @param array $info Vendor store info (`dokan_get_store_info()`).
     *
     * @return array
     */
    protected static function store_details( array $info ): array {
        $banner_id   = absint( $info['banner'] ?? 0 );
        $gravatar_id = absint( $info['gravatar'] ?? 0 );

        $elements = [
            [
                'id'          => 'company_banner',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'title'       => __( 'Store Details', 'dokan-lite' ),
                'collapsible' => true,
            ],
            [
                'id'          => 'banner',
                'type'        => 'field',
                'variant'     => 'vendor_image',
                'section_id'  => 'company_banner',
                'title'       => __( 'Store Banner', 'dokan-lite' ),
                'description' => sprintf(
                    /* translators: 1) store banner width 2) store banner height */
                    __( 'Upload a banner for your store. Banner size is (%1$sx%2$s) pixels.', 'dokan-lite' ),
                    dokan_get_vendor_store_banner_width(),
                    dokan_get_vendor_store_banner_height()
                ),
                'value'       => $banner_id,
                'default'     => 0,
                'image_url'   => $banner_id ? (string) wp_get_attachment_url( $banner_id ) : '',
                'legacy_key'  => 'banner',
            ],
            [
                'id'         => 'gravatar',
                'type'       => 'field',
                'variant'    => 'vendor_image',
                'section_id' => 'company_banner',
                'title'      => __( 'Profile Picture', 'dokan-lite' ),
                'value'      => $gravatar_id,
                'default'    => 0,
                'image_url'  => $gravatar_id ? (string) wp_get_attachment_url( $gravatar_id ) : '',
                'legacy_key' => 'gravatar',
            ],
            [
                'id'          => 'store_name',
                'type'        => 'field',
                'variant'     => 'text',
                'section_id'  => 'company_banner',
                'title'       => __( 'Store Name', 'dokan-lite' ),
                'placeholder' => __( 'store name', 'dokan-lite' ),
                'value'       => (string) ( $info['store_name'] ?? '' ),
                'default'     => '',
                'legacy_key'  => 'store_name',
                'validations' => [
                    [
                        'rules'   => 'not_empty',
                        'message' => __( 'Store name is required.', 'dokan-lite' ),
                    ],
                ],
            ],
            [
                'id'          => 'phone',
                'type'        => 'field',
                'variant'     => 'text',
                'section_id'  => 'company_banner',
                'title'       => __( 'Phone No', 'dokan-lite' ),
                'placeholder' => __( '+123456..', 'dokan-lite' ),
                'value'       => (string) ( $info['phone'] ?? '' ),
                'default'     => '',
                'legacy_key'  => 'phone',
            ],
        ];

        // Same visibility rule the legacy form used for the email checkbox.
        if ( ! dokan_is_vendor_info_hidden( 'email' ) ) {
            $elements[] = [
                'id'            => 'show_email',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'company_banner',
                'title'         => __( 'Show email address in store', 'dokan-lite' ),
                'value'         => ( $info['show_email'] ?? 'no' ) === 'yes' ? 'yes' : 'no',
                'default'       => 'no',
                'legacy_key'    => 'show_email',
                'enable_state'  => [
                    'label' => __( 'Visible', 'dokan-lite' ),
                    'value' => 'yes',
                ],
                'disable_state' => [
                    'label' => __( 'Hidden', 'dokan-lite' ),
                    'value' => 'no',
                ],
            ];
        }

        return $elements;
    }

    /**
     * Address card — omitted entirely when the Pro delivery-time module owns
     * the address UI (store-pickup renders its own location form there).
     *
     * @since DOKAN_SINCE
     *
     * @param array $info Vendor store info.
     *
     * @return array
     */
    protected static function address( array $info ): array {
        if ( function_exists( 'dokan_pro' ) && dokan_pro()->module->is_active( 'delivery_time' ) ) {
            return [];
        }

        $address = (array) ( $info['address'] ?? [] );

        return [
            [
                'id'          => 'location_details',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'title'       => __( 'Address', 'dokan-lite' ),
                'collapsible' => true,
            ],
            [
                'id'         => 'address',
                'type'       => 'field',
                'variant'    => 'vendor_address',
                'section_id' => 'location_details',
                'title'      => __( 'Address', 'dokan-lite' ),
                'value'      => [
                    'street_1' => (string) ( $address['street_1'] ?? '' ),
                    'street_2' => (string) ( $address['street_2'] ?? '' ),
                    'city'     => (string) ( $address['city'] ?? '' ),
                    'zip'      => (string) ( $address['zip'] ?? '' ),
                    'country'  => (string) ( $address['country'] ?? '' ),
                    'state'    => (string) ( $address['state'] ?? '' ),
                ],
                'default'    => [],
                'legacy_key' => 'address',
            ],
        ];
    }

    /**
     * Map card — only when a map provider API key is configured, same gate as
     * the legacy form (`dokan_has_map_api_key()`).
     *
     * @since DOKAN_SINCE
     *
     * @param array $info Vendor store info.
     *
     * @return array
     */
    protected static function map( array $info ): array {
        if ( ! dokan_has_map_api_key() ) {
            return [];
        }

        $provider = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );
        $api_key  = 'mapbox' === $provider
            ? dokan_get_option( 'mapbox_access_token', 'dokan_appearance', '' )
            : dokan_get_option( 'gmap_api_key', 'dokan_appearance', '' );

        return [
            [
                'id'          => 'store_map_section',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'title'       => __( 'Store Location', 'dokan-lite' ),
                'collapsible' => true,
            ],
            [
                'id'         => 'store_map',
                'type'       => 'field',
                'variant'    => 'vendor_map',
                'section_id' => 'store_map_section',
                'title'      => __( 'Map', 'dokan-lite' ),
                'provider'   => $provider,
                'api_key'    => $api_key,
                'value'      => [
                    'location'     => (string) ( $info['location'] ?? '' ),
                    'find_address' => (string) ( $info['find_address'] ?? '' ),
                ],
                'default'    => [
                    'location'     => '',
                    'find_address' => '',
                ],
            ],
        ];
    }

    /**
     * Store schedule card — gated by the admin appearance option, same as legacy.
     *
     * @since DOKAN_SINCE
     *
     * @param array $info Vendor store info.
     *
     * @return array
     */
    protected static function schedule( array $info ): array {
        if ( 'on' !== dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' ) ) {
            return [];
        }

        // Dependency pair (show/hide) mirrors the admin schema convention.
        $requires_schedule_enabled = [
            [
                'key'        => 'dokan_store_time_enabled',
                'value'      => 'yes',
                'to_self'    => true,
                'attribute'  => 'display',
                'effect'     => 'show',
                'comparison' => '===',
            ],
            [
                'key'        => 'dokan_store_time_enabled',
                'value'      => 'yes',
                'to_self'    => true,
                'attribute'  => 'display',
                'effect'     => 'hide',
                'comparison' => '!==',
            ],
        ];

        return [
            [
                'id'          => 'store_schedule',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'title'       => __( 'Store Schedule', 'dokan-lite' ),
                'collapsible' => true,
            ],
            [
                'id'            => 'dokan_store_time_enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'store_schedule',
                'title'         => __( 'Store has open close time', 'dokan-lite' ),
                'value'         => ( $info['dokan_store_time_enabled'] ?? 'no' ) === 'yes' ? 'yes' : 'no',
                'default'       => 'no',
                'legacy_key'    => 'dokan_store_time_enabled',
                'enable_state'  => [
                    'label' => __( 'Enabled', 'dokan-lite' ),
                    'value' => 'yes',
                ],
                'disable_state' => [
                    'label' => __( 'Disabled', 'dokan-lite' ),
                    'value' => 'no',
                ],
            ],
            [
                'id'           => 'dokan_store_time',
                'type'         => 'field',
                'variant'      => 'vendor_store_schedule',
                'section_id'   => 'store_schedule',
                'title'        => __( 'Store Schedule', 'dokan-lite' ),
                // Lite renders one range per day; Pro flips this via the schema filter.
                'multiple'     => false,
                'days'         => dokan_get_translated_days(),
                'value'        => is_array( $info['dokan_store_time'] ?? null ) ? $info['dokan_store_time'] : [],
                'default'      => [],
                'legacy_key'   => 'dokan_store_time',
                'dependencies' => $requires_schedule_enabled,
            ],
            [
                'id'           => 'dokan_store_open_notice',
                'type'         => 'field',
                'variant'      => 'text',
                'section_id'   => 'store_schedule',
                'title'        => __( 'Store Open Notice', 'dokan-lite' ),
                'placeholder'  => __( 'Store is open', 'dokan-lite' ),
                'value'        => (string) ( $info['dokan_store_open_notice'] ?? '' ),
                'default'      => '',
                'legacy_key'   => 'dokan_store_open_notice',
                'dependencies' => $requires_schedule_enabled,
            ],
            [
                'id'           => 'dokan_store_close_notice',
                'type'         => 'field',
                'variant'      => 'text',
                'section_id'   => 'store_schedule',
                'title'        => __( 'Store Close Notice', 'dokan-lite' ),
                'placeholder'  => __( 'Store is closed', 'dokan-lite' ),
                'value'        => (string) ( $info['dokan_store_close_notice'] ?? '' ),
                'default'      => '',
                'legacy_key'   => 'dokan_store_close_notice',
                'dependencies' => $requires_schedule_enabled,
            ],
        ];
    }

    /**
     * Terms & Conditions card — only when the admin allows vendor ToC.
     *
     * @since DOKAN_SINCE
     *
     * @param array $info Vendor store info.
     *
     * @return array
     */
    protected static function terms_and_conditions( array $info ): array {
        if ( 'on' !== dokan_get_option( 'seller_enable_terms_and_conditions', 'dokan_general', 'off' ) ) {
            return [];
        }

        return [
            [
                'id'          => 'terms_conditions',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'title'       => __( 'Terms and Conditions', 'dokan-lite' ),
                'collapsible' => true,
            ],
            [
                'id'            => 'enable_tnc',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'terms_conditions',
                'title'         => __( 'Show terms and conditions in store page', 'dokan-lite' ),
                'value'         => ( $info['enable_tnc'] ?? 'off' ) === 'on' ? 'on' : 'off',
                'default'       => 'off',
                'legacy_key'    => 'enable_tnc',
                'enable_state'  => [
                    'label' => __( 'Enabled', 'dokan-lite' ),
                    'value' => 'on',
                ],
                'disable_state' => [
                    'label' => __( 'Disabled', 'dokan-lite' ),
                    'value' => 'off',
                ],
            ],
            [
                'id'           => 'store_tnc',
                'type'         => 'field',
                'variant'      => 'rich_text',
                'section_id'   => 'terms_conditions',
                'title'        => __( 'TOC Details', 'dokan-lite' ),
                'value'        => (string) ( $info['store_tnc'] ?? '' ),
                'default'      => '',
                'legacy_key'   => 'store_tnc',
                'dependencies' => [
                    [
                        'key'        => 'enable_tnc',
                        'value'      => 'on',
                        'to_self'    => true,
                        'attribute'  => 'display',
                        'effect'     => 'show',
                        'comparison' => '===',
                    ],
                    [
                        'key'        => 'enable_tnc',
                        'value'      => 'on',
                        'to_self'    => true,
                        'attribute'  => 'display',
                        'effect'     => 'hide',
                        'comparison' => '!==',
                    ],
                ],
            ],
        ];
    }

    /**
     * Catalog mode card — only when the admin enabled the feature; sub-fields
     * follow the same per-option admin gates as the legacy render.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return array
     */
    protected static function catalog_mode( int $vendor_id ): array {
        if ( ! CatalogModeHelper::is_enabled_by_admin() || ! CatalogModeHelper::hide_add_to_cart_button_option_is_enabled_by_admin() ) {
            return [];
        }

        $settings = CatalogModeHelper::get_vendor_catalog_mode_settings( $vendor_id );

        $elements = [
            [
                'id'          => 'catalog_mode_section',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'title'       => __( 'Catalog Mode', 'dokan-lite' ),
                'collapsible' => true,
            ],
            [
                'id'            => 'catalog_mode_hide_add_to_cart_button',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'catalog_mode_section',
                'title'         => __( 'Remove Add to Cart Button', 'dokan-lite' ),
                'description'   => __( 'Check to remove Add to Cart option from your products.', 'dokan-lite' ),
                'value'         => ( $settings['hide_add_to_cart_button'] ?? 'off' ) === 'on' ? 'on' : 'off',
                'default'       => 'off',
                'enable_state'  => [
                    'label' => __( 'Enabled', 'dokan-lite' ),
                    'value' => 'on',
                ],
                'disable_state' => [
                    'label' => __( 'Disabled', 'dokan-lite' ),
                    'value' => 'off',
                ],
            ],
        ];

        if ( CatalogModeHelper::hide_product_price_option_is_enabled_by_admin() ) {
            $elements[] = [
                'id'            => 'catalog_mode_hide_product_price',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'catalog_mode_section',
                'title'         => __( 'Hide Product Price', 'dokan-lite' ),
                'description'   => __( 'Check to hide product price from your products.', 'dokan-lite' ),
                'value'         => ( $settings['hide_product_price'] ?? 'off' ) === 'on' ? 'on' : 'off',
                'default'       => 'off',
                'enable_state'  => [
                    'label' => __( 'Enabled', 'dokan-lite' ),
                    'value' => 'on',
                ],
                'disable_state' => [
                    'label' => __( 'Disabled', 'dokan-lite' ),
                    'value' => 'off',
                ],
                'dependencies'  => [
                    [
                        'key'        => 'catalog_mode_hide_add_to_cart_button',
                        'value'      => 'on',
                        'to_self'    => true,
                        'attribute'  => 'display',
                        'effect'     => 'show',
                        'comparison' => '===',
                    ],
                    [
                        'key'        => 'catalog_mode_hide_add_to_cart_button',
                        'value'      => 'on',
                        'to_self'    => true,
                        'attribute'  => 'display',
                        'effect'     => 'hide',
                        'comparison' => '!==',
                    ],
                ],
            ];
        }

        return $elements;
    }
}
