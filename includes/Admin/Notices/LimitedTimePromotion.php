<?php


namespace WeDevs\Dokan\Admin\Notices;

/**
 * Limited time promotion class
 *
 * For displaying limited time promotion in admin panel
 *
 * @since 3.0.14
 *
 * @package dokan
 */
class LimitedTimePromotion {

    /**
     * Option key for limited time promo
     *
     * @var string
     */
    public $promo_option_key = '_dokan_limited_time_promo';

    /**
     * LimitedTimePromotion constructor
     */
    public function __construct() {
        add_action( 'admin_notices', [ $this, 'render_promo_notices_html' ] );
        add_action( 'wp_ajax_dokan_dismiss_limited_time_promotional_notice', [ $this, 'dismiss_limited_time_promo' ] );
    }

    /**
     * Render promotional notices via vue.js
     *
     * @return void
     */
    public function render_promo_notices_html() {
        $notice = Helper::dokan_get_promo_notices();

        if ( empty( $notice ) ) {
            return;
        }

        dokan_get_template(
            'limited-time-promo-notice.php', [
                'notice' => $notice,
            ]
        );
    }

    /**
     * Dismisses limited time promo notice
     */
    public function dismiss_limited_time_promo() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['nonce'] ) ), 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan-lite' ) );
        }

        $key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';

        if ( ! empty( $key ) && ! empty( sanitize_text_field( wp_unslash( $_POST['dokan_limited_time_promotion_dismissed'] ) ) ) ) {
            $already_displayed_promo   = get_option( $this->promo_option_key, [] );
            $already_displayed_promo[] = $key;

            update_option( $this->promo_option_key, $already_displayed_promo );
            wp_send_json_success();
        }
    }
}

