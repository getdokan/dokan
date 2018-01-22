<?php
global $woocommerce;

$seller_id    = dokan_get_current_user_id();
$order_status = isset( $_GET['order_status'] ) ? sanitize_key( $_GET['order_status'] ) : 'all';
$paged        = isset( $_GET['pagenum'] ) ? absint( $_GET['pagenum'] ) : 1;
$limit        = 10;
$offset       = ( $paged - 1 ) * $limit;
$order_date   = isset( $_GET['order_date'] ) ? sanitize_key( $_GET['order_date'] ) : NULL;
$user_orders  = dokan_get_seller_orders( $seller_id, $order_status, $order_date, $limit, $offset );

if ( $user_orders ) {
    ?>
    <table class="dokan-table dokan-table-striped">
        <thead>
            <tr>
                <th><?php _e( 'Order', 'dokan-lite' ); ?></th>
                <th><?php _e( 'Order Total', 'dokan-lite' ); ?></th>
                <th><?php _e( 'Status', 'dokan-lite' ); ?></th>
                <th><?php _e( 'Customer', 'dokan-lite' ); ?></th>
                <th><?php _e( 'Date', 'dokan-lite' ); ?></th>
                <?php if ( current_user_can( 'dokan_manage_order' ) ): ?>
                    <th width="17%"><?php _e( 'Action', 'dokan-lite' ); ?></th>
                <?php endif ?>
            </tr>
        </thead>
        <tbody>
            <?php
            foreach ($user_orders as $order) {
                $the_order = new WC_Order( $order->order_id );
                ?>
                <tr >
                    <td class="dokan-order-id" data-title="<?php _e( 'Order', 'dokan-lite' ); ?>" >
                        <?php if ( current_user_can( 'dokan_view_order' ) ): ?>
                            <?php echo '<a href="' . wp_nonce_url( add_query_arg( array( 'order_id' => dokan_get_prop( $the_order, 'id' ) ), dokan_get_navigation_url( 'orders' ) ), 'dokan_view_order' ) . '"><strong>' . sprintf( __( 'Order %s', 'dokan-lite' ), esc_attr( $the_order->get_order_number() ) ) . '</strong></a>'; ?>
                        <?php else: ?>
                            <?php echo '<strong>' . sprintf( __( 'Order %s', 'dokan-lite' ), esc_attr( $the_order->get_order_number() ) ) . '</strong>'; ?>
                        <?php endif ?>
                    </td>
                    <td class="dokan-order-total" data-title="<?php _e( 'Order Total', 'dokan-lite' ); ?>" >
                        <?php echo $the_order->get_formatted_order_total(); ?>
                    </td>
                    <td class="dokan-order-status" data-title="<?php _e( 'Status', 'dokan-lite' ); ?>" >
                        <?php echo '<span class="dokan-label dokan-label-' . dokan_get_order_status_class( dokan_get_prop( $the_order, 'status' ) ) . '">' . dokan_get_order_status_translated( dokan_get_prop( $the_order, 'status' ) ) . '</span>'; ?>
                    </td>
                    <td class="dokan-order-customer" data-title="<?php _e( 'Customer', 'dokan-lite' ); ?>" >
                        <?php

                        // reset user info
                        $user_info = '';

                        if ( $the_order->get_user_id() ) {
                            $user_info = get_userdata( $the_order->get_user_id() );
                        }

                        if ( !empty( $user_info ) ) {

                            $user = '';

                            if ( $user_info->first_name || $user_info->last_name ) {
                                $user .= esc_html( $user_info->first_name . ' ' . $user_info->last_name );
                            } else {
                                $user .= esc_html( $user_info->display_name );
                            }

                        } else {
                            $user = __( 'Guest', 'dokan-lite' );
                        }

                        echo $user;
                        ?>
                    </td>
                    <td class="dokan-order-date" data-title="<?php _e( 'Date', 'dokan-lite' ); ?>" >
                        <?php
                        if ( '0000-00-00 00:00:00' == dokan_get_date_created( $the_order ) ) {
                            $t_time = $h_time = __( 'Unpublished', 'dokan-lite' );
                        } else {
                            $t_time = get_the_time( __( 'Y/m/d g:i:s A', 'dokan-lite' ), dokan_get_prop( $the_order, 'id' ) );

                            $gmt_time = strtotime( dokan_get_date_created( $the_order ) . ' UTC' );
                            $time_diff = current_time( 'timestamp', 1 ) - $gmt_time;

                            if ( $time_diff > 0 && $time_diff < 24 * 60 * 60 )
                                $h_time = sprintf( __( '%s ago', 'dokan-lite' ), human_time_diff( $gmt_time, current_time( 'timestamp', 1 ) ) );
                            else
                                $h_time = get_the_time( __( 'Y/m/d', 'dokan-lite' ), dokan_get_prop( $the_order, 'id' ) );
                        }

                        echo '<abbr title="' . esc_attr( dokan_date_time_format( $t_time ) ) . '">' . esc_html( apply_filters( 'post_date_column_time', dokan_date_time_format( $h_time, true ) , dokan_get_prop( $the_order, 'id' ) ) ) . '</abbr>';
                        ?>
                    </td>
                    <?php if ( current_user_can( 'dokan_manage_order' ) ): ?>
                        <td class="dokan-order-action" width="17%" data-title="<?php _e( 'Action', 'dokan-lite' ); ?>" >
                            <?php
                            do_action( 'woocommerce_admin_order_actions_start', $the_order );

                            $actions = array();

                            if ( dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) == 'on' ) {
                                if ( in_array( dokan_get_prop( $the_order, 'status' ), array( 'pending', 'on-hold' ) ) ) {
                                    $actions['processing'] = array(
                                        'url' => wp_nonce_url( admin_url( 'admin-ajax.php?action=dokan-mark-order-processing&order_id=' . dokan_get_prop( $the_order, 'id' ) ), 'dokan-mark-order-processing' ),
                                        'name' => __( 'Processing', 'dokan-lite' ),
                                        'action' => "processing",
                                        'icon' => '<i class="fa fa-clock-o">&nbsp;</i>'
                                    );
                                }

                                if ( in_array( dokan_get_prop( $the_order, 'status' ), array( 'pending', 'on-hold', 'processing' ) ) ) {
                                    $actions['complete'] = array(
                                        'url' => wp_nonce_url( admin_url( 'admin-ajax.php?action=dokan-mark-order-complete&order_id=' . dokan_get_prop( $the_order, 'id' ) ), 'dokan-mark-order-complete' ),
                                        'name' => __( 'Complete', 'dokan-lite' ),
                                        'action' => "complete",
                                        'icon' => '<i class="fa fa-check">&nbsp;</i>'
                                    );
                                }

                            }

                            $actions['view'] = array(
                                'url' => wp_nonce_url( add_query_arg( array( 'order_id' => dokan_get_prop( $the_order, 'id' ) ), dokan_get_navigation_url( 'orders' ) ), 'dokan_view_order' ),
                                'name' => __( 'View', 'dokan-lite' ),
                                'action' => "view",
                                'icon' => '<i class="fa fa-eye">&nbsp;</i>'
                            );

                            $actions = apply_filters( 'woocommerce_admin_order_actions', $actions, $the_order );

                            foreach ($actions as $action) {
                                $icon = ( isset( $action['icon'] ) ) ? $action['icon'] : '';
                                printf( '<a class="dokan-btn dokan-btn-default dokan-btn-sm tips" href="%s" data-toggle="tooltip" data-placement="top" title="%s">%s</a> ', esc_url( $action['url'] ), esc_attr( $action['name'] ), $icon );
                            }

                            do_action( 'woocommerce_admin_order_actions_end', $the_order );
                            ?>
                        </td>
                    <?php endif ?>
                    <td class="diviader"></td>
                </tr>

            <?php } ?>

        </tbody>

    </table>

    <?php
    $order_count = dokan_get_seller_orders_number( $seller_id, $order_status );

    // if date is selected then calculate number_of_pages accordingly otherwise calculate number_of_pages =  ( total_orders / limit );
    if ( ! is_null( $order_date ) ) {
        if ( count( $user_orders ) >= $limit ) {
            $num_of_pages = ceil ( ( ( $order_count + count( $user_orders ) ) - count( $user_orders ) ) / $limit );
        } else {
            $num_of_pages = ceil( count( $user_orders ) / $limit );
        }
    } else {
        $num_of_pages = ceil( $order_count / $limit );
    }


    $base_url  = dokan_get_navigation_url( 'orders' );

    if ( $num_of_pages > 1 ) {
        echo '<div class="pagination-wrap">';
        $page_links = paginate_links( array(
            'current'   => $paged,
            'total'     => $num_of_pages,
            'base'      => $base_url. '%_%',
            'format'    => '?pagenum=%#%',
            'add_args'  => false,
            'type'      => 'array',
        ) );

        echo "<ul class='pagination'>\n\t<li>";
        echo join("</li>\n\t<li>", $page_links);
        echo "</li>\n</ul>\n";
        echo '</div>';
    }
    ?>

<?php } else { ?>

    <div class="dokan-error">
        <?php _e( 'No orders found', 'dokan-lite' ); ?>
    </div>

<?php } ?>

<script>
    (function($){
        $(document).ready(function(){
            $('.datepicker').datepicker({
                dateFormat: 'yy-m-d'
            });
        });
    })(jQuery);
</script>