<?php
/**
 * Dokan Sub Order Templates
 *
 * @since 2.4
 *
 * @package dokan
 *
 * @var WC_Order $parent_order
 * @var WC_Order[] $sub_orders
 * @var array $statuses
 */

$allow_shipment      = dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' );
$wc_shipping_enabled = get_option( 'woocommerce_calc_shipping' ) === 'yes' ? true : false;
?>

<header>
    <h2><?php esc_html_e( 'Sub Orders', 'dokan-lite' ); ?></h2>
</header>

<div class="dokan-info">
    <strong><?php esc_html_e( 'Note:', 'dokan-lite' ); ?></strong>
    <?php
    /**
     * @since 3.2.12 added filter dokan_suborder_notice_to_customer
     * @args WC_Order $parent_order
     * @args WC_Order[] $sub_orders
     * @args array $statuses
     */
    echo apply_filters(
        'dokan_suborder_notice_to_customer',
        esc_html__(
            'This order has products from multiple vendors. So we divided this order into multiple vendor orders. Each order will be handled by their respective vendor independently.', 'dokan-lite'
        ), $parent_order, $sub_orders, $statuses
    );
    ?>
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
    $now = dokan_current_datetime();
    foreach ( $sub_orders as $order_post ) {
        $order      = wc_get_order( $order_post->ID ); // phpcs:ignore
        if ( ! $order ) {
            continue;
        }
        $item_count = $order->get_item_count();
        $order_date = $order->get_date_created();
        $order_date = is_a( $order_date, 'WC_DateTime' ) ? $now->setTimestamp( $order_date->getTimestamp() ) : $now;
        ?>
            <tr class="order">
                <td class="order-number">
                    <a href="<?php echo esc_url( $order->get_view_order_url() ); ?>">
                        <?php echo esc_html( $order->get_order_number() ); ?>
                    </a>
                </td>
                <td class="order-date">
                    <time datetime="<?php echo esc_attr( $order_date->format( 'Y-m-dTH:i:s' ) ); ?>">
                        <?php echo esc_html( dokan_format_date( $order_date ) ); ?>
                    </time>
                </td>
                <td class="order-status" style="text-align:left; white-space:nowrap;">
                    <?php echo isset( $statuses[ 'wc-' . dokan_get_prop( $order, 'status' ) ] ) ? esc_html( $statuses[ 'wc-' . dokan_get_prop( $order, 'status' ) ] ) : esc_html( dokan_get_prop( $order, 'status' ) ); ?>
                </td>
                <?php if ( function_exists( 'dokan_get_order_shipment_current_status' ) && 'on' === $allow_shipment && $wc_shipping_enabled ) : ?>
                    <td class="dokan-order-shipping-status" data-title="<?php esc_attr_e( 'Shipping Status', 'dokan-lite' ); ?>" >
                        <?php echo dokan_get_order_shipment_current_status( $order->get_id() ); ?>
                    </td>
                <?php endif; ?>
                <td class="order-total">
                    <?php
                    echo wp_kses_post(
                        sprintf(
                            // translators: 1) order total amount 2) order item count
                            _n( '%1$s for %2$s item', '%1$s for %2$s items', $item_count, 'dokan-lite' ), $order->get_formatted_order_total(), number_format_i18n( $item_count )
                        )
                    );
                    ?>
                </td>
                <td class="order-actions">
                    <?php
                        $actions = array();

                        $actions['view'] = array(
                            'url'  => $order->get_view_order_url(),
                            'name' => __( 'View', 'dokan-lite' ),
                        );

                        $actions = apply_filters( 'dokan_my_account_my_sub_orders_actions', $actions, $order );

                        foreach ( $actions as $key => $action ) { // phpcs:ignore
                            echo '<a href="' . esc_url( $action['url'] ) . '" class="button ' . sanitize_html_class( $key ) . '">' . esc_html( $action['name'] ) . '</a>';
                        }
						?>
                </td>
            </tr>
        <?php } ?>
    </tbody>
</table>
