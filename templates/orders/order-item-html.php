<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

$img_kses = apply_filters(
    'dokan_product_image_attributes', [
        'img' => [
            'alt'         => [],
            'class'       => [],
            'height'      => [],
            'src'         => [],
            'width'       => [],
            'srcset'      => [],
            'data-srcset' => [],
            'data-src'    => [],
        ],
    ]
);

?>
<tr class="item <?php echo ! empty( $class ) ? esc_attr( $class ) : ''; ?>" data-order_item_id="<?php echo esc_attr( $item_id ); ?>">
    <td class="thumb" style="width: 10%">
        <?php if ( $_product ) : ?>
            <a href="<?php echo esc_url( get_permalink( $_product->get_id() ) ); ?>">
                <?php echo wp_kses( $_product->get_image( 'shop_thumbnail', [ 'title' => '' ] ), $img_kses ); ?>
            </a>
        <?php else : ?>
            <?php echo wp_kses_post( wc_placeholder_img( 'shop_thumbnail' ) ); ?>
        <?php endif; ?>
    </td>

    <td class="name" style="width: 65%">
        <?php if ( $_product ) : ?>
            <a target="_blank" href="<?php echo esc_url( get_permalink( $_product->get_id() ) ); ?>">
                <?php echo esc_html( $item['name'] ); ?>
            </a>
        <?php else : ?>
            <?php echo esc_html( $item['name'] ); ?>
        <?php endif; ?>

        <small>
            <?php
            if ( $_product && $_product->get_sku() ) {
                echo '<br>' . esc_html( $_product->get_sku() );
            }
            ?>
        </small>
    </td>

    <?php do_action( 'woocommerce_admin_order_item_values', $_product, $item, absint( $item_id ) ); ?>

    <td width="1%">
        <?php
            if ( isset( $item['qty'] ) ) {
                $qty = $item->get_quantity();
                $refunded_qty = $order->get_qty_refunded_for_item( $item_id );
                
                if ( $refunded_qty ) { 
                    $qty_display = '<del>' . esc_html( $qty ) . '</del> <ins>' . esc_html( $qty - ( $refunded_qty * -1 ) ) . '</ins>';
                } else {
                    $qty_display = esc_html( $qty );
                } 
                
                echo $qty_display;
            }
        ?>
    </td>

    <td class="line_cost" style="width: 1%">
        <?php
            if ( isset( $item['line_total'] ) ) {
                if ( isset( $item['line_subtotal'] ) && $item['line_subtotal'] != $item['line_total'] ) {
                    echo wp_kses_post( '<del>' . wc_price( $item['line_subtotal'] ) . '</del> ' );
                }

                $line_total = $item['line_total'];
                $refunded = $order->get_total_refunded_for_item( $item_id );

                if ( $refunded ) {
                    echo wp_kses_post( '<del>' . wc_price( $line_total, array( 'currency' => $order->get_currency() ) ) ) . '</del> ';
                    $line_total = $line_total - $refunded;
                }

                echo wp_kses_post( wc_price( $line_total, array( 'currency' => $order->get_currency() ) ) );
            }

            echo wp_kses_post( wc_price( $item['line_total'], [ 'currency' => $order->get_currency() ] ) );
        }
        ?>
    </td>
</tr>
