<?php


namespace WeDevs\Dokan\Admin;

/**
 * Class NoticeHandler
 * @package WeDevs\Dokan\Admin
 */
class NoticeHandler {
    /**
     * Option key for limited time notice
     *
     * @var string
     */
    public $promo_option_key = '_dokan_limited_time_promo';

    /**
     * NoticeHandler constructor
     */
    public function __construct() {
        add_action( 'admin_notices', [ $this, 'show_promotions' ] );
        add_action( 'wp_ajax_dokan_dismiss_limited_time_promotional_notice', [ $this, 'dismiss_limited_time_promo' ] );
    }

    /**
     * Shows promotions
     */
    public function show_promotions() {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        $notices = apply_filters(
            'dokan_all_notices',
            [
				[
					'pro'         => true,
					'key'         => 'dokan-withdraw-promo',
					'thumbnail'   => DOKAN_PLUGIN_ASSEST . '/images/withdraw-request-promo.svg',
					'start_date'  => '2021-01-10 09:00:00 EST',
					'end_date'    => '2021-03-28 23:59:00 EST',
					'title'       => '<p>You’ve received <span>at least 5 Vendor</span> Withdrawal Requests already!</p><p>Want to get the full breakdown of your earnings?</p><p>Upgrade to Dokan Pro at <span>30% off</span> today!</p>',
					'body'        => '<p>Use this code at checkout:</p><span>dokanpro30</span>',
					'link'        => 'https://wedevs.com/dokan/pricing?utm_medium=wordpress-dashboard&utm_source=upgrade-to-pro',
					'button_text' => 'Get Now',
				],
			]
        );

        if ( empty( $notices ) ) {
            return;
        }

        $current_time_est = $this->get_current_time_est();
        $selected_notices = [];

        $already_displayed_promo = get_option( $this->promo_option_key, [] );

        foreach ( $notices as $ntc ) {
            if ( in_array( $ntc['key'], $already_displayed_promo, true ) || ( ! $ntc['pro'] && dokan()->is_pro_exists() ) ) {
                continue;
            }

            // Temporary condition for withdraw request promo
            $withdraw_count = dokan()->withdraw->get_total_withdraw_count();
            if ( $withdraw_count <= 4 ) {
                continue;
            }

            if ( strtotime( $ntc['start_date'] ) < strtotime( $current_time_est ) && strtotime( $current_time_est ) < strtotime( $ntc['end_date'] ) ) {
                $selected_notices[] = $ntc;
            }
        }

        if ( empty( $selected_notices ) ) {
            return;
        }

        dokan_get_template_part(
            'notices/dokan-notice', '', [
				'selected_notices' => $selected_notices,
			]
        );
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


    /**
     * Gets current time and converts to EST timezone.
     * @return string
     */
    private function get_current_time_est() {
        $dt = new \DateTime( 'now', new \DateTimeZone( 'UTC' ) );
        $dt->setTimezone( new \DateTimeZone( 'EST' ) );

        return $dt->format( 'Y-m-d H:i:s T' );
    }
}
