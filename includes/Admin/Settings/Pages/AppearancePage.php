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
    protected $id = 'menu_manager';

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
    protected $storage_key = 'dokan_menu_manager';

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
        // Create dashboard menu manager subpage
        $dashboard_menu_page = ElementFactory::sub_page( 'dashboard_menu_manager' )
            ->set_title( esc_html__( 'Dashboard Menu Manager', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Reorder, Rename, Activate, and Deactivate menus for your vendor dashboard.', 'dokan-lite' ) );

        // Create a single section for all vendor capabilities
        $dashboard_menu_section = ElementFactory::sub_section( 'dokan_manager_section' );

        // Add the section to the page
        $dashboard_menu_section->add(
            ElementFactory::field( 'dashboard_menu_manager', 'menu_manager' )
        );

        // Add the section to the dashboard menu page
        $dashboard_menu_page->add( $dashboard_menu_section );

        // Set up the main page
        $this
            ->set_title( esc_html__( 'Appearance', 'dokan-lite' ) )
            ->set_icon( 'appearance' )
            ->set_description( esc_html__( 'Configure dashboard menu settings, visibility, and customization options.', 'dokan-lite' ) );
//            ->add( $dashboard_menu_page );
        // Allow dokan-pro modules to add additional sub-pages
        $additional_sub_pages = apply_filters( 'dokan_appearance_page_sub_pages', [] );

        if ( ! empty( $additional_sub_pages ) && is_array( $additional_sub_pages ) ) {
            foreach ( $additional_sub_pages as $sub_page ) {
                if ( $sub_page instanceof SubPage ) {
                    $this->add( $sub_page );
                }
            }
        }
    }
}
