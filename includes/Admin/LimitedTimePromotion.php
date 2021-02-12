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

        $notices = [
            [
                'pro'         => false,
                'key'         => 'dokan-withdraw-promo',
                'thumbnail'   => DOKAN_PLUGIN_ASSEST . '/images/withdraw-request-promo.svg',
                'start_date'  => '2021-01-10 09:00:00 EST',
                'end_date'    => '2021-03-28 23:59:00 EST',
                'title'       => "<p>You’ve received <span>at least 5 Vendor</span> Withdrawal Requests already!</p><p>Want to get the full breakdown of your earnings?</p><p>Upgrade to Dokan Pro at <span>30% off</span> today!</p>",
                'body'        => "<p>Use this code at checkout:</p><span>dokanpro30</span>",
                'link'        => 'https://wedevs.com/dokan/pricing?utm_medium=wordpress-dashboard&utm_source=upgrade-to-pro',
                'button_text' => 'Get Now'
            ],
        ];

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

        ?>

        <?php foreach( $selected_notices as $notice ): ?>
        <div class="notice dokan-notice dokan-limited-time-promotional-notice">
            <div class="content">
                <div class="thumbnail">
                    <img src="<?php echo $notice['thumbnail'] ?>" alt="thumbnail">
                </div>
                <div class="title">
                    <?php echo $notice['title'] ?>
                </div>
                <div class="body">
                    <?php echo $notice['body'] ?>
                </div>
                <a target="_blank" href="<?php echo $notice['link'] ?>"><?php echo esc_html( $notice['button_text'] ) ?></a>
            </div>
            <span class="prmotion-close-icon dashicons dashicons-no-alt" data-key="<?php echo esc_attr( $notice['key'] ); ?>"></span>
            <div class="clear"></div>
        </div>
        <?php endforeach; ?>

        <style>

            .dokan-notice {
                border: 0px;
            }

            .dokan-limited-time-promotional-notice {
                padding: 10px;
                position: relative;
                background-color: #4B0063;
            }

            .dokan-limited-time-promotional-notice .prmotion-close-icon {
                position: absolute;
                background: white;
                border-radius: 10px;
                top: 10px;
                right: 10px;
                cursor: pointer;
                padding-top: 0px;
            }

            .dokan-limited-time-promotional-notice .content {
                color: white;
                padding: 14px;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .dokan-limited-time-promotional-notice .content .thumbnail img{
                height: 100px;
            }

            .dokan-limited-time-promotional-notice .content .title {
                font-size: 18px;
                margin-left: 24px;
                margin-right: 48px;
            }

            .dokan-limited-time-promotional-notice .content .title span {
                font-weight: bolder;
            }

            .dokan-limited-time-promotional-notice .content .body p {
                font-size: 10px;
            }

            .dokan-limited-time-promotional-notice .content .body span {
                color: #FF6393;
                font-size: 28px;
            }

            .dokan-limited-time-promotional-notice .content a {
                margin-left: 48px;
                text-decoration: none;
                padding: 10px 20px;
                background-color: white;
                color: black;
                border-radius: 22px;
            }
        </style>

        <script type='text/javascript'>
            jQuery( document ).ready( function ( $ ) {
                $( 'body' ).on( 'click', '.dokan-limited-time-promotional-notice span.prmotion-close-icon', function ( e ) {
                    e.preventDefault();

                    var self = $( this ),
                        key = self.data( 'key' );

                    wp.ajax.send( 'dokan_dismiss_limited_time_promotional_notice', {
                        data: {
                            dokan_limited_time_promotion_dismissed: true,
                            key: key,
                            nonce: '<?php echo esc_attr( wp_create_nonce( 'dokan_admin' ) ); ?>'
                        },
                        complete: function ( resp ) {
                            self.closest( '.dokan-limited-time-promotional-notice' ).fadeOut( 200 );
                        }
                    } );
                } );
            } );
        </script>

        <?php
    }

    /**
     * Dismisses limited time promo notice
     */
    public function dismiss_limited_time_promo() {
        $post_data = wp_unslash( $_POST );

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan-lite' ) );
        }

        if ( ! isset( $post_data['nonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['nonce'] ), 'dokan_admin' ) ) {
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
