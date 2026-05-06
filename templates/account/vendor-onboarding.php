<?php
/**
 * Vendor onboarding template (login + registration).
 *
 * @var array $data Form data injected via dokan_get_template_part(). Includes
 *                  show_login and show_registration booleans set by the
 *                  [dokan-vendor-onboarding-registration] shortcode.
 */

if ( function_exists( 'wc_print_notices' ) ) {
    wc_print_notices();
}

$container_class = 'dokan-onboarding-container';
if ( ! ( $data['show_login'] && $data['show_registration'] ) ) {
    $container_class .= ' dokan-onboarding-single';
}
?>

<div class="dokan-vendor-onboarding">
    <div class="<?php echo esc_attr( $container_class ); ?>">
        <?php if ( $data['show_login'] ) : ?>
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
        <?php endif; ?>

        <?php if ( $data['show_registration'] ) : ?>
            <!-- Registration Section -->
            <div class="dokan-registration-section">
                <h2><?php esc_html_e( 'Registration', 'dokan-lite' ); ?></h2>
                <?php dokan_get_template_part( 'account/vendor-registration', false, [ 'data' => $data ] ); ?>
            </div>
        <?php endif; ?>
    </div>
</div>
