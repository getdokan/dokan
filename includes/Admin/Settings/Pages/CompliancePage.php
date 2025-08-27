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
    protected int $priority = 260;

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

        // Create EU Compliance subpage
        $eu_compliance_page = ElementFactory::sub_page( 'eu_compliance' )
            ->set_title( esc_html__( 'EU Compliance', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure EU compliance settings and business requirements for vendors and customers.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/compliance/eu-compliance/' );

        // Create EU Compliance settings section
        $eu_compliance_section = ElementFactory::section( 'eu_compliance_settings' )
            ->set_title( esc_html__( 'EU Compliance Settings', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure EU business requirements and compliance fields.', 'dokan-lite' ) );

        // Add Display in Vendor Registration Form toggle
        $eu_compliance_section->add(
            ElementFactory::field( 'eu_vendor_registration_display', 'switch' )
                ->set_title( esc_html__( 'Display in Vendor Registration Form?', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Show required EU business fields during vendor account creation.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
        );

        // Create Vendor Extra Fields section
        $vendor_extra_fields_section = ElementFactory::section( 'vendor_extra_fields' );

        // Add Vendor Extra Fields checkbox group
        $vendor_extra_fields_section->add(
            ElementFactory::field( 'vendor_extra_fields', 'multicheck' )
                ->set_title( esc_html__( 'Vendor Extra Fields', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Checked fields will be used as extra fields for vendors.', 'dokan-lite' ) )
                ->add_option( esc_html__( 'Company Name', 'dokan-lite' ), 'company_name' )
                ->add_option( esc_html__( 'VAT Number', 'dokan-lite' ), 'vat_number' )
                ->add_option( esc_html__( 'Business Registration Number', 'dokan-lite' ), 'business_registration_number' )
                ->add_option( esc_html__( 'Tax ID', 'dokan-lite' ), 'tax_id' )
                ->add_option( esc_html__( 'EU Business Address', 'dokan-lite' ), 'eu_business_address' )
                ->set_default( ['company_name'] )
        );

        // Create Customer Extra Fields section
        $customer_extra_fields_section = ElementFactory::section( 'customer_extra_fields' );

        // Add Customer Extra Fields checkbox group
        $customer_extra_fields_section->add(
            ElementFactory::field( 'customer_extra_fields', 'multicheck' )
                ->set_title( esc_html__( 'Customer Extra Fields', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Checked fields will be used as extra fields for customers.', 'dokan-lite' ) )
                ->add_option( esc_html__( 'EU Address', 'dokan-lite' ), 'eu_address' )
                ->add_option( esc_html__( 'VAT Number', 'dokan-lite' ), 'customer_vat_number' )
                ->add_option( esc_html__( 'Tax ID', 'dokan-lite' ), 'customer_tax_id' )
                ->add_option( esc_html__( 'Bank IBAN', 'dokan-lite' ), 'bank_iban' )
                ->set_default( ['bank_iban'] )
        );

        // Add Germanized Support toggle
        $eu_compliance_section->add(
            ElementFactory::field( 'germanized_support_vendors', 'switch' )
                ->set_title( esc_html__( 'Enable Germanized Support For Vendors', 'dokan-lite' ) )
                ->set_description( esc_html__( 'This will add a new section in vendor product edit page with fields provided by Germanized for WooCommerce plugin.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'off' )
        );

        // Add Vendor Invoice Number Override toggle
        $eu_compliance_section->add(
            ElementFactory::field( 'vendor_invoice_number_override', 'switch' )
                ->set_title( esc_html__( 'Vendor\'s Can Override Invoice Number', 'dokan-lite' ) )
                ->set_description( esc_html__( 'If you enable this setting, each vendor will be able to customize invoice number for their orders.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'off' )
        );

        // Add the sections to the EU Compliance page
        $eu_compliance_page->add( $eu_compliance_section );
        $eu_compliance_page->add( $vendor_extra_fields_section );
        $eu_compliance_page->add( $customer_extra_fields_section );

        // Set up the main compliance page
        $this
            ->set_title( esc_html__( 'Compliance', 'dokan-lite' ) )
            ->set_icon( 'file' )
            ->set_description( esc_html__( 'Configure compliance settings, privacy policies, and legal requirements.', 'dokan-lite' ) )
            ->add( $privacy_page )
            ->add( $eu_compliance_page );
    }
}
