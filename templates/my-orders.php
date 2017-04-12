<?php
/**
 * Template Name: My Orders
 */
?>


<?php
    global $woocommerce;

    $customer_orders = get_posts( apply_filters( 'woocommerce_my_account_my_orders_query', array(
        'numberposts' => -1,
        'meta_key'    => '_customer_user',
        'meta_value'  => get_current_user_id(),
        'post_type'   => 'shop_order',
        'post_status' => 'wc-publish',
    ) ) );

    if ( $customer_orders ) : ?>

        <h2><?php echo apply_filters( 'woocommerce_my_account_my_orders_title', __( 'Recent Orders', 'dokan-lite' ) ); ?></h2>

        <table class="shop_table my_account_orders table table-striped">

            <thead>
                <tr>
                    <th class="order-number"><span class="nobr"><?php _e( 'Order', 'dokan-lite' ); ?></span></th>
                    <th class="order-date"><span class="nobr"><?php _e( 'Date', 'dokan-lite' ); ?></span></th>
                    <th class="order-status"><span class="nobr"><?php _e( 'Status', 'dokan-lite' ); ?></span></th>
                    <th class="order-total"><span class="nobr"><?php _e( 'Total', 'dokan-lite' ); ?></span></th>
                    <th class="order-total"><span class="nobr"><?php _e( 'Vendor', 'dokan-lite' ); ?></span></th>
                    <th class="order-actions">&nbsp;</th>
                </tr>
            </thead>

            <tbody><?php
                $statuses = wc_get_order_statuses();
                foreach ( $customer_orders as $customer_order ) {
                    $order = new WC_Order( $customer_order );
                    $item_count = $order->get_item_count();

                    ?><tr class="order">
                        <td class="order-number">
                            <a href="<?php echo $order->get_view_order_url(); ?>">
                                <?php echo $order->get_order_number(); ?>
                            </a>
                        </td>
                        <td class="order-date">
                            <time datetime="<?php echo date('Y-m-d', strtotime( dokan_get_date_created( $order ) ) ); ?>" title="<?php echo esc_attr( strtotime( dokan_get_date_created( $order ) ) ); ?>"><?php echo date_i18n( get_option( 'date_format' ), strtotime( dokan_get_date_created( $order ) ) ); ?></time>
                        </td>
                        <td class="order-status" style="text-align:left; white-space:nowrap;">
                            <?php echo isset( $statuses[dokan_get_prop( $order, 'status' )] ) ? $statuses[dokan_get_prop( $order, 'status' )] : dokan_get_prop( $order, 'status' ); ?>
                        </td>
                        <td class="order-total">
                            <?php echo sprintf( _n( '%s for %s item', '%s for %s items', $item_count, 'dokan-lite' ), $order->get_formatted_order_total(), $item_count ); ?>
                        </td>
                        
                        <td class="order-total">
                            <?php
                                $seller_id = dokan_get_seller_id_by_order( dokan_get_prop( $order, 'id' ) );
                                if ( !is_array( $seller_id ) && $seller_id != 0 ) {
                                    $sellershop = dokan_get_store_info( $seller_id );
                                    echo '<a href="'. dokan_get_store_url( $seller_id ) .'">'. $sellershop['store_name'] .'</a>';
                                } else {
                                    _e( 'Multiple Vendor', 'dokan-lite' );
                                }
                            ?>
                        </td>

                        <td class="order-actions">
                            <?php
                                $actions = array();

                                if ( in_array( dokan_get_prop( $order, 'status' ), apply_filters( 'woocommerce_valid_order_statuses_for_payment', array( 'pending', 'failed' ), $order ) ) )
                                    $actions['pay'] = array(
                                        'url'  => $order->get_checkout_payment_url(),
                                        'name' => __( 'Pay', 'dokan-lite' )
                                    );

                                if ( in_array( dokan_get_prop( $order, 'status' ), apply_filters( 'woocommerce_valid_order_statuses_for_cancel', array( 'pending', 'failed' ), $order ) ) )
                                    $actions['cancel'] = array(
                                        'url'  => $order->get_cancel_order_url( get_permalink( wc_get_page_id( 'myaccount' ) ) ),
                                        'name' => __( 'Cancel', 'dokan-lite' )
                                    );

                                $actions['view'] = array(
                                    'url'  => $order->get_view_order_url(),
                                    'name' => __( 'View', 'dokan-lite' )
                                );

                                $actions = apply_filters( 'woocommerce_my_account_my_orders_actions', $actions, $order );

                                foreach( $actions as $key => $action ) {
                                    echo '<a href="' . esc_url( $action['url'] ) . '" class="button ' . sanitize_html_class( $key ) . '">' . esc_html( $action['name'] ) . '</a>';
                                }
                            ?>
                        </td>
                    </tr><?php
                }
            ?></tbody>

        </table>

    <?php else: ?>

        <p class="dokan-info"><?php _e( 'No orders found!', 'dokan-lite' ); ?></p>

    <?php endif; ?>

    