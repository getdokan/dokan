<?php

namespace WeDevs\Dokan\Admin\Settings\Bridge\Pages;

use WeDevs\Dokan\Admin\Settings\Bridge\AbstractPage;
use WeDevs\Dokan\Admin\Settings\Bridge\ElementFactory;

/**
 * General Settings Page (Migrated to use plugin-settings package)
 *
 * This demonstrates how to migrate existing Dokan settings pages
 * to use the plugin-settings package.
 *
 * @since DOKAN_SINCE
 */
class GeneralPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected string $id = 'general';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 100;

    /**
     * Storage key for the page.
     *
     * @var string
     */
    protected string $storage_key = 'dokan_settings_general';

    /**
     * Register the page scripts and styles.
     *
     * @return void
     */
    public function register(): void {
        // Register any page-specific scripts/styles here.
    }

    /**
     * Get the page scripts.
     *
     * @return array
     */
    public function scripts(): array {
        return [];
    }

    /**
     * Get the page styles.
     *
     * @return array
     */
    public function styles(): array {
        return [];
    }

    /**
     * Get settings options for frontend.
     *
     * @return array
     */
    public function settings(): array {
        return [];
    }

    /**
     * Describe the settings structure.
     *
     * This method defines all the settings fields, sections, and their configuration.
     *
     * @return void
     */
    public function describe_settings(): void {
        $this
            ->set_title( esc_html__( 'General', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure the general settings for your marketplace.', 'dokan-lite' ) )
            ->add( $this->marketplace_subpage() )
            ->add( $this->pages_subpage() )
            ->add( $this->location_subpage() );
    }

    /**
     * Create the Marketplace subpage.
     *
     * @return \WeDevs\PluginSettings\Elements\SubPage
     */
    protected function marketplace_subpage() {
        return ElementFactory::sub_page( 'marketplace' )
            ->set_title( esc_html__( 'Marketplace', 'dokan-lite' ) )
            ->set_priority( 100 )
            ->set_description( esc_html__( 'Configure core marketplace functionalities and customer shopping experience.', 'dokan-lite' ) )
            ->set_doc_link( esc_url( 'https://wedevs.com/docs/dokan/developers/marketplace/' ) )
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
                    ->add(
                        ElementFactory::field( 'seller_enable_terms_and_conditions', 'switch' )
                            ->set_title( esc_html__( 'Enable Terms & Conditions', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Enable terms and conditions for vendors during registration.', 'dokan-lite' ) )
                            ->set_default( 'off' )
                    )
                    ->add(
                        ElementFactory::field( 'enable_vendor_contact_form', 'switch' )
                            ->set_title( esc_html__( 'Show Contact Form on Vendor Page', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Display a contact form on vendor store pages.', 'dokan-lite' ) )
                            ->set_default( 'on' )
                    )
            );
    }

    /**
     * Create the Pages subpage.
     *
     * @return \WeDevs\PluginSettings\Elements\SubPage
     */
    protected function pages_subpage() {
        // Get WordPress pages for the select options.
        $pages = $this->get_pages_options();

        return ElementFactory::sub_page( 'dokan_pages' )
            ->set_title( esc_html__( 'Page Setup', 'dokan-lite' ) )
            ->set_priority( 200 )
            ->set_description( esc_html__( 'Link your WordPress pages to essential Dokan marketplace functions and features.', 'dokan-lite' ) )
            ->add(
                ElementFactory::section( 'page_settings' )
                    ->add(
                        ElementFactory::field( 'dashboard', 'select' )
                            ->set_title( esc_html__( 'Vendor Dashboard', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Select the page to use as the vendor dashboard.', 'dokan-lite' ) )
                            ->set_options( $pages )
                    )
                    ->add(
                        ElementFactory::field( 'my_orders', 'select' )
                            ->set_title( esc_html__( 'My Orders', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Select the page to display customer orders.', 'dokan-lite' ) )
                            ->set_options( $pages )
                    )
                    ->add(
                        ElementFactory::field( 'store_listing', 'select' )
                            ->set_title( esc_html__( 'Store Listing', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Select the page to list all vendor stores.', 'dokan-lite' ) )
                            ->set_options( $pages )
                    )
            );
    }

    /**
     * Create the Location subpage.
     *
     * @return \WeDevs\PluginSettings\Elements\SubPage
     */
    protected function location_subpage() {
        return ElementFactory::sub_page( 'location' )
            ->set_title( esc_html__( 'Location', 'dokan-lite' ) )
            ->set_priority( 300 )
            ->set_description( esc_html__( 'Configure how map locations are displayed throughout your marketplace.', 'dokan-lite' ) )
            ->add(
                ElementFactory::section( 'map_api_configuration' )
                    ->set_title( esc_html__( 'Map API Configuration', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Configure the map API settings for your marketplace.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::field( 'map_api_source', 'select' )
                            ->set_title( esc_html__( 'Map API Source', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Which map API source you want to use in your site?', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'Google Maps', 'dokan-lite' ), 'google' )
                            ->add_option( esc_html__( 'Mapbox', 'dokan-lite' ), 'mapbox' )
                            ->set_default( 'google' )
                    )
                    ->add(
                        ElementFactory::field( 'google_map_api_key', 'password' )
                            ->set_title( esc_html__( 'Google Map API Key', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Enter your Google Maps API key to enable map functionality.', 'dokan-lite' ) )
                            ->set_placeholder( esc_html__( 'Enter your Google Maps API key', 'dokan-lite' ) )
                            ->add_dependency( 'location.map_api_configuration.map_api_source', 'google', true, 'display', 'show', '==' )
                    )
                    ->add(
                        ElementFactory::field( 'mapbox_api_key', 'password' )
                            ->set_title( esc_html__( 'Mapbox API Key', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Enter your Mapbox API key to enable map functionality.', 'dokan-lite' ) )
                            ->set_placeholder( esc_html__( 'Enter your Mapbox API key', 'dokan-lite' ) )
                            ->add_dependency( 'location.map_api_configuration.map_api_source', 'mapbox', true, 'display', 'show', '==' )
                    )
            );
    }

    /**
     * Get pages options for select fields.
     *
     * @return array
     */
    protected function get_pages_options(): array {
        $pages = get_pages();
        $options = [];

        foreach ( $pages as $page ) {
            $options[] = [
                'title' => $page->post_title,
                'value' => $page->ID,
            ];
        }

        return $options;
    }
}

