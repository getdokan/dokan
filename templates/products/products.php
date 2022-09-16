<?php
$product_action = ! empty( $_GET['action'] ) ? sanitize_text_field( wp_unslash( $_GET['action'] ) ) : 'listing';

if ( 'edit' === $product_action ) {
    do_action( 'dokan_render_product_edit_template', $product_action );
} else {
    do_action( 'dokan_render_product_listing_template', $product_action );
}
