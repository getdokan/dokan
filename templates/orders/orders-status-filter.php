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
    $order_id = absint( $_GET['order_id'] ); // phpcs:ignore
    ?>
    <div class="dokan-clearfix dokan-w12 dokan-form-group">
        <a href="<?php echo esc_url( dokan_get_navigation_url( 'orders' ) ); ?>" class="dokan-btn dokan-left">
            <?php esc_html_e( '&larr; Orders', 'dokan-lite' ); ?>
        </a>

        <?php
        /**
         * Fires before the order status filter.
         *
         * @since 4.0.0
         *
         * @param int $order_id Order ID.
         */
        do_action( 'dokan_order_status_filter_before', $order_id );
        ?>
    </div>
    <?php
} else {
    dokan_order_listing_status_filter();
}
