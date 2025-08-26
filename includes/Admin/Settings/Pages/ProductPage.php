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

        $size_guide_section = ElementFactory::section( 'size_guide_settings' )
            ->set_title( __( 'Size Guide', 'dokan-lite' ) )
            ->set_description( __( 'These settings control how the size guide will look on your Single Product Page.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/printful-integration/' )
            ->add(
                ElementFactory::field( 'size_guide_popup_title', 'text' )
                    ->set_title( __( 'Size Guide Popup Title', 'dokan-lite' ) )
                    ->set_description( __( 'Enter the title that will be displayed in the size guide popup.', 'dokan-lite' ) )
                    ->set_default( __( 'Size Guide', 'dokan-lite' ) )
                    ->set_placeholder( __( 'Type something', 'dokan-lite' ) )
            )
            ->add(
                ElementFactory::field( 'size_guide_popup_text_color', 'select_color_picker' )
                    ->set_title( __( 'Size guide popup text color', 'dokan-lite' ) )
                    ->set_description( __( 'Choose the text color for the size guide popup.', 'dokan-lite' ) )
                    ->set_default( '#25252d' )
            )
            ->add(
                ElementFactory::field( 'size_guide_popup_background_color', 'select_color_picker' )
                    ->set_title( __( 'Size Guide Popup Background Color', 'dokan-lite' ) )
                    ->set_description( __( 'Choose the background color for the size guide popup.', 'dokan-lite' ) )
                    ->set_default( '#ffffff' )
            )
            ->add(
                ElementFactory::field( 'size_guide_tab_background_color', 'select_color_picker' )
                    ->set_title( __( 'Size Guide Tab Background Color', 'dokan-lite' ) )
                    ->set_description( __( 'Choose the background color for inactive size guide tabs.', 'dokan-lite' ) )
                    ->set_default( '#ffffff' )
            )
            ->add(
                ElementFactory::field( 'size_guide_active_tab_background_color', 'select_color_picker' )
                    ->set_title( __( 'Size Guide Active Tab Background Color', 'dokan-lite' ) )
                    ->set_description( __( 'Choose the background color for the active size guide tab.', 'dokan-lite' ) )
                    ->set_default( '#7047eb' )
            )
            ->add(
                ElementFactory::field( 'size_guide_button_text', 'text' )
                    ->set_title( __( 'Size Guide Button Text', 'dokan-lite' ) )
                    ->set_description( __( 'Enter the text that will be displayed on the size guide button.', 'dokan-lite' ) )
                    ->set_default( __( 'Size Guide', 'dokan-lite' ) )
                    ->set_placeholder( __( 'Type something', 'dokan-lite' ) )
            )
            ->add(
                ElementFactory::field( 'size_guide_button_text_color', 'select_color_picker' )
                    ->set_title( __( 'Size Guide Button Text Color', 'dokan-lite' ) )
                    ->set_description( __( 'Choose the text color for the size guide button.', 'dokan-lite' ) )
                    ->set_default( '#ffffff' )
            )
            ->add(
                ElementFactory::field( 'size_guide_measurement_unit', 'radio_capsule' )
                    ->set_title( __( 'Primary Measurement Unit', 'dokan-lite' ) )
                    ->set_description( __( 'Select the primary measurement unit for the size guide.', 'dokan-lite' ) )
                    ->set_default( 'inches' )
                    ->add_option( __( 'Inches', 'dokan-lite' ), 'inches' )
                    ->add_option( __( 'Centimeter', 'dokan-lite' ), 'centimeter' )
            );

        $printful_integration = ElementFactory::sub_page(
            'printful_integration'
        )
                                                ->set_title( __( 'Printful', 'dokan-lite' ) )
                                                ->set_description( __( 'Configure Printful integration settings for print-on-demand products.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/printful-integration/' )
            ->add(
                ElementFactory::section( 'printful_api_settings' )
                    ->add(
                        ElementFactory::field_group( 'printful_api_settings_group' )
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
                                          ElementFactory::field( 'printful_app_name', 'info_field' )
                                                        ->set_title( __( 'App Name', 'dokan-lite' ) )
                                                        ->set_description( __( 'Your Printful app name.', 'dokan-lite' ) )
                                                        ->set_placeholder( __( 'Enter your app name', 'dokan-lite' ) )
                                                        ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'on', true, 'display', 'show', '===' )
                                                        ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'off', true, 'display', 'hide', '===' )
                                      )
                                ->add(
                                    ElementFactory::field( 'printful_app_url', 'copy_field' )
                                                ->set_title( __( 'App URL', 'dokan-lite' ) )
                                                ->set_description( __( 'Your website URL for Printful app configuration.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'https://yoursite.com', 'dokan-lite' ) )
                                                ->set_helper_text( __( 'This URL will be used by Printful to communicate with your website.', 'dokan-lite' ) )
                                        ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'on', true, 'display', 'show', '===' )
                                        ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'off', true, 'display', 'hide', '===' )
                                )
                                ->add(
                                    ElementFactory::field( 'printful_redirection_domains', 'copy_field' )
                                                ->set_title( __( 'Redirection Domains', 'dokan-lite' ) )
                                                ->set_description( __( 'Domains allowed for redirection after Printful authentication. Enter one domain per line.', 'dokan-lite' ) )
                                                ->set_placeholder( __( "yoursite.com\nsubdomain.yoursite.com", 'dokan-lite' ) )
                                                ->set_helper_text( __( 'These domains will be whitelisted for OAuth redirects.', 'dokan-lite' ) )
                                        ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'on', true, 'display', 'show', '===' )
                                        ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'off', true, 'display', 'hide', '===' )
                                )
                                ->add(
                                    ElementFactory::field( 'printful_client_id', 'show_hide' )
                                                ->set_title( __( 'Client ID', 'dokan-lite' ) )
                                                ->set_description( __( 'Your Printful app Client ID.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'Enter your Client ID', 'dokan-lite' ) )
                                                  ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'on', true, 'display', 'show', '===' )
                                                  ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'off', true, 'display', 'hide', '===' )
                                )
                                ->add(
                                    ElementFactory::field( 'printful_secret_key', 'show_hide' )
                                                ->set_title( __( 'Secret Key', 'dokan-lite' ) )
                                                ->set_description( __( 'Your Printful app Secret Key.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'Enter your Secret Key', 'dokan-lite' ) )
                                                  ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'on', true, 'display', 'show', '===' )
                                                  ->add_dependency( 'printful_integration.printful_api_settings.printful_api_settings_group.printful_enable', 'off', true, 'display', 'hide', '===' )
                                )
                    )
            )
            ->add( $size_guide_section );

        $request_for_quote = ElementFactory::sub_page(
            'request_for_quote'
        )
            ->set_title( __( 'Request for Quote', 'dokan-lite' ) )
            ->set_description( __( 'You can configure your site to allow customers to send customized quotes on the selected products.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/request-for-quote/' )
            ->add(
                ElementFactory::field( 'enable_quote_out_of_stock', 'switch' )
                    ->set_title( __( 'Enable Quote for Out of Stock Products', 'dokan-lite' ) )
                    ->set_description( __( 'Enable/Disable quote button for out of stock products. (Note: It is compatible with simple and variable products only)', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'enable_ajax_add_to_quote', 'switch' )
                    ->set_title( __( 'Enable Ajax Add to Quote', 'dokan-lite' ) )
                    ->set_description( __( 'Enable seamless quote request functionality with instant product additions.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'redirect_to_quote_page', 'switch' )
                    ->set_title( __( 'Redirect to Quote Page', 'dokan-lite' ) )
                    ->set_description( __( 'Redirect to the quote page after a product is successfully added to quote.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'decrease_offered_price', 'number' )
                    ->set_title( __( 'Decrease Offered Price', 'dokan-lite' ) )
                    ->set_description( __( 'Enter number in percent to decrease the offered price from standard price of product. Set zero (0) for standard price. Note: offered price will be display according to settings of cart. (eg: including/excluding tax)', 'dokan-lite' ) )
                    ->set_default( 0 )
                    ->set_placeholder( __( 'e.g 10', 'dokan-lite' ) )
                    ->set_prefix( '$' )
            )
            ->add(
                ElementFactory::field( 'convert_to_order', 'switch' )
                    ->set_title( __( 'Convert to Order', 'dokan-lite' ) )
                    ->set_description( __( 'Customers can Convert to Order. Adding customers is important here.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'quote_converter_display', 'switch' )
                    ->set_title( __( 'Quote Converter Display', 'dokan-lite' ) )
                    ->set_description( __( 'Enable display of "Quote converted by" in customer\'s my-account quote details page.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            );

        $wholesale = ElementFactory::sub_page(
            'wholesale'
        )
            ->set_title( __( 'Wholesale', 'dokan-lite' ) )
            ->set_description( __( 'You can configure wholesale settings for your store and allow vendors to operate on wholesale price and quantity.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/wholesale/' )
            ->add(
                ElementFactory::field( 'display_wholesale_pricing_to', 'radio_capsule' )
                    ->set_title( __( 'Display Wholesale Pricing To', 'dokan-lite' ) )
                    ->set_description( __( 'Define which user types can see discounted wholesale prices.', 'dokan-lite' ) )
                    ->set_default( 'wholesale_customer' )
                    ->add_option( __( 'Only Wholesale Customer', 'dokan-lite' ), 'wholesale_customer' )
                    ->add_option( __( 'All Users', 'dokan-lite' ), 'all_users' )
            )
            ->add(
                ElementFactory::field( 'wholesale_price_on_shop_archive', 'switch' )
                    ->set_title( __( 'Wholesale Price on Shop Archive', 'dokan-lite' ) )
                    ->set_description( __( 'Show in price column', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'need_approval_for_customer', 'switch' )
                    ->set_title( __( 'Need Approval for Customer', 'dokan-lite' ) )
                    ->set_description( __( 'Customer need admin approval for becoming a wholesale customer.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            );

        $this->add( $product_advertisement )
            ->add( $printful_integration )
            ->add( $request_for_quote )
            ->add( $wholesale )
            ->set_icon( 'Box' )
            ->set_title( __( 'Product Settings', 'dokan-lite' ) )
            ->set_description( __( 'Configure product-related settings for your marketplace.', 'dokan-lite' ) );
    }
}
