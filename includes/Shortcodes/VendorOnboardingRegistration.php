<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class VendorOnboardingRegistration extends DokanShortcode {

    protected $shortcode = 'dokan-vendor-onboarding-registration';

    /**
     * Vendor onboarding form shortcode callback
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
        wp_enqueue_script( 'dokan-vendor-address' );
        wp_enqueue_script( 'wc-password-strength-meter' );

        $data = dokan_get_seller_registration_form_data();

        ob_start();
        dokan_get_template_part( 'account/vendor-onboarding', false, [ 'data' => $data ] );
        $content = ob_get_clean();

        return apply_filters( 'dokan_vendor_reg_form', $content );
    }
}
    /**
     * Redirect regular customers to My Account after login from this page.
     * @since DOKAN
     * @param string $redirect_to
     * @param WP_User $user
     * @return string
     */
    add_filter( 'woocommerce_login_redirect', function( $redirect_to, $user ) {
        if ( ! empty( $_GET['redirect_to'] ) ) { // phpcs:ignore
            $redirect_to = esc_url( wp_unslash( $_GET['redirect_to'] ) ); // phpcs:ignore
        } 
        elseif ( user_can( $user, 'customer' ) ) {
            $redirect_to = wc_get_page_permalink( 'myaccount' );
        }

        return $redirect_to;
    }, 20, 2 );
