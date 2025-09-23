<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\ElementTransformer;
use WeDevs\Dokan\Admin\Settings;

class VendorPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'vendor';
    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 40;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_vendor';

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
        $vendor_onboarding = ElementFactory::sub_page( 'vendor_onboarding' )
            ->set_title( esc_html__( 'Vendor Onboarding', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Control the onboarding experience for vendors joining your marketplace.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/vendor-onboarding/' )
            ->add(
                ElementFactory::field( 'enable_selling', 'radio_capsule' )
                    ->set_title( esc_html__( 'Enable Selling', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Immediately enable selling for newly registered vendors.', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Automatically', 'dokan-lite' ), 'automatically' )
                    ->add_option( esc_html__( 'Manually', 'dokan-lite' ), 'manually' )
                    ->set_default( 'automatically' )
            )
            ->add(
                ElementFactory::field( 'address_fields', 'switch' )
                    ->set_title( esc_html__( 'Address Fields', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Add Address Fields on the Vendor Registration form.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            );

        // Create vendor capabilities subpage with a single section
        $vendor_capabilities_page = ElementFactory::sub_page( 'vendor_capabilities' )
            ->set_title( esc_html__( 'Vendor Capabilities', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure what vendors can do in your marketplace.', 'dokan-lite' ) );

        // Create a single section for all vendor capabilities
        $vendor_capabilities_section = ElementFactory::section( 'vendor_capabilities' );

        // Add all fields to the single section based on Figma design
        $vendor_capabilities_section
            ->add(
                ElementFactory::field( 'one_page_creation', 'switch' )
                    ->set_title( esc_html__( 'One Page Product Creation', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Add new product in single page view.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'product_popup', 'switch' )
                    ->set_title( esc_html__( 'Product Popup', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Add new product in popup view.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'order_status_change', 'switch' )
                    ->set_title( esc_html__( 'Order Status Change', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Allow vendor to update order status.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'select_any_category', 'switch' )
                    ->set_title( esc_html__( 'Select any category', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Allow vendors to select any category while creating/editing products.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            );

        // Add the single section to the vendor capabilities page
        $vendor_capabilities_page->add( $vendor_capabilities_section );

        $this
            ->set_title( esc_html__( 'Vendor', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure vendor-related settings and capabilities.', 'dokan-lite' ) )
            ->set_icon( 'Users' )
            ->add( $vendor_onboarding )
            ->add( $vendor_capabilities_page );
    }
}
