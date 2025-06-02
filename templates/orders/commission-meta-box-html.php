<?php
/**
 * Dokan Template
 *
 * Dokan Dashboard Commission Meta-box Content Template
 *
 * @var WC_Order $order
 * @var array $all_commission_types
 * @var \WeDevs\Dokan\Commission\OrderCommission $order_commission
 *
 * @since DOKAN_LITE
 *
 * @package dokan
 */

$order_total = $order->get_total() - $order->get_total_refunded();

$shipping_fee_recipient     = $order->get_meta( 'shipping_fee_recipient' );
$shipping_tax_fee_recipient = $order->get_meta( 'shipping_tax_fee_recipient' );
$product_tax_fee_recipient  = $order->get_meta( 'tax_fee_recipient' );
$admin                      = 'admin';

$shipping_fee     = $order->get_shipping_total();
$product_tax_fee  = $order->get_cart_tax();
$shipping_tax_fee = $order->get_shipping_tax();

$shipping_fee_refunded     = 0;
$product_tax_fee_refunded  = 0;
$shipping_tax_fee_refunded = 0;

foreach ( $order->get_refunds() as $refund ) {
    $shipping_fee_refunded += (float) $refund->get_shipping_total();
    $product_tax_fee_refunded += (float) $refund->get_shipping_tax();
    $shipping_tax_fee_refunded += (float) $refund->get_cart_tax();
}
?>

<div id="dokan-order-items" class="dokan-order-metabox-items postbox" style='border: none'>
    <div class="inside">
        <div class="dokan_order_items_wrapper">
            <table cellpadding="0" cellspacing="0" class="dokan_order_items">
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
                    $commission_type      = '';
                    $admin_commission     = '';
                    $commission_data = $order_commission->get_commission_for_line_item( $item_id );


                    $commission_type_html = $all_commission_types[ $commission_type ] ?? '';
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
                            <div class="view" title="<?php echo esc_html( sprintf( __( 'Source: %s', 'dokan-lite' ), $commission_data->get_settings()->get_source() ) ); ?>">
                                <?php echo esc_html( $commission_data->get_settings()->get_percentage() ); ?>%&nbsp;+&nbsp;<?php echo wc_price( $commission_data->get_settings()->get_flat() ); ?>
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
                                $original_commission = $commission_data->get_admin_net_commission();
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
                            $order_commission->get_vendor_earning(), array(
								'currency' => $order->get_currency(),
								'decimals' => wc_get_price_decimals(),
                            )
                        );
						?>
                    </td>
                </tr>
                <?php if ( $order_commission->get_admin_subsidy() ) : ?>
                <tr>
                    <td class="label"><?php esc_html_e( 'Subsidy:', 'dokan-lite' ); ?></td>
                    <td width="1%"></td>
                    <td class="total">
                        <?php
                        echo wc_price(
                            $order_commission->get_admin_subsidy(), array(
								'currency' => $order->get_currency(),
								'decimals' => wc_get_price_decimals(),
                            )
                        );
						?>
                    </td>
                </tr>
                <?php endif; ?>
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
                <?php if ( $order_commission->get_admin_gateway_fee() ) : ?>
                    <tr>
                        <td class="label"><?php esc_html_e( 'Gateway Fee:', 'dokan-lite' ); ?></td>
                        <td width="1%"></td>
                        <td class="total">
                            <?php
                            echo wc_price(
                                -1 * $order_commission->get_admin_gateway_fee(), array(
									'currency' => $order->get_currency(),
									'decimals' => wc_get_price_decimals(),
                                )
                            );
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
                            $order_commission->get_admin_commission(), array(
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
