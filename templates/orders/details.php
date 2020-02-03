<?php
global $woocommerce, $wpdb;

$order_id = isset( $_GET['order_id'] ) ? intval( $_GET['order_id'] ) : 0;

if ( !dokan_is_seller_has_order( dokan_get_current_user_id(), $order_id ) ) {
    echo '<div class="dokan-alert dokan-alert-danger">' . esc_html__( 'This is not yours, I swear!', 'dokan-lite' ) . '</div>';
    return;
}

$statuses = wc_get_order_statuses();
$order    = new WC_Order( $order_id );
$hide_customer_info = dokan_get_option( 'hide_customer_info', 'dokan_selling', 'off' );
?>
<div class="dokan-clearfix">
    <div class="dokan-w8 dokan-order-left-content">

        <div class="dokan-clearfix">
            <div class="" style="width:100%">
                <div class="dokan-panel dokan-panel-default">
                    <div class="dokan-panel-heading"><strong><?php printf( esc_html__( 'Order', 'dokan-lite' ) . '#%d', esc_attr( dokan_get_prop( $order, 'id' ) ) ); ?></strong> &rarr; <?php esc_html_e( 'Order Items', 'dokan-lite' ); ?></div>
                    <div class="dokan-panel-body" id="woocommerce-order-items">

                        <?php
                            if ( function_exists( 'dokan_render_order_table_items' ) ) {
                                dokan_render_order_table_items( $order_id );
                            } else {
                        ?>
                                <table cellpadding="0" cellspacing="0" class="dokan-table order-items">
                                    <thead>
                                        <tr>
                                            <th class="item" colspan="2"><?php esc_html_e( 'Item', 'dokan-lite' ); ?></th>

                                            <?php do_action( 'woocommerce_admin_order_item_headers' ); ?>

                                            <th class="quantity"><?php esc_html_e( 'Qty', 'dokan-lite' ); ?></th>

                                            <th class="line_cost"><?php esc_html_e( 'Totals', 'dokan-lite' ); ?></th>
                                        </tr>
                                    </thead>
                                    <tbody id="order_items_list">

                                        <?php
                                            // List order items
                                            $order_items = $order->get_items( apply_filters( 'woocommerce_admin_order_item_types', array( 'line_item', 'fee' ) ) );

                                            foreach ( $order_items as $item_id => $item ) {

                                                switch ( $item['type'] ) {
                                                    case 'line_item' :
                                                        $_product   = $order->get_product_from_item( $item );
                                                        dokan_get_template_part( 'orders/order-item-html', '', array(
                                                            'order'    => $order,
                                                            'item_id'  => $item_id,
                                                            '_product' => $_product,
                                                            'item'     => $item
                                                        ) );
                                                    break;
                                                    case 'fee' :
                                                        dokan_get_template_part( 'orders/order-fee-html', '', array(
                                                            'item_id' => $item_id,
                                                        ) );

                                                    break;
                                                }

                                                do_action( 'woocommerce_order_item_' . $item['type'] . '_html', $item_id, $item, $order );

                                            }
                                        ?>
                                    </tbody>

                                    <tfoot>
                                        <?php
                                            if ( $totals = $order->get_order_item_totals() ) {
                                                foreach ( $totals as $total ) {
                                                    ?>
                                                    <tr>
                                                        <th colspan="2"><?php echo wp_kses_data( $total['label'] ); ?></th>
                                                        <td colspan="2" class="value"><?php echo wp_kses_post( $total['value']); ?></td>
                                                    </tr>
                                                    <?php
                                                }
                                            }
                                        ?>
                                    </tfoot>

                                </table>

                                <?php
                                $coupons = $order->get_items( array( 'coupon' ) );

                                if ( $coupons ) {
                                    ?>
                                    <table class="dokan-table order-items">
                                        <tr>
                                            <th><?php esc_html_e( 'Coupons', 'dokan-lite' ); ?></th>
                                            <td>
                                                <ul class="list-inline"><?php
                                                    foreach ( $coupons as $item_id => $item ) {

                                                        $post_id = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_title = %s AND post_type = 'shop_coupon' AND post_status = 'publish' LIMIT 1;", $item['name'] ) );

                                                        $link = dokan_get_coupon_edit_url( $post_id );

                                                        echo '<li><a data-html="true" class="tips code" title="' . esc_attr( wc_price( $item['discount_amount'] ) ) . '" href="' . esc_url( $link ) . '"><span>' . esc_html( $item['name'] ). '</span></a></li>';
                                                    }
                                                ?></ul>
                                            </td>
                                        </tr>
                                    </table>
                                    <?php
                                }
                            }
                        ?>
                    </div>
                </div>
            </div>

            <?php do_action( 'dokan_order_detail_after_order_items', $order ); ?>

            <div class="dokan-left dokan-order-billing-address">
                <div class="dokan-panel dokan-panel-default">
                    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Billing Address', 'dokan-lite' ); ?></strong></div>
                    <div class="dokan-panel-body">
                        <?php
                            if ( $order->get_formatted_billing_address() ) {
                                echo wp_kses_post( $order->get_formatted_billing_address() );
                            } else {
                                esc_html_e( 'No billing address set.', 'dokan-lite' );
                            }
                        ?>
                    </div>
                </div>
            </div>

            <div class="dokan-left dokan-order-shipping-address">
                <div class="dokan-panel dokan-panel-default">
                    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Shipping Address', 'dokan-lite' ); ?></strong></div>
                    <div class="dokan-panel-body">
                        <?php
                            if ( $order->get_formatted_shipping_address() ) {
                                echo wp_kses_post( $order->get_formatted_shipping_address() );
                            } else {
                                esc_html_e( 'No shipping address set.', 'dokan-lite' );
                            }
                        ?>
                    </div>
                </div>
            </div>

            <div class="clear"></div>

            <div class="" style="width: 100%">
                <div class="dokan-panel dokan-panel-default">
                    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Downloadable Product Permission', 'dokan-lite' ); ?></strong></div>
                    <div class="dokan-panel-body">
                        <?php
                            dokan_get_template_part( 'orders/downloadable', '', array( 'order'=> $order ) );
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="dokan-w4 dokan-order-right-content">
        <div class="dokan-clearfix">
            <div class="" style="width:100%">
                <div class="dokan-panel dokan-panel-default">
                    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'General Details', 'dokan-lite' ); ?></strong></div>
                    <div class="dokan-panel-body general-details">
                        <ul class="list-unstyled order-status">
                            <li>
                                <span><?php esc_html_e( 'Order Status:', 'dokan-lite' ); ?></span>
                                <label class="dokan-label dokan-label-<?php echo esc_attr( dokan_get_order_status_class( dokan_get_prop( $order, 'status' ) ) ); ?>"><?php echo esc_html( dokan_get_order_status_translated( dokan_get_prop( $order, 'status' ) ) ); ?></label>

                                <?php if ( current_user_can( 'dokan_manage_order' ) && dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) == 'on' && $order->get_status() !== 'cancelled' && $order->get_status() !== 'refunded' ) {?>
                                    <a href="#" class="dokan-edit-status"><small><?php esc_html_e( '&nbsp; Edit', 'dokan-lite' ); ?></small></a>
                                <?php } ?>
                            </li>
                            <?php if ( current_user_can( 'dokan_manage_order' ) ): ?>
                                <li class="dokan-hide">
                                    <form id="dokan-order-status-form" action="" method="post">

                                        <select id="order_status" name="order_status" class="form-control">
                                            <?php
                                            foreach ( $statuses as $status => $label ) {
                                                echo '<option value="' . esc_attr( $status ) . '" ' . selected( $status, 'wc-' . dokan_get_prop( $order, 'status' ), false ) . '>' . esc_html__( $label, 'dokan-lite' ) . '</option>';
                                            }
                                            ?>
                                        </select>

                                        <input type="hidden" name="order_id" value="<?php echo esc_attr( dokan_get_prop( $order, 'id' ) ); ?>">
                                        <input type="hidden" name="action" value="dokan_change_status">
                                        <input type="hidden" name="_wpnonce" value="<?php echo esc_attr( wp_create_nonce( 'dokan_change_status' ) ); ?>">
                                        <input type="submit" class="dokan-btn dokan-btn-success dokan-btn-sm" name="dokan_change_status" value="<?php esc_attr_e( 'Update', 'dokan-lite' ); ?>">

                                        <a href="#" class="dokan-btn dokan-btn-default dokan-btn-sm dokan-cancel-status"><?php esc_html_e( 'Cancel', 'dokan-lite' ) ?></a>
                                    </form>
                                </li>
                            <?php endif ?>

                            <li>
                                <span><?php esc_html_e( 'Order Date:', 'dokan-lite' ); ?></span>
                                <?php echo esc_html( dokan_get_date_created( $order ) ); ?>
                            </li>
                            <li class="earning-from-order">
                                <span><?php esc_html_e( 'Earning From Order:', 'dokan-lite' ); ?></span>
                                <?php echo wp_kses_post( wc_price( dokan()->commission->get_earning_by_order( $order ) ) ); ?>
                            </li>
                        </ul>
                        <?php if ( 'off' === $hide_customer_info && ( $order->get_formatted_billing_address() || $order->get_formatted_shipping_address() ) ) : ?>
                        <ul class="list-unstyled customer-details">
                            <li>
                                <span><?php esc_html_e( 'Customer:', 'dokan-lite' ); ?></span>
                                <?php
                                $customer_user = absint( get_post_meta( dokan_get_prop( $order, 'id' ), '_customer_user', true ) );
                                if ( $customer_user && $customer_user != 0 ) {
                                    $customer_userdata = get_userdata( $customer_user );
                                    $display_name =  $customer_userdata->display_name;
                                } else {
                                    $display_name = get_post_meta( dokan_get_prop( $order, 'id' ), '_billing_first_name', true ). ' '. get_post_meta( dokan_get_prop( $order, 'id' ), '_billing_last_name', true );
                                }
                                ?>
                                <a href="#"><?php echo esc_html( $display_name ); ?></a><br>
                            </li>
                            <li>
                                <span><?php esc_html_e( 'Email:', 'dokan-lite' ); ?></span>
                                <?php echo esc_html( get_post_meta( dokan_get_prop( $order, 'id' ), '_billing_email', true ) ); ?>
                            </li>
                            <li>
                                <span><?php esc_html_e( 'Phone:', 'dokan-lite' ); ?></span>
                                <?php echo esc_html( get_post_meta( dokan_get_prop( $order, 'id' ), '_billing_phone', true ) ); ?>
                            </li>
                            <li>
                                <span><?php esc_html_e( 'Customer IP:', 'dokan-lite' ); ?></span>
                                <?php echo esc_html( get_post_meta( dokan_get_prop( $order, 'id' ), '_customer_ip_address', true ) ); ?>
                            </li>

                            <?php do_action( 'dokan_order_details_after_customer_info', $order ); ?>
                        </ul>
                        <?php endif; ?>
                        <?php
                        if ( get_option( 'woocommerce_enable_order_comments' ) != 'no' ) {
                            $customer_note = get_post_field( 'post_excerpt', dokan_get_prop( $order, 'id' ) );

                            if ( !empty( $customer_note ) ) {
                                ?>
                                <div class="alert alert-success customer-note">
                                    <strong><?php esc_html_e( 'Customer Note:', 'dokan-lite' ) ?></strong><br>
                                    <?php echo wp_kses_post( $customer_note ); ?>
                                </div>
                            <?php } ?>
                        <?php } ?>
                    </div>
                </div>
            </div>

            <div class="" style="width:100%">
                <div class="dokan-panel dokan-panel-default">
                    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Order Notes', 'dokan-lite' ); ?></strong></div>
                    <div class="dokan-panel-body" id="dokan-order-notes">
                        <?php
                        $args = array(
                            'post_id' => $order_id,
                            'approve' => 'approve',
                            'type'    => 'order_note'
                        );

                        remove_filter( 'comments_clauses', array( 'WC_Comments', 'exclude_order_comments' ), 10, 1 );
                        $notes = get_comments( $args );

                        echo '<ul class="order_notes list-unstyled">';

                        if ( $notes ) {
                            foreach( $notes as $note ) {
                                $note_classes = get_comment_meta( $note->comment_ID, 'is_customer_note', true ) ? array( 'customer-note', 'note' ) : array( 'note' );

                                ?>
                                <li rel="<?php echo esc_attr( absint( $note->comment_ID ) ) ; ?>" class="<?php echo esc_attr( implode( ' ', $note_classes ) ); ?>">
                                    <div class="note_content">
                                        <?php echo wp_kses_post( wpautop( wptexturize( $note->comment_content ) ) ); ?>
                                    </div>
                                    <p class="meta">
                                        <?php printf( esc_html__( 'added %s ago', 'dokan-lite' ), esc_textarea( human_time_diff( strtotime( $note->comment_date_gmt ), current_time( 'timestamp', 1 ) ) ) ); ?>
                                        <?php if ( current_user_can( 'dokan_manage_order_note' ) ): ?>
                                            <a href="#" class="delete_note"><?php esc_html_e( 'Delete note', 'dokan-lite' ); ?></a>
                                        <?php endif ?>
                                    </p>
                                </li>
                                <?php
                            }
                        } else {
                            echo '<li>' . esc_html__( 'There are no notes for this order yet.', 'dokan-lite' ) . '</li>';
                        }

                        echo '</ul>';

                        add_filter( 'comments_clauses', array( 'WC_Comments', 'exclude_order_comments' ), 10, 1 );
                        ?>
                        <div class="add_note">
                            <?php if ( current_user_can( 'dokan_manage_order_note' ) ): ?>
                                <h4><?php esc_html_e( 'Add note', 'dokan-lite' ); ?></h4>
                                <form class="dokan-form-inline" id="add-order-note" role="form" method="post">
                                    <p>
                                        <textarea type="text" id="add-note-content" name="note" class="form-control" cols="19" rows="3"></textarea>
                                    </p>
                                    <div class="clearfix">
                                        <div class="order_note_type dokan-form-group">
                                            <select name="note_type" id="order_note_type" class="dokan-form-control">
                                                <option value="customer"><?php esc_html_e( 'Customer note', 'dokan-lite' ); ?></option>
                                                <option value=""><?php esc_html_e( 'Private note', 'dokan-lite' ); ?></option>
                                            </select>
                                        </div>

                                        <input type="hidden" name="security" value="<?php echo esc_attr( wp_create_nonce( 'add-order-note' ) ); ?>">
                                        <input type="hidden" name="delete-note-security" id="delete-note-security" value="<?php echo esc_attr( wp_create_nonce('delete-order-note') ); ?>">
                                        <input type="hidden" name="post_id" value="<?php echo esc_attr( dokan_get_prop( $order, 'id' ) ); ?>">
                                        <input type="hidden" name="action" value="dokan_add_order_note">
                                        <input type="submit" name="add_order_note" class="add_note btn btn-sm btn-theme" value="<?php esc_attr_e( 'Add Note', 'dokan-lite' ); ?>">
                                    </div>
                                </form>
                            <?php endif; ?>

                            <div class="clearfix dokan-form-group" style="margin-top: 10px;">
                                <!-- Trigger the modal with a button -->
                                <input type="button" id="dokan-add-tracking-number" name="add_tracking_number" class="dokan-btn dokan-btn-success" value="<?php esc_attr_e( 'Tracking Number', 'dokan-lite' ); ?>">

                                <form id="add-shipping-tracking-form" method="post" class="dokan-hide" style="margin-top: 10px;">
                                    <div class="dokan-form-group">
                                        <label class="dokan-control-label"><?php esc_html_e( 'Shipping Provider Name / URL', 'dokan-lite' ); ?></label>
                                        <input type="text" name="shipping_provider" id="shipping_provider" class="dokan-form-control" value="">
                                    </div>

                                    <div class="dokan-form-group">
                                        <label class="dokan-control-label"><?php esc_html_e( 'Tracking Number', 'dokan-lite' ); ?></label>
                                        <input type="text" name="tracking_number" id="tracking_number" class="dokan-form-control" value="">
                                    </div>

                                    <div class="dokan-form-group">
                                        <label class="dokan-control-label"><?php esc_html_e( 'Date Shipped', 'dokan-lite' ); ?></label>
                                        <input type="text" name="shipped_date" id="shipped-date" class="dokan-form-control" value="" placeholder="<?php esc_attr_e( get_option( 'date_format' ), 'dokan-lite' ); ?>">
                                    </div>

                                    <input type="hidden" name="security" id="security" value="<?php echo esc_attr( wp_create_nonce('add-shipping-tracking-info' ) ); ?>">
                                    <?php wp_nonce_field( 'dokan_security_action', 'dokan_security_nonce' ); ?>
                                    <input type="hidden" name="post_id" id="post-id" value="<?php echo esc_attr( dokan_get_prop( $order, 'id' ) ); ?>">
                                    <input type="hidden" name="action" id="action" value="dokan_add_shipping_tracking_info">

                                    <div class="dokan-form-group">
                                        <input id="add-tracking-details" type="button" class="btn btn-primary" value="<?php esc_attr_e('Add Tracking Details', 'dokan-lite' );?>">
                                        <button type="button" class="btn btn-default" id="dokan-cancel-tracking-note"><?php esc_html_e( 'Close', 'dokan-lite' );?></button>
                                    </div>
                                </form>
                            </div>
                        </div> <!-- .add_note -->
                    </div> <!-- .dokan-panel-body -->
                </div> <!-- .dokan-panel -->
            </div>
        </div> <!-- .row -->
    </div> <!-- .col-md-4 -->
</div>
