<?php
/**
 *  Dashboard Widget Template
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
    <div class="widget-title"><i class="fa fa-shopping-cart"></i> <?php esc_attr_e( 'Orders', 'dokan-lite' ); ?></div>

    <div class="content-half-part">
        <ul class="list-unstyled list-count">
            <li>
                <a href="<?php echo esc_url( $orders_url ); ?>">
                    <span class="title"><?php esc_attr_e( 'Total', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_html( $orders_count->total ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo esc_url( add_query_arg( array( 'order_status' => 'wc-completed' ), $orders_url ) ); ?>" style="color: <?php echo esc_attr( $order_data[0]['color'] ); ?>">
                    <span class="title"><?php esc_attr_e( 'Completed', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_html( number_format_i18n( $orders_count->{'wc-completed'}, 0 ) ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo esc_url( add_query_arg( array( 'order_status' => 'wc-pending' ), $orders_url ) ); ?>" style="color: <?php echo esc_attr( $order_data[1]['color'] ); ?>">
                    <span class="title"><?php esc_attr_e( 'Pending', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_html( number_format_i18n( $orders_count->{'wc-pending'}, 0 ) ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo esc_url( add_query_arg( array( 'order_status' => 'wc-processing' ), $orders_url ) ); ?>" style="color: <?php echo esc_attr( $order_data[2]['color'] ); ?>">
                    <span class="title"><?php esc_attr_e( 'Processing', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_html( number_format_i18n( $orders_count->{'wc-processing'}, 0 ) ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo esc_url( add_query_arg( array( 'order_status' => 'wc-cancelled' ), $orders_url ) ); ?>" style="color: <?php echo esc_attr( $order_data[3]['color'] ); ?>">
                    <span class="title"><?php esc_html_e( 'Cancelled', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_html( number_format_i18n( $orders_count->{'wc-cancelled'}, 0 ) ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo esc_url( add_query_arg( array( 'order_status' => 'wc-refunded' ), $orders_url ) ); ?>" style="color: <?php echo esc_attr( $order_data[4]['color'] ); ?>">
                    <span class="title"><?php esc_html_e( 'Refunded', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_html( number_format_i18n( $orders_count->{'wc-refunded'}, 0 ) ); ?></span>
                </a>
            </li>
            <li>
                <a href="<?php echo esc_url( add_query_arg( array( 'order_status' => 'wc-on-hold' ), $orders_url ) ); ?>" style="color: <?php echo esc_attr( $order_data[5]['color'] ); ?>">
                    <span class="title"><?php esc_html_e( 'On hold', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_html( number_format_i18n( $orders_count->{'wc-on-hold'}, 0  ) ); ?></span>
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
        var order_stats = <?php echo wp_json_encode( wp_list_pluck( $order_data, 'value' ) ); ?>;
        var colors = <?php echo wp_json_encode( wp_list_pluck( $order_data, 'color' ) ); ?>;
        var labels = <?php echo wp_json_encode( wp_list_pluck( $order_data, 'label' ) ); ?>;

        var ctx = $("#order-stats").get(0).getContext("2d");
        var donn = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: order_stats,
                    backgroundColor: colors
                }],
                labels: labels,
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
    });
</script>
