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
            return '';
        }

        ob_start();

        dokan_get_template_part( 'my-orders' );

        return ob_get_clean();
    }
}
