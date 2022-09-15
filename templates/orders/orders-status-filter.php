<?php
/**
 *  Dokan Dashboard Template
 *
 *  Dokan Dashboard order status filter template
 *
 * @since   2.4
 *
 * @package dokan
 */

// this page can be accessed via link send directly from email
if ( isset( $_GET['order_id'] ) ) { // phpcs:ignore
    ?>
    <a href="<?php echo esc_url( dokan_get_navigation_url( 'orders' ) ); ?>" class="dokan-btn"><?php esc_html_e( '&larr; Orders', 'dokan-lite' ); ?></a>
    <?php
} else {
    dokan_order_listing_status_filter();
}
