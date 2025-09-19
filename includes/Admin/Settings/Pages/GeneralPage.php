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
            ->set_title( esc_html__( 'Page Setup', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Link your WordPress pages to essential Dokan marketplace functions and features.', 'dokan-lite' ) );

		foreach ( $pages as $page_id => $page ) {
            // Create a section for each page
            $page_section = ElementFactory::section( $page_id . '_section' )
                                            ->add( $page );

            $dokan_page->add( $page_section );
		}

        $this
            ->set_title( esc_html__( 'General', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure the general settings for your marketplace.', 'dokan-lite' ) )
            ->add(
                ElementFactory::sub_page( 'marketplace' )
                ->set_title( esc_html__( 'Marketplace', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Configure core marketplace functionalities and customer shopping experience.', 'dokan-lite' ) )
                    ->set_doc_link(
                        esc_url( 'https://wedevs.com/docs/dokan/developers/marketplace/' )
                    )
                    ->add(
                        ElementFactory::section( 'marketplace_settings' )
                            ->add(
                                ElementFactory::field( 'vendor_store_url', 'text' )
                                    ->set_title( esc_html__( 'Vendor Store URL', 'dokan-lite' ) )
                                    ->set_description(
                                        sprintf(
                                            // translators: %s: Site URL.
                                            esc_html__( 'Define the vendor store URL (%s/[this-text]/[vendor-name])', 'dokan-lite' ),
                                            get_site_url()
                                        )
                                    )
                                    ->set_placeholder( esc_html__( 'Store', 'dokan-lite' ) )
                                    ->set_default( 'store' )
                            )
                    )
            )
            ->add( $dokan_page )
            ->add(
                ElementFactory::sub_page( 'location' )
                    ->set_title( esc_html__( 'Location', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Configure how map locations are displayed throughout your marketplace.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::section( 'map_api_configuration' )
                            ->set_title( esc_html__( 'Map API Configuration', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Configure the map API settings for your marketplace.', 'dokan-lite' ) )
                            ->add(
                                ElementFactory::field( 'map_api_source', 'radio_capsule' )
                                    ->set_title( esc_html__( 'Map API Source', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Which map API source you want to use in your site?', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Google Maps', 'dokan-lite' ), 'google' )
                                    ->add_option( esc_html__( 'Mapbox', 'dokan-lite' ), 'mapbox' )
                                    ->set_default( 'google' )
                            )
                            ->add(
                                ElementFactory::field_group( 'google_map_api_key' )
                                    ->add(
                                        ElementFactory::field( 'google_map_base', 'base_field_label' )
                                            ->set_title( esc_html__( 'Google Map API Key', 'dokan-lite' ) )
                                            ->set_description( esc_html__( 'Enter your Google Maps API key to enable map functionality.', 'dokan-lite' ) )
                                    )
                                    ->add(
                                        ElementFactory::field( 'google_map_api_key', 'show_hide' )
                                            ->set_placeholder( esc_html__( 'Enter your Google Maps API key', 'dokan-lite' ) )
                                    )
                                    ->add_dependency( 'location.map_api_configuration.map_api_source', 'google', true, 'display', 'show', '==' )
                                    ->add_dependency( 'location.map_api_configuration.map_api_source', 'mapbox', true, 'display', 'hide', '==' )
                            )
                            ->add(
                                ElementFactory::field_group( 'mapbox_api_key' )
                                    ->add(
                                        ElementFactory::field( 'mapbox_map_base', 'base_field_label' )
                                            ->set_title( esc_html__( 'Mapbox API Key', 'dokan-lite' ) )
                                            ->set_description( esc_html__( 'Enter your Mapbox API key to enable map functionality.', 'dokan-lite' ) )
                                    )
                                    ->add(
                                        ElementFactory::field( 'mapbox_api_key', 'show_hide' )
                                            ->set_placeholder( esc_html__( 'Enter your Mapbox API key', 'dokan-lite' ) )
                                    )
                                    ->add_dependency( 'location.map_api_configuration.map_api_source', 'mapbox', true, 'display', 'show', '==' )
                                    ->add_dependency( 'location.map_api_configuration.map_api_source', 'google', true, 'display', 'hide', '==' )
                            )
                    )
            );
    }
}
