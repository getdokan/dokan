<?php
/**
 * Dokan Dashboard Template
 *
 * Dokan Dashboard Order Main Content Template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<?php
$user_string     = '';
$user_id         = '';
$orders_statuses = wc_get_order_statuses();

if ( ! empty( $_GET['customer_id'] ) ) { // WPCS: input var ok.
    $user_id = absint( $_GET['customer_id'] ); // WPCS: input var ok, sanitization ok.
    $user    = get_user_by( 'id', $user_id );
    $customer = new WC_Customer( $user_id );

    $user_string = sprintf(
        /* translators: 1: user display name 2: user ID 3: user email */
        esc_html__( '%1$s', 'dokan-lite' ),
        $customer->get_first_name() . ' ' . $customer->get_last_name()
    );
}

$filter_date_start = isset( $_GET['order_date_start'] ) ? sanitize_key( wp_unslash( $_GET['order_date_start'] ) ) : '';
$filter_date_end   = isset( $_GET['order_date_end'] ) ? sanitize_key( wp_unslash( $_GET['order_date_end'] ) ) : '';
$order_status      = isset( $_GET['order_status'] ) ? sanitize_key( wp_unslash( $_GET['order_status'] ) ) : 'all';
?>
<div class="dokan-order-filter-serach">
    <form action="" method="GET" class="dokan-left">
        <div class="dokan-form-group">
            <select name="customer_id" id="dokan-filter-customer" class="dokan-form-control dokan-w12"  data-allow_clear="true" data-placeholder="<?php esc_attr_e( 'Filter by registered customer', 'dokan-lite' ); ?>">
                <option value="<?php echo esc_attr( $user_id ); ?>" selected="selected"><?php echo wp_kses_post( $user_string ); ?></option>
            </select>

            <input autocomplete="off" id="order_filter_date_range" type="text" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Select Date Range', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $filter_date_start && $filter_date_end ? dokan_format_date( $filter_date_start ) . ' - ' . dokan_format_date( $filter_date_end ) : null ); ?>">
            <input id="order_filter_start_date" type="hidden" autocomplete="off" class="dokan-form-control" name="order_date_start" placeholder="<?php esc_attr_e( 'Start Date', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $filter_date_start ); ?>">
            <input id="order_filter_end_date" type="hidden" autocomplete="off" class="dokan-form-control" name="order_date_end" placeholder="<?php esc_attr_e( 'End Date', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $filter_date_end ); ?>">

            <button type="submit" name="dokan_order_filter" class="dokan-btn dokan-btn-sm dokan-btn-danger dokan-btn-theme"><span class="fa fa-filter"></span> <?php esc_attr_e( 'Filter', 'dokan-lite' ); ?></button>
            <a onclick="window.location = window.location.href.split('?')[0];" class="dokan-btn dokan-btn-sm"><span class="fa fa-undo"></span> <?php esc_attr_e( 'Reset', 'dokan-lite' ); ?></a>
        </div>
    </form>

    <?php if ( current_user_can( 'seller' ) || current_user_can( 'dokan_export_order' ) ) : ?>
        <form action="" method="POST" class="dokan-right">
            <div class="dokan-form-group">
                <?php
                    wp_nonce_field( 'dokan_vendor_order_export_action', 'dokan_vendor_order_export_nonce' );
                ?>
                <input type="submit" name="dokan_order_export_all"  class="dokan-btn dokan-btn-sm dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Export All', 'dokan-lite' ); ?>">
                <input type="submit" name="dokan_order_export_filtered"  class="dokan-btn dokan-btn-sm dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Export Filtered', 'dokan-lite' ); ?>">
                <input type="hidden" name="order_date_start" value="<?php echo esc_attr( $filter_date_start ); ?>">
                <input type="hidden" name="order_date_end" value="<?php echo esc_attr( $filter_date_end ); ?>">
                <input type="hidden" name="order_status" value="<?php echo esc_attr( $order_status ); ?>">
            </div>
        </form>
    <?php endif; ?>

    <div class="dokan-clearfix"></div>
</div>
