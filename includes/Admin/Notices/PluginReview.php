<?php

namespace WeDevs\Dokan\Admin\Notices;

/**
 * Review notice class.
 *
 * For displaying asking for review notice in admin panel.
 *
 * @since 3.3.1
 *
 * @package dokan
 */
class PluginReview {

    /**
     * ReviewNotice constructor.
     *
     * @since 3.3.1
     */
    public function __construct() {
        add_filter( 'dokan_admin_notices', [ $this, 'show_ask_for_review_notice' ] );
        add_action( 'wp_ajax_dokan_ask_for_review_notice_action', [ $this, 'review_notice_action_ajax_handler' ] );
    }

    /**
     * Show ask for review notice.
     *
     * @since 3.3.1
     *
     * @param array $notices
     *
     * @return array
     */
    public function show_ask_for_review_notice( $notices ) {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return $notices;
        }

        // Check if notice was hidden.
        if ( 'yes' === get_option( 'dokan_review_notice_hidden', 'no' ) ) {
            return $notices;
        }

        // Check if notice postponed.
        $notice_postponed = get_option( 'dokan_review_notice_postponed' );

        if ( ! empty( $notice_postponed ) && $notice_postponed > time() ) {
            return $notices;
        }

        // Check if plugin install time exists.
        $installed_time = get_option( 'dokan_installed_time' );

        if ( ! empty( $installed_time ) ) {
            $initial_delay_days = apply_filters( 'dokan_ask_for_review_admin_notice_initial_delay_days', 10 );
            $eligible_time      = dokan_current_datetime()->modify( "+$initial_delay_days  days" );

            if ( $eligible_time->getTimestamp() < time() ) {
                return $notices;
            }
        }

        $notices[] = [
            'type'              => 'info',
            'title'             => __( 'Enjoying Dokan Multivendor Marketplace?', 'dokan-lite' ),
            'description'       => __( 'If our plugin is performing well for you, it would be great if you could kindly write a review about <strong>Dokan</strong> on <strong>WordPress.org</strong>. It would give us insights to grow and improve this plugin.', 'dokan-lite' ),
            'priority'          => 3,
            'show_close_button' => true,
            'ajax_data'         => [
                'key'    => 'dokan-notice-dismiss',
                'action' => 'dokan_ask_for_review_notice_action',
                'nonce'  => wp_create_nonce( 'dokan_admin_review_notice_nonce' ),
            ],
            'actions'           => [
                [
                    'type'   => 'primary',
                    'text'   => __( 'Yes, You Deserve It', 'dokan-lite' ),
                    'action' => esc_url( 'https://wordpress.org/support/plugin/dokan-lite/reviews/?filter=5#new-post' ),
                    'target' => '_blank',
                ],
                [
                    'type'      => 'secondary',
                    'text'      => __( 'Maybe Later', 'dokan-lite' ),
                    'ajax_data' => [
                        'key'    => 'dokan-notice-postponed',
                        'action' => 'dokan_ask_for_review_notice_action',
                        'nonce'  => wp_create_nonce( 'dokan_admin_review_notice_nonce' ),
                    ],
                ],
                [
                    'type'      => 'secondary',
                    'text'      => __( 'I\'ve Added My Review', 'dokan-lite' ),
                    'ajax_data' => [
                        'key'    => 'dokan-notice-dismiss',
                        'action' => 'dokan_ask_for_review_notice_action',
                        'nonce'  => wp_create_nonce( 'dokan_admin_review_notice_nonce' ),
                    ],
                ],
            ],
        ];

        return $notices;
    }

    /**
     * Reveiw notice action ajax handler.
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function review_notice_action_ajax_handler() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['nonce'] ) ), 'dokan_admin_review_notice_nonce' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan-lite' ) );
        }

        // Check if the notice action key is valid.
        $key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
        if ( empty( $key ) || ! in_array( $key, [ 'dokan-notice-postponed', 'dokan-notice-dismiss' ], true ) ) {
            wp_send_json_error( __( 'Invalid request', 'dokan-lite' ) );
        }

        // Dismiss the notice.
        if ( 'dokan-notice-dismiss' === $key ) {
            update_option( 'dokan_review_notice_hidden', 'yes' );
            delete_option( 'dokan_review_notice_postponed' );

            wp_send_json_success();
        }

        // Postponed the notice.
        if ( 'dokan-notice-postponed' === $key ) {
            $postponed_days = apply_filters( 'dokan_ask_for_review_admin_notice_postponed_days', 15 );
            $postponed      = dokan_current_datetime()->modify( "+$postponed_days days" )->getTimestamp();

            update_option( 'dokan_review_notice_postponed', $postponed );

            wp_send_json_success();
        }

        // Send error in case of request filed.
        wp_send_json_error( __( 'Request failed', 'dokan-lite' ) );
    }
}
