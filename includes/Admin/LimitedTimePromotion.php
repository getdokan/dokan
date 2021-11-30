<?php


namespace WeDevs\Dokan\Admin;

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
        add_filter( 'admin_notices', [ $this, 'show_promotions' ] );
        add_action( 'wp_ajax_dokan_dismiss_limited_time_promotional_notice', [ $this, 'dismiss_limited_time_promo' ] );
    }

    /**
     * Shows promotions
     *
     * @return void
     */
    public function show_promotions() {
        echo '<div id="dokan-promo-notices"></div>';
    }

    /**
     * Dismisses limited time promo notice
     */
    public function dismiss_limited_time_promo() {
        $post_data = wp_unslash( $_POST );

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan-lite' ) );
        }

        if ( ! wp_verify_nonce( $post_data['nonce'], 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        if ( isset( $post_data['dokan_limited_time_promotion_dismissed'] ) && $post_data['dokan_limited_time_promotion_dismissed'] ) {
            $already_displayed_promo   = get_option( $this->promo_option_key, [] );
            $already_displayed_promo[] = $post_data['key'];

            update_option( $this->promo_option_key, $already_displayed_promo );
            wp_send_json_success();
        }
    }
}

