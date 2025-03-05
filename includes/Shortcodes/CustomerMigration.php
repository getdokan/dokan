<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class CustomerMigration extends DokanShortcode {
    /**
     * Shortcode name.
     *
     * @since 3.7.25 (PRO)
     * @since 3.14.10 Migration from DokanPro
     *
     * @var string Shortcode name
     */
    protected $shortcode = 'dokan-customer-migration';

    /**
     * Render [dokan-customer-migration] shortcode
     *
     * @since 3.7.25 (PRO)
     * @since 3.14.10 Migration from DokanPro
     *
     * @param array $atts
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        ob_start();
        dokan_get_container()->get( 'frontend_manager' )->become_a_vendor->load_customer_to_vendor_update_template();
        wp_enqueue_script( 'dokan-vendor-registration' );
        return ob_get_clean();
    }
}
