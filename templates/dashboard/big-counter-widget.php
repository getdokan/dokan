<?php
/**
 *  Dashboard Widget Template
 *
 *  Dashboard Big Counter widget template
 *
 *  @since 2.4
 *
 *  @author weDevs <info@wedevs.com>
 *
 *  @package dokan
 */
?>
<div class="dashboard-widget big-counter">
    <ul class="list-inline">
         <li>
            <div class="title"><?php esc_html_e( 'Sales', 'dokan-lite' ); ?></div>
            <div class="count"><?php echo wc_price( $earning ); ?></div>
        </li>
        <li>
            <div class="title"><?php esc_html_e( 'Earning', 'dokan-lite' ); ?></div>
            <div class="count"><?php echo dokan_get_seller_earnings( dokan_get_current_user_id() ); ?></div>
        </li>
        <li>
            <div class="title"><?php esc_html_e( 'Pageview', 'dokan-lite' ); ?></div>
            <div class="count"><?php echo dokan_number_format( esc_attr( $pageviews ) ); ?></div>
        </li>
        <li>
            <div class="title"><?php esc_html_e( 'Order', 'dokan-lite' ); ?></div>
            <div class="count">
                <?php
                $status = dokan_withdraw_get_active_order_status();
                $total = 0;
                foreach ( $status as $order_status ){
                    $total += $orders_count->$order_status;
                }
                echo esc_html( number_format_i18n( $total, 0 ) );
                ?>
            </div>
        </li>

        <?php do_action( 'dokan_seller_dashboard_widget_counter' ); ?>
    </ul>
</div> <!-- .big-counter -->
