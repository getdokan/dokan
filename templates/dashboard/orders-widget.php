<?php
/**
 *  Dahsboard Widget Template
 *
 *  Get dokan dashboard widget template
 *
 *  @since 2.4
 *
 *  @package dokan
 *
 */
?>

<div class="dashboard-widget orders">
    <div class="widget-title"><i class="fa fa-shopping-cart"></i> <?php _e( 'Orders', 'dokan' ); ?></div>

    <div class="content-half-part">
        <ul class="list-unstyled list-count">
            <li>
                <a href="<?php echo $orders_url; ?>">
                    <span class="title"><?php _e( 'Total', 'dokan' ); ?></span> <span class="count"><?php echo $orders_count->total; ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo add_query_arg( array( 'order_status' => 'wc-completed' ), $orders_url ); ?>" style="color: <?php echo $order_data[0]['color']; ?>">
                    <span class="title"><?php _e( 'Completed', 'dokan' ); ?></span> <span class="count"><?php echo number_format_i18n( $orders_count->{'wc-completed'}, 0 ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo add_query_arg( array( 'order_status' => 'wc-pending' ), $orders_url ); ?>" style="color: <?php echo $order_data[1]['color']; ?>">
                    <span class="title"><?php _e( 'Pending', 'dokan' ); ?></span> <span class="count"><?php echo number_format_i18n( $orders_count->{'wc-pending'}, 0 );; ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo add_query_arg( array( 'order_status' => 'wc-processing' ), $orders_url ); ?>" style="color: <?php echo $order_data[2]['color']; ?>">
                    <span class="title"><?php _e( 'Processing', 'dokan' ); ?></span> <span class="count"><?php echo number_format_i18n( $orders_count->{'wc-processing'}, 0 );; ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo add_query_arg( array( 'order_status' => 'wc-cancelled' ), $orders_url ); ?>" style="color: <?php echo $order_data[3]['color']; ?>">
                    <span class="title"><?php _e( 'Cancelled', 'dokan' ); ?></span> <span class="count"><?php echo number_format_i18n( $orders_count->{'wc-cancelled'}, 0 ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo add_query_arg( array( 'order_status' => 'wc-refunded' ), $orders_url ); ?>" style="color: <?php echo $order_data[4]['color']; ?>">
                    <span class="title"><?php _e( 'Refunded', 'dokan' ); ?></span> <span class="count"><?php echo number_format_i18n( $orders_count->{'wc-refunded'}, 0 ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo add_query_arg( array( 'order_status' => 'wc-on-hold' ), $orders_url ); ?>" style="color: <?php echo $order_data[5]['color']; ?>">
                    <span class="title"><?php _e( 'On hold', 'dokan' ); ?></span> <span class="count"><?php echo number_format_i18n( $orders_count->{'wc-on-hold'}, 0 ); ?></span>
                </a>
            </li>
        </ul>
    </div>
    <div class="content-half-part">
        <canvas id="order-stats"></canvas>
    </div>
</div> <!-- .orders -->

<script type="text/javascript">
    jQuery(function($) {
        var order_stats = <?php echo json_encode( $order_data ); ?>;

        var ctx = $("#order-stats").get(0).getContext("2d");
        new Chart(ctx).Doughnut(order_stats);
    });
</script>
