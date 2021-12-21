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
        add_action( 'admin_notices', [ $this, 'render_promo_notices_html' ], 8 );
        add_action( 'admin_notices', [ $this, 'enqueue_promo_notices_scripts' ] );
        add_action( 'wp_ajax_dokan_dismiss_limited_time_promotional_notice', [ $this, 'dismiss_limited_time_promo' ] );
    }

    /**
     * Render promotional notices via vue.js
     *
     * @return void
     */
    public function render_promo_notices_html() {
        echo '<div id="dokan-promo-notices"></div>';
    }

    /**
     * Enqueue dokan promo notices scripts
     *
     * @since 3.3.5
     *
     * @return void
     */
    public function enqueue_promo_notices_scripts() {
        wp_enqueue_script( 'dokan-promo-notice-js' );
        wp_localize_script( 'dokan-vue-vendor', 'dokan', dokan()->scripts->get_admin_localized_scripts() );
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

