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
    protected int $priority = 450;

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
                                                ->add(
                                                    ElementFactory::field( 'store_opening_time', 'switch' )
                                                                  ->set_title( esc_html__( 'Store Opening Closing Time Widget', 'dokan-lite' ) )
                                                                  ->set_description( esc_html__( 'Display business hours on vendor store pages for the customers.', 'dokan-lite' ) )
                                                                  ->set_enable_state(
                                                                      esc_html__( 'Enable', 'dokan-lite' ),
                                                                      'on'
                                                                  )
                                                                  ->set_disable_state(
                                                                      esc_html__( 'Disable', 'dokan-lite' ),
                                                                      'off'
                                                                  )
                                                                  ->set_default( 'off' )
                                                )
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
                                                )

                              )
            );

        // Add the section to the store page.
        $appearance_page->add( $store_page );
    }
}
