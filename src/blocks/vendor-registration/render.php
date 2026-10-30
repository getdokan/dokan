<?php
/**
 * Front-end render of the Vendor Registration Form block.
 *
 * @since DOKAN_SINCE
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo dokan_get_container()->get( \WeDevs\Dokan\VendorRegistration\Block::class )->render( (array) $attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped while rendering.
