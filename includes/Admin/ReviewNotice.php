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
        $postpond_days = 15;
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
            <p class="dokan-notice-text"><?php _e( 'Enjoying <strong><a href="https://wordpress.org/plugins/dokan-lite/" target="_blank">Dokan multivendor</a></strong>? If our plugin is performing well for you, it would be great if you could kindly write a review about <strong><a href="https://wordpress.org/plugins/dokan-lite/" target="_blank">Dokan on WordPress.org</a></strong>. It would give us insights to grow and improve this plugin.', 'dokan' ); ?></p>
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
                padding-bottom: 8px;
                border-left: 4px solid #f1545d;
            }

            .dokan-review-notice .dokan-review-notice-logo {
                float: left;
                width: 86px;
                height: auto;
                padding: 10px 12px 0 0;
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
                top: 8px;
                right: 8px;
                cursor: pointer;
            }
        </style>

        <script type="text/javascript">
            ;(function($) {

                /**
                * Dokan ask for reveiw admin notice
                */
                let Dokan_ask_for_reveiw_notice = {
                    init : function () {
                        $( '.dokan-review-notice .dokan-notice-action' ).on( 'click', function( e ) {
                            // Prevent default action
                            if ( 'a' !== e.target.tagName.toLowerCase() ) {
                                e.preventDefault();
                            }

                            let self = $( this );
                            let key  = self.data( 'key' );

                            wp.ajax.send( 'ask_for_review_admin_notice', {
                                data: {
                                    dokan_ask_for_review_notice_action: true,
                                    key: key,
                                    nonce: '<?php echo esc_attr( wp_create_nonce( 'dokan_admin' ) ); ?>',
                                },
                                complete: function ( response ) {
                                    self.closest( '.dokan-notice' ).fadeOut( 200 );
                                }
                            } );

                        });
                    }
                }

                Dokan_ask_for_reveiw_notice.init();

            })(jQuery);
        </script>
        <?php
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
        if ( 'dokan-notice-dismiss' === $_POST['key'] ) {
            // $updated[] = update_option( 'dokan_review_notice_enable', 0 );
            $result = update_option( 'dokan_review_notice_enable', 0 );
            $status = $result ? true : false;
        }

        if ( 'dokan-notice-postpond' === $_POST['key'] && $status === false ) {
            $result = update_option( 'dokan_review_notice_enable', 1 );
            $status = $result && $status !== false ? true : false;

            $result = update_option( 'dokan_review_notice_postpond', 1 );
            $status = $result && $status !== false ? true : false;

            $result = update_option( 'dokan_review_notice_postpond_time', strtotime( 'now' ) );
            $status = $result && $status !== false ? true : false;
        }

        if ( empty( $status ) ) {
            wp_send_json_error( __( 'Request failed', 'dokan' ) );
        }

        wp_send_json_success();
    }
}
