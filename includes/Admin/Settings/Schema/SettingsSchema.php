<?php

namespace WeDevs\Dokan\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Migration\Transformer\InvertOnOffTransformer;
use WeDevs\Dokan\Utilities\AdminSettings;

/**
 * Flat array settings schema for the admin settings page.
 *
 * Replaces the OOP ElementFactory/Page class approach with plain PHP arrays.
 * Each element is an associative array passed to plugin-ui's Settings component.
 *
 * Extension point: `apply_filters( 'dokan_get_admin_settings_schema', $elements )`
 *
 * @since DOKAN_SINCE
 */
class SettingsSchema {

    /**
     * Get the complete admin settings schema.
     *
     * @return array Flat array of settings elements.
     */
    public static function get_schema(): array {
        $elements = array_merge(
            self::general_page(),
            self::transaction_page(),
            self::vendor_page(),
            self::appearance_page(),
            self::compliance_page(),
            self::ai_assist_page(),
            self::moderation_page(),
            self::product_page()
        );

        // Lite/Pro gating: when Dokan Pro is inactive, drop elements that
        // explicitly declare `is_lite: false` (Pro-only). Elements without an
        // `is_lite` key — hand-authored entries and extension-registered
        // rows — are preserved untouched. The accessor `dokan()->is_pro_exists()`
        // is `apply_filters( 'dokan_is_pro_exists', false )` under the hood,
        // which lets Pro flip the flag at bootstrap and lets tests override it.
        $pro_active = function_exists( 'dokan' ) && dokan()->is_pro_exists();
        if ( ! $pro_active ) {
            $elements = array_values(
                array_filter(
                    $elements,
                    static function ( $element ) {
                        // Only `type: field` entries are subject to gating —
                        // pages, sub-pages, and sections never carry `is_lite`
                        // and must pass through.
                        if ( ! is_array( $element ) || ( $element['type'] ?? '' ) !== 'field' ) {
                            return true;
                        }

                        // Backward-compat: hand-authored fields without an
                        // `is_lite` key (e.g. legacy schema entries and
                        // extension-registered fields) are NOT filtered.
                        if ( ! array_key_exists( 'is_lite', $element ) ) {
                            return true;
                        }

                        return (bool) $element['is_lite'];
                    }
                )
            );
        }

        /**
         * Filter the admin settings schema.
         *
         * Pro and extensions append their elements to this array.
         *
         * @since DOKAN_SINCE
         *
         * @param array $elements Flat array of settings elements.
         */
        return apply_filters( 'dokan_get_admin_settings_schema', $elements );
    }

    /**
     * Helper to get pages for select dropdowns.
     *
     * Field `options` reference this lazily (via a closure — see general_page()
     * and the privacy policy field) so the query only fires when SettingsRegistry
     * resolves the schema for the admin UI/REST — never on the front-end
     * legacy-settings bridge harvest path, which ignores `options`.
     *
     * Intentionally NOT memoized in a function-static. WordPress's per-request
     * WP_Query cache already dedupes this identical page query across the field
     * call sites (a repeat call issues no SQL), and that cache is invalidated
     * when pages change. A function-static here would instead be un-resettable
     * (no reflection access, clear_cache() can't reach it) and could serve stale
     * options within a long-lived process or after a page is created mid-request.
     *
     * @return array
     */
    private static function get_page_options(): array {
        $pages_array = [];
        $pages       = get_posts(
            [
                'post_type'   => 'page',
                'numberposts' => -1,
            ]
        );

        if ( $pages ) {
            foreach ( $pages as $page ) {
                $pages_array[] = [
                    'value' => $page->ID,
                    'title' => $page->post_title,
                ];
            }
        }

        return $pages_array;
    }

    /**
     * Lazy provider for the page-select option list.
     *
     * Returns a closure that yields {@see get_page_options()} when invoked.
     * Fields reference this so the page query is deferred until
     * SettingsRegistry resolves the schema for the admin UI/REST — the
     * front-end legacy-settings bridge harvests the schema but never reads
     * `options`, so the query is skipped on every public request.
     *
     * Public so Pro modules (which always load alongside Lite) can reuse the
     * same lazy page-option provider via the `dokan_get_admin_settings_schema`
     * filter instead of duplicating the query. Sharing this also shares the
     * per-request memo in {@see get_page_options()}, so the admin build runs
     * the page query once across all consumers.
     *
     * @return \Closure
     */
    public static function get_lazy_page_options(): \Closure {
        return static function () {
            return self::get_page_options();
        };
    }

    /**
     * General page schema.
     *
     * @return array
     */
    private static function general_page(): array {
        $pages_options = self::get_lazy_page_options();

        return [
            // Page
            [
                'id'          => 'general',
                'type'        => 'page',
                'title'       => esc_html__( 'General', 'dokan-lite' ),
                'icon'        => 'Settings',
                'description' => esc_html__( 'Configure the general settings for your marketplace.', 'dokan-lite' ),
                'priority'    => 100,
            ],

            // === SubPage: Marketplace ===
            [
                'id'          => 'marketplace',
                'type'        => 'subpage',
                'page_id'     => 'general',
                'title'       => esc_html__( 'Marketplace', 'dokan-lite' ),
                'description' => esc_html__( 'Configure core marketplace functionalities and customer shopping experience.', 'dokan-lite' ),
                'priority'    => 100,
                'doc_link'    => 'https://wedevs.com/docs/dokan/developers/marketplace/',
            ],
            [
                'id'         => 'marketplace_settings',
                'type'       => 'section',
                'subpage_id' => 'marketplace',
            ],
            [
                'id'              => 'vendor_store_url_slug',
                'type'            => 'field',
                'variant'         => 'text',
                'section_id'      => 'marketplace_settings',
                'title'           => esc_html__( 'Vendor Store URL', 'dokan-lite' ),
                'description'     => sprintf(
                    /* translators: %s: Site URL */
                    esc_html__( 'Define the vendor store URL (%s/[this-text]/[vendor-name])', 'dokan-lite' ),
                    get_site_url()
                ),
                'placeholder'     => esc_html__( 'Store', 'dokan-lite' ),
                'default'         => 'store',
                'legacy_key'      => 'dokan_general.custom_store_url',
                'validations'     => [
                    [ 'not_in' => dokan_get_reserved_url_slugs() ],
                ],
                'validation_func' => function ( $value ) {
                    return ! in_array( $value, dokan_get_reserved_url_slugs(), true );
                },
            ],
            [
                'id'            => 'catalog_mode_add_to_cart_button_visibility',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'marketplace_settings',
                'title'         => esc_html__( 'Add to Cart Button Visibility', 'dokan-lite' ),
                'description'   => esc_html__( 'Show or hide the Add to Cart button on product pages in catalog mode.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_selling',
                    'field'  => 'catalog_mode_hide_add_to_cart_button',
				],
                'legacy_transformer' => InvertOnOffTransformer::class,
            ],
			[
				'id'            => 'catalog_mode_hide_product_price',
				'type'          => 'field',
				'variant'       => 'switch',
				'section_id'    => 'marketplace_settings',
                'title'   => __( 'Product Price Visibility', 'dokan-lite' ),
                'description'    => __( 'Check to hide product price.', 'dokan-lite' ),
                'default' => 'on',
				'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
				'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
				'legacy_key'    => [
					'option' => 'dokan_selling',
					'field'  => 'catalog_mode_hide_product_price',
				],
                'dependencies' => [
					[
						'key' => 'catalog_mode_add_to_cart_button_visibility',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
					[
						'key' => 'catalog_mode_add_to_cart_button_visibility',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
				],
                'legacy_transformer' => InvertOnOffTransformer::class,
			],
			// === SubPage: Page Setup ===
			[
				'id'          => 'dokan_pages',
				'type'        => 'subpage',
				'page_id'     => 'general',
				'title'       => esc_html__( 'Page Setup', 'dokan-lite' ),
				'description' => esc_html__( 'Link your WordPress pages to essential Dokan marketplace functions and features.', 'dokan-lite' ),
				'priority'    => 200,
				'doc_link'    => 'https://wedevs.com/docs/dokan/settings/page-settings-2/',
			],
			[
				'id'         => 'dashboard_section',
				'type'       => 'section',
				'subpage_id' => 'dokan_pages',
			],
			[
				'id'          => 'vendor_dashboard_page',
				'legacy_key' => [
					'option' => 'dokan_pages',
					'field'  => 'dashboard',
				],
				'type'        => 'field',
				'variant'     => 'select',
				'section_id'  => 'dashboard_section',
				'title'       => esc_html__( 'Dashboard', 'dokan-lite' ),
				'description' => esc_html__( 'Select a page to show vendor dashboard.', 'dokan-lite' ),
				'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
				'options'     => $pages_options,
			],
			[
				'id'         => 'my_orders_section',
				'type'       => 'section',
				'subpage_id' => 'dokan_pages',
			],
			[
				'id'          => 'my_orders_page',
				'legacy_key' => [
					'option' => 'dokan_pages',
					'field'  => 'my_orders',
				],
				'type'        => 'field',
				'variant'     => 'select',
				'section_id'  => 'my_orders_section',
				'title'       => esc_html__( 'My Orders', 'dokan-lite' ),
				'description' => esc_html__( 'Select a page to show my orders', 'dokan-lite' ),
				'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
				'options'     => $pages_options,
			],
			[
				'id'         => 'store_listing_section',
				'type'       => 'section',
				'subpage_id' => 'dokan_pages',
			],
			[
				'id'          => 'store_listing_page',
				'legacy_key' => [
					'option' => 'dokan_pages',
					'field'  => 'store_listing',
				],
				'type'        => 'field',
				'variant'     => 'select',
				'section_id'  => 'store_listing_section',
				'title'       => esc_html__( 'Store Listing', 'dokan-lite' ),
				'description' => esc_html__( 'Select a page to show all stores', 'dokan-lite' ),
				'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
				'options'     => $pages_options,
			],
			[
				'id'         => 'reg_tc_page_section',
				'type'       => 'section',
				'subpage_id' => 'dokan_pages',
			],
			[
				'id'          => 'reg_tc_page',
				'legacy_key' => [
					'option' => 'dokan_pages',
					'field'  => 'reg_tc_page',
				],
				'type'        => 'field',
				'variant'     => 'select',
				'section_id'  => 'reg_tc_page_section',
				'title'       => esc_html__( 'Terms and Conditions Page', 'dokan-lite' ),
				'description' => esc_html__( 'Select where you want to add Dokan pages.', 'dokan-lite' ),
				'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
				'tooltip'     => esc_html__( 'Select a page to display the Terms and Conditions of your store for Vendors.', 'dokan-lite' ),
				'options'     => $pages_options,
			],
            [
				'id'         => 'vendor_onboarding_page_section',
				'type'       => 'section',
				'subpage_id' => 'dokan_pages',
			],
			[
				'id'          => 'vendor_onboarding_page',
				'legacy_key' => [
					'option' => 'dokan_pages',
					'field'  => 'vendor_onboarding',
				],
				'type'        => 'field',
				'variant'     => 'select',
				'section_id'  => 'vendor_onboarding_page_section',
				'title'       => esc_html__( 'Vendor Onboarding Page', 'dokan-lite' ),
				'description' => esc_html__( 'Select a page for vendor onboarding and login', 'dokan-lite' ),
				'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
				'options'     => $pages_options,
			],

			// === SubPage: Location ===
			[
				'id'          => 'location',
				'type'        => 'subpage',
				'page_id'     => 'general',
				'title'       => esc_html__( 'Location', 'dokan-lite' ),
				'description' => esc_html__( 'Configure how map locations are displayed throughout your marketplace.', 'dokan-lite' ),
				'priority'    => 300,
				'doc_link'    => 'https://wedevs.com/docs/dokan/settings/page-settings-2/',
			],
			[
				'id'         => 'map_api_configuration',
				'type'       => 'section',
				'subpage_id' => 'location',
			],
			[
				'id'          => 'map_api_source',
				'legacy_key' => [
					'option' => 'dokan_appearance',
					'field'  => 'map_api_source',
				],
				'type'        => 'field',
				'variant'     => 'radio_capsule',
				'section_id'  => 'map_api_configuration',
				'title'       => esc_html__( 'Map API Source', 'dokan-lite' ),
				'description' => esc_html__( 'Which map API source you want to use in your site?', 'dokan-lite' ),
				'default'     => 'google_maps',
				'options'     => [
					[
						'title' => esc_html__( 'Google Maps', 'dokan-lite' ),
						'value' => 'google_maps',
					],
					[
						'title' => esc_html__( 'Mapbox', 'dokan-lite' ),
						'value' => 'mapbox',
					],
				],
			],
			[
				'id'           => 'google_map_api_key_group',
				'type'         => 'fieldgroup',
				'section_id'   => 'map_api_configuration',
				'dependencies' => [
					[
						'key' => 'map_api_source',
						'value' => 'google_maps',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '==',
					],
					[
						'key' => 'map_api_source',
						'value' => 'mapbox',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '==',
					],
				],
			],
			[
				'id'          => 'google_map_base',
				'type'        => 'field',
				'variant'     => 'base_field_label',
				'field_group_id' => 'google_map_api_key_group',
				'title'       => esc_html__( 'Google Map API Key', 'dokan-lite' ),
				'description' => sprintf(
					/* translators: %s: Google Maps API documentation URL */
					__( '<a href="%s" target="_blank" rel="noopener noreferrer">API Key</a> is needed to display map on store page.', 'dokan-lite' ),
					'https://developers.google.com/maps/documentation/javascript/'
				),
				'tooltip'     => __( 'Insert Google API Key (with hyperlink) to display store map.', 'dokan-lite' ),
			],
			[
				'id'             => 'google_map_api_key',
				'type'           => 'field',
				'variant'        => 'show_hide',
				'field_group_id' => 'google_map_api_key_group',
				'placeholder'    => esc_html__( 'Enter your Google Maps API key', 'dokan-lite' ),
				'legacy_key'     => [
					'option' => 'dokan_appearance',
					'field'  => 'gmap_api_key',
				],
			],
			[
				'id'           => 'mapbox_api_key_group',
				'type'         => 'fieldgroup',
				'section_id'   => 'map_api_configuration',
				'dependencies' => [
					[
						'key' => 'map_api_source',
						'value' => 'mapbox',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '==',
					],
					[
						'key' => 'map_api_source',
						'value' => 'google_maps',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '==',
					],
				],
			],
			[
				'id'             => 'mapbox_map_base',
				'type'           => 'field',
				'variant'        => 'base_field_label',
				'field_group_id' => 'mapbox_api_key_group',
				'title'          => esc_html__( 'Mapbox API Key', 'dokan-lite' ),
				'description'    => esc_html__( 'Enter your Mapbox API key to enable map functionality.', 'dokan-lite' ),
			],
			[
				'id'             => 'mapbox_api_key',
				'type'           => 'field',
				'variant'        => 'show_hide',
				'field_group_id' => 'mapbox_api_key_group',
				'placeholder'    => esc_html__( 'Enter your Mapbox API key', 'dokan-lite' ),
				'legacy_key'     => [
					'option' => 'dokan_appearance',
					'field'  => 'mapbox_access_token',
				],
			],

			// Map Placement
			[
				'id'         => 'map_placement',
				'type'       => 'section',
				'subpage_id' => 'location',
				'priority'    => 120,
			],
			[
				'id'                 => 'map_placement_locations',
				'type'               => 'field',
				'variant'            => 'multicheck',
				'section_id'         => 'map_placement',
				'title'              => esc_html__( 'Map Placement', 'dokan-lite' ),
				'description'        => esc_html__( 'Choose where the store location map appears', 'dokan-lite' ),
				'tooltip'            => esc_html__( 'Select the pages where you want to display the store location map.', 'dokan-lite' ),
				// Lite's only placement is the single-store-page sidebar map
				// (dokan_appearance.store_map, module-independent). The Pro
				// geolocation module extends this field with its Store Listing /
				// Shop Page / product location-tab placements via the
				// `dokan_get_admin_settings_schema` filter.
				'default'            => [ 'store_map' ],
				'options'            => [
					[
						'title' => esc_html__( 'Show map on Store Page', 'dokan-lite' ),
						'value' => 'store_map',
					],
				],
				'legacy_key'         => [
					'store_map' => 'dokan_appearance.store_map',
				],
				'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\MulticheckArrayBooleanTransformer::for_slots( [ 'store_map' ] ),
			],
		];
    }

    /**
     * Transaction page schema.
     *
     * @return array
     */
    private static function transaction_page(): array {
        $default_settings = [
            'commission_type'    => 'fixed',
            'admin_percentage'   => '10',
            'additional_fee'     => '10',
        ];

        return [
            // Page
            [
                'id'          => 'transaction',
                'type'        => 'page',
                'title'       => esc_html__( 'Transaction', 'dokan-lite' ),
                'description' => esc_html__( 'Configure transaction-related settings including commissions and fees.', 'dokan-lite' ),
                'icon'        => 'ArrowRightLeft',
                'priority'    => 600,
            ],

            // === SubPage: Fees ===
            [
                'id'          => 'fees',
                'type'        => 'subpage',
                'page_id'     => 'transaction',
                'title'       => esc_html__( 'Fees', 'dokan-lite' ),
                'description' => esc_html__( 'Configure how different types of fees are distributed between vendors and admin', 'dokan-lite' ),
				'priority' => 100,
            ],
            [
                'id'         => 'fees',
                'type'       => 'section',
                'subpage_id' => 'fees',
            ],
            [
                'id'          => 'shipping_fee_recipient',
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'fees',
                'title'       => esc_html__( 'Shipping Fee', 'dokan-lite' ),
                'description' => esc_html__( 'Who will be receiving the shipping fees? Note that, tax fees for corresponding shipping method will not be included with shipping fees.', 'dokan-lite' ),
                'default'     => 'seller',
                'options'     => [
                    [
						'title' => esc_html__( 'Vendor', 'dokan-lite' ),
						'value' => 'seller',
						'icon' => 'Users',
					],
                    [
						'title' => esc_html__( 'Admin', 'dokan-lite' ),
						'value' => 'admin',
						'icon' => 'User',
					],
                ],
                'legacy_key' => [
                    'option' => 'dokan_selling',
                    'field'  => 'shipping_fee_recipient',
                ],
            ],
            [
                'id'          => 'product_tax_fee_recipient',
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'fees',
                'title'       => esc_html__( 'Product Tax Fee', 'dokan-lite' ),
                'description' => esc_html__( 'Who will be receiving the tax fees for products? Note that, shipping tax fees will not be included with product tax.', 'dokan-lite' ),
                'default'     => 'seller',
                'options'     => [
                    [
						'title' => esc_html__( 'Vendor', 'dokan-lite' ),
						'value' => 'seller',
						'icon' => 'Users',
					],
                    [
						'title' => esc_html__( 'Admin', 'dokan-lite' ),
						'value' => 'admin',
						'icon' => 'User',
					],
                ],
                'legacy_key' => [
                    'option' => 'dokan_selling',
                    'field'  => 'tax_fee_recipient',
                ],
            ],
            [
                'id'          => 'shipping_tax_fee_recipient',
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'fees',
                'title'       => esc_html__( 'Shipping Tax Fee', 'dokan-lite' ),
                'description' => esc_html__( 'Who will be receiving the tax fees for shipping?', 'dokan-lite' ),
                'default'     => 'seller',
                'options'     => [
                    [
						'title' => esc_html__( 'Vendor', 'dokan-lite' ),
						'value' => 'seller',
						'icon' => 'Users',
					],
                    [
						'title' => esc_html__( 'Admin', 'dokan-lite' ),
						'value' => 'admin',
						'icon' => 'User',
					],
                ],
                'legacy_key' => [
                    'option' => 'dokan_selling',
                    'field'  => 'shipping_tax_fee_recipient',
                ],
            ],

            // === SubPage: Commissions ===
            [
                'id'          => 'commission',
                'type'        => 'subpage',
                'page_id'     => 'transaction',
                'title'       => esc_html__( 'Commissions', 'dokan-lite' ),
                'description' => esc_html__( 'Set up marketplace commission structure and earnings from vendor sales.', 'dokan-lite' ),
                'priority'    => 200,
            ],
            [
                'id'         => 'commission',
                'type'       => 'section',
                'subpage_id' => 'commission',
            ],
            [
                'id'          => 'commission_type',
                'legacy_key' => [
                    'option' => 'dokan_selling',
                    'field'  => 'commission_type',
                ],
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'commission',
                'title'       => esc_html__( 'Commission Type', 'dokan-lite' ),
                'tooltip'     => esc_html__( 'Select a commission type', 'dokan-lite' ),
                'description' => esc_html__( 'Select a commission type for your marketplace', 'dokan-lite' ),
                'default'     => $default_settings['commission_type'],
                'options'     => [
                    [
						'title' => esc_html__( 'Fixed', 'dokan-lite' ),
						'value' => 'fixed',
						'icon' => 'Percent',
					],
                    [
						'title' => esc_html__( 'Category Based', 'dokan-lite' ),
						'value' => 'category_based',
						'icon' => 'Box',
					],
                ],
            ],
            [
                'id'               => 'admin_commission',
                'type'             => 'field',
                'variant'          => 'combine_input',
                'section_id'       => 'commission',
                'title'            => esc_html__( 'Commission Amount', 'dokan-lite' ),
                'description'      => esc_html__( 'Amount you will get from sales in both percentage and fixed fee.', 'dokan-lite' ),
                'admin_percentage' => $default_settings['admin_percentage'],
                'additional_fee'   => $default_settings['additional_fee'],
                'dependencies'     => [
                    [
						'key' => 'commission_type',
						'value' => 'fixed',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'commission_type',
						'value' => 'fixed',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                ],
                'validations'      => [
                    [ 'not_empty' => esc_html__( 'Both percentage and fixed fee is required.', 'dokan-lite' ) ],
                ],
                // Server-side mirror of the client check (like delivery-time): both percentage and flat fee are required, so the save is blocked if either is empty.
                'validation_func'  => function ( $value ) {
                    $percentage = is_array( $value ) ? ( $value['admin_percentage'] ?? '' ) : '';
                    $flat       = is_array( $value ) ? ( $value['additional_fee'] ?? '' ) : '';
                    if ( '' === trim( (string) $percentage ) || '' === trim( (string) $flat ) ) {
                        return esc_html__( 'Both percentage and fixed fee is required.', 'dokan-lite' );
                    }
                    return true;
                },
                'legacy_key'       => [
                    'admin_percentage' => 'dokan_selling.admin_percentage',
                    'additional_fee'   => 'dokan_selling.additional_fee',
                ],
            ],
            [
                'id'            => 'reset_sub_category_when_edit_all_category',
                'legacy_key' => [
                    'option' => 'dokan_selling',
                    'field'  => 'reset_sub_category_when_edit_all_category',
                ],
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'commission',
                'title'         => esc_html__( 'Apply Parent Category Commission to All Subcategories', 'dokan-lite' ),
                'description'   => __( "Important: 'All Categories' commission serves as your marketplace's default rate and cannot be empty. If 0 is given in value, then the marketplace will deduct no commission from vendors", 'dokan-lite' ),
                'tooltip'       => __( "When enabled, changing a parent category's commission rate will automatically update all its subcategories. Disable this option to maintain independent commission rates for subcategories", 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'dependencies'  => [
                    [
						'key' => 'commission_type',
						'value' => 'category_based',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'commission_type',
						'value' => 'category_based',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'           => 'commission_category_based_values',
                'legacy_key' => [
                    'option' => 'dokan_selling',
                    'field'  => 'commission_category_based_values',
                ],
                'type'         => 'field',
                'variant'      => 'category_based_commission',
                'section_id'   => 'commission',
                'title'        => esc_html__( 'Commission Amount', 'dokan-lite' ),
                'description'  => esc_html__( 'Amount you will get from sales in both percentage and fixed fee.', 'dokan-lite' ),
                'dependencies' => [
                    [
						'key' => 'commission_type',
						'value' => 'category_based',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'commission_type',
						'value' => 'category_based',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                ],
                'validations'  => [
                    [ 'not_empty' => esc_html__( 'Both percentage and fixed fee is required.', 'dokan-lite' ) ],
                ],
                // Server-side mirror of the client check (like delivery-time): the All-Categories rate needs both percentage and flat fee, so the save is blocked if either is empty.
                'validation_func' => function ( $value ) {
                    $all        = is_array( $value ) && isset( $value['all'] ) ? $value['all'] : [];
                    $percentage = $all['percentage'] ?? '';
                    $flat       = $all['flat'] ?? '';
                    if ( '' === trim( (string) $percentage ) || '' === trim( (string) $flat ) ) {
                        return esc_html__( 'Admin Commission is required.', 'dokan-lite' );
                    }
                    return true;
                },
            ],

            // === SubPage: Withdraw ===
            [
                'id'          => 'withdraw_charge',
                'type'        => 'subpage',
                'page_id'     => 'transaction',
                'title'       => esc_html__( 'Withdraw', 'dokan-lite' ),
                'description' => esc_html__( 'Set up available withdrawal methods and transaction conditions for vendors.', 'dokan-lite' ),
				'priority' => 300,
                'doc_link'    => 'https://dokan.co/docs/wordpress/withdraw/',
            ],
            [
                'id'          => 'section_withdraw_charge',
                'type'        => 'section',
                'subpage_id'  => 'withdraw_charge',
                'title'       => esc_html__( 'Withdraw Methods and Charges', 'dokan-lite' ),
                'description' => esc_html__( 'Select suitable withdraw methods and charges for vendors.', 'dokan-lite' ),
            ],
            // PayPal
            [
                'id'         => 'withdraw_methods_group_paypal',
                'type'       => 'fieldgroup',
                'section_id' => 'section_withdraw_charge',
            ],
            [
                'id'             => 'paypal_withdraw',
                'type'           => 'field',
                'variant'        => 'switch',
                'field_group_id' => 'withdraw_methods_group_paypal',
                'title'          => esc_html__( 'PayPal', 'dokan-lite' ),
                'description'    => esc_html__( 'Enable PayPal as a withdrawal method for vendors.', 'dokan-lite' ),
                'default'        => 'on',
                'image_url'      => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/paypal.svg',
                'enable_state'   => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state'  => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'         => 'dokan_withdraw.withdraw_methods.paypal',
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\WithdrawMethodToggleTransformer::for_method( 'paypal' ),
            ],
            [
                'id'               => 'paypal_withdraw_charges',
                'type'             => 'field',
                'variant'          => 'combine_input',
                'field_group_id'   => 'withdraw_methods_group_paypal',
                'title'            => esc_html__( 'Withdraw charges', 'dokan-lite' ),
                'tooltip'          => esc_html__( 'Set withdrawal charges for PayPal method.', 'dokan-lite' ),
                'admin_percentage' => '0.00',
                'additional_fee'   => '0.00',
                'dependencies'     => [
                    [
						'key' => 'paypal_withdraw',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'paypal_withdraw',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
                'validations'      => [
                    [ 'not_empty' => esc_html__( 'Both percentage and fixed fee is required.', 'dokan-lite' ) ],
                ],
                'legacy_key'         => 'dokan_withdraw.withdraw_charges.paypal',
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\WithdrawChargeTransformer::class,
            ],
            // Bank Transfer
            [
                'id'         => 'withdraw_methods_group_bank',
                'type'       => 'fieldgroup',
                'section_id' => 'section_withdraw_charge',
            ],
            [
                'id'             => 'bank_transfer_withdraw',
                'type'           => 'field',
                'variant'        => 'switch',
                'field_group_id' => 'withdraw_methods_group_bank',
                'title'          => esc_html__( 'Bank Transfer', 'dokan-lite' ),
                'description'    => esc_html__( 'Enable Bank Transfer as a withdrawal method for vendors.', 'dokan-lite' ),
                'default'        => 'off',
                'image_url'      => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/bank-transfer.svg',
                'enable_state'   => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state'  => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'         => 'dokan_withdraw.withdraw_methods.bank',
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\WithdrawMethodToggleTransformer::for_method( 'bank' ),
            ],
            [
                'id'               => 'bank_transfer_withdraw_charges',
                'type'             => 'field',
                'variant'          => 'combine_input',
                'field_group_id'   => 'withdraw_methods_group_bank',
                'title'            => esc_html__( 'Withdraw charges', 'dokan-lite' ),
                'tooltip'          => esc_html__( 'Set withdrawal charges for Bank Transfer method.', 'dokan-lite' ),
                'admin_percentage' => '0.00',
                'additional_fee'   => '0.00',
                'dependencies'     => [
                    [
						'key' => 'bank_transfer_withdraw',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'bank_transfer_withdraw',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
                'validations'      => [
                    [ 'not_empty' => esc_html__( 'Both percentage and fixed fee is required.', 'dokan-lite' ) ],
                ],
                'legacy_key'         => 'dokan_withdraw.withdraw_charges.bank',
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\WithdrawChargeTransformer::class,
            ],
            // Note: Pro adds more withdraw methods (Skrill, Razorpay, Stripe, Paystack, Custom) via dokan_get_admin_settings_schema filter

            // Minimum Withdraw Limit
            [
                'id'         => 'minimum_withdraw_limit_section',
                'type'       => 'section',
                'subpage_id' => 'withdraw_charge',
            ],
            [
                'id'          => 'minimum_withdraw_limit',
                'type'        => 'field',
                'variant'     => 'number',
                'section_id'  => 'minimum_withdraw_limit_section',
                'title'       => esc_html__( 'Minimum Withdraw Limit', 'dokan-lite' ),
                'description' => esc_html__( 'Minimum balance required to make a withdraw request. Leave blank to set no minimum limits.', 'dokan-lite' ),
                'prefix'      => function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '$',
                'default'     => 50,
                'legacy_key' => [
                    'option' => 'dokan_withdraw',
                    'field'  => 'withdraw_limit',
                ],
            ],

            // Order Status for Withdraw
            [
                'id'         => 'withdraw_order_status_section',
                'type'       => 'section',
                'subpage_id' => 'withdraw_charge',
            ],
            self::withdraw_order_status_field(),

            // COD Payments
            [
                'id'         => 'cod_payments_section',
                'type'       => 'section',
                'subpage_id' => 'withdraw_charge',
            ],
            [
                'id'          => 'include_cod_payments_in_balance',
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'cod_payments_section',
                'title'       => esc_html__( 'COD Payments', 'dokan-lite' ),
                'description' => esc_html__( 'If an order is paid with Cash on Delivery (COD), then exclude that payment from vendor balance.', 'dokan-lite' ),
                'default'     => 'include',
                'options'     => [
                    [
						'title' => esc_html__( 'Include', 'dokan-lite' ),
						'value' => 'on',
					],
                    [
						'title' => esc_html__( 'Exclude', 'dokan-lite' ),
						'value' => 'off',
					],
                ],
                'legacy_key' => [
                    'option' => 'dokan_withdraw',
                    'field'  => 'exclude_cod_payment',
                ],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\InvertOnOffTransformer::class,
            ],

            // === SubPage: Reverse Withdrawal ===
            [
                'id'          => 'reverse_withdrawal',
                'type'        => 'subpage',
                'page_id'     => 'transaction',
                'title'       => esc_html__( 'Reverse Withdrawal', 'dokan-lite' ),
                'description' => esc_html__( 'Set up commission collection from vendors on Cash on Delivery orders. Control when and how to charge money from vendor accounts when they owe you.', 'dokan-lite' ),
                'priority'      => 400,
                'doc_link'      => 'https://wedevs.com/docs/dokan/withdraw/dokan-reverse-withdrawal/',
                'doc_link_text' => esc_html__( 'Doc', 'dokan-lite' ),
            ],
            [
                'id'         => 'reverse_withdrawal_section',
                'type'       => 'section',
                'subpage_id' => 'reverse_withdrawal',
            ],
            [
                'id'            => 'reverse_withdrawal_enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'reverse_withdrawal_section',
                'title'         => esc_html__( 'Activate Reverse Withdrawal (Cash On Delivery)', 'dokan-lite' ),
                'description'   => esc_html__( 'Enable this option to activate automatic balance collection from vendors.', 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key' => [
					'option' => 'dokan_reverse_withdrawal',
					'field' => 'enabled',
				],
                'priority'    => 50,
            ],
            [
                'id'          => 'reverse_withdrawal_billing_type',
                'legacy_key' => [
                    'option' => 'dokan_reverse_withdrawal',
                    'field'  => 'billing_type',
                ],
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'reverse_withdrawal_section',
                'title'       => esc_html__( 'Billing Type', 'dokan-lite' ),
                'description' => esc_html__( 'Select how vendors will be billed for their reverse balance amounts.', 'dokan-lite' ),
                'default'     => 'by_amount',
                'options'     => [
                    [
						'title' => esc_html__( 'By Amount Limit', 'dokan-lite' ),
						'value' => 'by_amount',
						'icon' => 'DollarSign',
					],
                    [
						'title' => esc_html__( 'Monthly', 'dokan-lite' ),
						'value' => 'by_month',
						'icon' => 'Calendar',
					],
                ],
            ],
            [
                'id'           => 'reverse_withdrawal_balance_threshold',
                'legacy_key' => [
                    'option' => 'dokan_reverse_withdrawal',
                    'field'  => 'reverse_balance_threshold',
                ],
                'type'         => 'field',
                'variant'      => 'number',
                'section_id'   => 'reverse_withdrawal_section',
                'title'        => sprintf(
                    /* translators: %s: Currency code */
                    esc_html__( 'Reverse Balance Threshold (%s)', 'dokan-lite' ),
                    function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'USD'
                ),
                'description'  => esc_html__( 'Set the amount that triggers automatic withdrawal actions.', 'dokan-lite' ),
                'prefix'       => function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '$',
                'addon_icon'   => true,
                'default'      => 150,
                'min_value'    => 0,
                'step'         => 0.5,
                'dependencies' => [
                    [
						'key' => 'reverse_withdrawal_billing_type',
						'value' => 'by_amount',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'reverse_withdrawal_billing_type',
						'value' => 'by_month',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'           => 'reverse_withdrawal_monthly_billing_day',
                'legacy_key' => [
                    'option' => 'dokan_reverse_withdrawal',
                    'field'  => 'monthly_billing_day',
                ],
                'type'         => 'field',
                'variant'      => 'number',
                'section_id'   => 'reverse_withdrawal_section',
                'title'        => esc_html__( 'Monthly Billing Date', 'dokan-lite' ),
                'description'  => esc_html__( 'Enter the day of month when you want to send reverse withdrawal balance invoices to vendors.', 'dokan-lite' ),
                'addon_icon'   => true,
                'default'      => 1,
                'min_value'    => 1,
                'max_value'    => 28,
                'validations'  => [
                    [
                        'rules'   => 'not_empty|min_value|max_value',
                        'message' => '',
                        'params'  => [
							'min' => 1,
							'max' => 28,
						],
                    ],
                    [
                        'rules'   => 'sum_max',
                        'message' => esc_html__( 'Monthly billing date (when billing type is monthly) plus grace period must not exceed 28.', 'dokan-lite' ),
                        'params'  => [
							'field' => 'reverse_withdrawal_due_period',
							'max' => 28,
						],
                    ],
                ],
                'dependencies' => [
                    [
						'key' => 'reverse_withdrawal_billing_type',
						'value' => 'by_month',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'reverse_withdrawal_billing_type',
						'value' => 'by_amount',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'          => 'reverse_withdrawal_due_period',
                'legacy_key' => [
                    'option' => 'dokan_reverse_withdrawal',
                    'field'  => 'due_period',
                ],
                'type'        => 'field',
                'variant'     => 'number',
                'section_id'  => 'reverse_withdrawal_section',
                'title'       => esc_html__( 'Grace Period', 'dokan-lite' ),
                'description' => esc_html__( 'Number of days to wait before enforcing collection actions. Set to 0 for immediate action.', 'dokan-lite' ),
                'addon_icon'  => true,
                'postfix'     => esc_html__( 'Days', 'dokan-lite' ),
                'default'     => 7,
                'min_value'   => 0,
                'max_value'   => 28,
                'step'        => 1,
                'validations' => [
                    [
                        'rules'   => 'not_empty|min_value|max_value',
                        'message' => '',
                        'params'  => [
							'min' => 0,
							'max' => 28,
						],
                    ],
                    [
                        'rules'   => 'sum_max',
                        'message' => esc_html__( 'Monthly billing date (when billing type is monthly) plus grace period must not exceed 28.', 'dokan-lite' ),
                        'params'  => [
							'field' => 'reverse_withdrawal_monthly_billing_day',
							'max' => 28,
						],
                    ],
                ],
            ],
            [
                'id'                 => 'reverse_withdrawal_failed_penalty_actions',
                'type'               => 'field',
                'variant'            => 'multicheck',
                'section_id'         => 'reverse_withdrawal_section',
                'title'              => esc_html__( 'Penalty Actions After Grace Period', 'dokan-lite' ),
                'description'        => esc_html__( 'Choose actions to take when the grace period expires and payment remains outstanding.', 'dokan-lite' ),
                'default'            => [ 'enable_catalog_mode' ],
                'options'            => [
                    [
						'title' => esc_html__( 'Disable Add to Cart Button', 'dokan-lite' ),
						'value' => 'enable_catalog_mode',
					],
                    [
						'title' => esc_html__( 'Hide Withdraw Menu', 'dokan-lite' ),
						'value' => 'hide_withdraw_menu',
					],
                    [
						'title' => esc_html__( 'Make Vendor Status Inactive', 'dokan-lite' ),
						'value' => 'status_inactive',
					],
                ],
                // Legacy `dokan_reverse_withdrawal.failed_actions` is a WP
                // multicheck parent array (key-as-value). Bridge each option
                // to its own sub-path so unselected slots are cleared without
                // wiping sibling keys.
                'legacy_key'         => [
                    'enable_catalog_mode' => 'dokan_reverse_withdrawal.failed_actions.enable_catalog_mode',
                    'hide_withdraw_menu'  => 'dokan_reverse_withdrawal.failed_actions.hide_withdraw_menu',
                    'status_inactive'     => 'dokan_reverse_withdrawal.failed_actions.status_inactive',
                ],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\MulticheckArrayTransformer::for_slots(
                    [ 'enable_catalog_mode', 'hide_withdraw_menu', 'status_inactive' ]
                ),
            ],
            [
                'id'            => 'reverse_withdrawal_grace_period_notice',
                'legacy_key' => [
                    'option' => 'dokan_reverse_withdrawal',
                    'field'  => 'display_notice',
                ],
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'reverse_withdrawal_section',
                'title'         => esc_html__( 'Display Notice During Grace Period', 'dokan-lite' ),
                'description'   => esc_html__( 'Show a payment reminder notification on the vendor dashboard during the grace period.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
            ],
        ];
    }

    /**
     * Build the `withdraw_order_status` multi-switch field.
     *
     * Options are derived from the legacy `dokan_settings_withdraw_order_status_options`
     * filter so Pro modules / extensions that already extend that filter continue to
     * add statuses on both the legacy and new UIs with one declaration. The new
     * field stores a `Record<string,bool>` keyed by status (e.g. `wc-completed`),
     * each slot bridged through {@see MulticheckSlotTransformer} to the legacy
     * `dokan_withdraw.withdraw_order_status` parent array.
     *
     * @return array
     */
    private static function withdraw_order_status_field(): array {
        $statuses = AdminSettings::withdraw_order_status_options();

        $options    = [];
        $legacy_key = [];
        foreach ( $statuses as $value => $label ) {
            $options[]            = [
                'value' => (string) $value,
                'label' => (string) $label,
            ];
            $legacy_key[ $value ] = 'dokan_withdraw.withdraw_order_status.' . $value;
        }
        $slot_keys = array_keys( $legacy_key );

        return [
            'id'                 => 'withdraw_order_status',
            'type'               => 'field',
            'variant'            => 'multicheck',
            'section_id'         => 'withdraw_order_status_section',
            'title'              => esc_html__( 'Order Status for Withdraw', 'dokan-lite' ),
            'description'        => esc_html__( 'Order status for which vendor can make a withdraw request.', 'dokan-lite' ),
            'options'            => $options,
            'default'            => [ 'wc-processing' ],
            'legacy_key'         => $legacy_key,
            'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\MulticheckArrayTransformer::for_slots( $slot_keys ),
        ];
    }

    /**
     * Vendor page schema.
     *
     * @return array
     */
    private static function vendor_page(): array {
        return [
            [
                'id'          => 'vendor',
                'type'        => 'page',
                'title'       => esc_html__( 'Vendors', 'dokan-lite' ),
                'description' => esc_html__( 'Configure vendor-related settings and capabilities.', 'dokan-lite' ),
                'icon'        => 'Users',
                'priority'    => 400,
            ],

            // === SubPage: Vendor Onboarding ===
            [
                'id'          => 'vendor_onboarding',
                'type'        => 'subpage',
                'page_id'     => 'vendor',
                'title'       => esc_html__( 'Vendor Onboarding', 'dokan-lite' ),
                'description' => esc_html__( 'Control the onboarding experience for vendors joining your marketplace.', 'dokan-lite' ),
                'priority'    => 100,
                'doc_link'    => 'https://wedevs.com/docs/dokan-lite/vendor-onboarding/',
            ],
            [
                'id'            => 'vendor_auto_enable_selling',
                'type'          => 'field',
                'variant'       => 'radio_capsule',
                'subpage_id'    => 'vendor_onboarding',
                'title'         => esc_html__( 'Enable Selling', 'dokan-lite' ),
                'description'   => esc_html__( 'Immediately enable selling for newly registered vendors.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'If checked, vendors will have permission to sell immediately after registration. If unchecked, newly registered vendors cannot add products until selling capability is activated manually from admin dashboard.', 'dokan-lite' ),
                'default'       => 'automatically',
                'options'       => self::map_array_to_radio_capsule_options( dokan_get_container()->get( AdminSettings::class )->new_seller_enable_selling_statuses() ),
                'legacy_key' => [
					'option' => 'dokan_selling',
					'field' => 'new_seller_enable_selling',
				],

            ],
            [
                'id'            => 'vendor_registration_address_fields',
                'type'          => 'field',
                'variant'       => 'switch',
                'subpage_id'    => 'vendor_onboarding',
                'title'         => esc_html__( 'Address Fields', 'dokan-lite' ),
                'description'   => esc_html__( 'Add Address Fields on the Vendor Registration form.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'Add Address Fields on the Vendor Registration form.', 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key' => [
                    'option' => 'dokan_general',
                    'field' => 'enabled_address_on_reg',
                ],
            ],
            [
                'id'            => 'show_register_as_vendor',
                'type'          => 'field',
                'variant'       => 'switch',
                'subpage_id'    => 'vendor_onboarding',
                'title'         => __( 'Show "Register as a Vendor" in Sign Up Page', 'dokan-lite' ),
                'description'   => __( 'Adds the "I am a customer / I am a vendor" role toggle to the WooCommerce My Account sign-up form.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_appearance',
                    'field'  => 'show_register_as_vendor',
                ],
            ],
            [
                'id'            => 'vendor_setup_wizard_logo',
                'type'          => 'field',
                'variant'       => 'wp_media_upload',
                'subpage_id'    => 'vendor_onboarding',
                'title'         => esc_html__( 'Vendor Setup Wizard Logo', 'dokan-lite' ),
                'description'   => esc_html__( 'Upload a logo for the vendor setup wizard.', 'dokan-lite' ),
                'allowed_types' => [ 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml' ],
                'max_file_size' => 2097152,
                'legacy_key'    => [
                    'option' => 'dokan_general',
                    'field'  => 'setup_wizard_logo_url',
                ],
            ],
            [
                'id'          => 'vendor_setup_wizard_message',
                'type'        => 'field',
                'variant'     => 'rich_text',
                'subpage_id'  => 'vendor_onboarding',
                'title'       => esc_html__( 'Vendor Setup Wizard Message', 'dokan-lite' ),
                'description' => esc_html__( 'Welcome message shown to vendors during setup.', 'dokan-lite' ),
                // Carries the legacy default verbatim: with no default the field
                // rendered empty and the first save of an untouched page replaced
                // the shipped welcome copy with a blank string.
                'default'     => __( 'Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. <strong>It’s completely optional and shouldn’t take longer than two minutes.</strong>', 'dokan-lite' ),
                'legacy_key'    => [
                    'option' => 'dokan_general',
                    'field'  => 'setup_wizard_message',
                ],
            ],
            [
                'id'            => 'vendor_welcome_wizard_enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'subpage_id'    => 'vendor_onboarding',
                'title'         => esc_html__( 'Welcome Wizard', 'dokan-lite' ),
                'description'   => esc_html__( 'Show the vendor setup wizard after first login.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
					'option' => 'dokan_general',
					'field'  => 'disable_welcome_wizard',
				],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\InvertOnOffTransformer::class,
            ],

            // === SubPage: Vendor Capabilities ===
            [
                'id'          => 'vendor_capabilities',
                'type'        => 'subpage',
                'page_id'     => 'vendor',
                'title'       => esc_html__( 'Vendor Capabilities', 'dokan-lite' ),
                'description' => esc_html__( 'Configure what vendors can do and control within your marketplace.', 'dokan-lite' ),
                'priority'    => 300,
            ],
            [
                'id'         => 'vendor_capabilities',
                'type'       => 'section',
                'subpage_id' => 'vendor_capabilities',
            ],
            [
                'id'            => 'one_page_product_creation',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'vendor_capabilities',
                'title'         => esc_html__( 'One Page Product Creation', 'dokan-lite' ),
                'description'   => esc_html__( 'Add new product in single page view.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'If disabled, instead of a single add product page it will open a pop up window or vendor will redirect to product page when adding new product.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_selling',
                    'field'  => 'one_step_product_create',
                ],
            ],
            [
                'id'            => 'vendor_new_product_popup',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'vendor_capabilities',
                'title'         => esc_html__( 'Product Popup', 'dokan-lite' ),
                'description'   => esc_html__( 'Add new product in popup view.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'If disabled, instead of a pop up window vendor will redirect to product page when adding new product.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'dependencies'  => [
                    [
						'key' => 'one_page_product_creation',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '!==',
					],
                    [
						'key' => 'one_page_product_creation',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
                'legacy_key'    => [
                    'option' => 'dokan_selling',
                    'field'  => 'disable_product_popup',
                ],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\InvertOnOffTransformer::class,
            ],
            [
                'id'            => 'vendor_can_change_order_status',
                'legacy_key' => [
                    'option' => 'dokan_selling',
                    'field'  => 'order_status_change',
                ],
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'vendor_capabilities',
                'title'         => esc_html__( 'Order Status Change', 'dokan-lite' ),
                'description'   => esc_html__( 'Allow vendor to update order status.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'Checking this will enable sellers to change the order status. If unchecked, only admin can change the order status.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
            ],
            [
                'id'            => 'vendor_select_any_product_category',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'vendor_capabilities',
                'title'         => esc_html__( 'Select any category', 'dokan-lite' ),
                'description'   => esc_html__( 'Allow vendors to select any category while creating/editing products.', 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_selling',
                    'field'  => 'dokan_any_category_selection',
                ],
            ],
        ];
    }

    /**
     * Appearance page schema.
     *
     * @return array
     */
    private static function appearance_page(): array {
        return [
            [
                'id'          => 'appearance',
                'type'        => 'page',
                'title'       => esc_html__( 'Appearance', 'dokan-lite' ),
                'description' => esc_html__( 'Configure dashboard menu settings, visibility, and customization options.', 'dokan-lite' ),
                'icon'        => 'PanelsRightBottom',
                'priority'    => 700,
            ],
            [
                'id'          => 'store',
                'type'        => 'subpage',
                'page_id'     => 'appearance',
                'title'       => esc_html__( 'Store', 'dokan-lite' ),
                'priority'    => 100,
            ],

            // === SubPage: Vendor Panel ===
            [
                'id'          => 'vendor_panel',
                'type'        => 'subpage',
                'page_id'     => 'appearance',
                'title'       => esc_html__( 'Vendor Panel', 'dokan-lite' ),
                'description' => esc_html__( 'Manage Vendor Panel appearance settings and modifications', 'dokan-lite' ),
                'priority'    => 50,
            ],
            [
                'id'          => 'vendor_dashboard_section',
                'type'        => 'section',
                'subpage_id'  => 'vendor_panel',
                'title'       => esc_html__( 'Vendor Dashboard Appearance', 'dokan-lite' ),
                'description' => esc_html__( 'Configure the appearance and style of the vendor dashboard.', 'dokan-lite' ),
            ],
            [
                'id'          => 'vendor_layout_style',
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'vendor_dashboard_section',
                'title'       => esc_html__( 'Vendor Dashboard Style', 'dokan-lite' ),
                'description' => esc_html__( 'Select the user interface for the vendor dashboard.', 'dokan-lite' ),
                'default'     => 'legacy',
                'options'     => [
                    [
						'title' => esc_html__( 'New UI', 'dokan-lite' ),
						'value' => 'latest',
					],
                    [
						'title' => esc_html__( 'Legacy UI', 'dokan-lite' ),
						'value' => 'legacy',
					],
                ],
                'legacy_key'  => [
                    'option' => 'dokan_appearance',
                    'field'  => 'vendor_layout_style',
                ],
            ],
            [
                'id'          => 'vendor_product_editor',
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'vendor_dashboard_section',
                'title'       => esc_html__( 'Vendor Product Editor', 'dokan-lite' ),
                'description' => esc_html__( 'Select the user interface for the vendor product editor.', 'dokan-lite' ),
                'default'     => 'legacy',
                'options'     => [
                    [
						'title' => esc_html__( 'New UI', 'dokan-lite' ),
						'value' => 'latest',
					],
                    [
						'title' => esc_html__( 'Legacy UI', 'dokan-lite' ),
						'value' => 'legacy',
					],
                ],
                'legacy_key'  => [
                    'option' => 'dokan_appearance',
                    'field'  => 'vendor_product_editor',
                ],
            ],

            // Products Per Page
            [
                'id'         => 'products_page',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'          => 'store_products_per_page',
                'type'        => 'field',
                'variant'     => 'number',
                'section_id'  => 'products_page',
                'title'       => esc_html__( 'Store Products Per Page', 'dokan-lite' ),
                'description' => esc_html__( 'Set how many products to display per page on the vendor store page.', 'dokan-lite' ),
                'tooltip'     => esc_html__( 'Set the number of products to display per page on the vendor store page.', 'dokan-lite' ),
                'placeholder' => esc_html__( 'Products Per Page', 'dokan-lite' ),
                'default'     => 12,
                'min_value'   => 1,
                'step'        => 1,
                'legacy_key' => [
                    'option' => 'dokan_general',
                    'field' => 'store_products_per_page',
                ],
            ],

            // Contact Form
            [
                'id'         => 'store_contact_form_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'store_contact_form_enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'store_contact_form_section',
                'title'         => esc_html__( 'Show Contact Form on Store Page', 'dokan-lite' ),
                'description'   => esc_html__( 'Display a vendor contact form in the store sidebar', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enable', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disable', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key' => [
					'option' => 'dokan_appearance',
					'field' => 'contact_seller',
				],
            ],

            // Default Store Media
            [
                'id'         => 'store_default_media_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'default_store_banner',
                'type'          => 'field',
                'variant'       => 'wp_media_upload',
                'section_id'    => 'store_default_media_section',
                'title'         => esc_html__( 'Default Store Banner', 'dokan-lite' ),
                'allowed_types' => [ 'image/jpeg', 'image/png', 'image/gif' ],
                'default'       => DOKAN_PLUGIN_ASSEST . '/images/default-store-banner.png',
                'legacy_key'    => [
                    'option' => 'dokan_appearance',
                    'field'  => 'default_store_banner',
                ],
            ],
            [
                'id'            => 'default_store_profile',
                'type'          => 'field',
                'variant'       => 'wp_media_upload',
                'section_id'    => 'store_default_media_section',
                'title'         => esc_html__( 'Default Store Profile Picture', 'dokan-lite' ),
                'allowed_types' => [ 'image/jpeg', 'image/png', 'image/gif' ],
                'default'       => DOKAN_PLUGIN_ASSEST . '/images/mystery-person.jpg',
                'legacy_key'    => [
                    'option' => 'dokan_appearance',
                    'field'  => 'default_store_profile',
                ],
            ],

            // Banner Dimension
            [
                'id'         => 'store_banner_dimension_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'store_banner_dimension',
                'type'          => 'field',
                'variant'       => 'double_input',
                'section_id'    => 'store_banner_dimension_section',
                'title'         => esc_html__( 'Store Banner Dimension', 'dokan-lite' ),
                'first_prefix'  => esc_html__( 'Width', 'dokan-lite' ),
                'second_prefix' => esc_html__( 'Height', 'dokan-lite' ),
                'default'       => [
					'first' => 625,
					'second' => 300,
				],
                // Legacy stores width/height as two separate keys under
                // `dokan_appearance` (Pro-injected). Bridge each to its own
                // slot of the `double_input` value via {@see DoubleInputTransformer}.
                'legacy_key'         => [
                    'first'  => 'dokan_appearance.store_banner_width',
                    'second' => 'dokan_appearance.store_banner_height',
                ],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\DoubleInputTransformer::class,
            ],

            // Store Template
            [
                'id'         => 'store_template',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'                => 'store_header_template',
                'type'              => 'field',
                'variant'           => 'customize_radio',
                'section_id'        => 'store_template',
                'title'             => esc_html__( 'Store Header Template', 'dokan-lite' ),
                'description'       => esc_html__( 'Select a store header for your store.', 'dokan-lite' ),
                'customize_variant' => 'template',
                'default'           => 'default',
                'options'           => [
                    [
						'title' => esc_html__( 'Template 1', 'dokan-lite' ),
						'value' => 'default',
						'image' => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/store/store-page-template-one.svg',
					],
                    [
						'title' => esc_html__( 'Template 2', 'dokan-lite' ),
						'value' => 'layout1',
						'image' => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/store/store-page-template-two.svg',
					],
                    [
						'title' => esc_html__( 'Template 3', 'dokan-lite' ),
						'value' => 'layout2',
						'image' => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/store/store-page-template-three.svg',
					],
                    [
						'title' => esc_html__( 'Template 4', 'dokan-lite' ),
						'value' => 'layout3',
						'image' => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/store/store-page-template-four.svg',
					],
                ],
                'radio_variant' => 'template',
                'legacy_key' => [
                    'option' => 'dokan_appearance',
                    'field'  => 'store_header_template',
                ],
            ],

            // Store Time Widget
            [
                'id'         => 'store_time_widget_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'store_opening_closing_time_widget',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'store_time_widget_section',
                'title'         => esc_html__( 'Store Opening Closing Time Widget', 'dokan-lite' ),
                'description'   => esc_html__( 'Enable store opening & closing time widget in the store sidebar', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enable', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disable', 'dokan-lite' ),
					'value' => 'off',
				],
				'legacy_key' => [
					'option' => 'dokan_appearance',
					'field' => 'store_open_close',
				],
            ],

            // Store Sidebar
            [
                'id'         => 'store_sidebar_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'store_sidebar_from_theme',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'store_sidebar_section',
                'title'         => esc_html__( 'Store Sidebar From Theme', 'dokan-lite' ),
                'description'   => esc_html__( "Apply main theme's sidebar styling to vendor stores for a consistent look", 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
					'label' => esc_html__( 'Enable', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disable', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key' => [
					'option' => 'dokan_appearance',
					'field' => 'enable_theme_store_sidebar',
				],
            ],

            // Vendor Info Visibility
            [
                'id'         => 'vendor_info_visibility_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'          => 'store_page_vendor_info_visibility',
                'type'        => 'field',
                'variant'     => 'info_preview',
                'section_id'  => 'vendor_info_visibility_section',
                'title'       => esc_html__( 'Vendor Info Visibility', 'dokan-lite' ),
                'description' => esc_html__( 'Choose what vendor details to show customers in single store page.', 'dokan-lite' ),
                'options'     => [
                    [
                        'value' => 'store_email',
                        'label' => esc_html__( 'Email Address', 'dokan-lite' ),
                    ],
                    [
                        'value' => 'store_phone',
                        'label' => esc_html__( 'Phone Number', 'dokan-lite' ),
                    ],
                    [
                        'value' => 'store_address',
                        'label' => esc_html__( 'Store Address', 'dokan-lite' ),
                    ],
                ],
                'default'     => [
                    'store_email'   => true,
                    'store_phone'   => true,
                    'store_address' => true,
                ],
                'legacy_key' => [
                    'option' => 'dokan_appearance',
                    'field'  => 'hide_vendor_info',
                ],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\HideVendorInfoTransformer::class,
            ],

            // Dokan Font
            [
                'id'         => 'dokan_font_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'dokan_fontawesome_enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'dokan_font_section',
                'title'         => esc_html__( 'Dokan font-awesome Functionality', 'dokan-lite' ),
                'description'   => esc_html__( "If disabled then Dokan font-awesome library won't be loaded in frontend.", 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enable', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disable', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key' => [
                    'option' => 'dokan_appearance',
                    'field'  => 'disable_dokan_fontawesome',
                ],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\InvertOnOffTransformer::class,
            ],

            // Single Product Preview
            [
                'id'         => 'single_product_preview_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'          => 'single_product_page_appearance',
                'type'        => 'field',
                'variant'     => 'info_preview',
                'section_id'  => 'single_product_preview_section',
                'title'       => esc_html__( 'Single Product Page Appearance', 'dokan-lite' ),
                'description' => esc_html__( 'Choose which sections to show when customers view individual products.', 'dokan-lite' ),
                'options'     => [
                    [
                        'value' => 'vendor_info',
                        'label' => esc_html__( 'Vendor Info', 'dokan-lite' ),
                    ],
                    [
                        'value' => 'more_products_tab',
                        'label' => esc_html__( 'More products tab', 'dokan-lite' ),
                    ],
                ],
                'default'     => [
                    'vendor_info'       => true,
                    'more_products_tab' => true,
                    'shipping_tab'      => true,
                ],
                'legacy_key'  => [
                    'vendor_info'       => [
						'option' => 'dokan_general',
						'field' => 'show_vendor_info',
					],
                    'more_products_tab' => [
						'option' => 'dokan_general',
						'field' => 'enabled_more_products_tab',
					],
                ],
                'legacy_transformer' => \WeDevs\Dokan\Admin\Settings\Migration\Transformer\SingleProductAppearanceTransformer::class,
            ],
        ];
    }

    /**
     * Convert an associative `value => label` array into the shape a
     * `radio_capsule` field's `options` attribute expects.
     *
     * Each input pair becomes one `{ title, value, icon }` element. Use this
     * to feed the output of helpers such as
     * `AdminSettings::new_seller_enable_selling_statuses()` (which return
     * `value => label` maps) directly into a `radio_capsule` schema element
     * without losing the option order or having to repeat the icon-lookup
     * boilerplate at every call site.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,string> $options Associative map of `option_value => display_label`.
     *                                      Keys become the field value; values become the visible title.
     * @param array<string,string> $icons   Optional `option_value => icon_identifier` map used to attach
     *                                      an icon to each capsule. Missing keys default to `''`.
     *
     * @return array<int,array{title:string,value:string,icon:string}>
     */
    public static function map_array_to_radio_capsule_options( array $options, array $icons = [] ): array {
        $labels = array_values( $options );
        $values = array_keys( $options );

        return array_map(
            function ( $label, $value ) use ( $icons ) {
                return [
					'title' => $label,
					'value' => $value,
					'icon'  => $icons[ $value ] ?? '',
                ];
            },
            $labels,
            $values
        );
    }

    /**
     * Compliance page schema.
     *
     * @return array
     */
    private static function compliance_page(): array {
        return [
            [
                'id'          => 'compliance',
                'type'        => 'page',
                'title'       => esc_html__( 'Compliance', 'dokan-lite' ),
                'icon'        => 'FileText',
                'description' => esc_html__( 'Configure privacy, data handling, and regulatory compliance settings.', 'dokan-lite' ),
                'priority'    => 1000,
            ],
            [
                'id'         => 'privacy',
                'type'       => 'subpage',
                'page_id'    => 'compliance',
                'title'      => esc_html__( 'Privacy', 'dokan-lite' ),
                'priority'   => 100,
            ],
            [
                'id'         => 'privacy_settings',
                'type'       => 'section',
                'subpage_id' => 'privacy',
            ],
            [
                'id'            => 'privacy_policy_visibility',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'privacy_settings',
                'title'         => esc_html__( 'Privacy Policy', 'dokan-lite' ),
                'description'   => esc_html__( 'Show privacy policy link on vendor store contact forms.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key' => [
					'option' => 'dokan_privacy',
					'field' => 'enable_privacy',
				],
            ],
            [
                'id'         => 'privacy_policy_page',
                'type'       => 'field',
                'variant'    => 'select',
                'section_id' => 'privacy_settings',
                'title'      => esc_html__( 'Privacy Policy Page', 'dokan-lite' ),
                'description' => esc_html__( 'Choose which page displays your privacy policy.', 'dokan-lite' ),
                'options'    => self::get_lazy_page_options(),
                'legacy_key' => [
					'option' => 'dokan_privacy',
					'field' => 'privacy_page',
				],
            ],
            [
                'id'            => 'seller_enable_terms_and_conditions',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'privacy_settings',
                'title'         => esc_html__( 'Store Terms and Conditions', 'dokan-lite' ),
                'description'   => esc_html__( 'Enable terms and conditions for vendor stores', 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_general',
                    'field'  => 'seller_enable_terms_and_conditions',
                ],
            ],
            [
                'id'         => 'privacy_policy_section',
                'type'       => 'section',
                'subpage_id' => 'privacy',
            ],
            [
                'id'         => 'privacy_policy_content',
                'type'       => 'field',
                'variant'    => 'rich_text',
                'section_id' => 'privacy_policy_section',
                'title'      => esc_html__( 'Privacy Policy Content', 'dokan-lite' ),
                'description' => esc_html__( 'Create or edit your privacy policy text that will be displayed to users.', 'dokan-lite' ),
                // Carries the legacy default verbatim: with no default the field
                // rendered empty and the first save of an untouched page replaced
                // the shipped policy text with a blank string.
                'default'    => __( 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]', 'dokan-lite' ),
                'legacy_key' => [
					'option' => 'dokan_privacy',
					'field' => 'privacy_policy',
				],
            ],
            [
                'id'         => 'admin_access_section',
                'type'       => 'section',
                'subpage_id' => 'privacy',
            ],
            [
                'id'            => 'admin_access_for_vendors',
                'legacy_key' => [
                    'option' => 'dokan_general',
                    'field'  => 'admin_access',
                ],
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'admin_access_section',
                'title'         => esc_html__( 'Admin Area Access', 'dokan-lite' ),
                'description'   => esc_html__( 'Prevent vendors from accessing the WordPress admin dashboard.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
            ],
            [
                'id'         => 'data_clear_section',
                'type'       => 'section',
                'subpage_id' => 'privacy',
                // Renders the section card itself in destructive tones. The
                // danger_switch field inside draws no card of its own, so this
                // is what gives the block its red border and background.
                'is_danger'  => true,
            ],
            [
                'id'             => 'data_clear_on_uninstall',
                'legacy_key'     => [
                    'option' => 'dokan_general',
                    'field'  => 'data_clear_on_uninstall',
                ],
                'type'           => 'field',
                'variant'        => 'danger_switch',
                'section_id'     => 'data_clear_section',
                'title'          => esc_html__( 'Data Clear Consent', 'dokan-lite' ),
                'description'    => esc_html__( 'Permanently delete all data and database tables related to Dokan and Dokan Pro plugins. This action cannot be undone.', 'dokan-lite' ),
                'icon'           => 'TriangleAlert',
                'default'        => 'off',
                'enable_state'   => [
                    'label' => esc_html__( 'Clear Data', 'dokan-lite' ),
                    'value' => 'on',
                ],
                'disable_state'  => [
                    'label' => esc_html__( 'Disabled', 'dokan-lite' ),
                    'value' => 'off',
                ],
                'confirm_modal'  => [
                    'title'             => esc_html__( 'Are you sure to delete all data?', 'dokan-lite' ),
                    'confirmationTitle' => esc_html__( 'Are you sure to delete all data?', 'dokan-lite' ),
                    'description'       => esc_html__( 'All data and tables related to Dokan and Dokan Pro will be deleted permanently. You will not be able to recover your lost data unless you keep a backup. Do you want to continue?', 'dokan-lite' ),
                    'confirmText'       => esc_html__( 'Yes, Delete', 'dokan-lite' ),
                    'cancelText'        => esc_html__( 'Cancel', 'dokan-lite' ),
                    'checkboxLabel'     => esc_html__( 'Yes, I understand.', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * AI Assist page schema.
     *
     * Page/subpage/section structure is static; engine options and per-provider
     * fieldgroups (api_info / api_notice / api_key / model) are generated
     * dynamically from {@see \WeDevs\Dokan\Intelligence\Manager}'s registered
     * providers, so adding a new AI provider (Lite or Pro) flows through with
     * no schema edits. Each generated api_key/model field declares its own
     * `legacy_key` against the `dokan_ai` option using the established
     * `dokan_ai_<provider_id>_api_key` / `dokan_ai_<provider_id>_model`
     * convention (`dokan_ai_image_<provider_id>_*` for the image side), so the
     * legacy admin form and the new UI stay in sync via the bridge.
     *
     * The image section is appended only when at least one image-capable
     * provider is registered — Lite ships none, Pro registers Leonardo AI
     * (and any others) via the Intelligence Manager, so Lite-only installs
     * see just the text section.
     *
     * @return array
     */
    private static function ai_assist_page(): array {
        // Legacy `show_if` gate: reveal a provider's API key + model only while its engine is selected (single-entry show-on-===, per PR #5727).
        $when_engine = static function ( string $engine_key, string $value ): array {
            return [
                [
					'key' => $engine_key,
					'value' => $value,
					'to_self' => true,
					'attribute' => 'display',
					'effect' => 'show',
					'comparison' => '===',
				],
            ];
        };

        $text_providers = self::resolve_ai_providers( 'text' );

        $provider_options = static function ( array $providers ): array {
            $out = [];
            foreach ( $providers as $id => $provider ) {
                $out[] = [
					'title' => $provider->get_title(),
					'value' => (string) $id,
				];
            }
            return $out;
        };

        $elements = [
            [
                'id'          => 'ai_assist',
                'type'        => 'page',
                'title'       => esc_html__( 'AI Assist', 'dokan-lite' ),
                'description' => esc_html__( 'Configure AI-powered features to enhance your marketplace experience.', 'dokan-lite' ),
                'icon'        => 'Sparkles',
                'priority'    => 300,
            ],
            [
                'id'          => 'product_generation',
                'type'        => 'subpage',
                'page_id'     => 'ai_assist',
                'title'       => esc_html__( 'Content Generation', 'dokan-lite' ),
                'description' => esc_html__( 'Set up AI to elevate your platform with enhanced capabilities.', 'dokan-lite' ),
                'priority'    => 100,
                'doc_link'    => 'https://dokan.co/docs/wordpress/settings/dokan-ai-assistant/',
            ],

            // ===== AI Product Info Generator (text) =====
            // Header-only section like the legacy `dokan_ai_product_info` sub_section — no enable toggle, engine selector always visible.
            [
                'id'          => 'product_info_section',
                'type'        => 'section',
                'subpage_id'  => 'product_generation',
                'title'       => esc_html__( 'AI Product Info Generator', 'dokan-lite' ),
                'description' => esc_html__( 'Let vendors generate product info by AI', 'dokan-lite' ),
            ],
            [
                'id'          => 'ai_product_info_engine',
                'type'        => 'field',
                'variant'     => 'select',
                'section_id'  => 'product_info_section',
                'title'       => esc_html__( 'Engine', 'dokan-lite' ),
                'description' => esc_html__( 'Select which AI provider to use for generating content.', 'dokan-lite' ),
                'default'     => 'openai',
                'options'     => $provider_options( $text_providers ),
                'legacy_key'  => 'dokan_ai.dokan_ai_engine',
            ],
        ];

        // Per-text-provider fieldgroups — dynamic from Manager registry.
        foreach ( $text_providers as $provider_id => $provider ) {
            $pid = (string) $provider_id;
            $elements = array_merge(
                $elements,
                self::ai_provider_group(
                    [
                        'provider_id'     => $pid,
                        'provider'        => $provider,
                        'section_id'      => 'product_info_section',
                        'engine_field_id' => 'ai_product_info_engine',
                        'engine_deps'     => $when_engine( 'ai_product_info_engine', $pid ),
                        'api_key_legacy'  => 'dokan_ai.dokan_ai_' . $pid . '_api_key',
                        'model_legacy'    => 'dokan_ai.dokan_ai_' . $pid . '_model',
                        'model_kind'      => 'text',
                        'id_prefix'       => 'text',
                    ]
                )
            );
        }

        // NOTE: Product Image Enhancement (the `product_description_section`
        // and its image engine / per-image-provider groups) is registered by
        // Dokan Pro via `dokan_get_admin_settings_schema`
        // (see ProSettingsSchema::ai_assist_settings()). It depends on image
        // providers that only Pro registers, so it lives entirely in Pro.

        return $elements;
    }

    /**
     * Resolve registered AI providers for the given kind ('text' | 'image').
     *
     * Returns an empty array when the Intelligence module is not loaded or
     * the container can't resolve Manager — keeps schema generation
     * best-effort so a partial bootstrap never breaks the settings UI.
     *
     * Public so Dokan Pro can resolve image providers when registering the
     * Product Image Enhancement schema via `dokan_get_admin_settings_schema`.
     *
     * @param string $kind
     *
     * @return array
     */
    public static function resolve_ai_providers( string $kind ): array {
        if ( ! class_exists( '\WeDevs\Dokan\Intelligence\Manager' ) ) {
            return [];
        }
        try {
            $manager = dokan()->get_container()->get( \WeDevs\Dokan\Intelligence\Manager::class );
            return 'image' === $kind
                ? $manager->get_image_supported_providers()
                : $manager->get_text_supported_providers();
        } catch ( \Throwable $e ) {
            unset( $e );
            return [];
        }
    }

    /**
     * Build the 5-element per-provider fieldgroup (group + api_info +
     * api_notice + api_key + model). Shared between the Lite text section and
     * the Pro image section (registered via `dokan_get_admin_settings_schema`)
     * so the dynamic per-provider shape stays in lock-step across both
     * plugins. Public for that cross-plugin reuse.
     *
     * @param array $cfg
     *
     * @return array
     */
    public static function ai_provider_group( array $cfg ): array {
        $pid          = $cfg['provider_id'];
        $provider     = $cfg['provider'];
        $toggle_deps  = $cfg['toggle_deps'] ?? [];
        $engine_deps  = $cfg['engine_deps'] ?? [];
        // Section-scoped prefix prevents id collisions when the same
        // provider id (e.g. "gemini") appears in both text and image
        // provider registries.
        $prefix       = isset( $cfg['id_prefix'] ) && '' !== $cfg['id_prefix']
            ? rtrim( (string) $cfg['id_prefix'], '_' ) . '_'
            : '';
        $group_id     = $prefix . $pid . '_api_info_group';

        // Build model options + default model id defensively — providers may
        // not implement get_models_by_type / get_default_model_id.
        $model_options = [];
        if ( method_exists( $provider, 'get_models_by_type' ) ) {
            $model_const = 'image' === ( $cfg['model_kind'] ?? '' )
                ? '\WeDevs\Dokan\Intelligence\Services\Model::SUPPORTS_IMAGE'
                : '\WeDevs\Dokan\Intelligence\Services\Model::SUPPORTS_TEXT';
            try {
                $models = $provider->get_models_by_type( constant( $model_const ) );
                foreach ( $models as $model_id => $model ) {
                    $model_options[] = [
						'title' => $model->get_title(),
						'value' => (string) $model_id,
					];
                }
            } catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $e );
            }
        }
        $default_model = method_exists( $provider, 'get_default_model_id' ) ? (string) $provider->get_default_model_id() : '';

        $api_key_url = method_exists( $provider, 'get_api_key_url' ) ? (string) $provider->get_api_key_url() : '';
        $image_url   = method_exists( $provider, 'get_image_url' ) ? (string) $provider->get_image_url() : '';

        // Children inherit the group's engine gate; only pin an extra toggle gate (Pro's image switch) when a caller supplies one — Lite text passes none.
        $api_info = [
            'id'             => $prefix . $pid . '_api_info',
            'type'           => 'field',
            'variant'        => 'base_field_label',
            'field_group_id' => $group_id,
            /* translators: %s: Provider title */
            'title'          => sprintf( esc_html__( '%s API', 'dokan-lite' ), $provider->get_title() ),
            'icon'           => 'CircleCheck',
            /* translators: %s: Provider title */
            'description'    => sprintf( esc_html__( 'Connect to your %s account with your website.', 'dokan-lite' ), $provider->get_title() ),
            'image_url'      => $image_url,
        ];
        $api_notice = [
            'id'             => $prefix . $pid . '_api_notice',
            'type'           => 'field',
            'variant'        => 'info',
            'field_group_id' => $group_id,
            /* translators: %s: Provider title */
            'title'          => sprintf( esc_html__( 'You can get your API Keys in your %s Account.', 'dokan-lite' ), $provider->get_title() ),
            /* translators: %s: Provider title */
            'link_text'      => sprintf( esc_html__( '%s Account', 'dokan-lite' ), $provider->get_title() ),
            'link_url'       => $api_key_url,
            'show_icon'      => true,
        ];
        $api_key = [
            'id'             => $prefix . $pid . '_api_key',
            'type'           => 'field',
            'variant'        => 'show_hide',
            'field_group_id' => $group_id,
            'title'          => esc_html__( 'API Key', 'dokan-lite' ),
            /* translators: %s: Provider title */
            'tooltip'        => sprintf( esc_html__( 'Enter your %s API key.', 'dokan-lite' ), $provider->get_title() ),
            /* translators: %s: Provider title */
            'placeholder'    => sprintf( esc_html__( 'Enter your %s API key', 'dokan-lite' ), $provider->get_title() ),
            'legacy_key'     => $cfg['api_key_legacy'],
        ];

        if ( ! empty( $toggle_deps ) ) {
            $api_info['dependencies']   = $toggle_deps;
            $api_notice['dependencies'] = $toggle_deps;
            $api_key['dependencies']    = $toggle_deps;
        }

        return [
            [
                'id'           => $group_id,
                'type'         => 'fieldgroup',
                'section_id'   => $cfg['section_id'],
                'dependencies' => $engine_deps,
            ],
            $api_info,
            $api_notice,
            $api_key,
            [
                'id'           => $prefix . $pid . '_model',
                'type'         => 'field',
                'variant'      => 'select',
                'section_id'   => $cfg['section_id'],
                'title'        => esc_html__( 'Model', 'dokan-lite' ),
                'description'  => esc_html__( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ),
                'default'      => $default_model,
                'options'      => $model_options,
                'legacy_key'   => $cfg['model_legacy'],
                'dependencies' => empty( $toggle_deps ) ? $engine_deps : array_merge( $toggle_deps, $engine_deps ),
            ],
        ];
    }

    /**
     * Moderation page schema (shell — Pro injects content).
     *
     * @return array
     */
    private static function moderation_page(): array {
        return [
            [
                'id'          => 'moderation',
                'type'        => 'page',
                'title'       => esc_html__( 'Moderation', 'dokan-lite' ),
                'description' => esc_html__( 'Configure moderation settings, return policies, and customer request management.', 'dokan-lite' ),
                'icon'        => 'Settings2',
                'priority'    => 900,
            ],

            // === SubPage: Captcha ===
            [
                'id'            => 'captcha',
                'type'          => 'subpage',
                'page_id'       => 'moderation',
                'title'         => esc_html__( 'Captcha', 'dokan-lite' ),
                'description'   => esc_html__( 'Add bot and spam protection to the forms across your store.', 'dokan-lite' ),
                'priority'      => 100,
                'doc_link'      => 'https://wedevs.com/docs/dokan/settings/dokan-recaptacha-v3-integration/',
                'doc_link_text' => esc_html__( 'Doc', 'dokan-lite' ),
            ],
            [
                'id'         => 'captcha_section',
                'type'       => 'section',
                'subpage_id' => 'captcha',
            ],
            [
                'id'            => 'captcha_enable_status',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'captcha_section',
                'title'         => esc_html__( 'Captcha Service', 'dokan-lite' ),
                'description'   => esc_html__( 'Activate captcha on every form that supports it.', 'dokan-lite' ),
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_appearance',
                    'field'  => 'captcha_enable_status',
                ],
            ],
            [
                'id'           => 'captcha_provider',
                'type'         => 'field',
                'variant'      => 'select',
                'section_id'   => 'captcha_section',
                'title'        => esc_html__( 'Captcha Provider', 'dokan-lite' ),
                'description'  => esc_html__( 'Select the captcha provider to use for this marketplace', 'dokan-lite' ),
                'default'      => 'google_recaptcha_v3',
                'options'      => [
                    [
						'title' => esc_html__( 'Google reCAPTCHA v3', 'dokan-lite' ),
						'value' => 'google_recaptcha_v3',
					],
                    [
						'title' => esc_html__( 'Cloudflare Turnstile', 'dokan-lite' ),
						'value' => 'cloudflare_turnstile',
					],
                ],
                'legacy_key'   => [
                    'option' => 'dokan_appearance',
                    'field'  => 'captcha_provider',
                ],
                'dependencies' => [
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_enable_status',
						'value' => 'off',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            // Provider header — display-only label (logo + title + description,
            // no toggle button). `default => 'on'` + legacy_key keep the legacy
            // `recaptcha_enable_status` flag enabled; credential fields render in
            // the group below.
            [
                'id'            => 'recaptcha_validation_label',
                'type'          => 'field',
                'variant'       => 'base_field_label',
                'section_id'    => 'captcha_section',
                'title'         => esc_html__( 'Google reCAPTCHA v3 Validation', 'dokan-lite' ),
                'description'   => sprintf(
                    /* translators: 1: opening anchor tag, 2: closing anchor tag */
                    esc_html__( 'Google reCAPTCHA v3 credentials are required to enable captcha for supported forms. %1$sGet Help%2$s', 'dokan-lite' ),
                    '<a href="https://wedevs.com/docs/dokan/settings/dokan-recaptacha-v3-integration/" target="_blank" rel="noopener noreferrer">',
                    '</a>'
                ),
                'image_url'     => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/social-onboarding/google.svg',
                'collapsed'     => false,
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_appearance',
                    'field'  => 'recaptcha_enable_status',
                ],
                'dependencies'  => [
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'google_recaptcha_v3',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'google_recaptcha_v3',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                ],
            ],
            // Group container for the card's credential fields. A dedicated
            // `fieldgroup` (not the switch field itself) so `field_group_id`
            // resolves to a real group element; the switch stays `type: field`
            // to keep its legacy_key bridging and single-option storage. Carries
            // the provider show/hide dependencies so credentials hide unless
            // reCAPTCHA v3 is the selected provider.
            [
                'id'           => 'recaptcha_credentials_group',
                'type'         => 'fieldgroup',
                'section_id'   => 'captcha_section',
                'dependencies' => [
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'google_recaptcha_v3',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'google_recaptcha_v3',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                ],
            ],
            [
                'id'             => 'recaptcha_admin_notice',
                'type'           => 'field',
                'variant'        => 'info',
                'field_group_id' => 'recaptcha_credentials_group',
                'show_icon'      => true,
                'title'          => esc_html__( 'You can get your Site Key and Secret Key from your reCAPTCHA admin console.', 'dokan-lite' ),
                'link_title'     => esc_html__( 'Admin Console', 'dokan-lite' ),
                'link_url'       => 'https://www.google.com/recaptcha/admin',
            ],
            [
                'id'             => 'recaptcha_site_key',
                'type'           => 'field',
                'variant'        => 'show_hide',
                'field_group_id' => 'recaptcha_credentials_group',
                'title'          => esc_html__( 'Site Key', 'dokan-lite' ),
                'placeholder'    => esc_html__( 'Site Key', 'dokan-lite' ),
                'tooltip'        => esc_html__( 'Insert Google reCAPTCHA v3 site key.', 'dokan-lite' ),
                'default'        => '',
                'legacy_key'     => [
                    'option' => 'dokan_appearance',
                    'field'  => 'recaptcha_site_key',
                ],
            ],
            [
                'id'             => 'recaptcha_secret_key',
                'type'           => 'field',
                'variant'        => 'show_hide',
                'field_group_id' => 'recaptcha_credentials_group',
                'title'          => esc_html__( 'Secret Key', 'dokan-lite' ),
                'placeholder'    => esc_html__( 'Secret Key', 'dokan-lite' ),
                'tooltip'        => esc_html__( 'Insert Google reCAPTCHA v3 secret key.', 'dokan-lite' ),
                'default'        => '',
                'legacy_key'     => [
                    'option' => 'dokan_appearance',
                    'field'  => 'recaptcha_secret_key',
                ],
            ],

            // Provider header — display-only label (no toggle button), shown when
            // Turnstile is the selected provider. `default => 'on'` + legacy_key keep
            // `turnstile_enable_status` enabled; credential fields render below.
            [
                'id'            => 'turnstile_validation_label',
                'type'          => 'field',
                'variant'       => 'base_field_label',
                'section_id'    => 'captcha_section',
                'title'         => esc_html__( 'Cloudflare Turnstile Validation', 'dokan-lite' ),
                'description'   => sprintf(
                    /* translators: 1: opening anchor tag, 2: closing anchor tag */
                    esc_html__( 'Cloudflare Turnstile credentials are required to enable captcha for supported forms. %1$sGet Help%2$s', 'dokan-lite' ),
                    '<a href="https://developers.cloudflare.com/turnstile/" target="_blank" rel="noopener noreferrer">',
                    '</a>'
                ),
                'image_url'     => DOKAN_PLUGIN_ASSEST . '/images/cloudflare.png',
                'collapsed'     => false,
                'default'       => 'on',
                'enable_state'  => [
					'label' => esc_html__( 'Enabled', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'legacy_key'    => [
                    'option' => 'dokan_appearance',
                    'field'  => 'turnstile_enable_status',
                ],
                'dependencies'  => [
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'cloudflare_turnstile',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'cloudflare_turnstile',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                ],
            ],
            // Group container for the card's credential fields. A dedicated
            // `fieldgroup` (not the switch field itself) so `field_group_id`
            // resolves to a real group element; the switch stays `type: field`
            // to keep its legacy_key bridging and single-option storage. Carries
            // the provider show/hide dependencies so credentials hide unless
            // Turnstile is the selected provider.
            [
                'id'           => 'turnstile_credentials_group',
                'type'         => 'fieldgroup',
                'section_id'   => 'captcha_section',
                'dependencies' => [
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_enable_status',
						'value' => 'on',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'cloudflare_turnstile',
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'captcha_provider',
						'value' => 'cloudflare_turnstile',
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                ],
            ],
            [
                'id'             => 'turnstile_admin_notice',
                'type'           => 'field',
                'variant'        => 'info',
                'field_group_id' => 'turnstile_credentials_group',
                'show_icon'      => true,
                'title'          => esc_html__( 'You can get your Site Key and Secret Key from your Cloudflare Turnstile dashboard.', 'dokan-lite' ),
                'link_title'     => esc_html__( 'Turnstile Dashboard', 'dokan-lite' ),
                'link_url'       => 'https://dash.cloudflare.com/?to=/:account/turnstile',
            ],
            [
                'id'             => 'turnstile_site_key',
                'type'           => 'field',
                'variant'        => 'show_hide',
                'field_group_id' => 'turnstile_credentials_group',
                'title'          => esc_html__( 'Site Key', 'dokan-lite' ),
                'placeholder'    => esc_html__( 'Site Key', 'dokan-lite' ),
                'tooltip'        => esc_html__( 'Insert Cloudflare Turnstile site key.', 'dokan-lite' ),
                'default'        => '',
                'legacy_key'     => [
                    'option' => 'dokan_appearance',
                    'field'  => 'turnstile_site_key',
                ],
            ],
            [
                'id'             => 'turnstile_secret_key',
                'type'           => 'field',
                'variant'        => 'show_hide',
                'field_group_id' => 'turnstile_credentials_group',
                'title'          => esc_html__( 'Secret Key', 'dokan-lite' ),
                'placeholder'    => esc_html__( 'Secret Key', 'dokan-lite' ),
                'tooltip'        => esc_html__( 'Insert Cloudflare Turnstile secret key.', 'dokan-lite' ),
                'default'        => '',
                'legacy_key'     => [
                    'option' => 'dokan_appearance',
                    'field'  => 'turnstile_secret_key',
                ],
            ],
        ];
    }

    /**
     * Product page schema (shell — Pro injects content).
     *
     * @return array
     */
    private static function product_page(): array {
        return [
            [
                'id'          => 'product',
                'type'        => 'page',
                'title'       => esc_html__( 'Product', 'dokan-lite' ),
                'description' => esc_html__( 'Configure product-related settings for your marketplace.', 'dokan-lite' ),
                'icon'        => 'Box',
                'priority'    => 200,
            ],
        ];
    }
}
