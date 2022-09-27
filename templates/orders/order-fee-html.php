<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<tr class="fee <?php echo ! empty( $class ) ? esc_attr( $class ) : ''; ?>" data-order_item_id="<?php echo esc_attr( $item_id ); ?>">
    <td class="check-column"><input type="checkbox"/></td>

    <td class="thumb"></td>

    <td class="name">
        <input
            type="text"
            placeholder="<?php esc_attr_e( 'Fee Name', 'dokan-lite' ); ?>"
            name="order_item_name[<?php echo esc_attr( absint( $item_id ) ); ?>]"
            value="<?php echo isset( $item['name'] ) ? esc_attr( $item['name'] ) : ''; ?>"/>
        <input type="hidden" class="order_item_id" name="order_item_id[]" value="<?php echo esc_attr( $item_id ); ?>"/>
    </td>

    <td class="quantity" style="width: 1%;">1</td>

    <td class="line_cost" style="width: 1%;">
        <label>
            <?php esc_html_e( 'Total', 'dokan-lite' ); ?>:
            <input
                type="text"
                name="line_total[<?php echo esc_attr( absint( $item_id ) ); ?>]"
                placeholder="0.00"
                value="<?php echo isset( $item['line_total'] ) ? esc_attr( $item['line_total'] ) : ''; ?>"
                class="line_total"/>
        </label>
    </td>

    <?php if ( get_option( 'woocommerce_calc_taxes' ) === 'yes' ) : ?>
        <td class="line_tax" style="width: 1%;">
            <input
                type="text"
                name="line_tax[<?php echo esc_attr( absint( $item_id ) ); ?>]"
                placeholder="0.00"
                value="<?php echo isset( $item['line_tax'] ) ? esc_attr( $item['line_tax'] ) : ''; ?>" class="line_tax"/>
        </td>
    <?php endif; ?>

</tr>
