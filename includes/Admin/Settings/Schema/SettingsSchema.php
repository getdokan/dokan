<?php

namespace WeDevs\Dokan\Admin\Settings\Schema;

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
     * General page schema.
     *
     * @return array
     */
    private static function general_page(): array {
        $pages_array = self::get_page_options();

        return [
            // Page
            [
                'id'          => 'general',
                'type'        => 'page',
                'title'       => esc_html__( 'General', 'dokan-lite' ),
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
                'id'              => 'vendor_store_url',
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
                'id'          => 'dashboard',
                'type'        => 'field',
                'variant'     => 'select',
                'section_id'  => 'dashboard_section',
                'title'       => esc_html__( 'Dashboard', 'dokan-lite' ),
                'description' => esc_html__( 'Select a page to show vendor dashboard.', 'dokan-lite' ),
                'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
                'options'     => $pages_array,
            ],
            [
                'id'         => 'my_orders_section',
                'type'       => 'section',
                'subpage_id' => 'dokan_pages',
            ],
            [
                'id'          => 'my_orders',
                'type'        => 'field',
                'variant'     => 'select',
                'section_id'  => 'my_orders_section',
                'title'       => esc_html__( 'My Orders', 'dokan-lite' ),
                'description' => esc_html__( 'Select a page to show my orders', 'dokan-lite' ),
                'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
                'options'     => $pages_array,
            ],
            [
                'id'         => 'store_listing_section',
                'type'       => 'section',
                'subpage_id' => 'dokan_pages',
            ],
            [
                'id'          => 'store_listing',
                'type'        => 'field',
                'variant'     => 'select',
                'section_id'  => 'store_listing_section',
                'title'       => esc_html__( 'Store Listing', 'dokan-lite' ),
                'description' => esc_html__( 'Select a page to show all stores', 'dokan-lite' ),
                'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
                'options'     => $pages_array,
            ],
            [
                'id'         => 'reg_tc_page_section',
                'type'       => 'section',
                'subpage_id' => 'dokan_pages',
            ],
            [
                'id'          => 'reg_tc_page',
                'type'        => 'field',
                'variant'     => 'select',
                'section_id'  => 'reg_tc_page_section',
                'title'       => esc_html__( 'Terms and Conditions Page', 'dokan-lite' ),
                'description' => esc_html__( 'Select where you want to add Dokan pages.', 'dokan-lite' ),
                'placeholder' => esc_html__( 'Select page', 'dokan-lite' ),
                'tooltip'     => esc_html__( 'Select a page to display the Terms and Conditions of your store for Vendors.', 'dokan-lite' ),
                'options'     => $pages_array,
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
                'id'           => 'google_map_api_key',
                'type'         => 'fieldgroup',
                'section_id'   => 'map_api_configuration',
                'dependencies' => [
                    [
						'key' => 'location.map_api_configuration.map_api_source',
						'value' => 'google_maps',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '==',
					],
                    [
						'key' => 'location.map_api_configuration.map_api_source',
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
                'field_group_id' => 'google_map_api_key',
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
                'field_group_id' => 'google_map_api_key',
                'placeholder'    => esc_html__( 'Enter your Google Maps API key', 'dokan-lite' ),
            ],
            [
                'id'           => 'mapbox_api_key',
                'type'         => 'fieldgroup',
                'section_id'   => 'map_api_configuration',
                'dependencies' => [
                    [
						'key' => 'location.map_api_configuration.map_api_source',
						'value' => 'mapbox',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '==',
					],
                    [
						'key' => 'location.map_api_configuration.map_api_source',
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
                'field_group_id' => 'mapbox_api_key',
                'title'          => esc_html__( 'Mapbox API Key', 'dokan-lite' ),
                'description'    => esc_html__( 'Enter your Mapbox API key to enable map functionality.', 'dokan-lite' ),
            ],
            [
                'id'             => 'mapbox_api_key',
                'type'           => 'field',
                'variant'        => 'show_hide',
                'field_group_id' => 'mapbox_api_key',
                'placeholder'    => esc_html__( 'Enter your Mapbox API key', 'dokan-lite' ),
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
                'icon'        => 'FileSpreadsheet',
                'priority'    => 100,
            ],
            [
                'id'         => 'fees',
                'type'       => 'section',
                'subpage_id' => 'fees',
            ],
            [
                'id'          => 'shipping_fee',
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
            ],
            [
                'id'          => 'product_tax_fee',
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
            ],
            [
                'id'          => 'shipping_tax_fee',
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
                'title'            => esc_html__( 'Admin Commission', 'dokan-lite' ),
                'description'      => esc_html__( 'Amount you will get from sales in both percentage and fixed fee', 'dokan-lite' ),
                'admin_percentage' => $default_settings['admin_percentage'],
                'additional_fee'   => $default_settings['additional_fee'],
                'dependencies'     => [
                    [
						'key' => 'commission.commission.commission_type',
						'value' => 'fixed',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'commission.commission.commission_type',
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
            ],
            [
                'id'            => 'reset_sub_category_when_edit_all_category',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'commission',
                'title'         => esc_html__( 'Apply Parent Category Commission to All Subcategories', 'dokan-lite' ),
                'description'   => esc_html__( "Important: 'All Categories' commission serves as your marketplace's default rate and cannot be empty. If 0 is given in value, then the marketplace will deduct no commission from vendors", 'dokan-lite' ),
                'tooltip'       => esc_html__( "When enabled, changing a parent category's commission rate will automatically update all its subcategories. Disable this option to maintain independent commission rates for subcategories", 'dokan-lite' ),
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
						'key' => 'commission.commission.commission_type',
						'value' => 'category_based',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'commission.commission.commission_type',
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
                'type'         => 'field',
                'variant'      => 'category_based_commission',
                'section_id'   => 'commission',
                'title'        => esc_html__( 'Admin Commission', 'dokan-lite' ),
                'description'  => esc_html__( 'Amount you will get from each sale', 'dokan-lite' ),
                'dependencies' => [
                    [
						'key' => 'commission.commission.commission_type',
						'value' => 'category_based',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                    [
						'key' => 'commission.commission.commission_type',
						'value' => 'category_based',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'commission.commission.reset_sub_category_when_edit_all_category',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'custom',
						'effect' => 'custom',
						'comparison' => '===',
					],
                    [
						'key' => 'commission.commission.reset_sub_category_when_edit_all_category',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'custom',
						'effect' => 'custom',
						'comparison' => '===',
					],
                ],
                'validations'  => [
                    [ 'not_empty' => esc_html__( 'Both percentage and fixed fee is required.', 'dokan-lite' ) ],
                ],
            ],

            // === SubPage: Withdraw ===
            [
                'id'          => 'withdraw_charge',
                'type'        => 'subpage',
                'page_id'     => 'transaction',
                'title'       => esc_html__( 'Withdraw', 'dokan-lite' ),
                'description' => esc_html__( 'Set up available withdrawal methods and transaction conditions for vendors.', 'dokan-lite' ),
                'icon'        => 'FileSpreadsheet',
                'priority'    => 300,
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
						'key' => 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal.paypal_withdraw',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal.paypal_withdraw',
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
						'key' => 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw',
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
            ],

            // COD Payments
            [
                'id'         => 'cod_payments_section',
                'type'       => 'section',
                'subpage_id' => 'withdraw_charge',
            ],
            [
                'id'          => 'cod_payments',
                'type'        => 'field',
                'variant'     => 'radio_capsule',
                'section_id'  => 'cod_payments_section',
                'title'       => esc_html__( 'COD Payments', 'dokan-lite' ),
                'description' => esc_html__( 'If an order is paid with Cash on Delivery (COD), then exclude that payment from vendor balance.', 'dokan-lite' ),
                'default'     => 'include',
                'options'     => [
                    [
						'title' => esc_html__( 'Include', 'dokan-lite' ),
						'value' => 'include',
					],
                    [
						'title' => esc_html__( 'Exclude', 'dokan-lite' ),
						'value' => 'exclude',
					],
                ],
            ],

            // === SubPage: Reverse Withdrawal ===
            [
                'id'          => 'reverse_withdrawal',
                'type'        => 'subpage',
                'page_id'     => 'transaction',
                'title'       => esc_html__( 'Reverse Withdrawal', 'dokan-lite' ),
                'description' => esc_html__( 'Set up commission collection from vendors on Cash on Delivery orders. Control when and how to charge money from vendor accounts when they owe you.', 'dokan-lite' ),
                'priority'    => 400,
                'doc_link'    => 'https://wedevs.com/docs/dokan/withdraw/dokan-reverse-withdrawal/',
            ],
            [
                'id'         => 'reverse_withdrawal_section',
                'type'       => 'section',
                'subpage_id' => 'reverse_withdrawal',
            ],
            [
                'id'            => 'enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'reverse_withdrawal_section',
                'title'         => esc_html__( 'Activate Reverse Withdrawal (Cash On Delivery)', 'dokan-lite' ),
                'description'   => esc_html__( 'Enable this option to activate automatic balance deducting from vendors.', 'dokan-lite' ),
                'default'       => 'off',
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
                'id'          => 'billing_type',
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
                'id'           => 'reverse_balance_threshold',
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
						'key' => 'reverse_withdrawal.reverse_withdrawal_section.billing_type',
						'value' => 'by_amount',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'reverse_withdrawal.reverse_withdrawal_section.billing_type',
						'value' => 'by_month',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'           => 'monthly_billing_day',
                'type'         => 'field',
                'variant'      => 'number',
                'section_id'   => 'reverse_withdrawal_section',
                'title'        => esc_html__( 'Monthly Billing Date', 'dokan-lite' ),
                'description'  => esc_html__( 'Enter the day of month when you want to send reverse withdrawal balance invoices to vendors.', 'dokan-lite' ),
                'addon_icon'   => true,
                'prefix'       => 'Calendar',
                'default'      => 1,
                'min_value'    => 1,
                'max_value'    => 28,
                'dependencies' => [
                    [
						'key' => 'reverse_withdrawal.reverse_withdrawal_section.billing_type',
						'value' => 'by_month',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'reverse_withdrawal.reverse_withdrawal_section.billing_type',
						'value' => 'by_amount',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'          => 'due_period',
                'type'        => 'field',
                'variant'     => 'number',
                'section_id'  => 'reverse_withdrawal_section',
                'title'       => esc_html__( 'Grace Period', 'dokan-lite' ),
                'description' => esc_html__( 'Number of days to wait before enforcing collection actions. Set to 0 for immediate action.', 'dokan-lite' ),
                'addon_icon'  => true,
                'prefix'      => 'Calendar',
                'postfix'     => esc_html__( 'Days', 'dokan-lite' ),
                'default'     => 7,
                'min_value'   => 0,
                'max_value'   => 28,
                'step'        => 1,
            ],
            [
                'id'          => 'failed_actions',
                'type'        => 'field',
                'variant'     => 'multicheck',
                'section_id'  => 'reverse_withdrawal_section',
                'title'       => esc_html__( 'Penalty Actions After Grace Period', 'dokan-lite' ),
                'description' => esc_html__( 'Choose actions to take when the grace period expires and payment remains outstanding.', 'dokan-lite' ),
                'default'     => [ 'enable_catalog_mode' ],
                'options'     => [
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
            ],
            [
                'id'            => 'display_notice',
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
                'id'            => 'enable_selling',
                'type'          => 'field',
                'variant'       => 'radio_capsule',
                'subpage_id'    => 'vendor_onboarding',
                'title'         => esc_html__( 'Enable Selling', 'dokan-lite' ),
                'description'   => esc_html__( 'Immediately enable selling for newly registered vendors.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'If checked, vendors will have permission to sell immediately after registration.', 'dokan-lite' ),
                'default'       => 'automatically',
            ],
            [
                'id'            => 'address_fields',
                'type'          => 'field',
                'variant'       => 'switch',
                'subpage_id'    => 'vendor_onboarding',
                'title'         => esc_html__( 'Address Fields', 'dokan-lite' ),
                'description'   => esc_html__( 'Add Address Fields on the Vendor Registration form.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'Add Address Fields on the Vendor Registration form.', 'dokan-lite' ),
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
                'id'            => 'one_page_creation',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'vendor_capabilities',
                'title'         => esc_html__( 'One Page Product Creation', 'dokan-lite' ),
                'description'   => esc_html__( 'Add new product in single page view.', 'dokan-lite' ),
                'tooltip'       => esc_html__( 'If disabled, instead of a single add product page it will open a pop up window or vendor will redirect to product page when adding new product.', 'dokan-lite' ),
                'default'       => 'off',
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
                'id'            => 'product_popup',
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
						'key' => 'vendor_capabilities.vendor_capabilities.one_page_creation',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '!==',
					],
                    [
						'key' => 'vendor_capabilities.vendor_capabilities.one_page_creation',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'            => 'order_status_change',
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
                'id'            => 'select_any_category',
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
                'title'       => esc_html__( 'Store Page', 'dokan-lite' ),
                'priority'    => 100,
            ],

            // Products Per Page
            [
                'id'         => 'products_page',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'          => 'store_product_per_page',
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
            ],

            // Google reCAPTCHA
            [
                'id'         => 'google_recaptcha',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'         => 'google_recaptcha_settings',
                'type'       => 'fieldgroup',
                'section_id' => 'google_recaptcha',
            ],
            [
                'id'             => 'recaptcha',
                'type'           => 'field',
                'variant'        => 'switch',
                'field_group_id' => 'google_recaptcha_settings',
                'title'          => esc_html__( 'Google reCaptcha Validation', 'dokan-lite' ),
                'description'    => sprintf(
                    /* translators: %s: Help link */
                    __( 'Connect to enable spam protection that works automatically in the background <a href="%s" target="_blank" rel="noopener noreferrer">Get Help</a>', 'dokan-lite' ),
                    'https://developers.google.com/recaptcha/docs/v3'
                ),
                'default'        => 'off',
                'image_url'      => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/social-onboarding/google.svg',
                'enable_state'   => [
					'label' => esc_html__( 'Enable', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state'  => [
					'label' => esc_html__( 'Disable', 'dokan-lite' ),
					'value' => 'off',
				],
            ],
            [
                'id'             => 'recaptcha_info',
                'type'           => 'field',
                'variant'        => 'info',
                'field_group_id' => 'google_recaptcha_settings',
                'title'          => esc_html__( 'Need Help?', 'dokan-lite' ),
                'description'    => sprintf(
                    /* translators: %s: Google reCaptcha URL */
                    __( "If you don't have a Google reCaptcha account, <a href=\"%s\" target=\"_blank\" rel=\"noopener noreferrer\">+ Create Google reCaptcha</a>", 'dokan-lite' ),
                    'https://www.google.com/recaptcha/admin/create'
                ),
                'dependencies'   => [
                    [
						'key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'             => 'recaptcha_site_key',
                'type'           => 'field',
                'variant'        => 'show_hide',
                'field_group_id' => 'google_recaptcha_settings',
                'title'          => esc_html__( 'Site Key', 'dokan-lite' ),
                'placeholder'    => esc_html__( 'Site Key', 'dokan-lite' ),
                'tooltip'        => esc_html__( 'Insert Google reCAPTCHA v3 site key.', 'dokan-lite' ),
                'dependencies'   => [
                    [
						'key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],
            [
                'id'             => 'recaptcha_secret_key',
                'type'           => 'field',
                'variant'        => 'show_hide',
                'field_group_id' => 'google_recaptcha_settings',
                'title'          => esc_html__( 'Secret Key', 'dokan-lite' ),
                'placeholder'    => esc_html__( 'Secret Key', 'dokan-lite' ),
                'tooltip'        => esc_html__( 'Insert Google reCAPTCHA v3 secret key.', 'dokan-lite' ),
                'dependencies'   => [
                    [
						'key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '===',
					],
                ],
            ],

            // Contact Form
            [
                'id'         => 'store_contact_form_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'store_clossing_time_widget',
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
            ],

            // Store Template
            [
                'id'         => 'store_template',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'                => 'store_template',
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
            ],

            // Store Time Widget
            [
                'id'         => 'store_time_widget_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'store_time_widget',
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
            ],

            // Store Sidebar
            [
                'id'         => 'store_sidebar_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'store_opening_time',
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
            ],

            // Vendor Info Visibility
            [
                'id'         => 'vendor_info_visibility_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'          => 'vendor_info_visibility',
                'type'        => 'field',
                'variant'     => 'vendor_info_preview',
                'section_id'  => 'vendor_info_visibility_section',
                'title'       => esc_html__( 'Vendor Info Visibility', 'dokan-lite' ),
                'description' => esc_html__( 'Choose what vendor details to show customers in single store page.', 'dokan-lite' ),
            ],

            // Dokan Font
            [
                'id'         => 'dokan_font_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'            => 'dokan_font',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'dokan_font_section',
                'title'         => esc_html__( 'Dokan font-awesome Functionality', 'dokan-lite' ),
                'description'   => esc_html__( "If disabled then Dokan font-awesome library won't be loaded in frontend.", 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
					'label' => esc_html__( 'Enable', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state' => [
					'label' => esc_html__( 'Disable', 'dokan-lite' ),
					'value' => 'off',
				],
            ],

            // Single Product Preview
            [
                'id'         => 'single_product_preview_section',
                'type'       => 'section',
                'subpage_id' => 'store',
            ],
            [
                'id'          => 'single_product_preview',
                'type'        => 'field',
                'variant'     => 'single_product_preview',
                'section_id'  => 'single_product_preview_section',
                'title'       => esc_html__( 'Single Product Page Appearance', 'dokan-lite' ),
                'description' => esc_html__( 'Choose which sections to show when customers view individual products.', 'dokan-lite' ),
            ],
        ];
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
                'id'            => 'privacy_policy_display',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'privacy_settings',
                'title'         => esc_html__( 'Privacy Policy', 'dokan-lite' ),
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
                'id'         => 'privacy_policy_page',
                'type'       => 'field',
                'variant'    => 'select',
                'section_id' => 'privacy_settings',
                'title'      => esc_html__( 'Privacy Policy Page', 'dokan-lite' ),
                'options'    => self::get_page_options(),
            ],
            [
                'id'         => 'privacy_policy_content',
                'type'       => 'section',
                'subpage_id' => 'privacy',
            ],
            [
                'id'         => 'privacy_policy_content',
                'type'       => 'field',
                'variant'    => 'rich_text',
                'section_id' => 'privacy_policy_content',
                'title'      => esc_html__( 'Privacy Policy Content', 'dokan-lite' ),
            ],
            [
                'id'         => 'admin_access_section',
                'type'       => 'section',
                'subpage_id' => 'privacy',
            ],
            [
                'id'            => 'admin_access',
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
            ],
            [
                'id'              => 'data_clear_on_uninstall',
                'type'            => 'field',
                'variant'         => 'switch',
                'section_id'      => 'data_clear_section',
                'title'           => esc_html__( 'Clear Data on Uninstall', 'dokan-lite' ),
                'description'     => esc_html__( 'Remove all Dokan data when the plugin is uninstalled.', 'dokan-lite' ),
                'default'         => 'off',
                'switcher_type'   => 'error',
                'should_confirm'  => true,
                'enable_state'    => [
					'label' => esc_html__( 'Clear Data', 'dokan-lite' ),
					'value' => 'on',
				],
                'disable_state'   => [
					'label' => esc_html__( 'Disabled', 'dokan-lite' ),
					'value' => 'off',
				],
                'confirm_modal'   => [
                    'title'             => esc_html__( 'Are you sure to delete all data?', 'dokan-lite' ),
                    'confirmationTitle' => esc_html__( 'Are you sure to delete all data?', 'dokan-lite' ),
                    'description'       => esc_html__( 'All data and tables related to Dokan and Dokan Pro will be deleted permanently. This action cannot be undone.', 'dokan-lite' ),
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
     * Note: Provider-specific fields (API key, model select per provider) are
     * generated dynamically based on registered AI providers via the Intelligence module.
     * The static fields (toggle + engine select) are defined here.
     *
     * @return array
     */
    private static function ai_assist_page(): array {
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
            [
                'id'         => 'product_image_section',
                'type'       => 'section',
                'subpage_id' => 'product_generation',
            ],
            [
                'id'            => 'product_info_generate',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'product_image_section',
                'title'         => esc_html__( 'Product Info Generate', 'dokan-lite' ),
                'description'   => esc_html__( 'Let vendors generate product info by AI.', 'dokan-lite' ),
                'default'       => 'off',
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
                'id'           => 'product_info_engine',
                'type'         => 'field',
                'variant'      => 'select',
                'section_id'   => 'product_image_section',
                'title'        => esc_html__( 'Engine', 'dokan-lite' ),
                'description'  => esc_html__( 'Select which AI provider to use for generating content.', 'dokan-lite' ),
                'default'      => 'openai',
                'options'      => [], // Populated dynamically from registered AI providers
                'dependencies' => [
                    [
						'key' => 'product_generation.product_image_section.product_info_generate',
						'value' => 'on',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'show',
						'comparison' => '===',
					],
                    [
						'key' => 'product_generation.product_image_section.product_info_generate',
						'value' => 'off',
						'to_self' => true,
						'attribute' => 'display',
						'effect' => 'hide',
						'comparison' => '!==',
					],
                ],
            ],
            // Note: Per-provider FieldGroups ({provider}_api_info_group) with api_info, api_notice,
            // api_key, and model fields are generated dynamically by the Intelligence module
            // and appended via the dokan_get_admin_settings_schema filter.
        ];

        // Generate provider-specific fields dynamically
        if ( class_exists( '\WeDevs\Dokan\Intelligence\Manager' ) ) {
            try {
                $text_providers = dokan()->get_container()->get( \WeDevs\Dokan\Intelligence\Manager::class )->get_text_supported_providers();

                // Add provider options to engine select
                $options = [];
                foreach ( $text_providers as $provider_id => $provider ) {
                    $options[] = [
						'title' => $provider->get_title(),
						'value' => $provider_id,
					];
                }
                // Update the engine select options
                foreach ( $elements as &$el ) {
                    if ( isset( $el['id'] ) && $el['id'] === 'product_info_engine' ) {
                        $el['options'] = $options;
                        break;
                    }
                }
                unset( $el );

                // Add per-provider field groups
                foreach ( $text_providers as $provider_id => $provider ) {
                    $dep_generate = 'product_generation.product_image_section.product_info_generate';
                    $dep_engine   = 'product_generation.product_image_section.product_info_engine';

                    $elements[] = [
                        'id'           => $provider_id . '_api_info_group',
                        'type'         => 'fieldgroup',
                        'section_id'   => 'product_image_section',
                        'dependencies' => [
                            [
								'key' => $dep_engine,
								'value' => $provider_id,
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'show',
								'comparison' => '===',
							],
                            [
								'key' => $dep_engine,
								'value' => $provider_id,
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'hide',
								'comparison' => '!==',
							],
                        ],
                    ];
                    $elements[] = [
                        'id'             => $provider_id . '_api_info',
                        'type'           => 'field',
                        'variant'        => 'base_field_label',
                        'field_group_id' => $provider_id . '_api_info_group',
                        'title'          => sprintf(
                            /* translators: %s: Provider title */
                            esc_html__( '%s API', 'dokan-lite' ),
                            $provider->get_title()
                        ),
                        'image_url'      => $provider->get_image_url(),
                        'dependencies'   => [
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'show',
								'comparison' => '===',
							],
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'hide',
								'comparison' => '!==',
							],
                        ],
                    ];
                    $elements[] = [
                        'id'             => $provider_id . '_api_notice',
                        'type'           => 'field',
                        'variant'        => 'info',
                        'field_group_id' => $provider_id . '_api_info_group',
                        'title'          => sprintf(
                            /* translators: %s: Provider title */
                            esc_html__( 'You can get your API Keys in your %s Account.', 'dokan-lite' ),
                            $provider->get_title()
                        ),
                        'link_text'      => sprintf(
                            /* translators: %s: Provider title */
                            esc_html__( '%s Account', 'dokan-lite' ),
                            $provider->get_title()
                        ),
                        'link_url'       => $provider->get_api_key_url(),
                        'dependencies'   => [
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'show',
								'comparison' => '===',
							],
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'hide',
								'comparison' => '!==',
							],
                        ],
                    ];
                    $elements[] = [
                        'id'             => $provider_id . '_api_key',
                        'type'           => 'field',
                        'variant'        => 'show_hide',
                        'field_group_id' => $provider_id . '_api_info_group',
                        'title'          => esc_html__( 'API Key', 'dokan-lite' ),
                        'placeholder'    => sprintf(
                            /* translators: %s: Provider title */
                            esc_html__( 'Enter your %s API key', 'dokan-lite' ),
                            $provider->get_title()
                        ),
                        'dependencies'   => [
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'show',
								'comparison' => '===',
							],
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'hide',
								'comparison' => '!==',
							],
                        ],
                    ];

                    // Model select with dynamic options
                    $model_options = [];
                    $models = $provider->get_models_by_type( \WeDevs\Dokan\Intelligence\Services\Model::SUPPORTS_TEXT );
                    foreach ( $models as $model_id => $model ) {
                        $model_options[] = [
							'title' => $model->get_title(),
							'value' => $model_id,
						];
                    }

                    $elements[] = [
                        'id'             => $provider_id . '_model',
                        'type'           => 'field',
                        'variant'        => 'select',
                        'field_group_id' => $provider_id . '_api_info_group',
                        'title'          => esc_html__( 'Model', 'dokan-lite' ),
                        'description'    => esc_html__( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ),
                        'default'        => $provider->get_default_model_id(),
                        'options'        => $model_options,
                        'dependencies'   => [
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'show',
								'comparison' => '===',
							],
                            [
								'key' => $dep_generate,
								'value' => 'on',
								'to_self' => true,
								'attribute' => 'display',
								'effect' => 'hide',
								'comparison' => '!==',
							],
                        ],
                    ];
                }
            } catch ( \Exception $e ) {
                // Intelligence module not available, skip dynamic fields
            }
        }

        return $elements;
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
