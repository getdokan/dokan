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
$user_string = '';
$user_id     = '';

if ( ! empty( $_GET['customer_id'] ) ) { // WPCS: input var ok.
    $user_id = absint( $_GET['customer_id'] ); // WPCS: input var ok, sanitization ok.
    $user    = get_user_by( 'id', $user_id );

    $user_string = sprintf(
        /* translators: 1: user display name 2: user ID 3: user email */
        esc_html__( '%1$s (#%2$s)', 'dokan-lite' ),
        $user->display_name,
        absint( $user->ID )
    );
}

$filter_date  = isset( $_GET['order_date'] ) ? sanitize_key( $_GET['order_date'] ) : '';
$order_status = isset( $_GET['order_status'] ) ? sanitize_key( $_GET['order_status'] ) : 'all';

?>
<div class="dokan-order-filter-serach">
    <form action="" method="GET" class="dokan-left">
        <div class="dokan-form-group">
            <input type="text" class="datepicker" style="width:120px; padding-bottom:7px" name="order_date" id="order_date_filter" placeholder="<?php esc_attr_e( 'Filter by Date', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $filter_date ); ?>">
            <select name="customer_id" id="dokan-filter-customer" style="width:220px" class="dokan-form-control"  data-allow_clear="true" data-placeholder="<?php esc_attr_e( 'Filter by registered customer', 'dokan-lite' ); ?>">
                <option value="<?php echo esc_attr( $user_id ); ?>" selected="selected"><?php echo wp_kses_post( $user_string ); ?><option>
            </select>
            <input type="submit" name="dokan_order_filter" class="dokan-btn dokan-btn-sm dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Filter', 'dokan-lite' ); ?>">
            <input type="hidden" name="order_status" value="<?php echo  esc_attr( $order_status ); ?>">
        </div>
    </form>

    <form action="" method="POST" class="dokan-right">
        <div class="dokan-form-group">
            <?php
                wp_nonce_field( 'dokan_vendor_order_export_action', 'dokan_vendor_order_export_nonce' );
            ?>
            <input type="submit" name="dokan_order_export_all"  class="dokan-btn dokan-btn-sm dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Export All', 'dokan-lite' ); ?>">
            <input type="submit" name="dokan_order_export_filtered"  class="dokan-btn dokan-btn-sm dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Export Filtered', 'dokan-lite' ); ?>">
            <input type="hidden" name="order_date" value="<?php echo esc_attr( $filter_date ); ?>">
            <input type="hidden" name="order_status" value="<?php echo esc_attr( $order_status ); ?>">
        </div>
    </form>

    <div class="dokan-clearfix"></div>
</div>
