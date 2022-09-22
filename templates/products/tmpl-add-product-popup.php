<?php

use WeDevs\Dokan\ProductCategory\Helper;
use WeDevs\Dokan\Walkers\TaxonomyDropdown;

?>
<script type="text/html" id="tmpl-dokan-add-new-product">
    <div id="dokan-add-new-product-popup" class="white-popup dokan-add-new-product-popup">
        <?php do_action( 'dokan_new_product_before_product_area' ); ?>
        <form action="" method="post" id="dokan-add-new-product-form">
            <div class="product-form-container">
                <div class="content-half-part dokan-feat-image-content">
                    <div class="dokan-feat-image-upload">
                        <?php
                        $wrap_class        = ' dokan-hide';
                        $instruction_class = '';
                        $feat_image_id     = 0;
                        $can_create_tags   = dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling' );
                        $tags_placeholder  = 'on' === $can_create_tags ? __( 'Select tags/Add tags', 'dokan-lite' ) : __( 'Select product tags', 'dokan-lite' );
                        ?>
                        <div class="instruction-inside<?php echo esc_attr( $instruction_class ); ?>">
                            <input type="hidden" name="feat_image_id" class="dokan-feat-image-id" value="<?php echo esc_attr( $feat_image_id ); ?>">

                            <i class="fas fa-cloud-upload-alt"></i>
                            <a href="#" class="dokan-feat-image-btn btn btn-sm"><?php esc_html_e( 'Upload a product cover image', 'dokan-lite' ); ?></a>
                        </div>

                        <div class="image-wrap<?php echo esc_attr( $wrap_class ); ?>">
                            <a class="close dokan-remove-feat-image">&times;</a>
                            <img height="" width="" src="" alt="">
                        </div>
                    </div>

                        <div class="dokan-product-gallery">
                            <div class="dokan-side-body" id="dokan-product-images">
                                <div id="product_images_container">
                                    <ul class="product_images dokan-clearfix">

                                        <li class="add-image add-product-images tips" data-title="<?php esc_attr_e( 'Add gallery image', 'dokan-lite' ); ?>">
                                            <a href="#" class="add-product-images"><i class="fas fa-plus" aria-hidden="true"></i></a>
                                        </li>
                                    </ul>
                                    <input type="hidden" id="product_image_gallery" name="product_image_gallery" value="">
                                </div>
                            </div>
                        </div>

                </div>
                <div class="content-half-part dokan-product-field-content">
                    <div class="dokan-form-group">
                        <input type="text" class="dokan-form-control" name="post_title" placeholder="<?php esc_attr_e( 'Product name..', 'dokan-lite' ); ?>">
                    </div>

                    <div class="dokan-clearfix">
                        <div class="dokan-form-group dokan-clearfix dokan-price-container">
                            <div class="content-half-part">
                                <label for="_regular_price" class="form-label"><?php esc_html_e( 'Price', 'dokan-lite' ); ?></label>
                                <div class="dokan-input-group">
                                    <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                                    <input type="text" class="dokan-product-regular-price wc_input_price dokan-form-control" name="_regular_price" id="_regular_price" placeholder="0.00">
                                </div>
                            </div>

                            <div class="content-half-part sale-price">
                                <label for="_sale_price" class="form-label">
                                    <?php esc_html_e( 'Discounted Price', 'dokan-lite' ); ?>
                                    <a href="#" class="sale_schedule"><?php esc_html_e( 'Schedule', 'dokan-lite' ); ?></a>
                                    <a href="#" class="cancel_sale_schedule dokan-hide"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></a>
                                </label>

                                <div class="dokan-input-group">
                                    <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                                    <input type="text" class="dokan-product-sales-price wc_input_price dokan-form-control"  name="_sale_price" placeholder="0.00" id="_sale_price">
                                </div>
                            </div>
                        </div>

                        <div class="dokan-hide sale-schedule-container sale_price_dates_fields dokan-clearfix dokan-form-group">
                            <div class="content-half-part from">
                                <div class="dokan-input-group">
                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'From', 'dokan-lite' ); ?></span>
                                    <input type="text" name="_sale_price_dates_from" class="dokan-form-control" value="" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_attr_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                </div>
                            </div>

                            <div class="content-half-part to">
                                <div class="dokan-input-group">
                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'To', 'dokan-lite' ); ?></span>
                                    <input type="text" name="_sale_price_dates_to" class="dokan-form-control" value="" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_attr_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dokan-clearfix"></div>
                <div class="product-full-container">

                    <?php
                        $data = Helper::get_saved_products_category();
                        $data['from'] = 'new_product_popup';
                        dokan_get_template_part( 'products/dokan-category-header-ui', '', $data );
                    ?>

                    <div class="dokan-form-group">
                        <label for="product_tag_search" class="form-label"><?php esc_html_e( 'Tags', 'dokan-lite' ); ?></label>
                        <select multiple="multiple" name="product_tag[]" id="product_tag_search" class="product_tag_search product_tags" data-placeholder="<?php echo esc_attr( $tags_placeholder ); ?>" style="width: 100%;"></select>
                    </div>

                    <?php do_action( 'dokan_new_product_after_product_tags' ); ?>

                    <div class="dokan-form-group">
                        <textarea name="post_excerpt" id="" class="dokan-form-control" rows="5" placeholder="<?php esc_attr_e( 'Enter some short description about this product...' , 'dokan-lite' ) ?>"></textarea>
                    </div>
                </d>
            </div>
            <div class="product-container-footer">
                <span class="dokan-show-add-product-error"></span>
                <span class="dokan-show-add-product-success"></span>
                <span class="dokan-spinner dokan-add-new-product-spinner dokan-hide"></span>
                <input type="submit" id="dokan-create-new-product-btn" class="dokan-btn dokan-btn-default" data-btn_id="create_new" value="<?php esc_attr_e( 'Create product', 'dokan-lite' ) ?>">
                <?php
                $display_create_and_add_new_button = true;
                if ( function_exists( 'dokan_pro' ) && dokan_pro()->module->is_active( 'product_subscription' ) ) {
                    if ( \DokanPro\Modules\Subscription\Helper::get_vendor_remaining_products( dokan_get_current_user_id() ) === 1 ) {
                        $display_create_and_add_new_button = false;
                    }
                }
                if ( $display_create_and_add_new_button ) :
                ?>
                <input type="submit" id="dokan-create-and-add-new-product-btn" class="dokan-btn dokan-btn-theme" data-btn_id="create_and_new" value="<?php esc_attr_e( 'Create & add new', 'dokan-lite' ) ?>">
                <?php endif; ?>
            </div>
        </form>
    </div>
    <style>
        .select2-container--open .select2-dropdown--below {
            margin-top: 0px;
        }

        .select2-container--open .select2-dropdown--above {
            margin-top: 0px;
        }
    </style>
</script>
<?php do_action( 'dokan_add_product_js_template_end' );?>
