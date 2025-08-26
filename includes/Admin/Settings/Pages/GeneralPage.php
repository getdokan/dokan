<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings;
use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\ElementTransformer;

class GeneralPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'general';
    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 100;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_general';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() {}

    /**
     * Get the page scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page scripts.
     */
    public function scripts(): array {
        return [];
    }

    /**
     * Get the page styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page styles.
     */
    public function styles(): array {
        return [];
    }

    /**
     * Pass the settings options to frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings options.
     */
    public function settings(): array {
        return [];
    }

    /**
     * Describe the settings options
     *
     * @return void
     */
    public function describe_settings(): void {
        $transformer = new ElementTransformer();
        $legacy_settings = dokan_get_container()->get( Settings::class );
        $transformer->set_settings(
            [
				'sections' => $legacy_settings->get_settings_sections(),
				'fields'    => $legacy_settings->get_settings_fields(),
			]
        );

        $pages = $transformer->transform( 'dokan_pages' );

		$dokan_page = ElementFactory::sub_page( 'dokan_pages' )
                ->set_title( __( 'Pages', 'dokan-lite' ) )
            ->set_description( __( 'Link your WordPress pages to essential Dokan marketplace functions and features.', 'dokan-lite' ) );

		foreach ( $pages as $page_id => $page ) {
            // Create a section for each page
            $page_section = ElementFactory::section( $page_id . '_section' )
                                            ->add( $page );

            $dokan_page->add( $page_section );
		}

        $this
            ->set_title( __( 'General', 'dokan-lite' ) )
            ->set_description( __( 'Configure the general settings for your marketplace.', 'dokan-lite' ) )
            ->add(
                ElementFactory::sub_page( 'marketplace' )
                ->set_title( __( 'Marketplace', 'dokan-lite' ) )
                ->set_description( __( 'Configure core marketplace functionalities and customer shopping experience.', 'dokan-lite' ) )
                    ->set_doc_link(
                        esc_url( 'https://wedevs.com/docs/dokan/developers/marketplace/' )
                    )
                    ->add(
                        ElementFactory::section( 'marketplace_settings' )
                                        ->add(
                                            ElementFactory::field( 'vendor_store_url', 'text' )
                                                        ->set_title( __( 'Vendor Store URL', 'dokan-lite' ) )
                                                        ->set_description( __( 'Define the vendor store URL (http://dokan-pro-with-licence.local/[this-text]/[vendor-name])', 'dokan-lite' ) )
                                                        ->set_placeholder( __( 'Store', 'dokan-lite' ) )
                                                        ->set_default( 'store' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'enable_single_seller_mode', 'switch' )
                                                        ->set_title( __( 'Enable Single Seller Mode', 'dokan-lite' ) )
                                                        ->set_description( __( 'Restrict customers from purchasing products from multiple vendors in a single order.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'on' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'store_category_mode', 'radio_capsule' )
                                                        ->set_title( __( 'Store Category', 'dokan-lite' ) )
                                                        ->set_description( __( 'Configure how store categories are handled in your marketplace.', 'dokan-lite' ) )
                                                        ->add_option(
                                                            __( 'None', 'dokan-lite' ), 'none'
                                                        )
                                                        ->add_option(
                                                            __( 'Single', 'dokan-lite' ), 'single'
                                                        )
                                                        ->add_option(
                                                            __( 'Multiple', 'dokan-lite' ), 'multiple'
                                                        )
                                                        ->set_default( 'single' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'show_customer_details_to_vendors', 'switch' )
                                                        ->set_title( __( 'Show Customer Details to Vendors', 'dokan-lite' ) )
                                                        ->set_description( __( 'Allow vendors to view customer shipping and contact information for orders.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'on' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'guest_product_enquiry', 'switch' )
                                                        ->set_title( __( 'Guest Product Enquiry', 'dokan-lite' ) )
                                                        ->set_description( __( 'Guest customers can submit product enquiries without logging in.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'on' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'add_to_cart_button_visibility', 'switch' )
                                                        ->set_title( __( 'Add to Cart Button Visibility', 'dokan-lite' ) )
                                                        ->set_description( __( 'Control \'Add to Cart\' button visibility based on your marketplace model.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'on' )
                                        )
                    )
                    ->add(
                        ElementFactory::section( 'live_search' )
                                        ->add(
                                            ElementFactory::field( 'live_search_base', 'base_field_label' )
                                                        ->set_title( esc_html__( 'Live Search Base', 'dokan-lite' ) )
                                                        ->set_description( esc_html__( 'Choose how search results should be displayed to users', 'dokan-lite' ) )
                                                        ->set_helper_text( esc_html__( 'This URL will be used as the base for all live search queries.', 'dokan-lite' ) )
                                                        ->set_doc_link(
                                                            esc_url( 'https://wedevs.com/docs/dokan/developers/live-search/' )
                                                        )
                                        )
                                        ->add(
                                            ElementFactory::field( 'search_box_radio', 'customize_radio' )
                                                        ->add_enhanced_option(
                                                            [
                                                                'title'       => __( 'Classic Search', 'dokan-lite' ),
                                                                'value'       => 'classic',
                                                                'description' => __( 'Traditional search box with basic functionality', 'dokan-lite' ),
                                                                'image' => DOKAN_PLUGIN_ASSEST . '/images/admin/classic-search.png',
                                                                'preview'     => true,
                                                            ]
                                                        )
                                                        ->add_enhanced_option(
                                                            [
                                                                'title'       => __( 'Enhanced Search', 'dokan-lite' ),
                                                                'value'       => 'enhanced',
                                                                'description' => __( 'Advanced search with additional features', 'dokan-lite' ),
                                                                'image' => DOKAN_PLUGIN_ASSEST . '/images/admin/enhanced-search.png',
                                                                'preview'     => true,
                                                            ]
                                                        )
                                                        ->set_default( 'enhanced' )
                                                        ->set_variant( 'card' )
                                        )
                    )
            )
            ->add( $dokan_page )
            ->add(
                ElementFactory::sub_page( 'location' )
                    ->set_title( __( 'Location', 'dokan-lite' ) )
                    ->set_description( __( 'Configure how map locations are displayed throughout your marketplace.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::section( 'map_api_configuration' )
                                        ->set_title( __( 'Map API Configuration', 'dokan-lite' ) )
                                        ->set_description( __( 'Configure the map API settings for your marketplace.', 'dokan-lite' ) )
                                        ->add(
                                            ElementFactory::field( 'map_api_source', 'radio_capsule' )
                                                        ->set_title( __( 'Map API Source', 'dokan-lite' ) )
                                                        ->set_description( __( 'Which map API source you want to use in your site?', 'dokan-lite' ) )
                                                        ->add_option( __( 'Google Maps', 'dokan-lite' ), 'google' )
                                                        ->add_option( __( 'Mapbox', 'dokan-lite' ), 'mapbox' )
                                                        ->set_default( 'google' )
                                        )
                                        ->add(
                                            ElementFactory::field_group( 'google_map_api_key' )
                                                        ->add(
                                                            ElementFactory::field( 'google_map_base', 'base_field_label' )
                                                                            ->set_title( __( 'Google Map API Key', 'dokan-lite' ) )
                                                                            ->set_description( __( 'Enter your Google Maps API key to enable map functionality.', 'dokan-lite' ) )
                                                        )
                                                        ->add(
                                                            ElementFactory::field( 'google_map_api_key', 'show_hide' )
                                                                            ->set_placeholder( __( 'Enter your Google Maps API key', 'dokan-lite' ) )
                                                        )
                                                        ->add_dependency( 'location.map_api_configuration.map_api_source', 'google', true, 'display', 'show', '==' )
                                                        ->add_dependency( 'location.map_api_configuration.map_api_source', 'mapbox', true, 'display', 'hide', '==' )
                                        )
                            ->add(
                                ElementFactory::field_group( 'mapbox_api_key' )
                                                ->add(
                                                    ElementFactory::field( 'mapbox_map_base', 'base_field_label' )
                                                                ->set_title( __( 'Mapbox API Key', 'dokan-lite' ) )
                                                                ->set_description( __( 'Enter your Mapbox API key to enable map functionality.', 'dokan-lite' ) )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'mapbox_api_key', 'show_hide' )
                                                                ->set_placeholder( __( 'Enter your Mapbox API key', 'dokan-lite' ) )
                                                )
                                                ->add_dependency( 'location.map_api_configuration.map_api_source', 'mapbox', true, 'display', 'show', '==' )
                                                ->add_dependency( 'location.map_api_configuration.map_api_source', 'google', true, 'display', 'hide', '==' )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'map_display_settings' )
                                        ->set_title( __( 'Map Display', 'dokan-lite' ) )
                                        ->set_description( __( 'Control the visibility of location maps site-wide.', 'dokan-lite' ) )
                                        ->add(
                                            ElementFactory::field( 'location_map_position', 'radio_capsule' )
                                                        ->set_title( __( 'Location Map Position', 'dokan-lite' ) )
                                                        ->add_option( __( 'Top', 'dokan-lite' ), 'top' )
                                                        ->add_option( __( 'Left', 'dokan-lite' ), 'left' )
                                                        ->add_option( __( 'Right', 'dokan-lite' ), 'right' )
                                                        ->set_default( 'top' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'show_filters_before_map', 'switch' )
                                                        ->set_title( __( 'Show Filters Before Location Map', 'dokan-lite' ) )
                                                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                            ->set_default( 'on' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'radius_search_unit', 'radio_capsule' )
                                                        ->set_title( __( 'Radius Search Unit', 'dokan-lite' ) )
                                                        ->add_option( __( 'Kilometers', 'dokan-lite' ), 'km' )
                                                        ->add_option( __( 'Miles', 'dokan-lite' ), 'miles' )
                                                        ->set_default( 'km' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'radius_search_min_distance', 'number' )
                                                        ->set_title( __( 'Radius Search - Minimum Distance', 'dokan-lite' ) )
                                                        ->set_description( __( 'Set minimum distance for radius search.', 'dokan-lite' ) )
                                                        ->set_default( 1 )
                                                ->set_postfix( 'km' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'radius_search_max_distance', 'number' )
                                                        ->set_title( __( 'Radius Search - Maximum Distance', 'dokan-lite' ) )
                                                        ->set_description( __( 'Set maximum distance for radius search.', 'dokan-lite' ) )
                                                        ->set_default( 100 )
                                                ->set_postfix( 'km' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'map_zoom_level', 'number' )
                                                        ->set_title( __( 'Map Zoom Level', 'dokan-lite' ) )
                                                        ->set_description( __( 'To zoom in, increase the number. To zoom out, decrease the number.', 'dokan-lite' ) )
                                                        ->set_default( 11 )
                                        )
                    )
                    ->add(
                        ElementFactory::section( 'map_placement' )
                            ->add(
                                ElementFactory::field( 'map_placement_locations', 'multicheck' )
                                                        ->set_title( __( 'Map Placement Locations', 'dokan-lite' ) )
                                                ->set_description( __( 'Choose where the store location map appears', 'dokan-lite' ) )
                                                ->set_helper_text( __( 'Select the pages where you want to display the store location map.', 'dokan-lite' ) )
                                                        ->add_option( 'store_listing', __( 'Store Listing', 'dokan-lite' ) )
                                                        ->add_option( 'shop_page', __( 'Shop Page', 'dokan-lite' ) )
                                                        ->add_option( 'single_product_location_tab', __( 'Location tab in single product page.', 'dokan-lite' ) )
                                                        ->set_default( [ 'store_listing', 'shop_page' ] )
                            )
                    )
            );
    }
}
