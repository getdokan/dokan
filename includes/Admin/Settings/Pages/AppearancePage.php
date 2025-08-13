<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\Elements\SubPage;

class AppearancePage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'appearance';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 150;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_appearance';

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
        $appearance_page = $this
            ->set_title( esc_html__( 'Appearance', 'dokan-lite' ) )
            ->set_icon( 'PanelsRightBottom' )
            ->set_description( esc_html__( 'Configure dashboard menu settings, visibility, and customization options.', 'dokan-lite' ) );

        // Create dashboard menu manager subpage
        $store_page = ElementFactory::sub_page( 'store' )
            ->set_title( esc_html__( 'Store Page', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 'dokan-lite' ) );

        // Create a single section for all vendor capabilities
        $store_section = ElementFactory::sub_section( 'store_page_section' );

        // Add the section to the page
        $store_section->add(
            ElementFactory::field( 'store_radio', 'radio' )
                ->set_description( esc_html__( 'Select the radio for your vendor dashboard.', 'dokan-lite' ) )
        );

        // Add the section to the store page.
        $store_page->add( $store_section );
        $appearance_page->add( $store_page );
    }
}
