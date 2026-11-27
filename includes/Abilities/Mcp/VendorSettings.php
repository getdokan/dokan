<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Contracts\Hookable;
use WP_User;

defined( 'ABSPATH' ) || exit;

/**
 * Gives a Vendor a place to create the application password their AI assistant signs in with.
 *
 * WordPress offers that on the profile screen in wp-admin, where Vendors are not admitted. The
 * tab's field talks to WordPress's own application-password REST route, so WordPress decides
 * who may create, list and revoke one; Dokan stores nothing and never sees a password.
 *
 * @since DOKAN_SINCE
 */
class VendorSettings implements Hookable {

    /**
     * Tab id on the Store settings page.
     */
    const TAB = 'tab_ai_assistant';

    /**
     * Section (card) id beneath the tab.
     */
    const SECTION = 'ai_assistant';

    /**
     * Field id of the server URL the assistant connects to.
     */
    const FIELD_ENDPOINT = 'ai_assistant_server_url';

    /**
     * Field id of the application passwords control.
     */
    const FIELD = 'ai_assistant_app_passwords';

    /**
     * Field variant the React page renders the control with.
     */
    const VARIANT = 'vendor_app_passwords';

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_get_vendor_settings_schema', [ $this, 'add_tab' ], 30 );
    }

    /**
     * Add the tab for an account that may connect an assistant.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat schema elements.
     *
     * @return array
     */
    public function add_tab( $elements ) {
        // The password belongs to whoever is signed in: Vendor Staff create their own, never their Vendor's.
        $user = wp_get_current_user();

        if ( ! is_array( $elements ) || ! $user instanceof WP_User || ! self::is_offered( (int) $user->ID ) ) {
            return $elements;
        }

        $elements[] = [
            'id'         => self::TAB,
            'type'       => 'tab',
            'subpage_id' => 'store_settings',
            'title'      => __( 'AI Assistant', 'dokan-lite' ),
            // After Dokan's own tabs (Policies is 50), ahead of the tabs add-ons append from 60.
            'priority'   => 55,
        ];

        $elements[] = [
            'id'          => self::SECTION,
            'type'        => 'section',
            'subpage_id'  => 'store_settings',
            'tab_id'      => self::TAB,
            'title'       => __( 'Connect an AI Assistant', 'dokan-lite' ),
            'description' => __( 'Let an assistant such as Claude work with your products and orders. It signs in as you and can only manage your own store.', 'dokan-lite' ),
            'collapsible' => true,
            'priority'    => 10,
        ];

        $available = wp_is_application_passwords_available_for_user( $user );

        // Where the assistant connects. Nothing to save: it is read-only, so the Store save leaves it alone.
        if ( $available ) {
            $elements[] = [
                'id'          => self::FIELD_ENDPOINT,
                'type'        => 'field',
                'variant'     => 'copy_field',
                'section_id'  => self::SECTION,
                'title'       => __( 'Server URL', 'dokan-lite' ),
                'description' => __( 'Add this to your assistant as an HTTP MCP server.', 'dokan-lite' ),
                'layout'      => 'full-width',
                'non_meta'    => true,
                'value'       => Access::endpoint(),
            ];
        }

        $elements[] = [
            'id'               => self::FIELD,
            'type'             => 'field',
            'variant'          => self::VARIANT,
            'section_id'       => self::SECTION,
            'title'            => __( 'Application Passwords', 'dokan-lite' ),
            'description'      => __( 'An application password lets the assistant sign in without your real password. Create one for each assistant and copy its token right away: it cannot be shown again.', 'dokan-lite' ),
            // Nothing to save: WordPress keeps the passwords, so the Store save must leave this field alone.
            'non_meta'         => true,
            // The browser pairs it with a password it has just created to build the token; the password itself never comes back here.
            'username'         => $user->user_login,
            'available'        => $available,
            'unavailable_text' => $available ? '' : self::unavailable_text(),
        ];

        return $elements;
    }

    /**
     * Whether the tab is offered to a user: both switches are on, something serves the endpoint
     * and this account may connect. The tab follows "Allow vendors to connect" for whoever opens
     * the dashboard; a Store Admin creates their own application password on their profile.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User ID.
     *
     * @return bool
     */
    public static function is_offered( int $user_id ): bool {
        return Access::is_enabled()
            && Access::vendor_access_enabled()
            && Status::server_can_run()
            && Access::user_can_connect( $user_id );
    }

    /**
     * Why WordPress offers no application passwords here, in the Vendor's words.
     *
     * Dokan only reports the decision: it is WordPress's, or a security plugin's, to make.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected static function unavailable_text(): string {
        if ( wp_is_application_passwords_available() ) {
            return __( 'Application passwords are not available for your account. Please contact the store admin.', 'dokan-lite' );
        }

        if ( ! wp_is_application_passwords_supported() ) {
            return __( 'Application passwords need HTTPS, which is not enabled on this site. Please contact the store admin.', 'dokan-lite' );
        }

        return __( 'Application passwords are switched off on this site. Please contact the store admin.', 'dokan-lite' );
    }
}
