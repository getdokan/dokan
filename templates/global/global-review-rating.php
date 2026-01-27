<?php
/**
 * Dokan Global Review Rating Template
 *
 * Displays the "Enjoyed Dokan?" rating request in admin footer.
 *
 * @since 4.0.0
 *
 * @package dokan
 */

defined( 'ABSPATH' ) || exit;
?>
<span id="footer-thankyou" style="display: block; font-weight: bold; font-style: normal; padding-bottom: 0.5rem;">
    <?php echo esc_html__( 'Enjoyed Dokan? Please leave us a', 'dokan-lite' ); ?> 
    <a href="<?php echo esc_url( 'https://wordpress.org/support/plugin/dokan-lite/reviews/?filter=5#new-post' ); ?>" target="_blank" class="wc-rating-link" aria-label="<?php echo esc_attr__( 'five star', 'dokan-lite' ); ?>">
        ★★★★★
    </a> 
    <?php echo esc_html__( 'rating. We really appreciate your support.', 'dokan-lite' ); ?>
</span>
