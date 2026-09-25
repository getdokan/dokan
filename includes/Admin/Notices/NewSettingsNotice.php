<?php

namespace WeDevs\Dokan\Admin\Notices;

use WeDevs\Dokan\Admin\Dashboard\LegacySwitcher;

/**
 * Nudges admins on the classic settings screen toward the new settings.
 *
 * @since DOKAN_SINCE
 */
class NewSettingsNotice {

    /**
     * Notice scope, rendered only on the classic settings screen.
     *
     * @since DOKAN_SINCE
     */
    public const SCOPE = 'legacy_settings';

    /**
     * Transient set while the notice is postponed.
     *
     * @since DOKAN_SINCE
     */
    public const POSTPONED_TRANSIENT = 'dokan_new_settings_notice_postponed';

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_filter( 'dokan_admin_notices', [ $this, 'show_notice' ] );
        add_action( 'wp_ajax_dokan_new_settings_notice_postpone', [ $this, 'postpone_notice' ] );
    }

    /**
     * Add the new settings notice.
     *
     * @since DOKAN_SINCE
     *
     * @param array $notices
     *
     * @return array
     */
    public function show_notice( $notices ) {
        if ( ! current_user_can( dokan_admin_menu_capability() ) ) {
            return $notices;
        }

        // Nothing to nudge once the site is on the new settings.
        if ( ! dokan_get_container()->get( LegacySwitcher::class )->is_legacy_settings_page() ) {
            return $notices;
        }

        if ( get_transient( self::POSTPONED_TRANSIENT ) ) {
            return $notices;
        }

        $switch_url = add_query_arg(
            [
                'dokan_action'                => 'switch_admin_panel',
                'legacy_key'                  => 'settings',
                'switch_to'                   => 'new',
                'dokan_admin_switching_nonce' => wp_create_nonce( 'dokan_switch_admin_panel' ),
            ],
            admin_url( 'admin.php' )
        );

        $notices[] = [
            'type'        => 'info',
            'scope'       => self::SCOPE,
            'title'       => __( 'Meet the new Dokan settings', 'dokan-lite' ),
            'description' => esc_html__( 'Rebuilt to be faster, cleaner, and easier to navigate. Try it — switch back anytime with one click. Becomes default January 1, 2027; classic screen stays available.', 'dokan-lite' ),
            'priority'    => 1,
            'actions'     => [
                [
                    'type'   => 'primary',
                    'text'   => __( 'Try the new settings', 'dokan-lite' ),
                    'action' => esc_url_raw( $switch_url ),
                ],
                [
                    'type'      => 'secondary',
                    'text'      => __( 'Maybe later', 'dokan-lite' ),
                    'ajax_data' => [
                        'action' => 'dokan_new_settings_notice_postpone',
                        'nonce'  => wp_create_nonce( 'dokan_new_settings_notice_nonce' ),
                    ],
                ],
            ],
        ];

        return $notices;
    }

    /**
     * Hide the notice site-wide for a while.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function postpone_notice() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['nonce'] ) ), 'dokan_new_settings_notice_nonce' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        if ( ! current_user_can( dokan_admin_menu_capability() ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan-lite' ) );
        }

        /**
         * Filter the number of days the new settings notice stays hidden after "Maybe later".
         *
         * @since DOKAN_SINCE
         *
         * @param int $days Number of days.
         */
        $days = (int) apply_filters( 'dokan_new_settings_notice_postponed_days', 20 );

        set_transient( self::POSTPONED_TRANSIENT, 'yes', $days * DAY_IN_SECONDS );

        wp_send_json_success();
    }
}
