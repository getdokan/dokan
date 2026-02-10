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
    protected int $priority = 700;
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
     * @throws \Exception
     * @return void
     */
    public function describe_settings(): void {
        $appearance_page = $this
            ->set_title( esc_html__( 'Appearance', 'dokan-lite' ) )
            ->set_icon( 'PanelsRightBottom' )
            ->set_description( esc_html__( 'Configure dashboard menu settings, visibility, and customization options.', 'dokan-lite' ) )
            ->add(
                ElementFactory::sub_page( 'store' )
                    ->set_priority( 100 )
                    ->set_title( esc_html__( 'Store Page', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::section( 'products_page' )
                            ->add(
                                ElementFactory::field( 'store_product_per_page', 'number' )
                                    ->set_title( esc_html__( 'Products Per Page', 'dokan-lite' ) )
                                    ->set_description(
                                        esc_html__(
                                            'Set how many products to display per page on the
vendor store page.', 'dokan-lite'
                                        )
                                    )
                                    ->set_default( 12 )
                                    ->set_placeholder( esc_html__( 'Products Per Page', 'dokan-lite' ) )
                                    ->set_minimum( 1 )
                                    ->set_step( 1 )
                                    ->set_helper_text( esc_html__( 'Set the number of products to display per page on the vendor store page.', 'dokan-lite' ) )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'google_recaptcha' )
                            ->add(
                                ElementFactory::field_group( 'google_recaptcha_settings' )
                                    ->add(
                                        ElementFactory::field( 'recaptcha', 'switch' )
                                            ->set_title( esc_html__( 'Google reCaptcha Validation', 'dokan-lite' ) )
                                            ->set_description(
                                                sprintf(
                                                    /* translators: 1. Link to Google reCaptcha */
                                                    esc_html__( 'Connect to enable spam protection that works automatically in the background. %1$sGet Help%2$s', 'dokan-lite' ),
                                                    '<a href="https://www.google.com/recaptcha/about/" target="_blank" rel="noopener noreferrer">',
                                                    '</a>'
                                                )
                                            )
                                            ->set_default( 'off' )
                                            ->set_enable_state( esc_html__( 'Enable', 'dokan-lite' ), 'on' )
                                            ->set_disable_state( esc_html__( 'Disable', 'dokan-lite' ), 'off' )
                                    )
                                    ->add(
                                        ElementFactory::field( 'recaptcha_info', 'info' )
                                            ->set_title( esc_html__( 'Need Help?', 'dokan-lite' ) )
                                            ->set_description(
                                                sprintf(
                                                    /* translators: 1. Link to Google reCaptcha setup */
                                                    esc_html__( 'If you don\'t have a Google reCaptcha account, %1$s+ Create Google reCaptcha%2$s', 'dokan-lite' ),
                                                    '<a href="https://www.google.com/recaptcha/admin/create" target="_blank" rel="noopener noreferrer">',
                                                    '</a>'
                                                )
                                            )
                                            ->add_dependency( 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'on', true, 'display', 'show', '===' )
                                            ->add_dependency( 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'off', true, 'display', 'hide', '===' )
                                    )
                                    ->add(
                                        ElementFactory::field( 'recaptcha_site_key', 'show_hide' )
                                            ->set_title( esc_html__( 'Site Key', 'dokan-lite' ) )
                                            ->set_description( esc_html__( 'Enter your Google reCaptcha site key here.', 'dokan-lite' ) )
                                            ->set_placeholder( esc_html__( 'Site Key', 'dokan-lite' ) )
                                            ->set_helper_text( esc_html__( 'Get your site key from Google reCaptcha admin console.', 'dokan-lite' ) )
                                            ->add_dependency( 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'on', true, 'display', 'show', '===' )
                                            ->add_dependency( 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'off', true, 'display', 'hide', '===' )
                                    )
                                    ->add(
                                        ElementFactory::field( 'recaptcha_secret_key', 'show_hide' )
                                            ->set_title( esc_html__( 'Secret Key', 'dokan-lite' ) )
                                            ->set_description( esc_html__( 'Enter your Google reCaptcha secret key here.', 'dokan-lite' ) )
                                            ->set_placeholder( esc_html__( 'Secret Key', 'dokan-lite' ) )
                                            ->set_helper_text( esc_html__( 'Get your secret key from Google reCaptcha admin console.', 'dokan-lite' ) )
                                            ->add_dependency( 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'on', true, 'display', 'show', '===' )
                                            ->add_dependency( 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'off', true, 'display', 'hide', '===' )
                                    )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'store_contact_form_section' )
                            ->add(
                                ElementFactory::field( 'store_clossing_time_widget', 'switch' )
                                    ->set_title( esc_html__( 'Show Contact Form on Store Page', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Display a vendor contact form in the store sidebar', 'dokan-lite' ) )
                                    ->set_enable_state(
                                        esc_html__( 'Enable', 'dokan-lite' ),
                                        'on'
                                    )
                                    ->set_disable_state(
                                        esc_html__( 'Disable', 'dokan-lite' ),
                                        'off'
                                    )
                                    ->set_default( 'on' )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'store_banner_dimension_section' )
                            ->add(
                                ElementFactory::field( 'store_banner_dimension', 'double_input' )
                                    ->set_title( esc_html__( 'Store Banner Dimension', 'dokan-lite' ) )
                                    ->set_first_prefix( esc_html__( 'Width', 'dokan-lite' ) )
                                    ->set_second_prefix( esc_html__( 'Height', 'dokan-lite' ) )
                                    ->set_value(
                                        [
                                            'first'  => 625,
                                            'second' => 300,
                                        ]
                                    )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'store_template' )
                            ->add(
                                ElementFactory::field( 'store_template', 'customize_radio' )
                                    ->set_title( esc_html__( 'Store Header Template', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Select a store header for your store.', 'dokan-lite' ) )
                                    ->set_default( 'template-1' )
                                    ->add_enhanced_option(
                                        [
                                            'title'       => esc_html__( 'Template 1', 'dokan-lite' ),
                                            'value'       => 'template-1',
                                            'description' => esc_html__( 'A clean and modern template with a focus on product display.', 'dokan-lite' ),
                                            'image'       => DOKAN_PLUGIN_ASSEST . '/src/images/store/store-page-template-one.svg',
                                        ]
                                    )
                                    ->add_enhanced_option(
                                        [
                                            'title'       => esc_html__( 'Template 2', 'dokan-lite' ),
                                            'value'       => 'template-2',
                                            'description' => esc_html__( 'A stylish template with emphasis on vendor branding.', 'dokan-lite' ),
                                            'image'       => DOKAN_PLUGIN_ASSEST . '/src/images/store/store-page-template-one.svg',
                                        ]
                                    )
                                    ->add_enhanced_option(
                                        [
                                            'title'       => esc_html__( 'Template 3', 'dokan-lite' ),
                                            'value'       => 'template-3',
                                            'description' => esc_html__( 'A minimalistic template for a sleek shopping experience.', 'dokan-lite' ),
                                            'image'       => DOKAN_PLUGIN_ASSEST . '/src/images/store/store-page-template-one.svg',
                                        ]
                                    )
                                    ->set_variant( 'template' )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'store_time_widget_section' )
                            ->add(
                                ElementFactory::field( 'store_time_widget', 'switch' )
                                    ->set_title( esc_html__( 'Store Opening Closing Time Widget', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Enable store opening & closing time widget in the store sidebar', 'dokan-lite' ) )
                                    ->set_enable_state(
                                        esc_html__( 'Enable', 'dokan-lite' ),
                                        'on'
                                    )
                                    ->set_disable_state(
                                        esc_html__( 'Disable', 'dokan-lite' ),
                                        'off'
                                    )
                                    ->set_default( 'off' )
                                    ->set_helper_text( esc_html__( 'Note: This option works only if the theme supports WooCommerce single product page sidebar.', 'dokan-lite' ) )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'store_sidebar_section' )
                            ->add(
                                ElementFactory::field( 'store_opening_time', 'switch' )
                                    ->set_title( esc_html__( 'Store Sidebar From Theme', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Apply main theme\'s sidebar styling to vendor stores for a consistent look', 'dokan-lite' ) )
                                    ->set_enable_state(
                                        esc_html__( 'Enable', 'dokan-lite' ),
                                        'on'
                                    )
                                    ->set_disable_state(
                                        esc_html__( 'Disable', 'dokan-lite' ),
                                        'off'
                                    )
                                    ->set_default( 'off' )
                                    ->set_helper_text( esc_html__( 'Note: This option works only if the theme supports WooCommerce single product page sidebar.', 'dokan-lite' ) )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'vendor_info_visibility_section' )
                            ->add(
                                ElementFactory::field( 'vendor_info_visibility', 'vendor_info_preview' )
                                    ->set_title( esc_html__( 'Vendor Info Visibility', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Choose what vendor details to show customers in single store page.', 'dokan-lite' ) )
                                    ->set_helper_text( esc_html__( 'Note: This option works only if the theme supports WooCommerce single product page sidebar.', 'dokan-lite' ) )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'dokan_font_section' )
                            ->add(
                                ElementFactory::field( 'dokan_font', 'switch' )
                                    ->set_title( esc_html__( 'Dokan font-awesome Functionality', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'If disabled then Dokan font-awesome library won\'t be loaded in frontend.', 'dokan-lite' ) )
                                    ->set_enable_state(
                                        esc_html__( 'Enable', 'dokan-lite' ),
                                        'on'
                                    )
                                    ->set_disable_state(
                                        esc_html__( 'Disable', 'dokan-lite' ),
                                        'off'
                                    )
                                    ->set_default( 'off' )
                                    ->set_helper_text( esc_html__( 'Note: This option works only if the theme supports WooCommerce single product page sidebar.', 'dokan-lite' ) )
                            )
                    )
                    ->add(
                        ElementFactory::section( 'single_product_preview_section' )
                            ->add(
                                ElementFactory::field( 'single_product_preview', 'single_product_preview' )
                                    ->set_title( esc_html__( 'Single Product Page Appearance ', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Choose which sections to show when customers view individual products.', 'dokan-lite' ) )
                                    ->set_helper_text( esc_html__( 'Note: This option works only if the theme supports WooCommerce single product page sidebar.', 'dokan-lite' ) )
                            )
                    )
            );
    }
}
