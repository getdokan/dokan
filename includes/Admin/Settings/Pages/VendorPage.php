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
    protected int $priority = 140;

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

        $vendor_onboarding = ElementFactory::sub_page(
            'vendor_onboarding'
        )
                                            ->set_title( __( 'Vendor Onboarding', 'dokan-lite' ) )
                                            ->set_description( __( 'Control the onboarding experience for vendors joining your marketplace.', 'dokan-lite' ) )
                                            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/vendor-onboarding/' )
                                            ->add(
                                                ElementFactory::field( 'enable_selling', 'radio_capsule' )
                                                            ->set_title( __( 'Enable Selling', 'dokan-lite' ) )
                                                            ->set_description( __( 'Immediately enable selling for newly registered vendors.', 'dokan-lite' ) )
                                                            ->add_option( __( 'Automatically', 'dokan-lite' ), 'automatically' )
                                                            ->add_option( __( 'Manually', 'dokan-lite' ), 'manually' )
                                                            ->set_default( 'automatically' )
                                            )
                                            ->add(
                                                ElementFactory::field( 'address_fields', 'switch' )
                                                            ->set_title( __( 'Address Fields', 'dokan-lite' ) )
                                                            ->set_description( __( 'Add Address Fields on the Vendor Registration form.', 'dokan-lite' ) )
                                                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                            ->set_default( 'on' )
                                            )
                                            ->add(
                                                ElementFactory::field( 'terms_conditions', 'switch' )
                                                            ->set_title( __( 'Terms and Conditions', 'dokan-lite' ) )
                                                            ->set_description( __( 'Enable the terms & conditions checkbox on vendor registration form.', 'dokan-lite' ) )
                                                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                            ->set_default( 'on' )
                                            )
                                            ->add(
                                                ElementFactory::field( 'welcome_wizard', 'switch' )
                                                            ->set_title( __( 'Welcome Wizard', 'dokan-lite' ) )
                                                            ->set_description( __( 'Welcome wizard for newly registered vendors.', 'dokan-lite' ) )
                                                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                            ->set_default( 'on' )
                                            )
                                            ->add(
                                                ElementFactory::field( 'vendor_setup_wizard_logo', 'file_upload' )
                                                            ->set_title( __( 'Vendor Setup Wizard Logo', 'dokan-lite' ) )
                                                            ->set_description( __( 'Recommended logo size (270px X 90px). If no logo is uploaded, site title is shown by default.', 'dokan-lite' ) )
                                                            ->set_placeholder( __( '+ Choose File', 'dokan-lite' ) )
                                                            ->set_allowed_types( [ 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml' ] )
                                                            ->set_max_file_size( 2 * 1024 * 1024 ) // 2MB
                                            )
                                            ->add(
                                                ElementFactory::field( 'vendor_setup_wizard_message', 'rich_text' )
                                                            ->set_title( __( 'Vendor Setup Wizard Message', 'dokan-lite' ) )
                                                            ->set_placeholder( __( 'Enter your welcome message here...', 'dokan-lite' ) )
                                            );
        // Create vendor capabilities subpage with a single section
        $vendor_capabilities_page = ElementFactory::sub_page( 'vendor_capabilities' )
            ->set_title( __( 'Vendor Capabilities', 'dokan-lite' ) )
            ->set_description( __( 'Configure what vendors can do in your marketplace.', 'dokan-lite' ) );

        // Social Onboarding sub-page
        $social_onboarding_page = ElementFactory::sub_page( 'social_onboarding' )
                                                ->set_title( __( 'Social Onboarding', 'dokan-lite' ) )
                                                ->set_description( __( 'Define settings to allow vendors to use their social profiles to register or log in to the marketplace.', 'dokan-lite' ) )
                                                ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/social-onboarding/' )
                                                ->add(
                                                    ElementFactory::section( 'social_onboarding' )
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
                                                                            ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'show', '==' )
                                                                            ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'off', true, 'display', 'hide', '==' )
                                                                            ->add(
                                                                                ElementFactory::field( 'facebook_enabled', 'switch' )
                                                                                                ->set_title( __( 'Connect to Facebook', 'dokan-lite' ) )
                                                                                                ->set_description(
                                                                                                    sprintf(
                                                                                                    // translators: 1) Link to get help.
                                                                                                        __( 'Configure your Facebook API settings. <a href="%s" target="_blank">Get Help</a>', 'dokan-lite' ),
                                                                                                        'https://wedevs.com/docs/dokan-lite/facebook-login/'
                                                                                                    )
                                                                                                )
                                                                                                ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/social-onboarding/facebook.svg' )
                                                                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                                ->set_default( 'off' )
                                                                            )
                                                                            ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'hide', '!==' )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'facebook_app_id', 'show_hide' )
                                                                                                        ->set_title( __( 'Facebook App ID', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your Facebook App ID from Facebook Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your Facebook App ID', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.facebook_api_group.facebook_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.facebook_api_group.facebook_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'facebook_app_secret', 'copy_field' )
                                                                                                        ->set_title( __( 'Facebook App Secret', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your Facebook App Secret from Facebook Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your Facebook App Secret', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.facebook_api_group.facebook_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.facebook_api_group.facebook_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'facebook_redirect_url', 'copy_field' )
                                                                                                        ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'The redirect URL for Facebook Login. Copy this URL and add it to your Facebook App settings.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_facebook_callback' ) )
                                                                                                        ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_facebook_callback' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.facebook_api_group.facebook_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.facebook_api_group.facebook_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                                        ->set_readonly( true )
                                                                                    )
                                                                    )

                                                                    ->add(
                                                                        ElementFactory::field_group( 'x_api_group' )
                                                                            ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'show', '==' )
                                                                            ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'off', true, 'display', 'hide', '==' )
                                                                            ->add(
                                                                                ElementFactory::field( 'x_enabled', 'switch' )
                                                                                                ->set_title( __( 'Connect to X', 'dokan-lite' ) )
                                                                                                ->set_description(
                                                                                                    sprintf(
                                                                                                    // translators: 1) Link to get help.
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
                                                                                                        ->set_description( __( 'Enter your X API Key from X Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your X API Key', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'x_api_secret', 'copy_field' )
                                                                                                        ->set_title( __( 'X API Secret', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your X API Secret from X Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your X API Secret', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'x_redirect_url', 'copy_field' )
                                                                                                        ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'The redirect URL for X Login. Copy this URL and add it to your X App settings.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_x_callback' ) )
                                                                                                        ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_x_callback' ) )
                                                                                                        ->set_readonly( true )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'google_key_content', 'textarea' )
                                                                                                        ->set_title( __( 'Apple Key Content', 'dokan-lite' ) )
                                                                                            ->set_placeholder( __( 'Write here', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.x_api_group.x_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field_group( 'google_api_group' )
                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'show', '===' )
                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'hide', '!==' )
                                                                                        ->add(
                                                                                            ElementFactory::field( 'google_enabled', 'switch' )
                                                                                                        ->set_title( __( 'Connect to Google', 'dokan-lite' ) )
                                                                                                        ->set_description(
                                                                                                            sprintf(
                                                                                                            // translators: 1) Link to get help.
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
                                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'show', '===' )
                                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                        )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'google_client_secret', 'copy_field' )
                                                                                                        ->set_title( __( 'Google Client Secret', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your Google Client Secret from Google Cloud Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your Google Client Secret', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'google_redirect_url', 'copy_field' )
                                                                                                        ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'The redirect URL for Google Login. Copy this URL and add it to your Google OAuth settings.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_google_callback' ) )
                                                                                                        ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_google_callback' ) )
                                                                                                        ->set_readonly( true )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'google_key_content', 'textarea' )
                                                                                                        ->set_title( __( 'Apple Key Content', 'dokan-lite' ) )
                                                                                            ->set_placeholder( __( 'Write here', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.google_api_group.google_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field_group( 'linkedin_api_group' )
                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'show', '===' )
                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'hide', '!==' )
                                                                                        ->add(
                                                                                            ElementFactory::field( 'linkedin_enabled', 'switch' )
                                                                                                        ->set_title( __( 'Connect to LinkedIn', 'dokan-lite' ) )
                                                                                                        ->set_description(
                                                                                                            sprintf(
                                                                                                            // translators: 1) Link to get help.
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
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'linkedin_client_secret', 'show_hide' )
                                                                                                        ->set_title( __( 'LinkedIn Client Secret', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your LinkedIn Client Secret from LinkedIn Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your LinkedIn Client Secret', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'linkedin_redirect_url', 'copy_field' )
                                                                                                        ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'The redirect URL for LinkedIn Login. Copy this URL and add it to your LinkedIn App settings.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_linkedin_callback' ) )
                                                                                                        ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_linkedin_callback' ) )
                                                                                                        ->set_readonly( true )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'linked_key_content', 'textarea' )
                                                                                                        ->set_title( __( 'Apple Key Content', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Paste your Apple private key content including BEGIN and END lines.', 'dokan-lite' ) )
                                                                                            ->set_placeholder( __( 'Write here', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                    )
                                                                    ->add(
                                                                        ElementFactory::field_group( 'apple_api_group' )
                                                                                        ->add(
                                                                                            ElementFactory::field( 'apple_enabled', 'switch' )
                                                                                                        ->set_title( __( 'Connect to Apple', 'dokan-lite' ) )
                                                                                                        ->set_description(
                                                                                                            sprintf(
                                                                                                                __( 'Configure your Apple API settings. <a href="%s" target="_blank">Get Help</a>', 'dokan-lite' ),
                                                                                                                'https://wedevs.com/docs/dokan-lite/apple-login/'
                                                                                                            )
                                                                                                        )
                                                                                                        ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/social-onboarding/apple.svg' )
                                                                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                                        ->set_default( 'off' )
                                                                                        )
                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'show', '===' )
                                                                                        ->add_dependency( 'social_onboarding.social_onboarding.social_login', 'on', true, 'display', 'hide', '!==' )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'apple_redirect_url', 'show_hide' )
                                                                                                        ->set_title( __( 'Redirect URL', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'The redirect URL for Apple Sign In. Copy this URL and add it to your Apple Developer account.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( home_url( '/wp-admin/admin-ajax.php?action=dokan_apple_callback' ) )
                                                                                                        ->set_default( home_url( '/wp-admin/admin-ajax.php?action=dokan_apple_callback' ) )
                                                                                                        ->set_readonly( true )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'apple_service_id', 'copy_field' )
                                                                                                        ->set_title( __( 'Apple Service ID', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your Apple Service ID from Apple Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your Apple Service ID', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'apple_team_id', 'show_hide' )
                                                                                                        ->set_title( __( 'Apple Team ID', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your Apple Team ID from Apple Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your Apple Team ID', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'apple_key_id', 'show_hide' )
                                                                                                        ->set_title( __( 'Apple Key ID', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Enter your Apple Key ID from Apple Developer Console.', 'dokan-lite' ) )
                                                                                                        ->set_placeholder( __( 'Enter your Apple Key ID', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                                    ->add(
                                                                                        ElementFactory::field( 'apple_key_content', 'textarea' )
                                                                                                        ->set_title( __( 'Apple Key Content', 'dokan-lite' ) )
                                                                                                        ->set_description( __( 'Paste your Apple private key content including BEGIN and END lines.', 'dokan-lite' ) )
                                                                                            ->set_placeholder( __( 'Write here', 'dokan-lite' ) )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'show', '===' )
                                                                                            ->add_dependency( 'social_onboarding.social_onboarding.apple_api_group.apple_enabled', 'on', true, 'display', 'hide', '!==' )
                                                                                    )
                                                                    )
                                                );

        // Vendor Subscription sub-page
        $vendor_subscription_page = ElementFactory::sub_page( 'vendor_subscription' )
                                                    ->set_icon( 'FileSpreadsheet' )
                                                    ->set_title( __( 'Vendor Subscription', 'dokan-lite' ) )
                                                    ->set_description( __( 'Configure marketplace settings to authorize vendors to create subscription products for their stores.', 'dokan-lite' ) )
                                                    ->set_doc_link( esc_url( 'https://wedevs.com/docs/dokan/vendor-settings/vendor-subscription/' ) );

        // Single Product Multi-Vendor sub-page
        $single_product_multi_vendor_page = ElementFactory::sub_page( 'single_product_multi_vendor' )
                                                            ->set_icon( 'FileSpreadsheet' )
                                                            ->set_title( __( 'Single Product Multi-Vendor', 'dokan-lite' ) )
                                                            ->set_description( __( 'You can configure your site to allow vendors to sell other vendor\'s products with desired customizations.', 'dokan-lite' ) )
                                                            ->set_doc_link( esc_url( 'https://wedevs.com/docs/dokan/vendor-settings/single-product-multi-vendor/' ) );

        // Store state sub-page
        $store_state_page = ElementFactory::sub_page( 'store_state' )
            ->set_icon( 'ShoppingBag' )
            ->set_title( __( 'Store State', 'dokan-lite' ) )
            ->set_description( __( 'Configure store state settings.', 'dokan-lite' ) )
            ->set_doc_link( esc_url( 'https://wedevs.com/docs/dokan/vendor-settings/store-state/' ) );

        // Create a single section for all vendor capabilities
        $vendor_capabilities_section = ElementFactory::section( 'vendor_capabilities' );

        // Add all fields to the single section based on Figma design
        $vendor_capabilities_section
            ->add(
                ElementFactory::field( 'selling_product_type', 'radio_capsule' )
                    ->set_title( __( 'Selling Product Types', 'dokan-lite' ) )
                    ->set_description( __( 'Select a type for vendors what type of product they can sell only.', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Physical', 'dokan-lite' ), 'physical', 'Box' )
                    ->add_option( esc_html__( 'Digital', 'dokan-lite' ), 'digital', 'Download' )
                    ->add_option( esc_html__( 'Both', 'dokan-lite' ), 'both', 'Dices' )
                    ->set_default( 'physical' )
            )
            ->add(
                ElementFactory::field( 'product_status', 'radio_capsule' )
                    ->set_title( __( 'Product Status', 'dokan-lite' ) )
                    ->set_description( __( 'The status of a product when a vendor creates or updates it.', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Published', 'dokan-lite' ), 'published' )
                    ->add_option( esc_html__( 'Pending Review', 'dokan-lite' ), 'pending' )
                    ->set_default( 'published' )
            )
            ->add(
                ElementFactory::field( 'duplicate_product', 'switch' )
                    ->set_title( __( 'Duplicate Product', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendor to duplicate their product.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'one_page_creation', 'switch' )
                    ->set_title( __( 'One Page Product Creation', 'dokan-lite' ) )
                    ->set_description( __( 'Add new product in single page view.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'product_popup', 'switch' )
                    ->set_title( __( 'Product Popup', 'dokan-lite' ) )
                    ->set_description( __( 'Add new product in popup view.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'order_status_change', 'switch' )
                                ->set_title( __( 'Order Status Change', 'dokan-lite' ) )
                                ->set_description( __( 'Allow vendor to update order status.', 'dokan-lite' ) )
                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'select_any_category', 'switch' )
                    ->set_title( __( 'Select any category', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to select any category while creating/editing products.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'category_selection', 'radio_capsule' )
                                ->set_title( __( 'Product Category Selection', 'dokan-lite' ) )
                                ->set_description( __( 'Control how vendors assign categories to their products.', 'dokan-lite' ) )
                                ->add_option( esc_html__( 'Single', 'dokan-lite' ), 'single' )
                                ->add_option( esc_html__( 'Multiple', 'dokan-lite' ), 'multiple' )
                                ->set_default( 'single' )
            )
            ->add(
                ElementFactory::field( 'vendors_create_tags', 'switch' )
                    ->set_title( __( 'Vendors Can Create Tags', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to create new product tags from vendor dashboard.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'add_new_attribute_values', 'switch' )
                    ->set_title( __( 'Add New Attribute Values', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to add new values to predefined attribute.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'product_review_management', 'switch' )
                    ->set_title( __( 'Product Review Management by Vendors', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to manage product review status changes from their dashboard.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'auction_functions', 'switch' )
                                ->set_title( __( 'Auction Functions for New Vendors', 'dokan-lite' ) )
                                ->set_description( __( 'Allow new vendors to create auction products upon registration.', 'dokan-lite' ) )
                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                ->set_default( 'off' )
            );

        // Add the single section to vendor capabilities page
        $vendor_capabilities_page->add( $vendor_capabilities_section );
        $vendor_capabilities_page->add(
            ElementFactory::section( 'discount_settings' )
                            ->set_title( __( 'Vendor Quantity and Order Discount', 'dokan-lite' ) )
                            ->set_description( __( 'This setting enables vendors to set discounts based on the quantity of items ordered from a specific vendor. Also, vendor can set a discount percentage which will be applied to the total order amount.', 'dokan-lite' ) )
                            ->add(
                                ElementFactory::field( 'product_quantity_discount', 'switch' )
                                            ->set_title( __( 'Discount Editing', 'dokan-lite' ) )
                                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                            ->set_default( 'on' )
                            )
                            ->add(
                                ElementFactory::field( 'order_discount', 'switch' )
                                            ->set_title( __( 'Order Discount', 'dokan-lite' ) )
                                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                            ->set_default( 'on' )
                            )
        );

        // Vendor Subscription section
        $vendor_subscription_section = ElementFactory::section( 'vendor_subscription' )
                                                    ->add(
                                                        ElementFactory::field( 'vendor_subscription', 'switch' )
                                                                        ->set_title( __( 'Vendor Subscription', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Allow vendors to purchase subscription packages to sell products in your marketplace', 'dokan-lite' ) )
                                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                        ->set_default( 'on' )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'subscription_view_page', 'select' )
                                                                        ->set_title( __( 'Subscription View Page', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Select the page where vendors can view and purchase available subscription plans.', 'dokan-lite' ) )
                                                                        ->set_placeholder( __( 'Sample Page', 'dokan-lite' ) )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'subscription_in_registration', 'switch' )
                                                                        ->set_title( __( 'Subscription in Registration Form', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Enable subscription pack in registration form for new vendor.', 'dokan-lite' ) )
                                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                        ->set_default( 'off' )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'email_notification_expiry', 'switch' )
                                                                        ->set_title( __( 'Email Notification for Expiry Alerts', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Send automatic email reminders to vendors before their subscription expires.', 'dokan-lite' ) )
                                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                        ->set_default( 'on' )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'alert_days_before_expiry', 'number' )
                                                                        ->set_title( __( 'Alert Days Before Expiry', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Number of days before subscription expires to send the reminder email.', 'dokan-lite' ) )
                                                                        ->set_placeholder( '10' )
                                                                        ->set_postfix( __( 'Days', 'dokan-lite' ) )
                                                                        ->set_default( 10 )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'products_status_on_expiry', 'radio_capsule' )
                                                                        ->set_title( __( 'Products Status on Expiry', 'dokan-lite' ) )
                                                                        ->set_description( __( 'What happens to vendor\'s products when their subscription expires', 'dokan-lite' ) )
                                                                        ->add_option( esc_html__( 'Draft', 'dokan-lite' ), 'draft' )
                                                                        ->add_option( esc_html__( 'Published', 'dokan-lite' ), 'published' )
                                                                        ->add_option( esc_html__( 'Pending Review', 'dokan-lite' ), 'pending_review' )
                                                                        ->set_default( 'draft' )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'cancelling_email_subject', 'textarea' )
                                                                        ->set_title( __( 'Cancelling Email Subject', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Enter subject text for canceled subscriptions email notification.', 'dokan-lite' ) )
                                                                        ->set_placeholder( __( 'Subscription Package Cancel notification.', 'dokan-lite' ) )
                                                                        ->set_default( __( 'Subscription Package Cancel notification.', 'dokan-lite' ) )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'cancelling_email_body', 'textarea' )
                                                                        ->set_title( __( 'Cancelling Email Body', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Enter body text for canceled subscriptions email notification.', 'dokan-lite' ) )
                                                                        ->set_placeholder( __( 'Dear subscriber, Your subscription has expired. Please renew your package to continue using it.', 'dokan-lite' ) )
                                                                        ->set_default( __( 'Dear subscriber, Your subscription has expired. Please renew your package to continue using it.', 'dokan-lite' ) )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'alert_email_subject', 'textarea' )
                                                                        ->set_title( __( 'Alert Email Subject', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Enter subject text for package end notification alert email', 'dokan-lite' ) )
                                                                        ->set_placeholder( __( 'Subscription Ending Soon', 'dokan-lite' ) )
                                                                        ->set_default( __( 'Subscription Ending Soon', 'dokan-lite' ) )
                                                    )
                                                    ->add(
                                                        ElementFactory::field( 'alert_email_body', 'textarea' )
                                                                        ->set_title( __( 'Alert Email body', 'dokan-lite' ) )
                                                                        ->set_description( __( 'Enter body text for package end notification alert email.', 'dokan-lite' ) )
                                                                        ->set_placeholder( __( 'Dear subscriber, Your subscription will be ending soon. Please renew your package in a timely manner for continued usage.', 'dokan-lite' ) )
                                                                        ->set_default( __( 'Dear subscriber, Your subscription will be ending soon. Please renew your package in a timely manner for continued usage.', 'dokan-lite' ) )
                                                    );

        // Add section to vendor subscription page
        $vendor_subscription_page->add( $vendor_subscription_section );

        // Single Product Multi-Vendor section
        $single_product_multi_vendor_section = ElementFactory::section( 'single_product_multi_vendor' )
                                                            ->add(
                                                                ElementFactory::field( 'single_product_multiple_vendor', 'switch' )
                                                                                ->set_title( __( 'Single Product Multiple Vendor', 'dokan-lite' ) )
                                                                                ->set_description( __( 'Enable Single Product Multiple Vendor functionality.', 'dokan-lite' ) )
                                                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                                                ->set_default( 'on' )
                                                            )
                                                            ->add(
                                                                ElementFactory::field( 'sell_item_button_text', 'text' )
                                                                                ->set_title( __( 'Sell Item Button Text', 'dokan-lite' ) )
                                                                                ->set_description( __( 'Change your sell this item button text.', 'dokan-lite' ) )
                                                                                ->set_placeholder( __( 'Sell This Item', 'dokan-lite' ) )
                                                                                ->set_default( __( 'Sell This Item', 'dokan-lite' ) )
                                                            )
                                                            ->add(
                                                                ElementFactory::field( 'available_vendor_display_area_title', 'text' )
                                                                                ->set_title( __( 'Available Vendor Display Area Title', 'dokan-lite' ) )
                                                                                ->set_description( __( 'Set your heading for available vendor section in single product page.', 'dokan-lite' ) )
                                                                                ->set_placeholder( __( 'Other Available Vendor', 'dokan-lite' ) )
                                                                                ->set_default( __( 'Other Available Vendor', 'dokan-lite' ) )
                                                            )
                                                            ->add(
                                                                ElementFactory::field( 'available_vendor_section_display_position', 'customize_radio' )
                                                                                ->set_title( __( 'Available Vendor Section Display Position', 'dokan-lite' ) )
                                                                                ->set_description( __( 'Control where customers see the list of available vendors when viewing products sold by multiple vendors.', 'dokan-lite' ) )
                                                                                ->add_enhanced_option(
                                                                                    [
                                                                                        'title'       => __( 'Top of Product Tab', 'dokan-lite' ),
                                                                                        'value'       => 'top_of_product_tab',
                                                                                        'description' => __( 'Display the available vendor section at the top of the product tab.', 'dokan-lite' ),
                                                                                        'image'       => plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/spmv/top-product-tab.svg',
                                                                                    ]
                                                                                )
                                                                                ->add_enhanced_option(
                                                                                    [
                                                                                        'title'       => __( 'Inside Product Tab', 'dokan-lite' ),
                                                                                        'value'       => 'inside_product_tab',
                                                                                        'description' => __( 'Display the available vendor section inside the product tab.', 'dokan-lite' ),
                                                                                        'image'       => plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/spmv/inside-product-tab.svg',
                                                                                    ]
                                                                                )
                                                                                ->add_enhanced_option(
                                                                                    [
                                                                                        'title'       => __( 'Bottom of Product Tab', 'dokan-lite' ),
                                                                                        'value'       => 'bottom_of_product_tab',
                                                                                        'description' => __( 'Display the available vendor section at the bottom of the product tab.', 'dokan-lite' ),
                                                                                        'image'       => plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/spmv/bottom-product-tab.svg',
                                                                                    ]
                                                                                )
                                                                                ->set_default( 'top_of_product_tab' )
                                                                                ->set_variant( 'card' )
                                                            )
                                                            ->add(
                                                                ElementFactory::field( 'spmv_products_display', 'select' )
                                                                                ->set_title( __( 'SPMV Products Display', 'dokan-lite' ) )
                                                                                ->set_description( __( 'Select option for shown products under SPMV concept. "Show all products" will show all duplicate products.', 'dokan-lite' ) )
                                                                                ->set_placeholder( __( 'Show all products', 'dokan-lite' ) )
                                                            );

        // Add section to single product multi vendor page
        $single_product_multi_vendor_page->add( $single_product_multi_vendor_section );

        // Store state sub-page
        $store_state_page->add(
            ElementFactory::section( 'vendor_state' )
        );

        $this
            ->set_title( __( 'Vendor', 'dokan-lite' ) )
            ->set_description( __( 'Configure vendor-related settings and capabilities.', 'dokan-lite' ) )
            ->set_icon( 'Users' )
            ->add( $vendor_onboarding )
            ->add( $social_onboarding_page )
            ->add( $vendor_capabilities_page )
            ->add( $vendor_subscription_page )
            ->add( $single_product_multi_vendor_page )
            ->add( $store_state_page );
    }
}
