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
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        $promos = [
            [
                'key'         => 'dokan-halloween2021',
                'start_date'  => '2021-10-21 00:09:00 EST',
                'end_date'    => '2021-10-31 00:09:00 EST',
                'title'       => 'Get Yourself a Spooky Delight !',
                'content'     => 'Get Up To 45% OFF on Dokan Pro.',
                'link'        => 'https://wedevs.com/dokan/pricing?utm_medium=text&utm_source=wordpress-dokan-halloween2021',
                'button_text' => __( 'Get Deals &rarr;', 'dokan-lite' ),
            ],
            [
                'key'         => 'dokan_pro_christmas_notice',
                'start_date'  => '2021-10-21 00:09:00 EST',
                'end_date'    => '2021-10-31 00:09:00 EST',
                'title'       => 'Christmas Offer!',
                'content'     => 'Save 30% Upgrading Your Dokan Package. Coupon: “XMAS30”. Offer Ends in 31st Dec, 12.00 PM!',
                'link'        => 'https://wedevs.com/dokan/pricing/#dokan-compare-table-section',
                'button_text' => __( 'Grab The Deal &rarr;', 'dokan-lite' ),
            ],
        ];

        if ( empty( $promos ) ) {
            return;
        }

        $current_time_est = $this->get_current_time_est();
        $notice           = [];

        $already_displayed_promo = get_option( $this->promo_option_key, [] );

        foreach ( $promos as $promo ) {
            if ( in_array( $promo['key'], $already_displayed_promo, true ) ) {
                continue;
            }

            if ( strtotime( $promo['start_date'] ) < strtotime( $current_time_est ) && strtotime( $current_time_est ) < strtotime( $promo['end_date'] ) ) {
                $notice = $promo;
            }
        }

        if ( empty( $notice ) ) {
            return;
        }

        ?>
            <div class="dokan-promo-notice promotion notice">
                    <div class="notice-content">
                        <div class="logo-wrap">
                            <div class="logo"></div>
                            <span class="icon icon-promotion"></span>
                        </div>
                        <div class="message">
                            <h3><?php echo esc_html( $notice['title'] ); ?></h3>
                            <div><?php echo esc_html( $notice['content'] ); ?></div>
                            <a class="btn btn-primary" target="_blank" href="<?php echo esc_url( $notice['link'] ); ?>"><?php echo esc_html( $notice['button_text'] ); ?></a>
                        </div>

                        <button class="close-notice" data-key="<?php echo esc_attr( $notice['key'] ); ?>">
                            <span class="dashicons dashicons-no-alt"></span>
                        </button>
                    </div>
                </div>
            <style>
                .dokan-promo-notice {
                    position: relative;
                }

                .dokan-promo-notice.notice {
                    border-width: 0;
                    padding: 0;
                    background: transparent;
                    box-shadow: none;
                }

                .dokan-promo-notice.promotion {
                    border-left: 2px solid #f1644d;
                }

                .dokan-promo-notice .notice-content {
                    display: flex;
                    padding: 20px 25px;
                    border: 1px solid #dfe2e7;
                    border-radius: 0 5px 5px 0;
                    background: #fff;
                }

                .dokan-promo-notice .logo-wrap {
                    position: relative;
                }

                .dokan-promo-notice .logo-wrap .logo {
                    width: 60px;
                    height: 60px;
                    background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 62 62' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='.90723' y='.79541' width='61' height='61' rx='30.5' fill='%23F16982'/%3E%3Cpath d='m19.688 25.014v-6.1614c1.4588-0.0303 7.7804 0.0301 13.407 3.6546-0.5844-0.2658-1.2264-0.4219-1.8846-0.4584-0.6581-0.0364-1.3177 0.0477-1.9361 0.2469-1.4936 0.5135-2.7441 1.8122-2.8483 3.2016-0.1737 2.3861 0 4.8627 0 7.2488v7.2186c-1.1115 0.0906-2.2577 0.1208-3.2649 0.1208-1.0768 0.0302-2.1188 0.0302-2.9524 0.1208l-0.521 0.0907v-15.283z' fill='%23fff'/%3E%3Cpath d='m17.848 43.77s-0.278-2.3257 2.5007-2.6579c2.7787-0.3323 8.0583 0.302 11.532-1.6008 0 0 2.0494-0.9363 2.4662-1.3893l-0.5558 1.6309s-1.6325 4.9534-6.5994 5.5876c-4.967 0.6041-5.9048-1.7517-9.3434-1.5705z' fill='%23fff'/%3E%3Cpath d='m28.546 45.824c3.9596-0.8457 8.4404-3.3828 8.4404-16.159 0-12.776-17.02-11.689-17.02-11.689 4.0639-2.084 25.008-4.6815 25.008 13.32 0 17.971-16.429 14.528-16.429 14.528z' fill='%23fff'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-size: cover;
                    background-position: center;
                }

                .dokan-promo-notice .logo-wrap .icon {
                    width: 20px;
                    height: 20px;
                    position: absolute;
                    top: -2px;
                    right: -8px;
                    border: 2px solid #fff;
                    border-radius: 55px;
                    background: #ffffff;
                }

                .dokan-promo-notice .logo-wrap .icon-promotion {
                    background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='.19824' y='.73975' width='20.18' height='20.18' rx='10.09' fill='%23F1634C'/%3E%3Cpath d='m5.3248 10.182c-0.00432 0.3752 0.227 0.713 0.57847 0.8446v-1.6082c0-0.02314 0.01156-0.05784 0.01156-0.08099-0.35384 0.13053-0.58917 0.4674-0.59003 0.84459z' fill='%23fff'/%3E%3Cpath d='m8.4834 12.172h-1.5156l0.56691 2.0594c0.08396 0.3142 0.36887 0.5327 0.69418 0.5322 0.23146 0.0027 0.45045-0.1046 0.59005-0.2893 0.14096-0.1756 0.18443-0.4102 0.11569-0.6247l-0.45121-1.6776z' fill='%23fff'/%3E%3Cpath d='m5.915 9.3264h0.01242v-0.01242c0 0.01242 0 0.01242-0.01242 0.01242z' fill='%23fff'/%3E%3Cpath d='m14.21 9.1641h-0.0925v2.0825h0.0925c0.5751 0 1.0413-0.4662 1.0413-1.0413 0-0.57504-0.4662-1.0412-1.0413-1.0412z' fill='%23fff'/%3E%3Cpath d='m6.25 9.418v1.6429c0.01251 0.4254 0.36112 0.7638 0.78672 0.7636h2.1057v-3.1238h-2.1057c-0.4165 0-0.78672 0.30082-0.78672 0.71732z' fill='%23fff'/%3E%3Cpath d='m9.4898 11.871 4.2808 1.7123v-6.6872l-4.2808 1.7123v3.2626z' fill='%23fff'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-size: cover;
                    background-position: center;
                }

                .dokan-promo-notice .message {
                    margin: 0 23px;
                }

                .dokan-promo-notice .message h3 {
                    margin: 0 0 10px;
                    font-weight: bold;
                    font-size: 18px;
                    font-family: Roboto, sans-serif;
                }

                .dokan-promo-notice .message div {
                    color: #4b4b4b;
                    font-weight: 400;
                    font-size: 13px;
                    font-family: "SF Pro Text", sans-serif;
                }

                .dokan-promo-notice .message .btn {
                    font-size: 12px;
                    font-weight: 300;
                    padding: 8px 15px;
                    margin-right: 15px;
                    margin-top: 10px;
                    border-radius: 3px;
                    border: 1px solid #00769d;
                    cursor: pointer;
                    transition: all .2s linear;
                    text-decoration: none;
                    font-family: "SF Pro Text", sans-serif;
                    display: inline-block;
                }

                .dokan-promo-notice .message .btn-primary {
                    color: #fff;
                    background: #2579B1;
                    margin-right: 15px;
                    font-weight: 400;
                }

                .dokan-promo-notice .message .btn-primary:hover {
                    background: transparent;
                    color: #2579B1;
                }

                .dokan-promo-notice .message a {
                    text-decoration: none;
                }

                .dokan-promo-notice .close-notice {
                    position: absolute;
                    top: 13px;
                    right: 10px;
                    border: 0;
                    background: transparent;
                }

                .dokan-promo-notice .close-notice span {
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #c2c2c2;
                    transition: all .2s ease;
                    cursor: pointer;
                    border: 1px solid #f3f3f3;
                    border-radius: 55px;
                    width: 20px;
                    height: 20px;
                }

                .dokan-promo-notice .close-notice span:hover {
                    color: #f16982;
                    border-color: #f16982;
                }

                @media only screen and (max-width: 576px) {
                    .dokan-promo-notice .message {
                        margin: 0 0 0 23px;
                    }
                }

                @font-face {
                    font-family: "SF Pro Text";
                    src: url(<?php echo DOKAN_PLUGIN_ASSEST . '/font/SF-Pro-Text-Regular.otf'; ?>) format('opentype');
                    font-weight: 400;
                }
            </style>
            <script>
                jQuery( document ).ready( function ( $ ) {
                    $( 'body' ).on( 'click', '.dokan-promo-notice .close-notice', function ( e ) {
                        e.preventDefault();

                        var self = $( this ),
                            key = self.data( 'key' );

                        self.attr( 'disabled', true );

                        wp.ajax.send( 'dokan_dismiss_limited_time_promotional_notice', {
                            data: {
                                dokan_limited_time_promotion_dismissed: true,
                                key: key,
                                nonce: '<?php echo esc_attr( wp_create_nonce( 'dokan_admin' ) ); ?>'
                            },
                            complete: function ( resp ) {
                                self.closest('.dokan-promo-notice').fadeOut(200);
                            }
                        } );
                    } );
                });
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
