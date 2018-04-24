<?php

/**
* Map meta data for new item meta keys
*
* @since 2.5.8
*
* @return void
**/
function dokan_get_order_item_meta_map() {
    return apply_filters( 'dokan_get_order_item_meta_keymap', array(
        'product_id'   => '_product_id',
        'variation_id' => '_variation_id',
        'quantity'     => '_qty',
        'tax_class'    => '_tax_class',
        'subtotal'     => '_line_subtotal',
        'subtotal_tax' => '_line_subtotal_tax',
        'total'        => '_line_total',
        'total_tax'    => '_line_tax',
        'taxes'        => '_line_tax_data'
    ) );
}
