<?php

namespace WeDevs\Dokan\Admin\Notices;

/**
 * Setup wizard notice handler class
 *
 * @since 3.3.3
 */
class SetupWizard {
    /**
     * Class constructor
     *
     * @since 3.3.3
     */
    public function __construct() {
        add_filter( 'dokan_admin_notices', [ $this, 'render_run_admin_setup_wizard_notice' ] );
        add_filter( 'wp_ajax_dokan_dismiss_admin_setup_wizard_notice', [ $this, 'dismiss_admin_setup_wizard_notice' ] );
    }

    /**
     * Render run admin setup wizard notice
     *
     * @since 2.9.27
     *
     * @param array $notices
     *
     * @return array
     */
    public function render_run_admin_setup_wizard_notice( $notices ) {
        $ran_wizard = get_option( 'dokan_admin_setup_wizard_ready', false );

        if ( $ran_wizard ) {
            return $notices;
        }

        // If vendor found, don't show the setup wizard as admin already ran the `setup wizard`
        // without the `dokan_admin_setup_wizard_ready` option.
        $vendor_count = dokan_get_seller_status_count();

        if ( ! empty( $vendor_count['active'] ) ) {
            update_option( 'dokan_admin_setup_wizard_ready', true );
            return $notices;
        }

        $notices[] = [
            'type'              => 'success',
            'description'       => __( '<strong>Welcome to Dokan</strong> &#8211; You&lsquo;re almost ready to start selling :)', 'dokan-lite' ),
            'priority'          => 2,
            'show_close_button' => true,
            'ajax_data'         => [
                'dismiss_dokan_admin_setup_wizard_notice' => true,
                'action'                                  => 'dokan_dismiss_admin_setup_wizard_notice',
                'nonce'                                   => wp_create_nonce( 'dokan_admin' ),
            ],
            'actions'           => [
                [
                    'type'   => 'primary',
                    'text'   => __( 'Run the Setup Wizard', 'dokan-lite' ),
                    'action' => admin_url( 'admin.php?page=dokan-setup' ),
                ],
            ],
        ];

        return $notices;
    }

    /**
     * Dismisses admin setup wizard notice
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function dismiss_admin_setup_wizard_notice() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['nonce'] ) ), 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan-lite' ) );
        }

        if ( ! empty( sanitize_text_field( wp_unslash( $_POST['dismiss_dokan_admin_setup_wizard_notice'] ) ) ) ) {
            update_option( 'dokan_admin_setup_wizard_ready', true );
            wp_send_json_success();
        }
    }
}
