<?php
/**
* Remove product_style option from database
*/

function dokan_remove_product_style_option() {
    delete_option( 'product_style' );
}

dokan_remove_product_style_option();
