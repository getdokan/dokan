<?php

/**
 * Template Name: Dokan commission setting bulk product edit
 *
 * @since 3.14.2
 *
 * @package Dokan
 */

use WeDevs\Dokan\Commission\Formula\Fixed;
?>

<div class="inline-edit-col">
    <div class="inline-edit-group">
        <label class="alignleft">
            <span class="title"><?php esc_html_e( 'Commission', 'dokan-lite' ); ?></span>
            <span class="input-text-wrap">
					<select class="dokan_override_bulk_product_commission change_to" name="dokan_override_bulk_product_commission">
						<option value=""><?php esc_html_e( '— No change —', 'dokan-lite' ); ?></option>
                        <option value="1"><?php esc_html_e( 'Change to:', 'dokan-lite' ); ?></option>
                    </select>
				</span>
        </label>
        <div class="change-input inline-edit-group dokan-admin-bulk-product-commission-data-box" style="">
            <div>
                <label for="admin_commission">
                    <?php esc_html_e( 'Fixed', 'dokan-lite' ); ?>
                </label>

                <span class="input-text-wrap" style="display: flex">
                        <input type="hidden" name="_per_product_admin_commission_type" value="<?php echo esc_attr( Fixed::SOURCE ); ?>">
                        <input class="input-text wc_input_price" min="0" max="100" type="text" name="_per_product_admin_commission" value=""/>
                        <span style="display: flex; align-items: center">%&nbsp;&nbsp;+</span>
                        <input type="text" name="_per_product_admin_additional_fee" class="input-text wc_input_price" value="">
                    </span>
                </span>
            </div>
        </div>
    </div>
</div>
