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
    }

    /**
     * Show ask for review notice
     *
     * @return void
     */
    public function show_ask_for_review_notice() {
        global $pagenow;

        $exclude = [ 'themes.php', 'users.php', 'tools.php', 'options-general.php', 'options-writing.php', 'options-reading.php', 'options-discussion.php', 'options-media.php', 'options-permalink.php', 'options-privacy.php', 'edit-comments.php', 'upload.php', 'media-new.php', 'admin.php', 'import.php', 'export.php', 'site-health.php', 'export-personal-data.php', 'erase-personal-data.php' ];

        if ( in_array( $pagenow, $exclude ) ) {
            return;
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        if ( empty( get_option( 'dokan_review_notice_enable', 1 ) ) ) {
            return;
        }

        $current_time  = strtotime( 'now' );
        $install_time  = get_option( 'dokan_installed_time' );
        $eligible_time = strtotime( '10 days', $install_time );
        $postpond_days = 7;
        $postpond_time = get_option( 'dokan_review_notice_postpond_time', 0 );

        if ( ! empty( get_option( 'dokan_review_notice_postpond' ) ) ) {
            $eligible_time = strtotime( $postpond_days . ' days', $postpond_time );
        }

        if ( $eligible_time >= $current_time ) {
            return;
        }

        ?>
        <div class="notice notice-warning dokan-notice dokan-review-notice">
            <div class="dokan-review-notice-logo">
                <img src="http://dokan-dev.test/wp-content/plugins/dokan-lite/assets/images/dokan-logo-small.svg" alt="Dokan Logo">
            </div>
            <p class="dokan-notice-text"><?php _e( 'Enjoying <a href="https://wordpress.org/plugins/dokan-lite/" target="_blank">Dokan multivendor</a>? If our plugin is performing well for you, it would be great if you could kindly write a review about <a href="https://wordpress.org/plugins/dokan-lite/" target="_blank">Dokan on WordPress.org</a>. It would give us insights to grow and improve this plugin.', 'dokan' ); ?></p>
            <div class="dokan-notice-buttons">
                <a class="button dokan-notice-btn dokan-notice-btn-primary dokan-notice-action" href="https://wordpress.org/support/plugin/dokan-lite/reviews/?filter=5" target="_blank"data-key="dokan-notice-postpond"><?php esc_html_e( 'Yes, You Deserve It', 'dokan' ); ?></a>
                <button class="button dokan-notice-btn dokan-notice-action" href="#"data-key="dokan-notice-postpond"><?php esc_html_e( 'Maybe Later', 'dokan' ); ?></button>
                <button class="button dokan-notice-btn dokan-notice-close dokan-notice-action" href="#" data-key="dokan-notice-dismiss"><?php esc_html_e( 'I’ve Added My Review', 'dokan' ); ?></button>
            </div>
            <span class="dokan-notice-close dokan-notice-action dashicons dashicons-no-alt" data-key="dokan-notice-dismiss"></span>
            <div class="clear"></div>
        </div>

        <style>
            .dokan-review-notice {
                position: relative;
                padding-right: 40px;
                padding-bottom: 12px;
                border-left: 4px solid #f1545d;
            }

            .dokan-review-notice .dokan-review-notice-logo {
                float: left;
                width: 84px;
                height: auto;
                padding: 10px 10px 0 0;
                box-sizing: border-box;
            }

            .dokan-review-notice .dokan-review-notice-logo img {
                max-width: 100%;
            }

            .dokan-review-notice .dokan-notice-btn {
                margin-right: 2px;
            }

            .dokan-review-notice .dokan-notice-btn-primary {
                color: #fff !important;
                background: #fb6e76 !important;
                border: 1px solid #fb6e76 !important;
            }

            .dokan-review-notice .dokan-notice-btn-primary:hover {
                background: #135e96 !important;
                border-color: #135e96 !important;
            }

            .dokan-review-notice span.dokan-notice-close{
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;
            }
        </style>
        <?php
    }
}
