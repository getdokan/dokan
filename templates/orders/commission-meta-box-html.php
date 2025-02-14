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

$shipping_fee_recipient     = $order->get_meta( 'shipping_fee_recipient' );
$shipping_tax_fee_recipient = $order->get_meta( 'shipping_tax_fee_recipient' );
$product_tax_fee_recipient  = $order->get_meta( 'tax_fee_recipient' );
$admin                      = 'admin';

$shipping_fee     = $order->get_shipping_total();
$product_tax_fee  = $order->get_shipping_tax();
$shipping_tax_fee = $order->get_cart_tax();

$shipping_fee_refunded     = 0;
$product_tax_fee_refunded  = 0;
$shipping_tax_fee_refunded = 0;

foreach ( $order->get_refunds() as $refund ) {
    $shipping_fee_refunded += (float) $refund->get_shipping_total();
    $product_tax_fee_refunded += (float) $refund->get_shipping_tax();
    $shipping_tax_fee_refunded += (float) $refund->get_cart_tax();
}
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
                                    <bdi>
                                    <?php
                                    echo wc_price(
                                        $original_commission, array(
											'currency' => $order->get_currency(),
											'decimals' => wc_get_price_decimals(),
                                        )
                                    );
									?>
                                            </bdi>
                                <?php

                                if ( $order->get_total_refunded_for_item( $item_id ) ) :
                                    ?>
                                        <small class="refunded">
                                        <?php
                                        echo wc_price(
                                            $commission_refunded, array(
												'currency' => $order->get_currency(),
												'decimals' => wc_get_price_decimals(),
                                            )
                                        );
										?>
                                                                </small>
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
                        <?php
                        echo wc_price(
                            $order_total, array(
								'currency' => $order->get_currency(),
								'decimals' => wc_get_price_decimals(),
                            )
                        );
						?>
                    </td>
                </tr>
                <tr>
                    <td class="label"><?php esc_html_e( 'Vendor earning:', 'dokan-lite' ); ?></td>
                    <td width="1%"></td>
                    <td class="total">
                        <?php
                        echo wc_price(
                            $net_amount, array(
								'currency' => $order->get_currency(),
								'decimals' => wc_get_price_decimals(),
                            )
                        );
						?>
                    </td>
                </tr>
                <?php if ( $shipping_fee_recipient === $admin ) : ?>
                <tr>
                    <td class="label"><?php esc_html_e( 'Shipping Fee:', 'dokan-lite' ); ?></td>
                    <td width="1%"></td>
                    <td class="total">
                        <?php
                        echo wc_price(
                            $shipping_fee, array(
								'currency' => $order->get_currency(),
								'decimals' => wc_get_price_decimals(),
                            )
                        );
						?>
                        <?php
                        if ( $shipping_fee_refunded ) :
                            ?>
                            <small class="refunded refunded-recipient">
                            <?php
                            echo wc_price(
                                $shipping_fee_refunded, array(
									'currency' => $order->get_currency(),
									'decimals' => wc_get_price_decimals(),
                                )
                            );
							?>
                                                                        </small>
							<?php
                        endif;
                        ?>
                    </td>
                </tr>
                <?php endif; ?>
                <?php if ( $product_tax_fee_recipient === $admin ) : ?>
                    <tr>
                        <td class="label"><?php esc_html_e( 'Product Tax Fee:', 'dokan-lite' ); ?></td>
                        <td width="1%"></td>
                        <td class="total">
                            <?php
                            echo wc_price(
                                $product_tax_fee, array(
									'currency' => $order->get_currency(),
									'decimals' => wc_get_price_decimals(),
                                )
                            );
							?>
                            <?php
                            if ( $product_tax_fee_refunded ) :
                                ?>
                                <small class="refunded refunded-recipient">
                                <?php
                                echo wc_price(
                                    $product_tax_fee_refunded, array(
										'currency' => $order->get_currency(),
										'decimals' => wc_get_price_decimals(),
                                    )
                                );
								?>
                                                                            </small>
								<?php
                            endif;
                            ?>
                        </td>
                    </tr>
                <?php endif; ?>
                <?php if ( $shipping_tax_fee_recipient === $admin ) : ?>
                    <tr>
                        <td class="label"><?php esc_html_e( 'Shipping Tax Fee:', 'dokan-lite' ); ?></td>
                        <td width="1%"></td>
                        <td class="total">
                            <?php
                            echo wc_price(
                                $shipping_tax_fee, array(
									'currency' => $order->get_currency(),
									'decimals' => wc_get_price_decimals(),
                                )
                            );
							?>
                            <?php
                            if ( $shipping_tax_fee_refunded ) :
                                ?>
                                <small class="refunded refunded-recipient">
                                <?php
                                echo wc_price(
                                    $shipping_tax_fee_refunded, array(
										'currency' => $order->get_currency(),
										'decimals' => wc_get_price_decimals(),
                                    )
                                );
								?>
                                                                            </small>
								<?php
                            endif;
                            ?>
                        </td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>

            <div class="clear"></div>


            <table class="wc-order-totals" style="border-top: 1px solid #999; border-bottom: none; margin-top:12px; padding-top:12px">
                <tbody>
                <tr>
                    <td class="label label-highlight"><?php esc_html_e( 'Total commission:', 'dokan-lite' ); ?></td>
                    <td width="1%"></td>
                    <td class="total">
                        <?php
                        echo wc_price(
                            $total_commission, array(
								'currency' => $order->get_currency(),
								'decimals' => wc_get_price_decimals(),
                            )
                        );
						?>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
    small.refunded-recipient {
        display: block;
        color: #a00;
        white-space: nowrap;
        font-size: smaller;
        padding: 0;
        margin: 0
    }

    small.refunded-recipient::before {
        font-family: Dashicons;
        speak: never;
        font-weight: 400;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        -webkit-font-smoothing: antialiased;
        margin: 0;
        text-indent: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
        content: "\f171";
        position: relative;
        top: auto;
        left: auto;
        margin: -1px 4px 0 0;
        vertical-align: middle;
        line-height: 1em;
    }
</style>
