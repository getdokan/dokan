<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

$store_info = dokan_get_store_info( get_current_user_id() );
?>

<!-- Dokan Store name Display -->
<div class="dokan-store-name">
    <h2><?php echo esc_html( $store_info['store_name'] ); ?></h2>
</div>