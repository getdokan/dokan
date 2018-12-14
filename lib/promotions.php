<?php

/**
* Promotion class
*
* For displaying AI base promotion in admin panel
*
* @since 2.9.0
*
* @package dokan
*/
abstract class WeDevs_Promotion {

    /**
     * Time Interval displaying between two promo
     *
     * @var integer
     */
    public $time_interval = 60*60*24*7;

    /**
     * option key for promo
     *
     * @var string
     */
    public $promo_option_key = '_dokan_displayed_promos';

    /**
     * Load autometically when class initiate
     *
     * @since 2.9.0
     */
    public function __construct() {
        add_action( 'admin_notices', array( $this, 'show_promotions' ) );
        add_action( 'wp_ajax_dokan-dismiss-upgrade-promotional-notice', array( $this, 'dismiss_upgrade_promo' ) );
    }

    /**
     * Get data
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_promotion_data() {
        return array();
    }

    /**
     * Module promotion notices
     *
     * @since 2.9.0
     *
     * @return void
     */
    public function show_promotions() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $notice       = $this->get_latest_promo();
        $last_time    = get_option( $this->promo_option_key . '_displayed_time' );
        $current_time = current_time( 'mysql' );

        if ( empty( $notice ) ) {
            return;
        }

        if ( ( strtotime( $current_time ) - strtotime( $last_time ) ) < $this->time_interval  ) {
            return;
        }

        ?>
            <div class="notice dokan-upgrade-promotional-notice">
                <div class="thumbnail">
                    <img src="<?php echo esc_url( $notice['thumbnail'] ); ?>" alt="<?php echo esc_attr( $notice['title'] ); ?>">
                </div>
                <div class="content">
                    <h2><?php echo esc_html( $notice['title'] ); ?></h2>
                    <p><?php echo esc_html( $notice['content'] ); ?></p>
                    <a href="<?php echo esc_url( $notice['link'] ); ?>" class="button button-primary promo-btn" target="_blank"><?php echo !empty( $notice['btn_text'] ) ? esc_html( $notice['btn_text'] ) : esc_html__( 'Learn More &rarr;', 'dokan-lite' ); ?></a>
                </div>
                <span class="prmotion-close-icon dashicons dashicons-no-alt" data-key="<?php echo esc_attr( $notice['key'] ); ?>" data-promo_key="<?php echo esc_attr( $this->promo_option_key ); ?>"></span>
                <div class="clear"></div>
            </div>

            <style>
                .dokan-upgrade-promotional-notice {
                    padding: 20px;
                    box-sizing: border-box;
                    position: relative;
                }

                .dokan-upgrade-promotional-notice .prmotion-close-icon{
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    cursor: pointer;
                }

                .dokan-upgrade-promotional-notice .thumbnail {
                    width: 20%;
                    float: left;
                }

                .dokan-upgrade-promotional-notice .thumbnail img{
                    width: 100%;
                    height: auto;
                    box-shadow: 0px 0px 25px #bbbbbb;
                    margin-right: 20px;
                    box-sizing: border-box;
                }

                .dokan-upgrade-promotional-notice .content {
                    float:left;
                    margin-left: 20px;
                    width: 75%;
                }

                .dokan-upgrade-promotional-notice .content h2 {
                    margin: 3px 0px 5px;
                    font-size: 17px;
                    font-weight: bold;
                    color: #555;
                    line-height: 25px;
                }

                .dokan-upgrade-promotional-notice .content p {
                    font-size: 14px;
                    text-align: justify;
                    color: #666;
                    margin-bottom: 10px;
                }

                .dokan-upgrade-promotional-notice .content a {
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
                jQuery(document).ready(function($){
                    $('body').on('click', '.dokan-upgrade-promotional-notice span.prmotion-close-icon', function(e) {
                        e.preventDefault();

                        var self = $(this),
                            key = self.data('key'),
                            promo_key = self.data('promo_key');

                        wp.ajax.send( 'dokan-dismiss-upgrade-promotional-notice', {
                            data: {
                                dokan_upgrade_promotion_dismissed: true,
                                key: key,
                                promo_key: promo_key,
                                nonce: '<?php echo esc_attr( wp_create_nonce( 'dokan_admin' ) ); ?>'
                            },
                            complete: function( resp ) {
                                self.closest('.dokan-upgrade-promotional-notice').fadeOut(200);
                            }
                        } );
                    });
                });
            </script>
        <?php
    }

    /**
     * Dissmiss prmo notice according
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function dismiss_upgrade_promo() {
        $post_data = wp_unslash( $_POST );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( __( 'You have no permission to do that', 'dokan-lite' ) );
        }

        if ( ! wp_verify_nonce( $post_data['nonce'], 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        if ( isset( $post_data['dokan_upgrade_promotion_dismissed'] ) && $post_data['dokan_upgrade_promotion_dismissed'] ) {
            $promo_option_key        = $post_data['promo_key'];
            $promo_last_display_time = $post_data['promo_key'] . '_displayed_time';

            $already_displayed_promo = get_option( $promo_option_key, array() );

            if ( ! isset( $already_displayed_promo[ $post_data['key'] ] ) ) {
                $already_displayed_promo[ $post_data['key'] ] = array(
                    'display'        => 0,
                    'last_displayed' => current_time( 'mysql' )
                );
            }

            update_option( $promo_option_key, $already_displayed_promo );
            update_option( $promo_last_display_time, current_time( 'mysql' ) );
            wp_send_json_success();
        }
    }

    /**
     * Get latest prmo
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_latest_promo() {
        $latest_promo = array();
        $promotions   = $this->get_promotion_data();

        if ( empty( $promotions ) ) {
            return $latest_promo;
        }

        uasort( $promotions, array( $this, 'sort_by_priority' ) );

        $already_displayed_promo = get_option( $this->promo_option_key, array() );

        foreach ( $promotions as $key => $value ) {
            if ( ! isset( $already_displayed_promo[$key] ) ) {
                $latest_promo = $value;
                $latest_promo['key'] = $key;
                return $latest_promo;
            }
        }

        return $latest_promo;
    }

    /**
     * Sort all promotions depends on priority key
     *
     * @param array $a
     * @param array $b
     *
     * @return integer
     */
    public function sort_by_priority( $a, $b ) {
        if ( isset( $a['priority'] ) && isset( $b['priority'] ) ) {
            return $a['priority'] - $b['priority'];
        } else {
            return 199;
        }
    }

}
