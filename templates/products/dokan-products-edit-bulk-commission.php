<?php

/**
 * Template Name: Dokan commission setting bulk product edit
 *
 * @since DOKAN_SINCE
 *
 * @package Dokan
 */

use WeDevs\Dokan\Commission\Formula\Fixed;
?>

<div class="inline-edit-col" style="float: left">
    <h4><?php esc_html_e( 'Commission settings', 'dokan-lite' ); ?></h4>
    <div class="inline-edit-group  dokan-admin-bulk-product-commission-override-box">
        <label class="alignleft">
            <span class="title"><?php esc_html_e( 'Override', 'dokan-lite' ); ?></span>
            <input type="checkbox" name="dokan_override_bulk_product_commission" id="dokan_override_bulk_product_commission">
        </label>
    </div>

    <div class="inline-edit-group dokan-admin-bulk-product-commission-data-box">
        <p class="form-field dimensions_field">
            <label for="admin_commission">
                <?php esc_html_e( 'Admin Commission', 'dokan-lite' ); ?>
            </label>

            <span class="input-text-wrap" style="display: flex">
                        <input type="hidden" name="_per_product_admin_commission_type" value="<?php echo esc_attr( Fixed::SOURCE ); ?>">
                        <input class="input-text wc_input_price" min="0" max="100" type="text" name="_per_product_admin_commission" value=""/>
                        <span style="display: flex; align-items: center">%&nbsp;&nbsp;+</span>
                        <input type="text" name="_per_product_admin_additional_fee" class="input-text wc_input_price" value="">
                    </span>
            </span>
        </p>
    </div>
</div>
