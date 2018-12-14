<?php
/**
 * Dokan Settings Header Template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<header class="dokan-dashboard-header">
    <h1 class="entry-title">
        <?php echo wp_kses_post( $heading ); ?>
        <small>&rarr; <a href="<?php echo esc_url( dokan_get_store_url( dokan_get_current_user_id() ) ); ?>"><?php esc_html_e( 'Visit Store', 'dokan-lite' ); ?></a></small>
    </h1>
</header><!-- .dokan-dashboard-header -->
