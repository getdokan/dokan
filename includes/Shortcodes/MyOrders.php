<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class MyOrders extends DokanShortcode {

    protected $shortcode = 'dokan-my-orders';

    /**
     * Render my orders page
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        if ( ! is_user_logged_in() ) {
            return;
        }

        wp_enqueue_style( 'dokan-my-orders-style', DOKAN_PLUGIN_ASSEST . '/css/my-orders-styles.css', [], DOKAN_PLUGIN_VERSION );
        wp_enqueue_style( 'dokan-select2-css' );
        wp_enqueue_script( 'dokan-select2-js' );
        wp_enqueue_style( 'dokan-date-range-picker' );
        wp_enqueue_script( 'dokan-date-range-picker' );

        ob_start();

        dokan_get_template_part( 'my-orders' );

        return ob_get_clean();
    }
}
