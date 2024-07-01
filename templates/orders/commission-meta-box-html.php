<?php
/**
 * Dokan Template
 *
 * Dokan Dashboard Commission Meta-box Content Template
 *
 * @var WC_Order $order
 * @var object $data
 * @var float $total_commission
 * @var array $all_commission_types
 *
 * @since DOKAN_LITE
 *
 * @package dokan
 */

$total_commission = 0 > $total_commission ? 0 : $total_commission;

$order_total = $data && property_exists( $data, 'order_total' ) ? $data->order_total : 0;
$net_amount  = $data && property_exists( $data, 'net_amount' ) ? $data->net_amount : 0;
?>

<div id="woocommerce-order-items" class="postbox" style='border: none'>
    <div class="postbox-header">
        <div class="handle-actions hide-if-no-js">
            <button type="button" class="handle-order-higher" aria-disabled="false" aria-describedby="woocommerce-order-items-handle-order-higher-description">
                <span class="order-higher-indicator" aria-hidden="true"></span>
            </button>
            <button type="button" class="handle-order-lower" aria-disabled="false" aria-describedby="woocommerce-order-items-handle-order-lower-description">
                <span class="screen-reader-text"></span>
                <span class="order-lower-indicator" aria-hidden="true"></span>
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
                    <th colspan="2">Item</th>
                    <th><?php esc_html_e( 'Type', 'dokan-lite' ); ?></th>
                    <th><?php esc_html_e( 'Rate', 'dokan-lite' ); ?></th>
                    <th><?php esc_html_e( 'Qty', 'dokan-lite' ); ?></th>
                    <th><?php esc_html_e( 'Commission', 'dokan-lite' ); ?></th>
                </tr>
                </thead>

                <tbody id="order_line_items">
                <?php foreach ( $order->get_items() as $item_id => $item ) : ?>
                    <?php
                    $product      = $item->get_product();
                    $product_link = $product ? admin_url( 'post.php?post=' . $item->get_product_id() . '&action=edit' ) : '';
                    $thumbnail    = $product ? apply_filters( 'woocommerce_admin_order_item_thumbnail', $product->get_image( 'thumbnail', array( 'title' => '' ), false ), $item_id, $item ) : '';
                    $row_class    = apply_filters( 'woocommerce_admin_html_order_item_class', ! empty( $class ) ? $class : '', $item, $order );
                    $commission   = 0;

                    $commission_data = dokan()->commission->get_commission(
                        [
                            'order_item_id' => $item->get_id(),
                            'total_amount' => $item->get_total(),
                            'total_quantity' => $item->get_quantity(),
                        ]
                    );

                    $commission_type      = $commission_data->get_type();
                    $admin_commission     = $commission_data->get_admin_commission();
                    $percentage           = isset( $commission_data->get_parameters()['percentage'] ) ? $commission_data->get_parameters()['percentage'] : 0;
                    $flat                 = isset( $commission_data->get_parameters()['flat'] ) ? $commission_data->get_parameters()['flat'] : 0;
                    $commission_type_html = $all_commission_types[ $commission_type ];
                    ?>
                    <tr class="item  <?php echo esc_attr( $row_class ); ?>" data-order_item_id="<?php echo $item->get_id(); ?>">
                        <td class="thumb">
                            <div class="wc-order-item-thumbnail"> <?php echo wp_kses_post( $thumbnail ); ?> </div>
                        </td>
                        <td class="name">
                            <?php
                            if ( $product_link ) :
                                ?>
                                    <a href="<?php echo esc_url( $product_link ); ?>" class="wc-order-item-name"><?php echo wp_kses_post( $item->get_name() ); ?></a>
                                <?php
                            else :
                                ?>
                                    <div class="wc-order-item-name"><?php echo wp_kses_post( $item->get_name() ); ?></div>
                                <?php
                            endif;

                            if ( $product && $product->get_sku() ) :
                                ?>
                                    <div class="wc-order-item-sku"><strong><?php echo esc_html__( 'SKU:', 'dokan-lite' ); ?></strong><?php echo esc_html( $product->get_sku() ); ?></div>
                                <?php
                            endif;

                            if ( $item->get_variation_id() ) :
                                ?>
                                    <div class="wc-order-item-variation">
                                        <strong>
                                            <?php
                                            echo esc_html__( 'Variation ID:', 'dokan-lite' );

											if ( 'product_variation' === get_post_type( $item->get_variation_id() ) ) :
												echo esc_html( $item->get_variation_id() );
                                            else :
                                                /* translators: %s: variation id */
                                                printf( esc_html__( '%s (No longer exists)', 'dokan-lite' ), esc_html( $item->get_variation_id() ) );
                                            endif;
											?>
                                    </div>
                                <?php
                            endif;
                            ?>
                        </td>


                        <td width="1%">
                            <div class="view">
                                <bdi><?php echo esc_html( $commission_type_html ); ?></bdi>
                            </div>
                        </td>
                        <td width="1%">
                            <div class="view">
                                <?php echo esc_html( isset( $commission_data->get_parameters()['percentage'] ) ? $commission_data->get_parameters()['percentage'] : 0 ); ?>%&nbsp;+&nbsp;<?php echo wc_price( isset( $commission_data->get_parameters()['flat'] ) ? $commission_data->get_parameters()['flat'] : 0 ); ?>
                            </div>
                        </td>
                        <td class="quantity" width="1%">
                            <div class="view">
                                <?php
                                echo '<small class="times">&times;</small> ' . esc_html( $item->get_quantity() );

                                $refunded_qty = -1 * $order->get_qty_refunded_for_item( $item_id );

                                if ( $refunded_qty ) {
                                    echo '<small class="refunded">' . esc_html( $refunded_qty * -1 ) . '</small>';
                                }
                                ?>
                            </div>
                        </td>
                        <td width="1%">
                            <div class="view">
                                <?php
                                $amount = $item->get_total();
                                $original_commission = $commission_data->get_admin_commission();

                                if ( $order->get_total_refunded_for_item( $item_id ) ) {
                                    $commission_refunded = ( $order->get_total_refunded_for_item( $item_id ) / $amount ) * $original_commission;
                                }

                                ?>
                                    <bdi><?php echo wc_price( $original_commission, array( 'currency' => $order->get_currency() ) ); ?></bdi>
                                <?php

                                if ( $order->get_total_refunded_for_item( $item_id ) ) :
                                    ?>
                                        <small class="refunded"><?php echo wc_price( $commission_refunded, array( 'currency' => $order->get_currency() ) ); ?></small>
                                    <?php
                                endif;
                                ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <div class="wc-order-data-row wc-order-totals-items wc-order-items-editable">
            <table class="wc-order-totals">
                <tbody>
                <tr>
                    <td class="label"><?php esc_html_e( 'Net total:', 'dokan-lite' ); ?></td>
                    <td width="1%"></td>
                    <td class="total">
                        <?php echo wc_price( $order_total, array( 'currency' => $order->get_currency() ) ); ?>
                    </td>
                </tr>
                <tr>
                    <td class="label"><?php esc_html_e( 'Vendor earning:', 'dokan-lite' ); ?></td>
                    <td width="1%"></td>
                    <td class="total">
                        <?php echo wc_price( $net_amount, array( 'currency' => $order->get_currency() ) ); ?>
                    </td>
                </tr>
                </tbody>
            </table>

            <div class="clear"></div>


            <table class="wc-order-totals" style="border-top: 1px solid #999; border-bottom: none; margin-top:12px; padding-top:12px">
                <tbody>
                <tr>
                    <td class="label label-highlight"><?php esc_html_e( 'Total commission:', 'dokan-lite' ); ?></td>
                    <td width="1%"></td>
                    <td class="total">
                        <?php echo wc_price( $total_commission, array( 'currency' => $order->get_currency() ) ); ?>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
