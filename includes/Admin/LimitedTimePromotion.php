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
                'key'        => 'dokan-wedevs-eid-2021',
                'start_date' => '2021-05-11 00:09:00 EST',
                'end_date'   => '2021-05-24 23:00:00 EST',
                'title'      => "Eid Mubarak! Stay Safe & Spread Happiness.",
                'content'    => 'Enjoy Up To 50% OFF on Dokan Pro.',
                'link'       => 'https://wedevs.com/dokan/pricing?utm_medium=text&utm_source=wordpress-dokan-eidoffer2021',
            ],
        ];

        if ( empty( $notices ) ) {
            return;
        }

        $current_time_est = $this->get_current_time_est();
        $notice           = [];

        $already_displayed_promo = get_option( $this->promo_option_key, [] );

        foreach ( $notices as $ntc ) {
            if ( in_array( $ntc['key'], $already_displayed_promo, true ) ) {
                continue;
            }

            if ( strtotime( $ntc['start_date'] ) < strtotime( $current_time_est ) && strtotime( $current_time_est ) < strtotime( $ntc['end_date'] ) ) {
                $notice = $ntc;
            }
        }

        if ( empty( $notice ) ) {
            return;
        }

        ?>
        <div class="notice dokan-limited-time-promotional-notice">
            <div class="content">
                <h2><?php echo esc_html( $notice['title'] ); ?></h2>
                <p><?php echo esc_html( $notice['content'] ); ?></p>
                <a href="<?php echo esc_url( $notice['link'] ); ?>" class="button button-primary promo-btn" target="_blank"><?php echo esc_html__( 'Get Deals &rarr;', 'dokan-lite' ); ?></a>
            </div>
            <span class="prmotion-close-icon dashicons dashicons-no-alt" data-key="<?php echo esc_attr( $notice['key'] ); ?>"></span>
            <div class="clear"></div>
        </div>

        <style>
            .dokan-limited-time-promotional-notice {
                padding: 20px;
                box-sizing: border-box;
                position: relative;
            }

            .dokan-limited-time-promotional-notice .prmotion-close-icon {
                position: absolute;
                top: 20px;
                right: 20px;
                cursor: pointer;
            }

            .dokan-limited-time-promotional-notice .content {
                float: left;
                width: 75%;
            }

            .dokan-limited-time-promotional-notice .content h2 {
                margin: 3px 0px 5px;
                font-size: 17px;
                font-weight: bold;
                color: #555;
                line-height: 25px;
            }

            .dokan-limited-time-promotional-notice .content p {
                font-size: 14px;
                text-align: justify;
                color: #666;
                margin-bottom: 10px;
            }

            .dokan-limited-time-promotional-notice .content a {
                border: none;
                box-shadow: none;
                height: 31px;
                line-height: 30px;
                border-radius: 3px;
                background: #ff5722;
                text-shadow: none;
                width: 140px;
                text-align: center;
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
