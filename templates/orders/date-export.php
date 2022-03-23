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

$filter_date_start = isset( $_GET['order_date_start'] ) ? sanitize_key( $_GET['order_date_start'] ) : '';
$filter_date_end   = isset( $_GET['order_date_end'] ) ? sanitize_key( $_GET['order_date_end'] ) : '';
$order_status      = isset( $_GET['order_status'] ) ? sanitize_key( $_GET['order_status'] ) : 'all';
$sort_order        = isset( $_GET['sort_order'] ) ? sanitize_text_field( wp_unslash( $_GET['sort_order'] ) ) : 'DESC';
$total_high        = ! empty( $_GET['total_high'] ) ? absint( wp_unslash( $_GET['total_high'] ) ) : '';
$total_low         = ! empty( $_GET['total_low'] ) ? absint( wp_unslash( $_GET['total_low'] ) ) : '';
?>
<div class="dokan-order-filter-serach">
    <form action="" method="GET" class="dokan-left">
        <div class="dokan-form-group">
            <select name="customer_id" id="dokan-filter-customer" class="dokan-form-control dokan-w12"  data-allow_clear="true" data-placeholder="<?php esc_attr_e( 'Filter by registered customer', 'dokan-lite' ); ?>">
                <option value="<?php echo esc_attr( $user_id ); ?>" selected="selected"><?php echo wp_kses_post( $user_string ); ?></option>
            </select>
        </div>
        <div class="dokan-form-group">
            <select name="order_status" class="dokan-form-control">
                <option value="all" <?php selected( 'all', $order_status ); ?>><?php esc_html_e( 'All Order Statuses', 'dokan-lite' ); ?></option>
                <?php
                foreach ( $orders_statuses as $status_key => $status_name ) :
                    ?>
                    <option value="<?php echo esc_attr( $status_key ); ?>" <?php selected( $status_key, $order_status ); ?>><?php esc_html_e( $status_name ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="dokan-form-group">
            <select name="sort_order" class="dokan-form-control">
                <option value="DESC" <?php selected( 'DESC', $sort_order ); ?> ><?php esc_html_e( 'Newer Orders First', 'dokan-lite'); ?> </option>
                <option value="ASC" <?php selected( 'ASC', $sort_order ); ?> ><?php esc_html_e( 'Older Orders First', 'dokan-lite'); ?> </option>
            </select>
        </div>
        <div class="dokan-form-group">
            <input type="text" autocomplete="off" class="datepicker dokan-form-control" name="order_date_start" placeholder="<?php esc_attr_e( 'Start Date', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $filter_date_start ); ?>">
        </div>
        <div class="dokan-form-group">
            <input type="text" autocomplete="off" class="datepicker dokan-form-control" name="order_date_end" placeholder="<?php esc_attr_e( 'End Date', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $filter_date_end ); ?>">
        </div>
        <div class="dokan-form-group">
            <input name="total_low" type="number" value="<?php echo esc_attr( $total_low ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Minimum Order Total', 'dokan-lite'); ?>">
        </div>
        <div class="dokan-form-group">
            <input name="total_high" type="number" value="<?php echo esc_attr( $total_high ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Maximum Order Total', 'dokan-lite' ); ?>">
        </div>
        <div class="dokan-form-group">
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
                <input type="hidden" name="order" value="<?php echo esc_attr( $sort_order ); ?>">
                <input type="hidden" name="total_high" value="<?php echo esc_attr( $total_high); ?>" >
                <input type="hidden" name="total_low" value="<?php echo esc_attr( $total_low); ?>" >
            </div>
        </form>
    <?php endif; ?>

    <div class="dokan-clearfix"></div>
</div>
