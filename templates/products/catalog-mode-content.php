<?php
/**
 * @since 3.6.4
 *
 * @var $product_id int
 * @var $saved_data array
 */

use WeDevs\Dokan\CatalogMode\Helper;

?>
<?php do_action( 'dokan_product_edit_before_catalog_mode', $product_id, $saved_data ); ?>

<style>
    .product-edit-new-container .dokan-catalog-mode {
        margin-bottom: 20px;
    }
</style>

<div class="dokan-edit-row dokan-catalog-mode dokan-clearfix">
    <div class="dokan-section-heading">
        <h2>
            <i class="fas fa-cart-arrow-down"></i>
            <?php esc_html_e( 'Catalog Mode', 'dokan-lite' ); ?>
        </h2>
        <p><?php esc_html_e( 'Enable/Disable Catalog Mode for this product', 'dokan-lite' ); ?></p>
        <a href="#" class="dokan-section-toggle">
            <i class="fas fa-sort-down fa-flip-vertical" aria-hidden="true"></i>
        </a>
        <div class="dokan-clearfix"></div>
    </div>
    <div class="dokan-section-content">
        <?php wp_nonce_field( 'dokan_catalog_mode_frontend', '_dokan_catalog_mode_frontend_nonce' ); ?>
        <?php if ( Helper::hide_add_to_cart_button_option_is_enabled_by_admin() ) : ?>
            <label for="catalog_mode_hide_add_to_cart_button" style="display: block;">
                <input type="checkbox" id="catalog_mode_hide_add_to_cart_button" value="on" name="catalog_mode[hide_add_to_cart_button]"
                    <?php checked( $saved_data['hide_add_to_cart_button'], 'on' ); ?> />
                <span> <?php esc_html_e( 'Check to remove Add to Cart option from your products.', 'dokan-lite' ); ?></span>
            </label>
        <?php endif; ?>
        <?php if ( Helper::hide_product_price_option_is_enabled_by_admin() ) : ?>
            <label for="catalog_mode_hide_product_price" style="display: <?php echo 'on' === $saved_data['hide_add_to_cart_button'] ? 'none' : 'block'; ?>;">
                <input type="checkbox" id="catalog_mode_hide_product_price" value="on" name="catalog_mode[hide_product_price]"
                    <?php checked( $saved_data['hide_product_price'], 'on' ); ?> />
                <span> <?php esc_html_e( 'Check to hide product price from your products.', 'dokan-lite' ); ?></span>
            </label>
        <?php endif; ?>
        <div class="dokan-clearfix"></div>
    </div>
</div>
<?php do_action( 'dokan_product_edit_after_catalog_mode', $product_id, $saved_data ); ?>
<?php if ( Helper::hide_add_to_cart_button_option_is_enabled_by_admin() ) : ?>
    <script type="text/javascript">
        (function ($) {
            $(document).ready(function () {
                $('#catalog_mode_hide_add_to_cart_button').on('change', function () {
                    if ($(this).is(':checked')) {
                        $('#catalog_mode_hide_product_price').parent().show();
                    } else {
                        $('#catalog_mode_hide_product_price').parent().hide();
                        $('#catalog_mode_hide_product_price').prop('checked', false);
                    }
                });
                $('#catalog_mode_hide_add_to_cart_button').trigger('change');
            });
        })(jQuery);
    </script>
<?php endif; ?>
