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
 * @var \WeDevs\Dokan\Commission\OrderCommission $order_commission
 *
 * @since DOKAN_LITE
 *
 * @package dokan
 */

$total_commission = 0 > $total_commission ? 0 : $total_commission;

$order_total = $order->get_total() - $order->get_total_refunded();
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

<div id="dokan-order-items" class="postbox" style='border: none'>
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
                            <div class="view" title="<?php echo esc_html( sprintf( __( 'Source: %s', 'dokan-lite'), $commission_data->get_settings()->get_source() ) ); ?>">
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
                                $original_commission = $commission_data->get_admin_commission();
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
								'decimals' => wc_get_price_decimals() + 2,
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
                                -1 * $order_commission->get_admin_gateway_fee() , array(
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
    #dokan-order-items .inside {
        margin: 0;
        padding: 0;
        background: #fefefe;
    }
    #dokan-order-items .wc-order-data-row {
        border-bottom: 1px solid #dfdfdf;
        padding: 1.5em 2em;
        background: #f8f8f8;
        line-height: 2em;
        text-align: right;
    }
    #dokan-order-items .wc-order-data-row::after,
    #dokan-order-items .wc-order-data-row::before {
        content: " ";
        display: table;
    }
    #dokan-order-items .wc-order-data-row::after {
        clear: both;
    }
    #dokan-order-items .wc-order-data-row p {
        margin: 0;
        line-height: 2em;
    }
    #dokan-order-items .wc-order-data-row .wc-used-coupons {
        text-align: left;
    }
    #dokan-order-items .wc-order-data-row .wc-used-coupons .tips {
        display: inline-block;
    }
    #dokan-order-items .wc-used-coupons {
        float: left;
        width: 50%;
    }
    #dokan-order-items .wc-order-totals {
        float: right;
        width: 50%;
        margin: 0;
        padding: 0;
        text-align: right;
    }
    #dokan-order-items .wc-order-totals .amount {
        font-weight: 700;
    }
    #dokan-order-items .wc-order-totals .label {
        vertical-align: top;
    }
    #dokan-order-items .wc-order-totals .total {
        font-size: 1em !important;
        width: 10em;
        margin: 0 0 0 0.5em;
        box-sizing: border-box;
    }
    #dokan-order-items .wc-order-totals .total input[type="text"] {
        width: 96%;
        float: right;
    }
    #dokan-order-items .wc-order-totals .refunded-total {
        color: #a00;
    }
    #dokan-order-items .wc-order-totals .label-highlight {
        font-weight: 700;
    }
    #dokan-order-items .refund-actions {
        margin-top: 5px;
        padding-top: 12px;
        border-top: 1px solid #dfdfdf;
    }
    #dokan-order-items .refund-actions .button {
        float: right;
        margin-left: 4px;
    }
    #dokan-order-items .refund-actions .cancel-action {
        float: left;
        margin-left: 0;
    }
    #dokan-order-items .add_meta {
        margin-left: 0 !important;
    }
    #dokan-order-items h3 small {
        color: #999;
    }
    #dokan-order-items .amount {
        white-space: nowrap;
    }
    #dokan-order-items .add-items .description {
        margin-right: 10px;
    }
    #dokan-order-items .add-items .button {
        float: left;
        margin-right: 0.25em;
    }
    #dokan-order-items .add-items .button-primary {
        float: none;
        margin-right: 0;
    }
    #dokan-order-items .inside {
        display: block !important;
    }
    #dokan-order-items .handlediv,
    #dokan-order-items .hndle,
    #dokan-order-items .postbox-header {
        display: none;
    }
    #dokan-order-items .woocommerce_order_items_wrapper {
        margin: 0;
        overflow-x: auto;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items {
        width: 100%;
        background: #fff;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items thead th {
        text-align: left;
        padding: 1em;
        font-weight: 400;
        color: #999;
        background: #f8f8f8;
        -webkit-touch-callout: none;
        user-select: none;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items thead th.sortable {
        cursor: pointer;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items thead th:last-child {
        padding-right: 2em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items thead th:first-child {
        padding-left: 2em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items thead th .wc-arrow {
        float: right;
        position: relative;
        margin-right: -1em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody th,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td {
        padding: 1.5em 1em 1em;
        text-align: left;
        line-height: 1.5em;
        vertical-align: top;
        border-bottom: 1px solid #f8f8f8;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody th textarea,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td textarea {
        width: 100%;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody th select,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td select {
        width: 50%;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody th input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody th textarea,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td textarea {
        font-size: 14px;
        padding: 4px;
        color: #555;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody th:last-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td:last-child {
        padding-right: 2em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody th:first-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td:first-child {
        padding-left: 2em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody tr:last-child td {
        border-bottom: 1px solid #dfdfdf;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody tr:first-child td {
        border-top: 8px solid #f8f8f8;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tbody#order_line_items tr:first-child td {
        border-top: none;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.thumb {
        text-align: left;
        width: 38px;
        padding-bottom: 1.5em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.thumb .wc-order-item-thumbnail {
        width: 38px;
        height: 38px;
        border: 2px solid #e8e8e8;
        background: #f8f8f8;
        color: #ccc;
        position: relative;
        font-size: 21px;
        display: block;
        text-align: center;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.thumb .wc-order-item-thumbnail:empty::before {
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
        content: "\f128";
        width: 38px;
        line-height: 38px;
        display: block;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.thumb .wc-order-item-thumbnail img {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        position: relative;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.name .wc-order-item-sku,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.name .wc-order-item-variation {
        display: block;
        margin-top: 0.5em;
        font-size: 0.92em !important;
        color: #888;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item {
        min-width: 200px;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .center,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .variation-id {
        text-align: center;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class {
        text-align: right;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class label {
        white-space: nowrap;
        color: #999;
        font-size: 0.833em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost label input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost label input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost label input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax label input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity label input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax label input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class label input {
        display: inline;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class input {
        width: 70px;
        vertical-align: middle;
        text-align: right;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost select,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost select,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost select,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax select,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity select,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax select,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class select {
        width: 85px;
        height: 26px;
        vertical-align: middle;
        font-size: 1em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input {
        display: inline-block;
        background: #fff;
        border: 1px solid #ddd;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.07);
        margin: 1px 0;
        min-width: 80px;
        overflow: hidden;
        line-height: 1em;
        text-align: right;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input div.input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input div.input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input div.input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input div.input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input div.input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input div.input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input div.input {
        width: 100%;
        box-sizing: border-box;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input div.input label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input div.input label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input div.input label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input div.input label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input div.input label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input div.input label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input div.input label {
        font-size: 0.75em;
        padding: 4px 6px 0;
        color: #555;
        display: block;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input div.input input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input div.input input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input div.input input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input div.input input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input div.input input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input div.input input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input div.input input {
        width: 100%;
        box-sizing: border-box;
        border: 0;
        box-shadow: none;
        margin: 0;
        padding: 0 6px 4px;
        color: #555;
        background: 0 0;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input div.input input::-webkit-input-placeholder,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input div.input input::-webkit-input-placeholder,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input div.input input::-webkit-input-placeholder,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input div.input input::-webkit-input-placeholder,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input div.input input::-webkit-input-placeholder,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input div.input input::-webkit-input-placeholder,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input div.input input::-webkit-input-placeholder {
        color: #ddd;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input div.input:first-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input div.input:first-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input div.input:first-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input div.input:first-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input div.input:first-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input div.input:first-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input div.input:first-child {
        border-bottom: 1px dashed #ddd;
        background: #fff;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input div.input:first-child label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input div.input:first-child label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input div.input:first-child label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input div.input:first-child label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input div.input:first-child label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input div.input:first-child label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input div.input:first-child label {
        color: #ccc;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .split-input div.input:first-child input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .split-input div.input:first-child input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .split-input div.input:first-child input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .split-input div.input:first-child input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .split-input div.input:first-child input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .split-input div.input:first-child input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .split-input div.input:first-child input {
        color: #ccc;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .view,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .view,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .view,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .view,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .view,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .view,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .view {
        white-space: nowrap;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .edit,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .edit,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .edit,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .edit,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .edit,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .edit,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .edit {
        text-align: left;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost del,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost del,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost del,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax del,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity del,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax del,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class del,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class small.times {
        font-size: 0.92em !important;
        color: #888;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-taxes,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-refund-fields,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-taxes {
        margin: 0;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-refund-fields label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-taxes label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-refund-fields label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-taxes label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-refund-fields label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-taxes label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-refund-fields label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-taxes label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-refund-fields label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-taxes label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-refund-fields label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-taxes label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-refund-fields label,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-taxes label {
        display: block;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax .wc-order-item-discount,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class .wc-order-item-discount {
        display: block;
        margin-top: 0.5em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .cost small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .item_cost small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_cost small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .line_tax small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax small.times,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .tax_class small.times {
        margin-right: 0.25em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity {
        text-align: center;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .quantity input {
        text-align: center;
        width: 50px;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items span.subtotal {
        opacity: 0.5;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.tax_class,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items th.tax_class {
        text-align: left;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .calculated {
        border-color: #ae8ca2;
        border-style: dotted;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta {
        width: 100%;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta {
        margin: 0.5em 0 0;
        font-size: 0.92em !important;
        color: #888;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta tr th,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta tr th {
        border: 0;
        padding: 0 4px 0.5em 0;
        line-height: 1.5em;
        width: 20%;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta tr td,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta tr td {
        padding: 0 4px 0.5em 0;
        border: 0;
        line-height: 1.5em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta tr td input,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta tr td input {
        width: 100%;
        margin: 0;
        position: relative;
        border-bottom: 0;
        box-shadow: none;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta tr td textarea,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta tr td textarea {
        width: 100%;
        height: 4em;
        margin: 0;
        box-shadow: none;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta tr td input:focus + textarea,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta tr td input:focus + textarea {
        border-top-color: #999;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta tr td p,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta tr td p {
        margin: 0 0 0.5em;
        line-height: 1.5em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.display_meta tr td p:last-child,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items table.meta tr td p:last-child {
        margin: 0;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items .refund_by {
        border-bottom: 1px dotted #999;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.fee .thumb div {
        display: block;
        text-indent: -9999px;
        position: relative;
        height: 1em;
        width: 1em;
        font-size: 1.5em;
        line-height: 1em;
        vertical-align: middle;
        margin: 0 auto;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.fee .thumb div::before {
        font-family: WooCommerce;
        speak: never;
        font-weight: 400;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        margin: 0;
        text-indent: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
        content: "\e007";
        color: #ccc;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.refund .thumb div {
        display: block;
        text-indent: -9999px;
        position: relative;
        height: 1em;
        width: 1em;
        font-size: 1.5em;
        line-height: 1em;
        vertical-align: middle;
        margin: 0 auto;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.refund .thumb div::before {
        font-family: WooCommerce;
        speak: never;
        font-weight: 400;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        margin: 0;
        text-indent: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
        content: "\e014";
        color: #ccc;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.shipping .thumb div {
        display: block;
        text-indent: -9999px;
        position: relative;
        height: 1em;
        width: 1em;
        font-size: 1.5em;
        line-height: 1em;
        vertical-align: middle;
        margin: 0 auto;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.shipping .thumb div::before {
        font-family: WooCommerce;
        speak: never;
        font-weight: 400;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        margin: 0;
        text-indent: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
        content: "\e01a";
        color: #ccc;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.shipping .shipping_method,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items tr.shipping .shipping_method_name {
        width: 100%;
        margin: 0 0 0.5em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items th.line_tax {
        white-space: nowrap;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.line_tax .delete-order-tax,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items th.line_tax .delete-order-tax {
        display: block;
        text-indent: -9999px;
        position: relative;
        height: 1em;
        width: 1em;
        float: right;
        font-size: 14px;
        visibility: hidden;
        margin: 3px -18px 0 0;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.line_tax .delete-order-tax::before,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items th.line_tax .delete-order-tax::before {
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
        content: "\f153";
        color: #999;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.line_tax .delete-order-tax:hover::before,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items th.line_tax .delete-order-tax:hover::before {
        color: #a00;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items td.line_tax:hover .delete-order-tax,
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items th.line_tax:hover .delete-order-tax {
        visibility: visible;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items small.refunded {
        display: block;
        color: #a00;
        white-space: nowrap;
        margin-top: 0.5em;
    }
    #dokan-order-items .woocommerce_order_items_wrapper table.woocommerce_order_items small.refunded::before {
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
    #dokan-order-items .wc-order-edit-line-item {
        padding-left: 0;
    }
    #dokan-order-items .wc-order-edit-line-item-actions {
        width: 44px;
        text-align: right;
        padding-left: 0;
        vertical-align: middle;
    }
    #dokan-order-items .wc-order-edit-line-item-actions a {
        color: #ccc;
        display: inline-block;
        cursor: pointer;
        padding: 0;
        margin: 0 0 6px 12px;
        vertical-align: middle;
        text-decoration: none;
        line-height: 16px;
        width: 16px;
        height: 16px;
        overflow: hidden;
    }
    #dokan-order-items .wc-order-edit-line-item-actions a::before {
        margin: 0;
        padding: 0;
        font-size: 16px;
        width: 16px;
        height: 16px;
    }
    #dokan-order-items .wc-order-edit-line-item-actions a:hover::before {
        color: #999;
    }
    #dokan-order-items .wc-order-edit-line-item-actions a:first-child {
        margin-left: 0;
    }
    #dokan-order-items .wc-order-edit-line-item-actions .edit-order-item::before {
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
        content: "\f464";
        position: relative;
    }
    #dokan-order-items .wc-order-edit-line-item-actions .delete-order-item::before,
    #dokan-order-items .wc-order-edit-line-item-actions .delete_refund::before {
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
        content: "\f158";
        position: relative;
    }
    #dokan-order-items .wc-order-edit-line-item-actions .delete-order-item:hover::before,
    #dokan-order-items .wc-order-edit-line-item-actions .delete_refund:hover::before {
        color: #a00;
    }
    #dokan-order-items tbody tr .wc-order-edit-line-item-actions {
        opacity: 0;
    }
    #dokan-order-items tbody tr:focus-within .wc-order-edit-line-item-actions,
    #dokan-order-items tbody tr:hover .wc-order-edit-line-item-actions {
        opacity: 1;
    }
    #dokan-order-items .wc-order-totals .wc-order-edit-line-item-actions {
        width: 1.5em;
        visibility: visible !important;
    }
    #dokan-order-items .wc-order-totals .wc-order-edit-line-item-actions a {
        padding: 0;
    }

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
