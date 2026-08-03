<?php

namespace WeDevs\Dokan\Vendor\Settings\Schema;

use WeDevs\Dokan\CatalogMode\Helper as CatalogModeHelper;
use WeDevs\Dokan\Utilities\RichTextSanitizerUtil;
use WeDevs\Dokan\Utilities\VendorUtil;
use WeDevs\Dokan\Vendor\Settings\StoreScheduleValidator;

/**
 * Vendor Store Settings flat-array schema.
 *
 * Builds the flat `SettingsElement[]` list (page → subpage → section cards →
 * fields) consumed by the plugin-ui `<Settings>` engine on the vendor
 * dashboard Store settings page. Field values are populated inline from the
 * vendor's `dokan_profile_settings` user meta — the storage keys and value
 * shapes stay byte-identical to the legacy store form (see
 * plugin-internal-tasks#2115).
 *
 * Presentation follows the Figma Store page: every section renders as its own
 * collapsible card (title + helper description) with full-width stacked
 * fields; cross-plugin card order is controlled via `priority` so Pro can
 * slot its cards (e.g. Store Biography before Terms & Conditions).
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
            self::branding( $info ),
            self::store_information( $info ),
            self::address( $info ),
            self::map( $info ),
            self::schedule( $info ),
            self::catalog_mode( $vendor_id ),
            self::terms_and_conditions( $info )
        );

        /**
         * Filter the vendor Store settings schema.
         *
         * Pro modules append their sections/fields here and keep persisting
         * through the legacy `dokan_store_profile_settings_args` /
         * `dokan_store_profile_saved` seams. A field element may declare a
         * string `legacy_key` to control which `dokan_profile_settings` key
         * its value lands in (defaults to the field id). Use `priority` to
         * slot cards into the page order (Lite cards use 10–90).
         *
         * @since DOKAN_SINCE
         *
         * @param array $elements  Flat schema elements with values.
         * @param int   $vendor_id Vendor user ID.
         */
        $elements = apply_filters( 'dokan_get_vendor_settings_schema', $elements, $vendor_id );

        return self::group_into_tabs( $elements );
    }

    /**
     * Show/hide dependency pair: reveal a field only while another equals a value.
     *
     * Mirrors the admin schema convention (a `===`/`!==` show/hide couple).
     *
     * @since DOKAN_SINCE
     *
     * @param string $key   Controlling field id.
     * @param mixed  $value Value that reveals the dependent field.
     *
     * @return array Two-rule set for a field's `dependencies`.
     */
    protected static function visible_when( string $key, $value ): array {
        return [
            [
                'key'        => $key,
                'value'      => $value,
                'to_self'    => true,
                'attribute'  => 'display',
                'effect'     => 'show',
                'comparison' => '===',
            ],
            [
                'key'        => $key,
                'value'      => $value,
                'to_self'    => true,
                'attribute'  => 'display',
                'effect'     => 'hide',
                'comparison' => '!==',
            ],
        ];
    }

    /**
     * Page and subpage skeleton the section cards hang from.
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
                'id'           => 'store_settings',
                'type'         => 'subpage',
                'page_id'      => 'store',
                'title'        => __( 'Store', 'dokan-lite' ),
                // The page component renders the "Store" heading — hide the duplicate.
                'hide_heading' => true,
            ],
        ];
    }


    /**
     * Group the page's cards under the line tabs.
     *
     * Runs after the schema filter, so the one extension surface covers tabs
     * too: a section (or section-less card field) placed via
     * `dokan_get_vendor_settings_schema` picks its tab by declaring `tab_id`,
     * and a custom tab is just an injected `type => tab` element. Cards that
     * declare nothing fall back to General — the engine renders only the
     * active tab's children, so nothing may be left tabless. Tabs that end up
     * with no cards are dropped.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat schema elements, schema filter applied.
     *
     * @return array
     */
    protected static function group_into_tabs( array $elements ): array {
        $tabs       = self::base_tabs();
        $known_tabs = self::known_tab_ids( $elements, $tabs );

        // Pin every card (section or section-less field) to a known tab, defaulting to General so nothing is left tabless.
        $used_tabs = [];
        foreach ( $elements as &$element ) {
            if ( ! self::is_tab_member( $element ) ) {
                continue;
            }

            $tab_id = ! empty( $element['tab_id'] ) && in_array( (string) $element['tab_id'], $known_tabs, true )
                ? (string) $element['tab_id']
                : 'tab_general';

            $element['tab_id']    = $tab_id;
            $used_tabs[ $tab_id ] = true;
        }
        unset( $element );

        // Admin gates can empty whole tabs (map key, schedule, catalog, T&C) — drop those.
        $tabs = array_filter(
            $tabs,
            static function ( array $tab ) use ( $used_tabs ) {
                return ! empty( $used_tabs[ $tab['id'] ] );
            }
        );

        return array_merge( $elements, array_values( $tabs ) );
    }

    /**
     * The Store page's line tabs, in strip order.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected static function base_tabs(): array {
        $titles = [
            'tab_general'  => __( 'General', 'dokan-lite' ),
            'tab_location' => __( 'Location', 'dokan-lite' ),
            'tab_schedule' => __( 'Schedule', 'dokan-lite' ),
            'tab_business' => __( 'Business', 'dokan-lite' ),
            'tab_policies' => __( 'Policies', 'dokan-lite' ),
        ];

        $tabs     = [];
        $priority = 10;

        foreach ( $titles as $id => $title ) {
            $tabs[]    = [
                'id'         => $id,
                'type'       => 'tab',
                'subpage_id' => 'store_settings',
                'title'      => $title,
                'priority'   => $priority,
            ];
            $priority += 10;
        }

        return $tabs;
    }

    /**
     * Valid tab ids: the base tabs plus any injected through the schema filter.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat schema elements.
     * @param array $tabs     Base tabs.
     *
     * @return string[]
     */
    protected static function known_tab_ids( array $elements, array $tabs ): array {
        $ids = wp_list_pluck( $tabs, 'id' );

        foreach ( $elements as $element ) {
            if ( 'tab' === ( $element['type'] ?? '' ) && ! empty( $element['id'] ) ) {
                $ids[] = $element['id'];
            }
        }

        return $ids;
    }

    /**
     * Whether an element is a store-subpage card that belongs under a tab: a
     * section, or a section-less card field (e.g. Live Chat).
     *
     * @since DOKAN_SINCE
     *
     * @param array $element Schema element.
     *
     * @return bool
     */
    protected static function is_tab_member( array $element ): bool {
        if ( 'store_settings' !== ( $element['subpage_id'] ?? '' ) ) {
            return false;
        }

        $type    = $element['type'] ?? '';
        $is_card = ( 'field' === $type || 'fieldgroup' === $type ) && empty( $element['section_id'] );

        return 'section' === $type || $is_card;
    }

    /**
     * Branding card: store title, banner, and logo.
     *
     * @since DOKAN_SINCE
     *
     * @param array $info Vendor store info (`dokan_get_store_info()`).
     *
     * @return array
     */
    protected static function branding( array $info ): array {
        $banner_id   = absint( $info['banner'] ?? 0 );
        $gravatar_id = absint( $info['gravatar'] ?? 0 );

        $banner_width  = dokan_get_vendor_store_banner_width();
        $banner_height = dokan_get_vendor_store_banner_height();

        return [
            [
                'id'          => 'company_banner',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'tab_id'      => 'tab_general',
                'title'       => __( 'Branding', 'dokan-lite' ),
                'description' => __( "Oversee your store's branding elements: title, banner, logo, and contact number.", 'dokan-lite' ),
                'collapsible' => true,
                'priority'    => 10,
            ],
            [
                'id'          => 'store_name',
                'type'        => 'field',
                'variant'     => 'text',
                'section_id'  => 'company_banner',
                'icon'        => 'Asterisk',
                'title'       => __( 'Store Title', 'dokan-lite' ),
                'placeholder' => __( 'ex - Fashion Store', 'dokan-lite' ),
                'layout'      => 'full-width',
                'required'    => true,
                'value'       => (string) ( $info['store_name'] ?? '' ),
                'default'     => '',
                'legacy_key'  => 'store_name',
                'validations' => [
                    [
                        'rules'   => 'not_empty',
                        'message' => __( 'Store title is required.', 'dokan-lite' ),
                    ],
                ],
            ],
            [
                'id'              => 'banner',
                'type'            => 'field',
                'variant'         => 'vendor_image',
                'section_id'      => 'company_banner',
                'title'           => __( 'Store Banner', 'dokan-lite' ),
                'description'     => sprintf(
                    /* translators: 1) store banner width 2) store banner height */
                    __( 'Specification - %1$s X %2$s pixels, Format JPG or Png and file size 5mb max', 'dokan-lite' ),
                    $banner_width,
                    $banner_height
                ),
                'value'           => $banner_id,
                'default'         => 0,
                'image_url'       => $banner_id ? (string) wp_get_attachment_url( $banner_id ) : '',
                // Shown full-width when the vendor hasn't set a banner yet, same as the store page.
                'placeholder_url' => VendorUtil::get_vendor_default_banner_url(),
                // The picker crops to the admin dimension via the legacy custom-header-crop ajax.
                'crop'            => self::crop_config( $banner_width, $banner_height ),
                'legacy_key'      => 'banner',
            ],
            [
                'id'          => 'gravatar',
                'type'        => 'field',
                'variant'     => 'vendor_image',
                'section_id'  => 'company_banner',
                'title'       => __( 'Logo', 'dokan-lite' ),
                'description' => __( 'Specification - 150 X 150 pixels, file size 5mb max', 'dokan-lite' ),
                'shape'       => 'round',
                // Legacy profile-picture parity: fixed 150×150 crop, same flex flags.
                'crop'        => self::crop_config( 150, 150 ),
                'value'       => $gravatar_id,
                'default'     => 0,
                'image_url'   => $gravatar_id ? (string) wp_get_attachment_url( $gravatar_id ) : '',
                'legacy_key'  => 'gravatar',
            ],
        ];
    }

    /**
     * Crop config for a `vendor_image` field — the picker crops to exactly this size.
     *
     * @since DOKAN_SINCE
     *
     * @param int $width  Target crop width.
     * @param int $height Target crop height.
     *
     * @return array
     */
    protected static function crop_config( int $width, int $height ): array {
        return [
            'width'  => $width,
            'height' => $height,
        ];
    }

    /**
     * Store Information card: phone and email visibility.
     *
     * @since DOKAN_SINCE
     *
     * @param array $info Vendor store info.
     *
     * @return array
     */
    protected static function store_information( array $info ): array {
        $elements = [
            [
                'id'          => 'store_information',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'tab_id'      => 'tab_general',
                'title'       => __( 'Store Information', 'dokan-lite' ),
                'description' => __( 'These information can increase trust layers to your customers.', 'dokan-lite' ),
                'collapsible' => true,
                'priority'    => 20,
            ],
        ];

        // Email visibility toggle sits above the phone, matching the legacy form's email-checkbox visibility rule.
        if ( ! dokan_is_vendor_info_hidden( 'email' ) ) {
            $elements[] = [
                'id'            => 'show_email',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'store_information',
                'title'         => __( 'Show email address in store', 'dokan-lite' ),
                'description'   => __( 'Display your account email on the store page so customers can reach you directly.', 'dokan-lite' ),
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

        $elements[] = [
            'id'                => 'phone',
            'type'              => 'field',
            'variant'           => 'text',
            'section_id'        => 'store_information',
            'title'             => __( 'Phone', 'dokan-lite' ),
            'placeholder'       => __( 'e.g 206-555-0122', 'dokan-lite' ),
            'layout'            => 'full-width',
            'value'             => (string) ( $info['phone'] ?? '' ),
            'default'           => '',
            'legacy_key'        => 'phone',
            // Phone keeps the legacy dedicated sanitizer.
            'sanitize_callback' => static function ( $value ) {
                return dokan_sanitize_phone_number( wp_unslash( (string) $value ) );
            },
        ];

        return $elements;
    }

    /**
     * Store Locations card — omitted entirely when the Pro delivery-time
     * module owns the address UI (store-pickup renders its own form there).
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
                'tab_id'      => 'tab_location',
                'title'       => __( 'Store Locations', 'dokan-lite' ),
                'description' => __( 'Please enter the address of your store where you conduct your business.', 'dokan-lite' ),
                'collapsible' => true,
                'priority'    => 30,
            ],
            [
                'id'         => 'address',
                'type'       => 'field',
                'variant'    => 'vendor_address',
                'section_id' => 'location_details',
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
     * Store Map card — only when a map provider API key is configured, same
     * gate as the legacy form (`dokan_has_map_api_key()`).
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
                'tab_id'      => 'tab_location',
                'title'       => __( 'Store Map', 'dokan-lite' ),
                'description' => __( 'Kindly provide the location of the store address from which you ship your products.', 'dokan-lite' ),
                'collapsible' => true,
                'priority'    => 40,
            ],
            [
                'id'         => 'store_map',
                'type'       => 'field',
                'variant'    => 'vendor_map',
                'section_id' => 'store_map_section',
                'title'      => __( 'Find Address', 'dokan-lite' ),
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
     * Store Schedule card — gated by the admin appearance option, same as legacy.
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

        // Reveal the schedule fields only while the enable switch is on.
        $requires_schedule_enabled = self::visible_when( 'dokan_store_time_enabled', 'yes' );

        return [
            [
                'id'          => 'store_schedule',
                'type'        => 'section',
                'subpage_id'  => 'store_settings',
                'tab_id'      => 'tab_schedule',
                'title'       => __( 'Store Schedule', 'dokan-lite' ),
                'description' => __( 'Set the daily open and close time your store follows.', 'dokan-lite' ),
                'collapsible' => true,
                'priority'    => 50,
            ],
            [
                'id'            => 'dokan_store_time_enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'store_schedule',
                'title'         => __( 'Store has open close time', 'dokan-lite' ),
                'description'   => __( 'Show your daily opening and closing hours on the store page.', 'dokan-lite' ),
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
                'id'                => 'dokan_store_time',
                'type'              => 'field',
                'variant'           => 'vendor_store_schedule',
                'section_id'        => 'store_schedule',
                // Lite renders one range per day; Pro flips this via the schema filter.
                'multiple'          => false,
                'days'              => dokan_get_translated_days(),
                'value'             => is_array( $info['dokan_store_time'] ?? null ) ? $info['dokan_store_time'] : [],
                'default'           => [],
                'legacy_key'        => 'dokan_store_time',
                'dependencies'      => $requires_schedule_enabled,
                'sanitize_callback' => [ StoreScheduleValidator::class, 'sanitize' ],
                'validation_func'   => [ StoreScheduleValidator::class, 'validate' ],
            ],
            [
                'id'           => 'dokan_store_open_notice',
                'type'         => 'field',
                'variant'      => 'text',
                'section_id'   => 'store_schedule',
                'title'        => __( 'Store Open Notice', 'dokan-lite' ),
                'description'  => __( 'Message customers see on your store page during open hours.', 'dokan-lite' ),
                'placeholder'  => __( 'Store is open', 'dokan-lite' ),
                'layout'       => 'full-width',
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
                'description'  => __( 'Message customers see on your store page outside open hours.', 'dokan-lite' ),
                'placeholder'  => __( 'Store is closed', 'dokan-lite' ),
                'layout'       => 'full-width',
                'value'        => (string) ( $info['dokan_store_close_notice'] ?? '' ),
                'default'      => '',
                'legacy_key'   => 'dokan_store_close_notice',
                'dependencies' => $requires_schedule_enabled,
            ],
        ];
    }

    /**
     * Terms & Conditions card — only when the admin allows vendor ToC.
     * Renders last on the page (priority 90), collapsed by default.
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
                'tab_id'      => 'tab_policies',
                'title'       => __( 'Terms & Conditions', 'dokan-lite' ),
                'description' => __( 'Clearly define store policies to ensure a smooth shopping experience.', 'dokan-lite' ),
                'collapsible' => true,
                'priority'    => 90,
            ],
            [
                'id'            => 'enable_tnc',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'terms_conditions',
                'title'         => __( 'Show terms and conditions in store page', 'dokan-lite' ),
                'description'   => __( 'Publish your store terms and conditions on the store page so customers know your policies before they buy.', 'dokan-lite' ),
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
                'id'                => 'store_tnc',
                'type'              => 'field',
                'variant'           => 'rich_text',
                'section_id'        => 'terms_conditions',
                'title'             => __( 'TOC Details', 'dokan-lite' ),
                'icon'              => 'Asterisk',
                'description'       => __( 'Spell out your store policies — returns, shipping, and warranties — that customers agree to when they order.', 'dokan-lite' ),
                // Required when the toggle is on — enforced by the validation_func below, same content check as the legacy form.
                'required'          => true,
                'layout'            => 'full-width',
                'value'             => (string) ( $info['store_tnc'] ?? '' ),
                'default'           => '',
                'legacy_key'        => 'store_tnc',
                // Effectively-empty markup collapses to '' (legacy semantics), which the validation_func then treats as blank.
                'sanitize_callback' => static function ( $value ) {
                    $html = wp_kses_post( wp_unslash( (string) $value ) );

                    return '' === RichTextSanitizerUtil::sanitize_richtext_content( $html ) ? '' : $html;
                },
                // Cross-field: enabling the ToC toggle requires actual content.
                'validation_func'   => static function ( $value, array $all_values ) {
                    if ( 'on' === ( $all_values['enable_tnc'] ?? '' ) && '' === (string) $value ) {
                        return __( 'Please add Terms & Conditions content before saving the settings.', 'dokan-lite' );
                    }

                    return true;
                },
                'dependencies'      => self::visible_when( 'enable_tnc', 'on' ),
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
                'tab_id'      => 'tab_business',
                'title'       => __( 'Catalog Mode', 'dokan-lite' ),
                'description' => __( 'Control how customers can purchase products from your store.', 'dokan-lite' ),
                'collapsible' => true,
                'priority'    => 60,
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
                'dependencies'  => self::visible_when( 'catalog_mode_hide_add_to_cart_button', 'on' ),
            ];
        }

        return $elements;
    }
}
