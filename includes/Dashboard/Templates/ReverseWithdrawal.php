<?php
namespace WeDevs\Dokan\Dashboard\Templates;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class ReverseWithdrawal {
    /**
     * Admin constructor.
     */
    public function __construct() {
        //enqueue required scripts
        add_action( 'wp_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1 );

        add_action( 'dokan_reverse_withdrawal_content_area_header', [ $this, 'render_header' ] );
    }

    /**
     * Dokan Reverse Withdrawal header Template render
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_header() {
        dokan_get_template_part( 'reverse-withdrawal/header' );
    }

    /**
     * Enqueue Frontend Scripts
     *
     * @param string $hook
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function admin_enqueue_scripts( $hook ) {
        global $wp;

        if ( ! dokan_is_seller_dashboard() || ! isset( $wp->query_vars['reverse-withdrawal'] ) ) {
            return;
        }

        // load frontend scripts
    }

}
