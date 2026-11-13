<?php

namespace WeDevs\Dokan\CJDropshipping\Admin;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Points;
use WeDevs\Dokan\CJDropshipping\Api\TokenManager;
use WeDevs\Dokan\CJDropshipping\Connection;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Warns the admin about the CJ account: suspension, reconnect, low points (F2, F3).
 *
 * @since DOKAN_SINCE
 */
class Monitor implements Hookable {

    public const DAILY_HOOK = 'dokan_cj_daily_maintenance';

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_admin_notices', [ $this, 'add_notices' ] );
        add_action( 'dokan_cj_suspended', [ $this, 'email_suspended' ] );
        add_action( self::DAILY_HOOK, [ $this, 'run_daily' ] );
        add_action( 'admin_post_dokan_cj_recheck', [ $this, 'handle_recheck' ] );
        add_action( 'init', [ $this, 'schedule_daily' ], 20 );
    }

    /**
     * Keep the daily maintenance job scheduled while CJ is set up.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function schedule_daily(): void {
        if ( ! Settings::is_enabled() || Status::DISCONNECTED === Status::get_state() || ! function_exists( 'WC' ) ) {
            return;
        }

        Queue::ensure_recurring( self::DAILY_HOOK, DAY_IN_SECONDS );
    }

    /**
     * Refresh the token early and send the suspension warning once (F3).
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function run_daily(): void {
        if ( Status::is_connected() ) {
            try {
                ( new TokenManager() )->access_token();
            } catch ( ApiException $e ) {
                dokan_log( '[CJ Dropshipping] Daily token check failed: ' . $e->getMessage(), 'error' );
            }
        }

        $raw = Status::raw();

        if ( Status::is_suspension_near() && (int) ( $raw['warned_for'] ?? 0 ) !== (int) ( $raw['active_since'] ?? 0 ) ) {
            $this->email_admin(
                __( 'CJ will soon pause your marketplace\'s CJ connection', 'dokan-lite' ),
                sprintf(
                    /* translators: 1: days since the account was last active, 2: CJ reactivation link */
                    __( 'Your marketplace CJ account has had no CJ purchases for %1$d days. CJ pauses API access after 30 days, and then vendors can\'t import, sync or get CJ shipping prices. To avoid it, place an order on that CJ account, or reactivate API access when it pauses: %2$s', 'dokan-lite' ),
                    Status::days_active(),
                    Connection::REACTIVATE_URL
                )
            );

            update_option( Status::OPTION, array_merge( $raw, [ 'warned_for' => (int) ( $raw['active_since'] ?? 0 ) ] ), false );
        }
    }

    /**
     * Email the admin when CJ suspends the account.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function email_suspended(): void {
        $this->email_admin(
            __( 'CJ has paused your marketplace\'s CJ connection', 'dokan-lite' ),
            sprintf(
                /* translators: %s: CJ reactivation link */
                __( 'CJ paused API access for your marketplace CJ account because it had no CJ purchases for 30 days. Vendors can\'t import or sync CJ products, and new checkouts use the last saved shipping prices for up to 24 hours. Log in to that CJ account and reactivate API access here: %s. Then click "I reactivated it" in Dokan > Settings > CJ Dropshipping.', 'dokan-lite' ),
                Connection::REACTIVATE_URL
            )
        );
    }

    /**
     * Admin notices for the CJ connection.
     *
     * @since DOKAN_SINCE
     *
     * @param array $notices Notices.
     *
     * @return array
     */
    public function add_notices( $notices ): array {
        $notices = (array) $notices;

        if ( ! Settings::is_enabled() || ! current_user_can( 'manage_woocommerce' ) ) {
            return $notices;
        }

        $state       = Status::get_state();
        $recheck_url = add_query_arg(
            [
                'action'   => 'dokan_cj_recheck',
                '_wpnonce' => wp_create_nonce( 'dokan_cj_recheck' ),
            ],
            admin_url( 'admin-post.php' )
        );

        if ( Status::SUSPENDED === $state ) {
            $notices[] = [
                'type'        => 'alert',
                'scope'       => 'global',
                'priority'    => 1,
                'title'       => __( 'CJ has paused your marketplace\'s CJ connection', 'dokan-lite' ),
                'description' => __( 'CJ pauses API access after 30 days without a purchase on the account. Vendors can\'t import or sync CJ products until you reactivate it on CJ.', 'dokan-lite' ),
                'actions'     => [
                    [
                        'type'   => 'primary',
                        'text'   => __( 'Reactivate on CJ', 'dokan-lite' ),
                        'action' => Connection::REACTIVATE_URL,
                        'target' => '_blank',
                    ],
                    [
                        'type'   => 'secondary',
                        'text'   => __( 'I reactivated it', 'dokan-lite' ),
                        'action' => $recheck_url,
                    ],
                ],
            ];
        } elseif ( Status::NEEDS_RECONNECT === $state ) {
            $notices[] = [
                'type'        => 'alert',
                'scope'       => 'global',
                'priority'    => 1,
                'title'       => __( 'Reconnect your CJ account', 'dokan-lite' ),
                'description' => __( 'The saved CJ API key no longer works, so CJ Dropshipping has stopped. Paste the key again in the CJ Dropshipping settings.', 'dokan-lite' ),
                'actions'     => [
                    [
                        'type'   => 'primary',
                        'text'   => __( 'Open CJ settings', 'dokan-lite' ),
                        'action' => self::settings_url(),
                    ],
                ],
            ];
        } elseif ( Status::is_suspension_near() ) {
            $notices[] = [
                'type'        => 'warning',
                'priority'    => 5,
                'title'       => __( 'CJ will soon pause your CJ connection', 'dokan-lite' ),
                'description' => sprintf(
                    /* translators: %d: days without a CJ purchase */
                    __( 'Your marketplace CJ account has had no purchase for %d days. CJ pauses API access after 30 days. Place an order on that account, or reactivate API access on CJ when it pauses.', 'dokan-lite' ),
                    Status::days_active()
                ),
                'actions'     => [
                    [
                        'type'   => 'primary',
                        'text'   => __( 'Open CJ', 'dokan-lite' ),
                        'action' => Connection::REACTIVATE_URL,
                        'target' => '_blank',
                    ],
                ],
            ];
        } elseif ( Status::is_connected() && Points::is_low() ) {
            $notices[] = [
                'type'        => 'warning',
                'priority'    => 6,
                'title'       => __( 'CJ points are running low today', 'dokan-lite' ),
                'description' => __( 'The marketplace has used most of today\'s CJ points. Checkout shipping prices come first; imports and syncing wait until CJ tops the points up.', 'dokan-lite' ),
            ];
        }

        return $notices;
    }

    /**
     * Recheck the account after the admin reactivated it on CJ.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function handle_recheck(): void {
        check_admin_referer( 'dokan_cj_recheck' );

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( esc_html__( 'You are not allowed to do this.', 'dokan-lite' ), 403 );
        }

        try {
            ( new Connection() )->check();
        } catch ( ApiException $e ) {
            dokan_log( '[CJ Dropshipping] Recheck failed: ' . $e->getMessage(), 'error' );
        }

        wp_safe_redirect( wp_get_referer() ? wp_get_referer() : self::settings_url() );
        exit;
    }

    /**
     * CJ settings page in the admin.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function settings_url(): string {
        return admin_url( 'admin.php?page=dokan-dashboard#/settings?page=product&subpage=cj_dropshipping' );
    }

    /**
     * Send a plain email to the site admin in WooCommerce's template.
     *
     * @since DOKAN_SINCE
     *
     * @param string $subject Subject and heading.
     * @param string $message Body text.
     *
     * @return void
     */
    private function email_admin( string $subject, string $message ): void {
        if ( ! function_exists( 'WC' ) ) {
            return;
        }

        $mailer = WC()->mailer();

        $mailer->send( get_option( 'admin_email' ), $subject, $mailer->wrap_message( $subject, wpautop( make_clickable( esc_html( $message ) ) ) ) );
    }
}
