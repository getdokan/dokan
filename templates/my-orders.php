<?php
/**
 * Template Name: My Orders
 */
?>


<?php
global $woocommerce;

$customer_orders = dokan()->order->get_customer_orders(
    [
        'limit' => -1,
    ]
);

if ( $customer_orders ) :
    ?>

    <h2><?php echo esc_html( apply_filters( 'woocommerce_my_account_my_orders_title', __( 'Recent Orders', 'dokan-lite' ) ) ); ?></h2>

    <table class="shop_table my_account_orders table table-striped">
        <thead>
        <tr>
            <th class="order-number"><span class="nobr"><?php esc_html_e( 'Order', 'dokan-lite' ); ?></span></th>
            <th class="order-date"><span class="nobr"><?php esc_html_e( 'Date', 'dokan-lite' ); ?></span></th>
            <th class="order-status"><span class="nobr"><?php esc_html_e( 'Status', 'dokan-lite' ); ?></span></th>
            <th class="order-total"><span class="nobr"><?php esc_html_e( 'Total', 'dokan-lite' ); ?></span></th>
            <th class="order-total"><span class="nobr"><?php esc_html_e( 'Vendor', 'dokan-lite' ); ?></span></th>
            <th class="order-actions">&nbsp;</th>
        </tr>
        </thead>

        <tbody>
        <?php
        $statuses = wc_get_order_statuses();
        $now      = dokan_current_datetime();
        foreach ( $customer_orders as $customer_order ) {
            $order      = wc_get_order( $customer_order ); // phpcs:ignore
            $item_count = $order->get_item_count();
            $order_date = $order->get_date_created();
            $order_date = is_a( $order_date, 'WC_DateTime' ) ? $now->setTimestamp( $order_date->getTimestamp() ) : $now;
            ?>
            <tr class="order">
                <td class="order-number">
                    <a href="<?php echo esc_attr( $order->get_view_order_url() ); ?>">
                        <?php echo esc_html( $order->get_order_number() ); ?>
                    </a>
                </td>
                <td class="order-date">
                    <time datetime="<?php echo esc_attr( $order_date->format( 'Y-m-dTH:i:s' ) ); ?>">
                        <?php echo esc_html( dokan_format_date( $order_date ) ); ?>
                    </time>
                </td>
                <td class="order-status" style="text-align:left; white-space:nowrap;">
                    <?php echo isset( $statuses[ 'wc-' . $order->get_status() ] ) ? esc_html( $statuses[ 'wc-' . $order->get_status() ] ) : esc_html( $order->get_status() ); ?>
                </td>
                <td class="order-total">
                    <?php
                    echo wp_kses_post(
                        sprintf(
                        // translators: 1) order total amount 2) item count
                            _n( '%1$s for %2$s item', '%1$s for %2$s items', $item_count, 'dokan-lite' ), $order->get_formatted_order_total(), number_format_i18n( $item_count )
                        )
                    );
                    ?>
                </td>

                <td class="order-total">
                    <?php
                    $seller_id = (int) dokan_get_seller_id_by_order( $order->get_id() );
                    if ( $seller_id !== 0 ) {
                        $sellershop = dokan_get_store_info( $seller_id );
                        echo '<a href="' . esc_url( dokan_get_store_url( $seller_id ) ) . '">' . esc_html( $sellershop['store_name'] ) . '</a>';
                    } else {
                        esc_html_e( 'Multiple Vendor', 'dokan-lite' );
                    }
                    ?>
                </td>

                <td class="order-actions">
                    <?php
                    $actions = [];

                    if ( in_array( $order->get_status(), apply_filters( 'woocommerce_valid_order_statuses_for_payment', [ 'pending', 'failed' ], $order ), true ) ) {
                        $actions['pay'] = [
                            'url'  => $order->get_checkout_payment_url(),
                            'name' => __( 'Pay', 'dokan-lite' ),
                        ];
                    }

                    if ( in_array( $order->get_status(), apply_filters( 'woocommerce_valid_order_statuses_for_cancel', [ 'pending', 'failed' ], $order ), true ) ) {
                        $actions['cancel'] = [
                            'url'  => $order->get_cancel_order_url( get_permalink( wc_get_page_id( 'myaccount' ) ) ),
                            'name' => __( 'Cancel', 'dokan-lite' ),
                        ];
                    }

                    $actions['view'] = [
                        'url'  => $order->get_view_order_url(),
                        'name' => __( 'View', 'dokan-lite' ),
                    ];

                    $actions = apply_filters( 'woocommerce_my_account_my_orders_actions', $actions, $order );

                    foreach ( $actions as $key => $action ) { // phpcs:ignore
                        echo '<a href="' . esc_url( $action['url'] ) . '" class="button ' . sanitize_html_class( $key ) . '">' . esc_html( $action['name'] ) . '</a>';
                    }
                    ?>
                </td>
            </tr>
            <?php
        }
        ?>
        </tbody>

    </table>

<?php else : ?>

    <p class="dokan-info"><?php esc_html_e( 'No orders found!', 'dokan-lite' ); ?></p>

<?php endif; ?>
