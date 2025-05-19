<?php
/**
 * Dokan Template
 *
 * Dokan Dashboard Sub-order or Related Order Content Template
 *
 * @var WC_Order $order
 * @var WC_Order[] $orders_to_render
 * @var boolean $has_sub_order
 * @var WC_Order $parent_order
 *
 * @since DOKAN_LITE
 *
 * @package dokan
 */
?>

<div id="woocommerce-order-items" class="postbox" style='border: none'>
    <div class="postbox-header">
        <div class="handle-actions hide-if-no-js">
            <button type="button" class="handle-order-higher" aria-disabled="false" aria-describedby="dokan-order-items-handle-order-higher-description">
                <span class="order-higher-indicator" aria-hidden="true"></span>
            </button>
            <button type="button" class="handle-order-lower" aria-disabled="false" aria-describedby="dokan-order-items-handle-order-lower-description">
                <span class="screen-reader-text"></span><span class="order-lower-indicator" aria-hidden="true"></span>
            </button>
            <button type="button" class="handlediv" aria-expanded="true">
                <span class="toggle-indicator" aria-hidden="true"></span>
            </button>
        </div>
    </div>
    <div class="inside">
        <div class="woocommerce_order_items_wrapper wc-order-items-editable">
            <table cellpadding="0" cellspacing="0" class="woocommerce_order_items">
                <thead>
                <tr>
                    <th colspan="2"><?php esc_html_e( 'Order', 'dokan-lite' ); ?></th>
                    <th><?php esc_html_e( 'Date', 'dokan-lite' ); ?></th>
                    <th><?php esc_html_e( 'Status', 'dokan-lite' ); ?></th>
                    <th><?php esc_html_e( 'Total', 'dokan-lite' ); ?></th>
                    <th><?php esc_html_e( 'Vendor', 'dokan-lite' ); ?></th>
                </tr>
                </thead>

                <tbody id="order_line_items">
                <?php foreach ( $orders_to_render as $order_item ) : ?>
                    <?php
                    $woocommerce_list_table = wc_get_container()->get( \Automattic\WooCommerce\Internal\Admin\Orders\ListTable::class );
                    $vendor                 = dokan()->vendor->get( $order_item->get_meta( '_dokan_vendor_id' ) );
                    $edit_url               = esc_url(
                        add_query_arg(
                            [
                                'action' => 'edit',
                                'post'   => $order_item->get_id(),
                            ],
                            admin_url( 'post.php' )
                        )
                    );

                    $sub_order = new WC_Order( $order_item->get_id() );
                    ?>
                    <tr class="item">
                        <td class="name">
                            <a href="<?php echo esc_url( $edit_url ); ?>" class="order-view"><strong># <?php echo esc_attr( $sub_order->get_id() ); ?></strong></a>

                            <?php
							if ( ! $has_sub_order && $sub_order->get_id() === $parent_order->get_id() ) :
								echo '<strong>' . esc_html_e( '(Parent order)', 'dokan-lite' ) . '</p>';
                            endif;
                            ?>
                        </td>
                        <td width="1%"></td>


                        <td class=''>
                            <div class="view">
                                <?php echo $woocommerce_list_table->render_order_date_column( $sub_order ); ?>
                            </div>
                        </td>

                        <td class="">
                            <div class="view">
                                <?php echo $woocommerce_list_table->render_order_status_column( $sub_order ); ?>
                            </div>
                        </td>
                        <td>
                            <div class="view">
                                <?php echo $woocommerce_list_table->render_order_total_column( $sub_order ); ?>
                            </div>
                        </td>
                        <td>
                            <div class="view">
                                <?php if ( $vendor->get_shop_name() ) : ?>
                                    <a href="<?php echo esc_url( $vendor->get_shop_url() ); ?>"><?php echo esc_html( $vendor->get_shop_name() ); ?></a>
                                <?php else : ?>
                                    <?php esc_html_e( '(no name)', 'dokan-lite' ); ?>
                                <?php endif ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<script>
    jQuery( document ).ready(function() {
        jQuery( '#dokan_sub_or_related_orders a.order-preview' ).hide();
    });
</script>
