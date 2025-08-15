<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\Pages\AbstractPage;

class ProductPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'product';

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */

    protected $storage_key = 'dokan_settings_product';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() { }

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

    public function describe_settings(): void {
        $product_advertisement = ElementFactory::sub_page(
            'product_advertisement'
        )
                                                ->set_title( __( 'Product Advertisement', 'dokan-lite' ) )
                                                ->set_description( __( 'Configure settings for your vendor to feature their products on store pages.', 'dokan-lite' ) )
                                                ->set_icon( 'dashicons dashicons-megaphone' )
                                                ->add(
                                                    ElementFactory::field( 'advertisement_available_slots', 'number' )
                                                                ->set_title( __( 'No. of Available Slot', 'dokan-lite' ) )
                                                                ->set_description( __( 'Enter how many products can be advertised, enter -1 for no limit.', 'dokan-lite' ) )
                                                                ->set_default( -1 )
                                                                ->set_placeholder( __( 'Type something', 'dokan-lite' ) )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'advertisement_expire_days', 'number' )
                                                                ->set_title( __( 'Expire After Days', 'dokan-lite' ) )
                                                                ->set_description( __( 'Enter how many days product will be advertised, enter -1 if you don\'t want to set any expiration period.', 'dokan-lite' ) )
                                                                ->set_default( -1 )
                                                                ->set_placeholder( __( 'e.g 10', 'dokan-lite' ) )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'advertisement_cost_usd', 'number' )
                                                                ->set_title( __( 'Advertisement Cost (USD)', 'dokan-lite' ) )
                                                                ->set_description( __( 'Cost of per advertisement. Set 0 (zero) to purchase.', 'dokan-lite' ) )
                                                                ->set_default( 0 )
                                                                ->set_placeholder( __( 'e.g 10', 'dokan-lite' ) )
                                                                ->set_step( 0.01 )
                                                                ->set_prefix( '$' )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'vendor_can_purchase_advertisement', 'switch' )
                                                                ->set_title( __( 'Vendor Can Purchase Advertisement', 'dokan-lite' ) )
                                                                ->set_description( __( 'If you check this checkbox, vendors will be able to purchase advertisement from product listing and product edit page.', 'dokan-lite' ) )
                                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                ->set_default( 'on' )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'advertisement_in_subscription', 'switch' )
                                                                ->set_title( __( 'Advertisement In Subscription', 'dokan-lite' ) )
                                                                ->set_description( __( 'If you check this checkbox, vendor will be able to advertise their products without any additional cost based on the plan they are subscribed to.', 'dokan-lite' ) )
                                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                ->set_default( 'on' )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'mark_advertised_as_featured', 'switch' )
                                                                ->set_title( __( 'Mark Advertised Product as Featured?', 'dokan-lite' ) )
                                                                ->set_description( __( 'If you check this checkbox, advertised product will be marked as featured. Products will be automatically removed from featured list after advertisement is expired.', 'dokan-lite' ) )
                                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                ->set_default( 'on' )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'display_advertised_on_top', 'switch' )
                                                                ->set_title( __( 'Display Advertised Product on Top?', 'dokan-lite' ) )
                                                                ->set_description( __( 'If you check this checkbox, advertised products will be displayed on top of the catalog listing eg: shop page, single store page etc.', 'dokan-lite' ) )
                                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                ->set_default( 'on' )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'out_of_stock_visibility', 'switch' )
                                                                ->set_title( __( 'Out of Stock Visibility', 'dokan-lite' ) )
                                                                ->set_description( __( 'Hide out of stock items from the advertisement list. Note that, if WooCommerce setting for out of stock visibility is checked, product will be hidden despite this setting.', 'dokan-lite' ) )
                                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                ->set_default( 'on' )
                                                                ->set_helper_text( __( 'If you enable this option, out of stock products will not be displayed in the advertisement list.', 'dokan-lite' ) )
                                                );

        $printful_integration = ElementFactory::sub_page(
            'printful_integration'
        )
                                                ->set_title( __( 'Printful', 'dokan-lite' ) )
                                                ->set_description( __( 'Configure Printful integration settings for print-on-demand products.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/printful-integration/' )
            ->add(
                ElementFactory::section( 'printful_integration_section' )
                                ->add(
                                    ElementFactory::field( 'printful_integration_enable', 'switch' )
                                                ->set_title( __( 'Enable Printful Integration', 'dokan-lite' ) )
                                                ->set_description( __( 'Enable or disable Printful integration for your marketplace.', 'dokan-lite' ) )
                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                ->set_default( 'off' )
                                )
            )
            ->add(
                ElementFactory::section( 'printful_api_settings' )
                                ->set_title( __( 'API Settings', 'dokan-lite' ) )
                                ->set_description( __( 'Configure your Printful API connection settings.', 'dokan-lite' ) )
                                ->add(
                                    ElementFactory::field( 'printful_enable', 'switch' )
                                                ->set_title( __( 'Printful App', 'dokan-lite' ) )
                                                ->set_description(
                                                    __(
                                                        'These settings control how the size guide will look on your
Single Product Page.', 'dokan-lite'
                                                    )
                                                )
                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                ->set_default( 'off' )
                                )
                                ->add(
                                    ElementFactory::field( 'printful_app_url', 'copy_field' )
                                                ->set_title( __( 'App URL', 'dokan-lite' ) )
                                                ->set_description( __( 'Your website URL for Printful app configuration.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'https://yoursite.com', 'dokan-lite' ) )
                                                ->set_helper_text( __( 'This URL will be used by Printful to communicate with your website.', 'dokan-lite' ) )
                                )
                                ->add(
                                    ElementFactory::field( 'printful_redirection_domains', 'copy_field' )
                                                ->set_title( __( 'Redirection Domains', 'dokan-lite' ) )
                                                ->set_description( __( 'Domains allowed for redirection after Printful authentication. Enter one domain per line.', 'dokan-lite' ) )
                                                ->set_placeholder( __( "yoursite.com\nsubdomain.yoursite.com", 'dokan-lite' ) )
                                                ->set_helper_text( __( 'These domains will be whitelisted for OAuth redirects.', 'dokan-lite' ) )
                                )
                                ->add(
                                    ElementFactory::field( 'printful_client_id', 'text' )
                                                ->set_title( __( 'Client ID', 'dokan-lite' ) )
                                                ->set_description( __( 'Your Printful app Client ID.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'Enter your Client ID', 'dokan-lite' ) )
                                )
                                ->add(
                                    ElementFactory::field( 'printful_secret_key', 'password' )
                                                ->set_title( __( 'Secret Key', 'dokan-lite' ) )
                                                ->set_description( __( 'Your Printful app Secret Key.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'Enter your Secret Key', 'dokan-lite' ) )
                                )
            );

        $this->add( $product_advertisement )
            ->add( $printful_integration )
            ->set_title( __( 'Product Settings', 'dokan-lite' ) )
            ->set_description( __( 'Configure product-related settings for your marketplace.', 'dokan-lite' ) )
            ->set_icon( 'dashicons dashicons-cart' );
    }
}
