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
    protected int $priority = 200;
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
                                    ElementFactory::section( 'store_template' )
                                                ->add(
                                                    ElementFactory::field( 'store_template', 'customize_radio' )
                                                                    ->set_title( esc_html__( 'Store Template', 'dokan-lite' ) )
                                                                    ->set_description( esc_html__( 'Select a template for vendor stores.', 'dokan-lite' ) )
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
                                    ElementFactory::section( 'store_clossing_time_widget_section' )
                                                ->add(
                                                    ElementFactory::field( 'store_clossing_time_widget', 'switch' )
                                                                    ->set_title( esc_html__( 'Store SEO', 'dokan-lite' ) )
                                                                    ->set_description( esc_html__( 'Enable SEO features for vendor stores to improve search engine visibility.', 'dokan-lite' ) )
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
            )
            ->add(
                ElementFactory::sub_page( 'storefont_social_onboarding' )
                                ->set_title( esc_html__( 'Storefont Social', 'dokan-lite' ) )
                                ->set_description(
                                    esc_html__( 'Allow vendors to link their social accounts to build trust and connect with customers.', 'dokan-lite' )
                                )
                                ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/social-onboarding/' )
                                ->add(
                                    ElementFactory::section( 'storefont_social_onboarding_section' )
                                                ->add(
                                                    ElementFactory::field( 'social_login', 'switch' )
                                                                    ->set_title( __( 'Social Login', 'dokan-lite' ) )
                                                                    ->set_description( __( 'Enabling this will add Social Icons under registration form to allow users to login or register using Social Profiles.', 'dokan-lite' ) )
                                                                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                    ->set_default( 'on' )
                                                )
                                                ->add(
                                                    ElementFactory::field_group( 'facebook_api_group' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'on', true, 'display', 'show', '==' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'off', true, 'display', 'hide', '==' )
                                                                    ->add(
                                                                        ElementFactory::field( 'facebook_enabled', 'switch' )
                                                                                    ->set_title( __( 'Connect to Facebook', 'dokan-lite' ) )
                                                                                    ->set_description(
                                                                                        sprintf(
                                                                                        /* translators: %s: Help link URL */
                                                                                            __( 'Configure your Facebook API settings. <a href="%s" target="_blank">Get Help</a>', 'dokan-lite' ),
                                                                                            'https://wedevs.com/docs/dokan-lite/facebook-login/'
                                                                                        )
                                                                                    )
                                                                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/social-onboarding/facebook.svg' )
                                                                                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                    ->set_default( 'off' )
                                                                    )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'on', true, 'display', 'hide', '!==' )
                                                                    ->add(
                                                                        ElementFactory::field( 'facebook_app_id', 'show_hide' )
                                                                                    ->set_title( __( 'Facebook App ID', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your Facebook App ID from Facebook Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your Facebook App ID', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'facebook_app_secret', 'copy_field' )
                                                                                    ->set_title( __( 'Facebook App Secret', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your Facebook App Secret from Facebook Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your Facebook App Secret', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'facebook_redirect_url', 'copy_field' )
                                                                                    ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'The redirect URL for Facebook Login. Copy this URL and add it to your Facebook App settings.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_facebook_callback' ) )
                                                                                    ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_facebook_callback' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    ->set_readonly( true )
                                                                    )
                                                )
                                                ->add(
                                                    ElementFactory::field_group( 'x_api_group' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'on', true, 'display', 'show', '==' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'off', true, 'display', 'hide', '==' )
                                                                    ->add(
                                                                        ElementFactory::field( 'x_enabled', 'switch' )
                                                                                    ->set_title( __( 'Connect to X', 'dokan-lite' ) )
                                                                                    ->set_description(
                                                                                        sprintf(
                                                                                        /* translators: %s: Help link URL */
                                                                                            __( 'Configure your X API settings. <a href="%s" target="_blank">Get Help</a>', 'dokan-lite' ),
                                                                                            'https://wedevs.com/docs/dokan-lite/x-twitter-login/'
                                                                                        )
                                                                                    )
                                                                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/social-onboarding/x-twitter.svg' )
                                                                                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                    ->set_default( 'off' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'x_api_key', 'show_hide' )
                                                                                    ->set_title( __( 'X API Key', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your X API Key from X Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your X API Key', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.x_api_group.x_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.x_api_group.x_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'x_api_secret', 'show_hide' )
                                                                                    ->set_title( __( 'X API Secret', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your X API Secret from X Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your X API Secret', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.x_api_group.x_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.x_api_group.x_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'x_redirect_url', 'copy_field' )
                                                                                    ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'The redirect URL for X Login. Copy this URL and add it to your X App settings.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_x_callback' ) )
                                                                                    ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_x_callback' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.x_api_group.x_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.x_api_group.x_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                                    ->set_readonly( true )
                                                                    )
                                                )
                                                ->add(
                                                    ElementFactory::field_group( 'google_api_group' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'on', true, 'display', 'show', '==' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'off', true, 'display', 'hide', '==' )
                                                                    ->add(
                                                                        ElementFactory::field( 'google_enabled', 'switch' )
                                                                                    ->set_title( __( 'Connect to Google', 'dokan-lite' ) )
                                                                                    ->set_description(
                                                                                        sprintf(
                                                                                        // translators: %s: Help link URL
                                                                                            __( 'Configure your Google API settings. <a href="%s" target="_blank">Get Help</a>', 'dokan-lite' ),
                                                                                            'https://wedevs.com/docs/dokan-lite/google-login/'
                                                                                        )
                                                                                    )
                                                                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/social-onboarding/google.svg' )
                                                                                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                    ->set_default( 'off' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'google_client_id', 'show_hide' )
                                                                                    ->set_title( __( 'Google Client ID', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your Google Client ID from Google Cloud Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your Google Client ID', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.google_api_group.google_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.google_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'google_client_secret', 'show_hide' )
                                                                                    ->set_title( __( 'Google Client Secret', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your Google Client Secret from Google Cloud Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your Google Client Secret', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.google_api_group.google_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.google_api_group.google_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'google_redirect_url', 'copy_field' )
                                                                                    ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'The redirect URL for Google Login. Copy this URL and add it to your Google OAuth settings.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_google_callback' ) )
                                                                                    ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_google_callback' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.google_api_group.google_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.google_api_group.google_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                                    ->set_readonly( true )
                                                                    )
                                                )
                                                ->add(
                                                    ElementFactory::field_group( 'linkedin_api_group' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'on', true, 'display', 'show', '==' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'off', true, 'display', 'hide', '==' )
                                                                    ->add(
                                                                        ElementFactory::field( 'linkedin_enabled', 'switch' )
                                                                                    ->set_title( __( 'Connect to LinkedIn', 'dokan-lite' ) )
                                                                                    ->set_description(
                                                                                        sprintf(
                                                                                        // translators: %s: Help link URL
                                                                                            __( 'Configure your LinkedIn API settings. <a href="%s" target="_blank">Get Help</a>', 'dokan-lite' ),
                                                                                            'https://wedevs.com/docs/dokan-lite/linkedin-login/'
                                                                                        )
                                                                                    )
                                                                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/social-onboarding/linkedin.svg' )
                                                                                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                    ->set_default( 'off' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'linkedin_client_id', 'show_hide' )
                                                                                    ->set_title( __( 'LinkedIn Client ID', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your LinkedIn Client ID from LinkedIn Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your LinkedIn Client ID', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.linkedin_api_group.linkedin_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'linkedin_client_secret', 'show_hide' )
                                                                                    ->set_title( __( 'LinkedIn Client Secret', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your LinkedIn Client Secret from LinkedIn Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your LinkedIn Client Secret', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.linkedin_api_group.linkedin_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'linkedin_redirect_url', 'copy_field' )
                                                                                    ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'The redirect URL for LinkedIn Login. Copy this URL and add it to your LinkedIn App settings.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_linkedin_callback' ) )
                                                                                    ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_linkedin_callback' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.linkedin_api_group.linkedin_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                                    ->set_readonly( true )
                                                                    )
                                                )
                                                ->add(
                                                    ElementFactory::field_group( 'apple_api_group' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'on', true, 'display', 'show', '==' )
                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'off', true, 'display', 'hide', '==' )
                                                                    ->add(
                                                                        ElementFactory::field( 'apple_enabled', 'switch' )
                                                                                    ->set_title( __( 'Connect to Apple', 'dokan-lite' ) )
                                                                                    ->set_description(
                                                                                        sprintf(
                                                                                        // translators: %s: Help link URL
                                                                                            __( 'Configure your Apple API settings. <a href="%s" target="_blank">Get Help</a>', 'dokan-lite' ),
                                                                                            'https://wedevs.com/docs/dokan-lite/apple-login/'
                                                                                        )
                                                                                    )
                                                                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/social-onboarding/apple.svg' )
                                                                                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                    ->set_default( 'off' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'apple_service_id', 'show_hide' )
                                                                                    ->set_title( __( 'Apple Service ID', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your Apple Service ID from Apple Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your Apple Service ID', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'apple_team_id', 'show_hide' )
                                                                                    ->set_title( __( 'Apple Team ID', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your Apple Team ID from Apple Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your Apple Team ID', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'apple_key_id', 'show_hide' )
                                                                                    ->set_title( __( 'Apple Key ID', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Enter your Apple Key ID from Apple Developer Console.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( 'Enter your Apple Key ID', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'apple_key_content', 'textarea' )
                                                                                    ->set_title( __( 'Apple Key Content', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'Paste your Apple private key content including BEGIN and END lines.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( __( '-----BEGIN PRIVATE KEY-----\nYour private key content here\n-----END PRIVATE KEY-----', 'dokan-lite' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field( 'apple_redirect_url', 'copy_field' )
                                                                                    ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                    ->set_description( __( 'The redirect URL for Apple Sign In. Copy this URL and add it to your Apple Developer account.', 'dokan-lite' ) )
                                                                                    ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_apple_callback' ) )
                                                                                    ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_apple_callback' ) )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                    ->add_dependency( 'storefont_social_onboarding.storefont_social_onboarding_section.apple_api_group.apple_enabled', 'off', true, 'display', 'hide', '!==' )
                                                                                    ->set_readonly( true )
                                                                    )
                                                )
                                )
            );
    }
}
