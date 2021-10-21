<?php

namespace WeDevs\Dokan\Admin;

/**
 * Review notice class
 *
 * For displaying asking for review notice in admin panel
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package dokan
 */
class ReviewNotice {

    /**
     * ReviewNotice constructor
     */
    public function __construct() {
        add_action( 'admin_notices', [ $this, 'show_ask_for_review_notice' ], 0, 1 );
        add_action( 'wp_ajax_ask_for_review_admin_notice', [ $this, 'review_notice_action_handler' ] );
    }

    /**
     * Show ask for review notice
     *
     * @return void
     */
    public function show_ask_for_review_notice() {
        global $pagenow;

        $exclude = apply_filters( 'dokan_ask_for_review_admin_notice_exclude_pages', [ 'users.php', 'tools.php', 'options-general.php', 'options-writing.php', 'options-reading.php', 'options-discussion.php', 'options-media.php', 'options-permalink.php', 'options-privacy.php', 'edit-comments.php', 'upload.php', 'media-new.php', 'import.php', 'export.php', 'site-health.php', 'export-personal-data.php', 'erase-personal-data.php' ] );

        if ( in_array( $pagenow, $exclude ) ) {
            return;
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        if ( empty( get_option( 'dokan_review_notice_enable', 1 ) ) ) {
            return;
        }

        $current_time  = time();
        $install_time  = get_option( 'dokan_installed_time' );
        $eligible_time = strtotime( '10 days', $install_time );
        $postpond_days = apply_filters( 'dokan_ask_for_review_admin_notice_postpond_days', 15 );
        $postpond_time = get_option( 'dokan_review_notice_postpond_time', 0 );

        if ( ! empty( get_option( 'dokan_review_notice_postpond' ) ) ) {
            $eligible_time = strtotime( $postpond_days . ' days', $postpond_time );
        }

        if ( $eligible_time >= $current_time ) {
            return;
        }

        dokan_get_template( 'admin-notice/ask-for-review.php' );
    }

    /**
     * Reveiw notice action ajax handler
     *
     * @return void
     */
    public function review_notice_action_handler() {
        if ( ! wp_verify_nonce( $_POST['nonce'], 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan' ) );
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan' ) );
        }

        if ( empty( $_POST['dokan_ask_for_review_notice_action'] ) || empty( $_POST['key'] ) ) {
            wp_send_json_error( __( 'Invalid request', 'dokan' ) );
        }

        $status = false;
        if ( 'dokan-notice-dismiss' === wp_unslash( $_POST['key'] ) ) {
            $result = update_option( 'dokan_review_notice_enable', 0 );
            $status = $result ? true : false;

            delete_option( 'dokan_review_notice_postpond' );
            delete_option( 'dokan_review_notice_postpond_time' );
        }

        if ( 'dokan-notice-postpond' === wp_unslash( $_POST['key'] ) && $status === false ) {
            $result = update_option( 'dokan_review_notice_enable', 1 );
            $status = $result && $status !== false ? true : false;

            $result = update_option( 'dokan_review_notice_postpond', 1 );
            $status = $result && $status !== false ? true : false;

            $result = update_option( 'dokan_review_notice_postpond_time', time() );
            $status = $result && $status !== false ? true : false;
        }

        if ( empty( $status ) ) {
            wp_send_json_error( __( 'Request failed', 'dokan' ) );
        }

        wp_send_json_success();
    }
}
