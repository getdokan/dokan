<?php

namespace WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages;

use WeDevs\Dokan\Vendor\SettingsApi\Abstracts\Page;

defined( 'ABSPATH' ) || exit;

class Store extends Page {

    /**
     * Group or page key.
     *
     * @var string $group Group or page key.
     */
    protected $group = 'store';

    /**
     * Render the settings page with tab, cad, fields.
     *
     * @since 3.7.10
     *
     * @param array $groups Settings Group or page to render.
     *
     * @return array
     */
    public function render_group( array $groups ): array {
        $groups[] = [
            'id'          => $this->group,
            'label'       => __( 'Store Settings', 'dokan-lite' ),
            'description' => __( 'Vendor Store Settings', 'dokan-lite' ),
            'parent_id'   => '',
            'sub_groups'  => apply_filters( 'dokan_vendor_settings_store_sub_groups', [] ),
        ];

        return $groups;
    }

    /**
     * Render the store settings page.
     *
     * @since 3.7.10
     */
    public function render_settings( array $settings ): array {
        $general_tab   = [];
        $general_tab[] = [
            'id'        => 'general',
            'title'     => __( 'General', 'dokan-lite' ),
            'desc'      => '',
            'icon'      => '',
            'info'      => [],
            'type'      => 'tab',
            'parent_id' => 'store',
        ];

        $branding_card   = [];
        $branding_card[] = [
            'id'        => 'branding',
            'title'     => __( 'Branding', 'dokan-lite' ),
            'desc'      => __( 'Set the overall appearance of your store by setting banner image, logo and more', 'dokan-lite' ),
            'info'      => [],
            'icon'      => 'dokan-icon-banner',
            'type'      => 'card',
            'parent_id' => 'store',
            'tab'       => 'general',
            'editable'  => false,
        ];
        $branding_card[] = [
            'id'        => 'banner',
            'title'     => __( 'Store Banner', 'dokan-lite' ),
            // translators: 1) store banner width, 2) store banner height.
            'desc'      => sprintf( __( 'Upload your store banner [ jpg or png, %d X %d pixels (max), 5 mb (max) ]', 'dokan-lite' ), dokan_get_option( 'store_banner_width', 'dokan_appearance', 625 ), dokan_get_option( 'store_banner_height', 'dokan_appearance', 300 ) ),
            'icon'      => '',
            'type'      => 'image',
            'parent_id' => 'store',
            'tab'       => 'general',
            'card'      => 'branding',
        ];
        $branding_card[] = [
            'id'        => 'gravatar',
            'title'     => __( 'Store Gravatar', 'dokan-lite' ),
            'desc'      => __( 'Upload your brand logo [ jpg or png, 150 X 150 pixels (max), 5mb (max) ]', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'image',
            'parent_id' => 'store',
            'tab'       => 'general',
            'card'      => 'branding',
        ];

        $branding_card = apply_filters( 'dokan_vendor_settings_api_branding_card', $branding_card );
        array_push( $general_tab, ...$branding_card );

        $business_info_card   = [];
        $business_info_card[] = [
            'id'        => 'business_info',
            'title'     => __( 'Business Info', 'dokan-lite' ),
            'desc'      => __( 'Provide your business details for store visitors', 'dokan-lite' ),
            'info'      => [
//                [
//                    'text' => __( 'Docs', 'dokan-lite' ),
//                    'url'  => '#',
//                    'icon' => 'dokan-icon-doc',
//                ],
//                [
//                    'text' => __( 'Video Guide', 'dokan-lite' ),
//                    'url'  => '#',
//                    'icon' => 'dokan-icon-video',
//                ],
            ],
            'icon'      => 'dokan-icon-inventory',
            'type'      => 'card',
            'parent_id' => 'store',
            'tab'       => 'general',
        ];
        $business_info_card[] = [
            'id'          => 'store_name',
            'title'       => __( 'Store Name', 'dokan-lite' ),
            'desc'        => '',
            'placeholder' => __( 'Insert Store Name', 'dokan-lite' ),
            'icon'        => '',
            'required'    => true,
            'type'        => 'text',
            'parent_id'   => 'store',
            'tab'         => 'general',
            'card'        => 'business_info',
        ];

        $business_info_card = apply_filters( 'dokan_vendor_settings_api_business_info_card', $business_info_card );
        array_push( $general_tab, ...$business_info_card );

        $general_tab = apply_filters( 'dokan_vendor_settings_api_general_tab', $general_tab );
        array_push( $settings, ...$general_tab );

        $store_details_tab   = [];
        $store_details_tab[] = [
            'id'        => 'store_details',
            'title'     => __( 'Store Setup', 'dokan-lite' ),
            'desc'      => '',
            'icon'      => '',
            'info'      => [],
            'type'      => 'tab',
            'parent_id' => 'store',
        ];

        $location_contact_card   = [];
        $location_contact_card[] = [
            'id'        => 'location_contact',
            'title'     => __( 'Store Address & Details', 'dokan-lite' ),
            'desc'      => __( 'Store locations, contact information and more', 'dokan-lite' ),
            'info'      => [
                [
                    'text' => __( 'Docs', 'dokan-lite' ),
                    'url'  => 'https://wedevs.com/docs/dokan/modules/dokan-vendor-vacation/',
                    'icon' => 'dokan-icon-doc',
                ],
            ],
            'icon'      => 'dokan-icon-location',
            'type'      => 'card',
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'editable'  => false,
        ];
        $location_contact_card[] = [
            'id'        => 'phone',
            'title'     => __( 'Phone', 'dokan-lite' ),
            'desc'      => __( 'Enter your store phone', 'dokan-lite' ),
            'icon'      => 'dokan-icon-phone',
            'type'      => 'text',
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'card'      => 'location_contact',
        ];
        $location_contact_card[] = [
            'id'        => 'address',
            'title'     => __( 'Address', 'dokan-lite' ),
            'desc'      => __( 'Provide your store locations to be displayed on the site.', 'dokan-lite' ),
            'icon'      => 'dokan-icon-location',
            'type'      => 'section',
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'card'      => 'location_contact',
            'editable'  => true,
            'fields'    => [
                [
                    'id'        => 'street_1',
                    'title'     => __( 'Street', 'dokan-lite' ),
                    'desc'      => __( 'Street address', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'address',
                ],
                [
                    'id'        => 'street_2',
                    'title'     => __( 'Street Line 2', 'dokan-lite' ),
                    'desc'      => __( 'Street address continued', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'address',
                ],
                [
                    'id'        => 'city',
                    'title'     => __( 'City', 'dokan-lite' ),
                    'desc'      => __( 'City name', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'address',
                ],
                [
                    'id'        => 'zip',
                    'title'     => __( 'Zip Code', 'dokan-lite' ),
                    'desc'      => __( 'Zip code', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'address',
                ],
                [
                    'id'        => 'country',
                    'title'     => __( 'Country', 'dokan-lite' ),
                    'desc'      => __( 'Select your country', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'select',
                    'options'   => [ '' => __( 'Select a country&hellip;', 'dokan-lite' ) ] + WC()->countries->get_allowed_countries(),
                    'parent_id' => 'address',
                ],
                [
                    'id'        => 'state',
                    'title'     => __( 'State', 'dokan-lite' ),
                    'desc'      => __( 'State or state code', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'select',
                    'options'   => [ '' => __( 'Select a state', 'dokan-lite' ) ] + WC()->countries->get_allowed_country_states(),
                    'parent_id' => 'address',
                ],
            ],
        ];
        $location_contact_card[] = [
            'id'        => 'location',
            'title'     => __( 'Store Location', 'dokan-lite' ),
            'desc'      => __( 'Store Location GPS coordinate.', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'text',
            'hidden'    => true,
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'card'      => 'location_contact',
        ];
        $location_contact_card[] = [
            'id'        => 'find_address',
            'title'     => __( 'Store Address', 'dokan-lite' ),
            'desc'      => __( 'Store Address', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'text',
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'card'      => 'location_contact',
        ];

        $location_contact_card = apply_filters( 'dokan_vendor_settings_api_location_contact_card', $location_contact_card );
        array_push( $store_details_tab, ...$location_contact_card );

        $store_weekly_timing_card   = [];
        $store_weekly_timing_card[] = [
            'id'        => 'store_weekly_timing',
            'title'     => __( 'Store Open Close Timing', 'dokan-lite' ),
            'desc'      => __( 'Set business operation hours ', 'dokan-lite' ),
            'info'      => [],
            'icon'      => 'dokan-icon-clock',
            'type'      => 'card',
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'editable'  => false,
        ];

        $store_weekly_timing_card[] = [
            'id'        => 'dokan_store_time_enabled',
            'title'     => __( 'Enable Store Time', 'dokan-lite' ),
            'desc'      => __( 'Show store opening closing time widget in store page', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'checkbox',
            'default'   => 'yes',
            'options'   => [
                'yes' => __( 'Yes', 'dokan-lite' ),
                'no'  => __( 'No', 'dokan-lite' ),
            ],
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'card'      => 'store_weekly_timing',
        ];

        $store_weekly_timing_card[] = [
            'id'        => 'dokan_store_time',
            'title'     => __( 'Store Operation Time', 'dokan-lite' ),
            'desc'      => __( 'Your store operation time', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'section',
            'parent_id' => 'store',
            'tab'       => 'store_details',
            'card'      => 'store_weekly_timing',
            'fields'    => [
                [
                    'id'        => 'monday',
                    'title'     => __( 'Monday', 'dokan-lite' ),
                    'desc'      => __( 'Monday Schedule', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'custom',
                    'parent_id' => 'dokan_store_time',
                ],
                [
                    'id'        => 'tuesday',
                    'title'     => __( 'Tuesday', 'dokan-lite' ),
                    'desc'      => __( 'Tuesday Schedule', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'custom',
                    'parent_id' => 'dokan_store_time',
                ],
                [
                    'id'        => 'wednesday',
                    'title'     => __( 'Wednesday', 'dokan-lite' ),
                    'desc'      => __( 'Wednesday Schedule', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'custom',
                    'parent_id' => 'dokan_store_time',
                ],
                [
                    'id'        => 'thursday',
                    'title'     => __( 'Thursday', 'dokan-lite' ),
                    'desc'      => __( 'Thursday Schedule', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'custom',
                    'parent_id' => 'dokan_store_time',
                ],
                [
                    'id'        => 'friday',
                    'title'     => __( 'Friday', 'dokan-lite' ),
                    'desc'      => __( 'Friday Schedule', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'custom',
                    'parent_id' => 'dokan_store_time',
                ],
                [
                    'id'        => 'saturday',
                    'title'     => __( 'Saturday', 'dokan-lite' ),
                    'desc'      => __( 'Saturday Schedule', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'custom',
                    'parent_id' => 'dokan_store_time',
                ],
                [
                    'id'        => 'sunday',
                    'title'     => __( 'Sunday', 'dokan-lite' ),
                    'desc'      => __( 'Sunday Schedule', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'custom',
                    'parent_id' => 'dokan_store_time',
                ],
            ],
        ];
        $store_weekly_timing_card[] = [
            'id'          => 'dokan_store_open_notice',
            'title'       => __( 'Store Open Notice', 'dokan-lite' ),
            'desc'        => __( 'Store open notice for store visitors', 'dokan-lite' ),
            'icon'        => '',
            'placeholder' => __( 'Store is open and taking orders', 'dokan-lite' ),
            'type'        => 'text',
            'parent_id'   => 'store',
            'tab'         => 'store_details',
            'card'        => 'store_weekly_timing',
        ];
        $store_weekly_timing_card[] = [
            'id'          => 'dokan_store_close_notice',
            'title'       => __( 'Store Close Notice', 'dokan-lite' ),
            'desc'        => __( 'Store close notice for store visitors', 'dokan-lite' ),
            'placeholder' => __( 'Store closed. Please contact for emergencies only', 'dokan-lite' ),
            'icon'        => '',
            'type'        => 'text',
            'parent_id'   => 'store',
            'tab'         => 'store_details',
            'card'        => 'store_weekly_timing',
        ];

        $store_weekly_timing_card = apply_filters( 'dokan_vendor_settings_api_store_weekly_timing_card', $store_weekly_timing_card );
        array_push( $store_details_tab, ...$store_weekly_timing_card );

        $store_details_tab = apply_filters( 'dokan_vendor_settings_api_store_details_tab', $store_details_tab );
        array_push( $settings, ...$store_details_tab );

        $advanced_tab   = [];
        $advanced_tab[] = [
            'id'        => 'advanced',
            'title'     => __( 'Advanced', 'dokan-lite' ),
            'desc'      => '',
            'icon'      => '',
            'info'      => [],
            'type'      => 'tab',
            'parent_id' => 'store',
        ];

        $product_display_card   = [];
        $product_display_card[] = [
            'id'        => 'product_display',
            'title'     => __( 'Product Display Settings', 'dokan-lite' ),
            'desc'      => __( 'Configure which product sections you want to display in your store page', 'dokan-lite' ),
            'info'      => [
                [
                    'text' => __( 'Docs', 'dokan-lite' ),
                    'url'  => 'https://wedevs.com/docs/dokan/tutorials/how-to-create-product-sections-in-single-store-page/',
                    'icon' => 'dokan-icon-doc',
                ],
            ],
            'icon'      => 'dokan-icon-products',
            'type'      => 'card',
            'parent_id' => 'store',
            'tab'       => 'advanced',
            'editable'  => false,
        ];

        $fields              = [];
        $customizer_settings = dokan_get_option( 'product_sections', 'dokan_appearance' );

        if ( isset( $customizer_settings['featured'] ) && 'off' === $customizer_settings['featured'] ) {
            $fields[] = [
                'id'        => 'featured',
                'title'     => __( 'Show featured products section', 'dokan-lite' ),
                'desc'      => __( 'Allow your Featured Products section to be displayed in your single store page', 'dokan-lite' ),
                'icon'      => '',
                'type'      => 'checkbox',
                'default'   => 'yes',
                'options'   => [
                    'yes' => __( 'Yes', 'dokan-lite' ),
                    'no'  => __( 'No', 'dokan-lite' ),
                ],
                'parent_id' => 'product_sections',
            ];
        }

        if ( isset( $customizer_settings['latest'] ) && 'off' === $customizer_settings['latest'] ) {
            $fields[] = [
                'id'        => 'latest',
                'title'     => __( 'Show latest products section', 'dokan-lite' ),
                'desc'      => __( 'Allow your Latest Products section to be displayed in your single store page', 'dokan-lite' ),
                'icon'      => '',
                'type'      => 'checkbox',
                'default'   => 'yes',
                'options'   => [
                    'yes' => __( 'Yes', 'dokan-lite' ),
                    'no'  => __( 'No', 'dokan-lite' ),
                ],
                'parent_id' => 'product_sections',
            ];
        }

        if ( isset( $customizer_settings['best_selling'] ) && 'off' === $customizer_settings['best_selling'] ) {
            $fields[] = [
                'id'        => 'best_selling',
                'title'     => __( 'Show best selling products section', 'dokan-lite' ),
                'desc'      => __( 'Allow your Best Selling Products section to be displayed in your single store page', 'dokan-lite' ),
                'icon'      => '',
                'type'      => 'checkbox',
                'default'   => 'yes',
                'options'   => [
                    'yes' => __( 'Yes', 'dokan-lite' ),
                    'no'  => __( 'No', 'dokan-lite' ),
                ],
                'parent_id' => 'product_sections',
            ];
        }

        if ( isset( $customizer_settings['top_rated'] ) && 'off' === $customizer_settings['top_rated'] ) {
            $fields[] = [
                'id'        => 'top_rated',
                'title'     => __( 'Show top rated products section', 'dokan-lite' ),
                'desc'      => __( 'Allow your Top Rated Products section to be displayed in your single store page', 'dokan-lite' ),
                'icon'      => '',
                'type'      => 'checkbox',
                'default'   => 'yes',
                'options'   => [
                    'yes' => __( 'Yes', 'dokan-lite' ),
                    'no'  => __( 'No', 'dokan-lite' ),
                ],
                'parent_id' => 'product_sections',
            ];
        }

        $fields                 = apply_filters( 'dokan_vendor_settings_api_product_section_fields', $fields );
        $product_display_card[] = [
            'id'        => 'product_section',
            'title'     => '',
            'desc'      => '',
            'info'      => [],
            'icon'      => '',
            'type'      => 'section',
            'parent_id' => 'store',
            'tab'       => 'advance',
            'card'      => 'product_display',
            'fields'    => $fields,
        ];

        $product_display_card[] = [
            'id'        => 'show_more_ptab',
            'title'     => __( 'Add "More Product" tab on Single Store page', 'dokan-lite' ),
            'desc'      => __( 'Add "More Product" tab to display additional items in your store page', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'checkbox',
            'default'   => 'yes',
            'options'   => [
                'yes' => __( 'Yes', 'dokan-lite' ),
                'no'  => __( 'No', 'dokan-lite' ),
            ],
            'parent_id' => 'store',
            'tab'       => 'advanced',
            'card'      => 'product_display',
        ];
        $product_display_card[] = [
            'id'        => 'show_email',
            'title'     => __( 'Show Email', 'dokan-lite' ),
            'desc'      => __( 'Do you want to display the store email publicly?', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'checkbox',
            'default'   => 'no',
            'options'   => [
                'yes' => __( 'Yes', 'dokan-lite' ),
                'no'  => __( 'No', 'dokan-lite' ),
            ],
            'parent_id' => 'store',
            'tab'       => 'advanced',
            'card'      => 'product_display',
        ];
        $product_display_card[] = [
            'id'        => 'store_ppp',
            'title'     => __( 'Number of products displayed per page', 'dokan-lite' ),
            'desc'      => __( 'Number of products that will be shown by default in your store page', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'number',
            'default'   => 20,
            'parent_id' => 'store',
            'tab'       => 'advanced',
            'card'      => 'product_display',
        ];
        $product_display_card   = apply_filters( 'dokan_vendor_settings_api_product_display_card', $product_display_card );
        array_push( $advanced_tab, ...$product_display_card );

        $terms_and_conditions_card   = [];
        $terms_and_conditions_card[] = [
            'id'        => 'terms_and_conditions',
            'title'     => __( 'Terms and Conditions', 'dokan-lite' ),
            'desc'      => __( 'Define the rules of your store page by providing a detailed break down of the Terms and Conditions ', 'dokan-lite' ),
            'info'      => [],
            'icon'      => 'dokan-icon-policy',
            'type'      => 'card',
            'parent_id' => 'store',
            'tab'       => 'advanced',
            'editable'  => false,
        ];
        $terms_and_conditions_card[] = [
            'id'        => 'enable_tnc',
            'title'     => __( 'Display Terms & Condition', 'dokan-lite' ),
            'desc'      => __( 'Enable Store Terms & Condition', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'checkbox',
            'default'   => 'yes',
            'options'   => [
                'on'  => __( 'On', 'dokan-lite' ),
                'off' => __( 'Off', 'dokan-lite' ),
            ],
            'parent_id' => 'store',
            'tab'       => 'advanced',
            'card'      => 'terms_and_conditions',
        ];
        $terms_and_conditions_card[] = [
            'id'          => 'dokan_tnc_text',
            'title'       => __( 'Terms & Condition', 'dokan-lite' ),
            'desc'        => __( 'Store Terms & Condition', 'dokan-lite' ),
            'placeholder' => __( 'Insert your store Terms & Conditions', 'dokan-lite' ),
            'icon'        => '',
            'type'        => 'textarea',
            'default'     => '',
            'parent_id'   => 'store',
            'tab'         => 'advanced',
            'card'        => 'terms_and_conditions',
            'editing'     => true,
        ];

        $terms_and_conditions_card = apply_filters( 'dokan_vendor_settings_api_terms_and_conditions_card', $terms_and_conditions_card );
        array_push( $advanced_tab, ...$terms_and_conditions_card );

        $advanced_tab = apply_filters( 'dokan_vendor_settings_api_advanced_tab', $advanced_tab );
        array_push( $settings, ...$advanced_tab );

        return $settings;
    }
}
