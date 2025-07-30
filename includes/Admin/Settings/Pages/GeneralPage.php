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
                ->set_description( __( 'Configure the pages for your marketplace.', 'dokan-lite' ) );

		foreach ( $pages as $page_id => $page ) {
			$dokan_page->add(
				$page
			);
		}

        $this
            ->set_title( __( 'General', 'dokan-lite' ) )
            ->set_description( __( 'Configure the general settings for your marketplace.', 'dokan-lite' ) )
            ->add(
                ElementFactory::sub_page( 'marketplace' )
                ->set_title( __( 'Marketplace', 'dokan-lite' ) )
                ->set_description( __( 'Configure core marketplace functionalities and customer shopping experience.', 'dokan-lite' ) )
                ->add(
                    ElementFactory::section( 'info' )
                    ->set_title( __( 'Info', 'dokan-lite' ) )
                    ->set_description( __( 'Configure the info for your marketplace.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::field( 'test_info', 'info' )
                        ->set_title( __( 'Info', 'dokan-lite' ) )
                        ->set_description( __( 'Configure the info for your marketplace.', 'dokan-lite' ) )
                    )
                    ->add(
                        ElementFactory::field( 'double_text', 'double_text' )
                            ->set_label( __( 'Double Text Field Example', 'dokan-lite' ) )
                            ->set_first_value( 'Example First Value' )
                            ->set_second_value( 'Example Second Value' )
                    )
                )
            )
            ->add(
                $dokan_page
            )
		    ->add(
                ElementFactory::sub_page( 'location' )
                ->set_title( __( 'Location', 'dokan-lite' ) )
                ->set_description( __( 'Configure the location for your marketplace.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::section( 'location_display' )
                                      ->set_title( __( 'Location Display', 'dokan-lite' ) )
                                      ->set_description( __( 'Configure how location information is displayed in your marketplace.', 'dokan-lite' ) )
                                      ->add(
                                          ElementFactory::field( 'location_display_mode', 'customize_radio' )
                                                        ->set_title( __( 'Location Display Mode', 'dokan-lite' ) )
                                                        ->set_description( __( 'Choose how location information should be displayed to customers.', 'dokan-lite' ) )
                                                        ->add_enhanced_option(
                                                            __( 'Map View', 'dokan-lite' ),
                                                            'map',
                                                            __( 'Display locations using interactive maps', 'dokan-lite' )
                                                        )
                                                        ->add_enhanced_option(
                                                            __( 'List View', 'dokan-lite' ),
                                                            'list',
                                                            __( 'Display locations as a simple list', 'dokan-lite' )
                                                        )
                                                        ->set_default( 'map' )
                                      )
                                      ->add(
                                          ElementFactory::field( 'location_template_style', 'customize_radio' )
                                                        ->set_title( __( 'Location Template Style', 'dokan-lite' ) )
                                                        ->set_description( __( 'Select the template style for location pages.', 'dokan-lite' ) )
                                                        ->add_enhanced_option(
                                                            __( 'Classic Template', 'dokan-lite' ),
                                                            'classic',
                                                            __( 'Traditional layout with standard styling', 'dokan-lite' ),
                                                            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/><rect x="7" y="8" width="10" height="2" stroke="currentColor" stroke-width="2"/><rect x="7" y="12" width="6" height="2" stroke="currentColor" stroke-width="2"/></svg>',
                                                            'http://dokan-dev.test/wp-content/uploads/2025/07/Group-1000006638.png',
                                                            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>'
                                                        )
                                                        ->add_enhanced_option(
                                                            __( 'Modern Template', 'dokan-lite' ),
                                                            'modern',
                                                            __( 'Contemporary design with enhanced features', 'dokan-lite' ),
                                                            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>'
                                                        )
                                                        ->add_enhanced_option(
                                                            __( 'Minimal Template', 'dokan-lite' ),
                                                            'minimal',
                                                            __( 'Clean and simple design approach', 'dokan-lite' ),
                                                            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="6" width="14" height="12" rx="1" stroke="currentColor" stroke-width="2"/><path d="M9 10h6M9 14h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
                                                        )
                                                        ->set_default( 'modern' )
                                                        ->set_variant( 'card' )
                                      )
                    )
            );
    }
}
