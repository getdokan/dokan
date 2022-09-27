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

        <?php
        global $wpdb;

        $item     = new WC_Order_Item( $order );
        $metadata = $item->get_meta_data();
        foreach ( $metadata as $meta ) {
            // Skip hidden core fields
            if ( in_array(
                $meta['meta_key'],
                apply_filters(
                    'woocommerce_hidden_order_itemmeta', [
                        '_qty',
                        '_tax_class',
                        '_product_id',
                        '_variation_id',
                        '_line_subtotal',
                        '_line_subtotal_tax',
                        '_line_total',
                        '_line_tax',
                    ]
                ),
                true
            ) ) {
                continue;
            }

            // Skip serialised meta
            if ( is_serialized( $meta['meta_value'] ) ) {
                continue;
            }

            // Get attribute data
            if ( taxonomy_exists( wc_sanitize_taxonomy_name( $meta['meta_key'] ) ) ) {
                $term               = get_term_by( 'slug', $meta['meta_value'], wc_sanitize_taxonomy_name( $meta['meta_key'] ) ); // phpcs:ignore
                $meta['meta_key']   = wc_attribute_label( wc_sanitize_taxonomy_name( $meta['meta_key'] ) ); // phpcs:ignore
                $meta['meta_value'] = isset( $term->name ) ? $term->name : $meta['meta_value']; // phpcs:ignore
            } else {
                $meta['meta_key'] = apply_filters( 'woocommerce_attribute_label', wc_attribute_label( $meta['meta_key'], $_product ), $meta['meta_key'] ); // phpcs:ignore
            }

            echo '<br /><strong>' . wp_kses_post( rawurldecode( $meta['meta_key'] ) ) . ':</strong> ' . wp_kses_post( make_clickable( rawurldecode( $meta['meta_value'] ) ) );
        }
        ?>

    </td>

    <?php do_action( 'woocommerce_admin_order_item_values', $_product, $item, absint( $item_id ) ); ?>

    <td style="width: 1%">
        <?php
        if ( isset( $item['qty'] ) ) {
            echo esc_html( $item['qty'] );
        }
        ?>
    </td>

    <td class="line_cost" style="width: 1%">
        <?php
        if ( isset( $item['line_total'] ) ) {
            if ( isset( $item['line_subtotal'] ) && $item['line_subtotal'] !== $item['line_total'] ) {
                echo wp_kses_post( '<del>' . wc_price( $item['line_subtotal'] ) . '</del> ' );
            }

            echo wp_kses_post( wc_price( $item['line_total'], [ 'currency' => $order->get_currency() ] ) );
        }
        ?>
    </td>
</tr>
