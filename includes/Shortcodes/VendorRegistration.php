<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class VendorRegistration extends DokanShortcode {

    protected $shortcode = 'dokan-vendor-registration';

    /**
     * Vendor regsitration form shortcode callback
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        if ( is_user_logged_in() ) {
            return esc_html__( 'You are already logged in', 'dokan-lite' );
        }

        dokan()->scripts->load_form_validate_script();

        wp_enqueue_script( 'dokan-form-validate' );
        wp_enqueue_script( 'dokan-vendor-registration' );

        ob_start();
        $postdata = wc_clean( $_POST ); // WPCS: CSRF ok, input var ok.

        dokan_get_template_part( 'account/vendor-registration', false, array( 'postdata' => $postdata ) );
        $content = ob_get_clean();

        return apply_filters( 'dokan_vendor_reg_form', $content );
    }
}
