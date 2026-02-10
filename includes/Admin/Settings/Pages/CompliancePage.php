<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings;

class CompliancePage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'compliance';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 1000;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_compliance';

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
     * @throws \Exception
     * @return void
     */
    public function describe_settings(): void {
        $legacy_settings = dokan_get_container()->get( Settings::class );
        $pages_array = $legacy_settings->get_post_type( 'page' );
        $options = [];
        foreach ( $pages_array as $key => $label ) {
            $options[] = [
                'title' => $label,
                'value' => $key,
            ];
        }
        // Create Privacy subpage
        $privacy_page = ElementFactory::sub_page( 'privacy' )
            ->set_priority( 100 )
            ->set_title( esc_html__( 'Privacy', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure privacy policy settings and content for vendor stores.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/compliance/privacy/' );

        // Create Privacy settings section
        $privacy_section = ElementFactory::section( 'privacy_settings' )
            ->set_title( esc_html__( 'Privacy Settings', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure privacy policy display and content settings.', 'dokan-lite' ) );

        // Add Privacy Policy Display toggle
        $privacy_section->add(
            ElementFactory::field( 'privacy_policy_display', 'switch' )
                ->set_title( esc_html__( 'Privacy Policy Display', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Show privacy policy link on vendor store contact forms.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
        );

        // Add Privacy Policy Page dropdown
        $privacy_section->add(
            ElementFactory::field( 'privacy_policy_page', 'select' )
                ->set_title( esc_html__( 'Privacy Policy Page', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Choose which page displays your privacy policy', 'dokan-lite' ) )
                ->set_placeholder( esc_html__( 'Select a page', 'dokan-lite' ) )
                ->set_options( $options )
        );

        // Create Privacy Policy Content section
        $privacy_content_section = ElementFactory::section( 'privacy_policy_content' )
            ->set_title( esc_html__( 'Privacy Policy Content', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Create or edit your privacy policy text that will be displayed to users', 'dokan-lite' ) );

        // Create Admin Area Access section.
        $admin_access_section = ElementFactory::section( 'admin_access_section' );

        // Create data clear section.
        $data_clear_section = ElementFactory::section( 'data_clear_section' );

        // Add Privacy Policy Content rich text editor
        $privacy_content_section->add(
            ElementFactory::field( 'privacy_policy_content', 'rich_text' )
                ->set_title( esc_html__( 'Privacy Policy Content', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Create or edit your privacy policy text that will be displayed to users', 'dokan-lite' ) )
                ->set_placeholder( esc_html__( 'Enter your privacy policy content here...', 'dokan-lite' ) )
        );

        $admin_access_section->add(
            ElementFactory::field( 'admin_access', 'switch' )
                ->set_title( esc_html__( 'Admin Area Access', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Prevent vendors from accessing the wp-admin dashboard area. If HPOS feature is enabled, admin access will be blocked regardless of this setting.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
        );

        $data_clear_section->add(
            ElementFactory::field( 'data_clear_on_uninstall', 'switch' )
                ->set_title( esc_html__( 'Data Clear', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Permanently delete all data and database tables related to Dokan and Dokan Pro plugins. This action cannot be undone.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Clear Data', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'off' )
                ->set_switcher_type( 'error' )
                ->set_should_confirm( true )
                ->set_confirm_modal(
                    array(
                        'title'             => esc_html__( 'Are you sure to delete all data?', 'dokan-lite' ),
                        'confirmationTitle' => esc_html__( 'Are you sure to delete all data?', 'dokan-lite' ),
                        'description'       => esc_html__( 'All data and tables related to Dokan and Dokan Pro will be deleted permanently. You will not be able to recover your lost data unless you keep a backup. Do you want to continue?', 'dokan-lite' ),
                        'confirmText'       => esc_html__( 'Yes, Delete', 'dokan-lite' ),
                        'cancelText'        => esc_html__( 'Cancel', 'dokan-lite' ),
                        'checkboxLabel'     => esc_html__( 'Yes, I understand.', 'dokan-lite' ),
                    )
                )
        );

        // Add the sections to the Privacy page
        $privacy_page->add( $privacy_section );
        $privacy_page->add( $privacy_content_section );
        $privacy_page->add( $admin_access_section );
        $privacy_page->add( $data_clear_section );

        // Set up the main compliance page
        $this
            ->set_title( esc_html__( 'Compliance', 'dokan-lite' ) )
            ->set_icon( 'Files' )
            ->set_description( esc_html__( 'Configure compliance settings, privacy policies, and legal requirements.', 'dokan-lite' ) )
            ->add( $privacy_page );
    }
}
