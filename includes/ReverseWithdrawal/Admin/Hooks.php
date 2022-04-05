<?php
namespace WeDevs\Dokan\ReverseWithdrawal\Admin;

use WeDevs\Dokan\ReverseWithdrawal\Helper;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class Hooks {
    /**
     * Admin constructor.
     */
    public function __construct() {
        //enqueue required scripts
        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1 );
    }

    /**
     * Enqueue Admin Scripts
     *
     * @param string $hook
     *
     * @since 3.5.0
     *
     * @return void
     */
    public function admin_enqueue_scripts( $hook ) {
        if ( 'toplevel_page_dokan' !== $hook ) {
            return;
        }
    }

}
