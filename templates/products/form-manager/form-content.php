<?php
/**
 * Dokan Dashboard Product Edit Template
 *
 * @since DOKAN_SINCE
 *
 * @var $product WC_Product instance of WC_Product object
 *
 * @package dokan
 */

defined( 'ABSPATH' ) || exit;

?>
<input type="hidden" name="dokan_product_id" id="dokan_product_id" value="<?php echo esc_attr( $product->get_id() ); ?>" />
<div id="product-form-manager-template" class="dokan-product-edit-form"></div>
