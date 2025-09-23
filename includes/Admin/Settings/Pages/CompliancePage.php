<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

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
    protected int $priority = 100;

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
        // Create Privacy subpage
        $privacy_page = ElementFactory::sub_page( 'privacy' )
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
                ->add_option( esc_html__( 'Privacy Policy', 'dokan-lite' ), 'privacy-policy' )
                ->add_option( esc_html__( 'Terms of Service', 'dokan-lite' ), 'terms-of-service' )
                ->add_option( esc_html__( 'Legal Information', 'dokan-lite' ), 'legal-information' )
                ->set_default( 'privacy-policy' )
        );

        // Create Privacy Policy Content section
        $privacy_content_section = ElementFactory::section( 'privacy_policy_content' )
            ->set_title( esc_html__( 'Privacy Policy Content', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Create or edit your privacy policy text that will be displayed to users', 'dokan-lite' ) );

        // Add Privacy Policy Content rich text editor
        $privacy_content_section->add(
            ElementFactory::field( 'privacy_policy_content', 'rich_text' )
                ->set_title( esc_html__( 'Privacy Policy Content', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Create or edit your privacy policy text that will be displayed to users', 'dokan-lite' ) )
                ->set_placeholder( esc_html__( 'Enter your privacy policy content here...', 'dokan-lite' ) )
        );

        // Add the sections to the Privacy page
        $privacy_page->add( $privacy_section );
        $privacy_page->add( $privacy_content_section );

        // Set up the main compliance page
        $this
            ->set_title( esc_html__( 'Compliance', 'dokan-lite' ) )
            ->set_icon( 'Files' )
            ->set_description( esc_html__( 'Configure compliance settings, privacy policies, and legal requirements.', 'dokan-lite' ) )
            ->add( $privacy_page );
    }
}
