<?php
global $woocommerce;

if ( $user_orders ) {
    ?>
    <form id="order-filter" method="POST" class="dokan-form-inline">
        <?php if ( dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) === 'on' ) { ?>
            <div class="dokan-form-group">
                <label for="bulk-order-action-selector" class="screen-reader-text"><?php esc_html_e( 'Select bulk action', 'dokan-lite' ); ?></label>

                <select name="status" id="bulk-order-action-selector" class="dokan-form-control chosen">
                    <?php foreach ( $bulk_order_statuses as $key => $value ) { ?>
                        <option class="bulk-order-status" value="<?php echo esc_attr( $key ); ?>"><?php echo esc_attr( $value ); ?></option>
                    <?php } ?>
                </select>
            </div>

            <div class="dokan-form-group">
                <?php wp_nonce_field( 'bulk_order_status_change', 'security' ); ?>
                <input type="submit" name="bulk_order_status_change" id="bulk-order-action" class="dokan-btn dokan-btn-theme" value="<?php esc_attr_e( 'Apply', 'dokan-lite' ); ?>">
            </div>
        <?php } ?>
        <table class="dokan-table dokan-table-striped">
            <thead>
            <tr>
                <th id="cb" class="manage-column column-cb check-column">
                    <label for="cb-select-all"></label>
                    <input id="cb-select-all" class="dokan-checkbox" type="checkbox">
                </th>
                <th><?php esc_html_e( 'Order', 'dokan-lite' ); ?></th>
                <th><?php esc_html_e( 'Order Total', 'dokan-lite' ); ?></th>
                <th><?php esc_html_e( 'Earning', 'dokan-lite' ); ?></th>
                <th><?php esc_html_e( 'Status', 'dokan-lite' ); ?></th>
                <th><?php esc_html_e( 'Customer', 'dokan-lite' ); ?></th>
                <th><?php esc_html_e( 'Date', 'dokan-lite' ); ?></th>
                <?php if ( function_exists( 'dokan_get_order_shipment_current_status' ) && 'on' === $allow_shipment && $wc_shipping_enabled ) : ?>
                    <th><?php esc_html_e( 'Shipment', 'dokan-lite' ); ?></th>
                <?php endif; ?>
                <?php do_action( 'dokan_order_listing_header_before_action_column' ); ?>
                <?php if ( current_user_can( 'dokan_manage_order' ) ) { ?>
                    <th width="17%"><?php esc_html_e( 'Action', 'dokan-lite' ); ?></th>
                <?php } ?>
            </tr>
            </thead>
            <tbody>
            <?php
            foreach ( $user_orders as $order ) { // phpcs:ignore
                /**
                 * @var WC_Order $order
                 */
                ?>
                <tr>
                    <th class="dokan-order-select check-column">
                        <label for="cb-select-<?php echo esc_attr( $order->get_id() ); ?>"></label>
                        <input class="cb-select-items dokan-checkbox" type="checkbox" name="bulk_orders[]" value="<?php echo esc_attr( $order->get_id() ); ?>">
                    </th>
                    <td class="dokan-order-id column-primary" data-title="<?php esc_attr_e( 'Order', 'dokan-lite' ); ?>">
                        <?php if ( current_user_can( 'dokan_view_order' ) ) { ?>
                            <?php
                            echo '<a href="'
                                . esc_url( wp_nonce_url( add_query_arg( [ 'order_id' => $order->get_id() ], dokan_get_navigation_url( 'orders' ) ), 'dokan_view_order' ) )
                                . '"><strong>'
                                // translators: 1) order number
                                . sprintf( esc_html__( 'Order %s', 'dokan-lite' ), esc_attr( $order->get_order_number() ) ) . '</strong></a>';
                            ?>
                        <?php } else { ?>
                            <?php
                            echo '<strong>'
                                // translators: 1) order number
                                . sprintf( esc_html__( 'Order %s', 'dokan-lite' ), esc_attr( $order->get_order_number() ) )
                                . '</strong>';
                            ?>
                        <?php } ?>

                        <button type="button" class="toggle-row"></button>
                    </td>
                    <td class="dokan-order-total" data-title="<?php esc_attr_e( 'Order Total', 'dokan-lite' ); ?>">
                        <?php echo wp_kses_post( $order->get_formatted_order_total() ); ?>
                    </td>
                    <td class="dokan-order-earning" data-title="<?php esc_attr_e( 'Earning', 'dokan-lite' ); ?>">
                        <?php
                            echo wp_kses_post(
                                wc_price(
                                    dokan()->commission->get_earning_by_order( $order ),
                                    [
                                        'currency' => $order->get_currency(),
                                        'decimals' => wc_get_price_decimals(),
                                    ]
                                )
                            );
                        ?>
                    </td>
                    <td class="dokan-order-status" data-title="<?php esc_attr_e( 'Status', 'dokan-lite' ); ?>">
                        <?php echo '<span class="dokan-label dokan-label-' . esc_attr( dokan_get_order_status_class( $order->get_status() ) ) . '">' . esc_html( dokan_get_order_status_translated( $order->get_status() ) ) . '</span>'; ?>
                    </td>
                    <td class="dokan-order-customer" data-title="<?php esc_attr_e( 'Customer', 'dokan-lite' ); ?>">
                        <?php
                        $customer_full_name = trim( $order->get_formatted_billing_full_name() );
                        $user = empty( $customer_full_name ) ? __( 'Guest', 'dokan-lite' ) : $customer_full_name;
                        echo esc_html( $user );
                        ?>
                    </td>
                    <td class="dokan-order-date" data-title="<?php esc_attr_e( 'Date', 'dokan-lite' ); ?>">
                        <?php
                        if ( '0000-00-00 00:00:00' === $order->get_date_created()->format( 'Y-m-d H:i:s' ) ) {
                            $t_time = __( 'Unpublished', 'dokan-lite' );
                            $h_time = __( 'Unpublished', 'dokan-lite' );
                        } else {
                            $t_time    = $order->get_date_created();
                            $time_diff = time() - $t_time->getTimestamp();

                            // get human-readable time
                            $h_time = $time_diff > 0 && $time_diff < 24 * 60 * 60
                                // translators: 1)  human-readable date
                                ? sprintf( __( '%s ago', 'dokan-lite' ), human_time_diff( $t_time->getTimestamp(), time() ) )
                                : dokan_format_date( $t_time->getTimestamp() );

                            // fix t_time
                            $t_time = dokan_format_date( $t_time->getTimestamp() );
                        }

                        echo '<abbr title="' . esc_attr( $t_time ) . '">' . esc_html( apply_filters( 'post_date_column_time', $h_time, $order->get_id() ) ) . '</abbr>';
                        ?>
                    </td>
                    <?php if ( function_exists( 'dokan_get_order_shipment_current_status' ) && 'on' === $allow_shipment && $wc_shipping_enabled ) : ?>
                        <td class="dokan-order-shipping-status" data-title="<?php esc_attr_e( 'Shipping Status', 'dokan-lite' ); ?>">
                            <?php echo wp_kses_post( dokan_get_order_shipment_current_status( $order->get_id() ) ); ?>
                        </td>
                    <?php endif; ?>
                    <?php do_action( 'dokan_order_listing_row_before_action_field', $order ); ?>
                    <?php if ( current_user_can( 'dokan_manage_order' ) ) { ?>
                        <td class="dokan-order-action" width="17%" data-title="<?php esc_attr_e( 'Action', 'dokan-lite' ); ?>">
                            <?php
                            do_action( 'woocommerce_admin_order_actions_start', $order );

                            $actions = [];

                            if ( dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) === 'on' ) {
                                if ( in_array( $order->get_status(), [ 'pending', 'on-hold' ], true ) ) {
                                    $actions['processing'] = [
                                        'url'    => wp_nonce_url( admin_url( 'admin-ajax.php?action=dokan-mark-order-processing&order_id=' . $order->get_id() ), 'dokan-mark-order-processing' ),
                                        'name'   => __( 'Processing', 'dokan-lite' ),
                                        'action' => 'processing',
                                        'icon'   => '<i class="far fa-clock">&nbsp;</i>',
                                    ];
                                }

                                if ( in_array( $order->get_status(), [ 'pending', 'on-hold', 'processing' ], true ) ) {
                                    $actions['complete'] = [
                                        'url'    => wp_nonce_url( admin_url( 'admin-ajax.php?action=dokan-mark-order-complete&order_id=' . $order->get_id() ), 'dokan-mark-order-complete' ),
                                        'name'   => __( 'Complete', 'dokan-lite' ),
                                        'action' => 'complete',
                                        'icon'   => '<i class="fas fa-check">&nbsp;</i>',
                                    ];
                                }
                            }

                            $actions['view'] = [
                                'url'    => wp_nonce_url( add_query_arg( [ 'order_id' => $order->get_id() ], dokan_get_navigation_url( 'orders' ) ), 'dokan_view_order' ),
                                'name'   => __( 'View', 'dokan-lite' ),
                                'action' => 'view',
                                'icon'   => '<i class="far fa-eye">&nbsp;</i>',
                            ];

                            $actions = apply_filters( 'woocommerce_admin_order_actions', $actions, $order );

                            foreach ( $actions as $action ) { // phpcs:ignore
                                $icon = ( isset( $action['icon'] ) ) ? $action['icon'] : '';
                                printf( '<a class="dokan-btn dokan-btn-default dokan-btn-sm tips" href="%s" data-toggle="tooltip" data-placement="top" title="%s">%s</a> ', esc_url( $action['url'] ), esc_attr( $action['name'] ), wp_kses_post( $icon ) );
                            }

                            do_action( 'woocommerce_admin_order_actions_end', $order );
                            ?>
                        </td>
                    <?php } ?>
                </tr>

                <?php
            }
            ?>

            </tbody>

        </table>
    </form>

    <?php
    // if date is selected then calculate number_of_pages accordingly otherwise calculate number_of_pages =  ( total_orders / limit );
    if ( $num_of_pages > 1 ) {
        echo '<div class="pagination-wrap">';
        echo "<ul class='pagination'>\n\t<li>";
        echo wp_kses_post( join( "</li>\n\t<li>", $page_links ) );
        echo "</li>\n</ul>\n";
        echo '</div>';
    }
    ?>

    <?php
} else {
    ?>

    <div class="dokan-error">
        <?php esc_html_e( 'No orders found', 'dokan-lite' ); ?>
    </div>

<?php } ?>
