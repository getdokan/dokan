<?php

if ( function_exists( 'wc_print_notices' ) ) {
    wc_print_notices();
}

?>

<div class="dokan-vendor-onboarding">
    <div class="dokan-onboarding-container">
        <!-- Login Section -->
        <div class="dokan-login-section">
            <h2><?php esc_html_e( 'Login', 'dokan-lite' ); ?></h2>
            <?php 
            $args = [
                'message'  => '',
                'redirect' => wc_get_page_permalink( 'myaccount' ), // Redirect customers here
                'hidden'   => false,
            ];
            wc_get_template( 'global/form-login.php', $args ); 
            ?>
        </div>

        <!-- Registration Section -->
        <div class="dokan-registration-section">
            <h2><?php esc_html_e( 'Registration', 'dokan-lite' ); ?></h2>
            <?php dokan_get_template_part( 'account/vendor-registration', false, [ 'data' => $data ] ); ?>
        </div>
    </div>
</div>

