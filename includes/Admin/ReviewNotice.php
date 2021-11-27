<?php

namespace WeDevs\Dokan\Admin;

/**
 * Review notice class.
 *
 * For displaying asking for review notice in admin panel.
 *
 * @since 3.3.1
 *
 * @package dokan
 */
class ReviewNotice {

    /**
     * ReviewNotice constructor.
     *
     * @since 3.3.1
     */
    public function __construct() {
        add_action( 'admin_notices', [ $this, 'show_ask_for_review_notice' ], 0, 1 );
        add_action( 'wp_ajax_dokan_ask_for_review_notice_action', [ $this, 'review_notice_action_ajax_handler' ] );
    }

    /**
     * Show ask for review notice.
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function show_ask_for_review_notice() {
        global $pagenow;

        // Pages to exclude the notice.
        $exclude = apply_filters( 'dokan_ask_for_review_admin_notice_exclude_pages', [ 'users.php', 'tools.php', 'options-general.php', 'options-writing.php', 'options-reading.php', 'options-discussion.php', 'options-media.php', 'options-permalink.php', 'options-privacy.php', 'edit-comments.php', 'upload.php', 'media-new.php', 'import.php', 'export.php', 'site-health.php', 'export-personal-data.php', 'erase-personal-data.php' ] );

        if ( in_array( $pagenow, $exclude, true ) ) {
            return;
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        // Check if notice was hidden.
        if ( 'yes' === get_option( 'dokan_review_notice_hidden', 'no' ) ) {
            return;
        }

        // Check if notice postponed.
        $notice_postponed = get_option( 'dokan_review_notice_postponed' );

        if ( ! empty( $notice_postponed ) && $notice_postponed > time() ) {
            return;
        }

        // Check if plugin install time exists.
        $installed_time = get_option( 'dokan_installed_time' );

        if ( ! empty( $installed_time ) ) {
            $initial_delay_days = apply_filters( 'dokan_ask_for_review_admin_notice_initial_delay_days', 10 );
            $eligible_time      = dokan_current_datetime()->modify( "+$initial_delay_days  days" );

            if ( $eligible_time->getTimestamp() < time() ) {
                return;
            }
        }

        // All checking passed, display admin notice.
        dokan_get_template( 'admin-notice/ask-for-review.php' );
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
