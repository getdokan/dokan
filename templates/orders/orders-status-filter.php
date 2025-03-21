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
        <?php if ( $show_edit_url ?? false ) : ?>
            <a href="<?php echo esc_url( dokan_get_navigation_url( 'new/#/orders/edit/' . $order_id ) ); ?>" class="edit-order-button dokan-btn btn btn-sm btn-theme dokan-btn-theme dokan-right">
                <?php esc_html_e( 'Edit Order', 'dokan-lite' ); ?>
            </a>
        <?php endif; ?>
    </div>
    <?php
} else {
    dokan_order_listing_status_filter();
}
