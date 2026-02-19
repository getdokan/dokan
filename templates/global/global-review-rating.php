<?php
/**
 * Dokan Global Review Rating Template
 *
 * Displays the "Enjoyed Dokan?" rating request in admin footer.
 *
 * @since 4.2.9
 *
 * @package dokan
 */

defined( 'ABSPATH' ) || exit;
?>
<span id="dokan-admin-switching" class="dokan-layout dokan-admin-page-body"></span>
<span id="dokan-footer-thankyou">
    <?php echo esc_html__( 'Enjoyed Dokan? Please leave us a', 'dokan-lite' ); ?> 
    <a href="<?php echo esc_url( 'https://wordpress.org/support/plugin/dokan-lite/reviews/?filter=5#new-post' ); ?>" target="_blank" rel="noopener noreferrer" class="wc-rating-link" aria-label="<?php echo esc_attr__( 'five star', 'dokan-lite' ); ?>">
        ★★★★★
    </a> 
    <?php echo esc_html__( 'rating. We really appreciate your support.', 'dokan-lite' ); ?>
</span>
