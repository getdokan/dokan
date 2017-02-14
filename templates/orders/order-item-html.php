<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<tr class="item <?php if ( ! empty( $class ) ) echo $class; ?>" data-order_item_id="<?php echo $item_id; ?>">
	<td class="thumb" width="10%">
		<?php if ( $_product ) : ?>
			<a href="<?php echo esc_url( get_permalink( $_product->id ) ); ?>">
				<?php echo $_product->get_image( 'shop_thumbnail', array( 'title' => '' ) ); ?>
			</a>
		<?php else : ?>
			<?php echo woocommerce_placeholder_img( 'shop_thumbnail' ); ?>
		<?php endif; ?>
	</td>

	<td class="name" width="65%">

		<?php if ( $_product ) : ?>
			<a target="_blank" href="<?php echo esc_url( get_permalink( $_product->id ) ); ?>">
				<?php echo esc_html( $item['name'] ); ?>
			</a>
		<?php else : ?>
			<?php echo esc_html( $item['name'] ); ?>
		<?php endif; ?>

		<small><?php if ( $_product && $_product->get_sku() ) echo '<br>' . esc_html( $_product->get_sku() ); ?></small>

		<?php 
		global $wpdb;

		if ( $metadata = $order->has_meta( $item_id ) ) {
			foreach ( $metadata as $meta ) {

				// Skip hidden core fields
				if ( in_array( $meta['meta_key'], apply_filters( 'woocommerce_hidden_order_itemmeta', array(
					'_qty',
					'_tax_class',
					'_product_id',
					'_variation_id',
					'_line_subtotal',
					'_line_subtotal_tax',
					'_line_total',
					'_line_tax',
				) ) ) ) {
					continue;
				}

				// Skip serialised meta
				if ( is_serialized( $meta['meta_value'] ) ) {
					continue;
				}

				// Get attribute data
				if ( taxonomy_exists( wc_sanitize_taxonomy_name( $meta['meta_key'] ) ) ) {
					$term               = get_term_by( 'slug', $meta['meta_value'], wc_sanitize_taxonomy_name( $meta['meta_key'] ) );
					$meta['meta_key']   = wc_attribute_label( wc_sanitize_taxonomy_name( $meta['meta_key'] ) );
					$meta['meta_value'] = isset( $term->name ) ? $term->name : $meta['meta_value'];
				} else {
					$meta['meta_key']   = apply_filters( 'woocommerce_attribute_label', wc_attribute_label( $meta['meta_key'], $_product ), $meta['meta_key'] );
				}

				echo '<br /><strong>' . wp_kses_post( rawurldecode( $meta['meta_key'] ) ) . ':</strong> ' . wp_kses_post( make_clickable( rawurldecode( $meta['meta_value'] ) ) );
			}
		}
		?>

	</td>

	<?php do_action( 'woocommerce_admin_order_item_values', $_product, $item, absint( $item_id ) ); ?>

    <td width="1%">
        <?php if ( isset( $item['qty'] ) ) echo esc_html( $item['qty'] ); ?>
    </td>

    <td class="line_cost" width="1%">
        <?php
            if ( isset( $item['line_total'] ) ) {
                if ( isset( $item['line_subtotal'] ) && $item['line_subtotal'] != $item['line_total'] ) echo '<del>' . wc_price( $item['line_subtotal'] ) . '</del> ';

                echo wc_price( $item['line_total'] );
            }
        ?>
    </td>
</tr>