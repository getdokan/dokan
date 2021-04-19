<?php
/**
 * Dokan Sub Order Templates
 *
 * @since 2.4
 *
 * @package dokan
 */

$allow_shipment      = dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' );
$wc_shipping_enabled = get_option( 'woocommerce_calc_shipping' ) === 'yes' ? true : false;
?>

<header>
    <h2><?php esc_html_e( 'Sub Orders', 'dokan-lite' ); ?></h2>
</header>

<div class="dokan-info">
    <strong><?php esc_html_e( 'Note:', 'dokan-lite' ); ?></strong>
    <?php esc_html_e( 'This order has products from multiple vendors. So we divided this order into multiple vendor orders.
    Each order will be handled by their respective vendor independently.', 'dokan-lite' ); ?>
</div>

<table class="shop_table my_account_orders table table-striped">

    <thead>
        <tr>
            <th class="order-number"><span class="nobr"><?php esc_html_e( 'Order', 'dokan-lite' ); ?></span></th>
            <th class="order-date"><span class="nobr"><?php esc_html_e( 'Date', 'dokan-lite' ); ?></span></th>
            <th class="order-status"><span class="nobr"><?php esc_html_e( 'Status', 'dokan-lite' ); ?></span></th>
            <?php if ( function_exists( 'dokan_get_order_shipment_current_status' ) && 'on' === $allow_shipment && $wc_shipping_enabled ) : ?>
                <th class="order-shipment-status"><?php esc_html_e( 'Shipment', 'dokan-lite' ); ?></th>
            <?php endif; ?>
            <th class="order-total"><span class="nobr"><?php esc_html_e( 'Total', 'dokan-lite' ); ?></span></th>
            <th class="order-actions">&nbsp;</th>
        </tr>
    </thead>
    <tbody>
    <?php
    foreach ($sub_orders as $order_post) {
        $order      = new WC_Order( $order_post->ID );
        $item_count = $order->get_item_count();
        ?>
            <tr class="order">
                <td class="order-number">
                    <a href="<?php echo esc_url( $order->get_view_order_url() ); ?>">
                        <?php echo esc_html( $order->get_order_number() ); ?>
                    </a>
                </td>
                <td class="order-date">
                    <time datetime="<?php echo esc_attr( date('Y-m-d', strtotime( dokan_get_date_created( $order ) ) ) ); ?>" title="<?php echo esc_attr( strtotime( dokan_get_date_created( $order ) ) ); ?>"><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( dokan_get_date_created( $order ) ) ) ); ?></time>
                </td>
                <td class="order-status" style="text-align:left; white-space:nowrap;">
                    <?php echo isset( $statuses['wc-' . dokan_get_prop( $order, 'status' )] ) ? esc_html( $statuses['wc-' . dokan_get_prop( $order, 'status' )] ) : esc_html( dokan_get_prop( $order, 'status' ) ); ?>
                </td>
                <?php if ( function_exists( 'dokan_get_order_shipment_current_status' ) && 'on' === $allow_shipment && $wc_shipping_enabled ) : ?>
                    <td class="dokan-order-shipping-status" data-title="<?php esc_attr_e( 'Shipping Status', 'dokan-lite' ); ?>" >
                        <?php echo dokan_get_order_shipment_current_status( $order->get_id() ); ?>
                    </td>
                <?php endif; ?>
                <td class="order-total">
                    <?php echo wp_kses_post( sprintf( _n( '%s for %s item', '%s for %s items', $item_count, 'dokan-lite' ), $order->get_formatted_order_total(), $item_count ) ); ?>
                </td>
                <td class="order-actions">
                    <?php
                        $actions = array();

                        $actions['view'] = array(
                            'url'  => $order->get_view_order_url(),
                            'name' => __( 'View', 'dokan-lite' )
                        );

                        $actions = apply_filters( 'dokan_my_account_my_sub_orders_actions', $actions, $order );

                        foreach( $actions as $key => $action ) {
                            echo '<a href="' . esc_url( $action['url'] ) . '" class="button ' . sanitize_html_class( $key ) . '">' . esc_html( $action['name'] ) . '</a>';
                        }
                    ?>
                </td>
            </tr>
        <?php } ?>
    </tbody>
</table>
