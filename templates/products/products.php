<?php
$action = isset( $_GET['action'] ) ? $_GET['action'] : 'listing';

if ( $action == 'edit' ) {
    do_action( 'dokan_render_product_edit_template', $action );
} else {
    do_action( 'dokan_render_product_listing_template', $action );
}