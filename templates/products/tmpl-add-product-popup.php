<script type="text/html" id="tmpl-dokan-add-new-product">
    <div id="dokan-add-new-product-popup" class="white-popup dokan-add-new-product-popup">
        <h2><i class="fa fa-briefcase">&nbsp;</i>&nbsp;<?php esc_html_e( 'Add New Product', 'dokan-lite' ); ?></h2>

        <form action="" method="post" id="dokan-add-new-product-form">
            <div class="product-form-container">
                <div class="content-half-part dokan-feat-image-content">
                    <div class="dokan-feat-image-upload">
                        <?php
                        $wrap_class        = ' dokan-hide';
                        $instruction_class = '';
                        $feat_image_id     = 0;
                        ?>
                        <div class="instruction-inside<?php echo esc_attr( $instruction_class ); ?>">
                            <input type="hidden" name="feat_image_id" class="dokan-feat-image-id" value="<?php echo esc_attr( $feat_image_id ); ?>">

                            <i class="fa fa-cloud-upload"></i>
                            <a href="#" class="dokan-feat-image-btn btn btn-sm"><?php esc_html_e( 'Upload a product cover image', 'dokan-lite' ); ?></a>
                        </div>

                        <div class="image-wrap<?php echo esc_attr( $wrap_class ); ?>">
                            <a class="close dokan-remove-feat-image">&times;</a>
                            <img height="" width="" src="" alt="">
                        </div>
                    </div>

                    <?php if ( apply_filters( 'dokan_product_gallery_allow_add_images', true ) ): ?>
                        <div class="dokan-product-gallery">
                            <div class="dokan-side-body" id="dokan-product-images">
                                <div id="product_images_container">
                                    <ul class="product_images dokan-clearfix">

                                        <li class="add-image add-product-images tips" data-title="<?php esc_attr_e( 'Add gallery image', 'dokan-lite' ); ?>">
                                            <a href="#" class="add-product-images"><i class="fa fa-plus" aria-hidden="true"></i></a>
                                        </li>
                                    </ul>
                                    <input type="hidden" id="product_image_gallery" name="product_image_gallery" value="">
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>

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
                                    <input type="number" class="dokan-product-regular-price dokan-form-control" name="_regular_price" placeholder="0.00" min="0" step="any">
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
                                    <input type="number" class="dokan-product-sales-price dokan-form-control" name="_sale_price" placeholder="0.00" min="0" step="any">
                                </div>
                            </div>
                        </div>

                        <div class="dokan-hide sale-schedule-container sale_price_dates_fields dokan-clearfix dokan-form-group">
                            <div class="content-half-part from">
                                <div class="dokan-input-group">
                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'From', 'dokan-lite' ); ?></span>
                                    <input type="text" name="_sale_price_dates_from" class="dokan-form-control datepicker sale_price_dates_from" value="" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_attr_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                </div>
                            </div>

                            <div class="content-half-part to">
                                <div class="dokan-input-group">
                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'To', 'dokan-lite' ); ?></span>
                                    <input type="text" name="_sale_price_dates_to" class="dokan-form-control datepicker sale_price_dates_to" value="" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_attr_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dokan-clearfix"></div>
                <div class="product-full-container">
                    <?php if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ): ?>
                        <div class="dokan-form-group">
                            <?php
                            $product_cat = -1;
                            $category_args =  array(
                                'show_option_none' => __( '- Select a category -', 'dokan-lite' ),
                                'hierarchical'     => 1,
                                'hide_empty'       => 0,
                                'name'             => 'product_cat',
                                'id'               => 'product_cat',
                                'taxonomy'         => 'product_cat',
                                'title_li'         => '',
                                'class'            => 'product_cat dokan-form-control dokan-select2',
                                'exclude'          => '',
                                'selected'         => $product_cat,
                            );

                            wp_dropdown_categories( apply_filters( 'dokan_product_cat_dropdown_args', $category_args ) );
                        ?>
                        </div>
                    <?php elseif ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'multiple' ): ?>
                        <div class="dokan-form-group">
                            <?php
                            $term = array();
                            include_once DOKAN_LIB_DIR.'/class.taxonomy-walker.php';
                            $drop_down_category = wp_dropdown_categories(  apply_filters( 'dokan_product_cat_dropdown_args', array(
                                'show_option_none' => __( '', 'dokan-lite' ),
                                'hierarchical'     => 1,
                                'hide_empty'       => 0,
                                'name'             => 'product_cat[]',
                                'id'               => 'product_cat',
                                'taxonomy'         => 'product_cat',
                                'title_li'         => '',
                                'class'            => 'product_cat dokan-form-control dokan-select2',
                                'exclude'          => '',
                                'selected'         => $term,
                                'echo'             => 0,
                                'walker'           => new DokanTaxonomyWalker()
                            ) ) );

                            echo str_replace( '<select', '<select data-placeholder="'.__( 'Select product category', 'dokan-lite' ).'" multiple="multiple" ', $drop_down_category ); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
                            ?>
                        </div>
                    <?php endif; ?>

                    <div class="dokan-form-group">
                        <?php
                        require_once DOKAN_LIB_DIR.'/class.taxonomy-walker.php';
                        $drop_down_tags = wp_dropdown_categories( array(
                            'show_option_none' => __( '', 'dokan-lite' ),
                            'hierarchical'     => 1,
                            'hide_empty'       => 0,
                            'name'             => 'product_tag[]',
                            'id'               => 'product_tag',
                            'taxonomy'         => 'product_tag',
                            'title_li'         => '',
                            'class'            => 'product_tags dokan-form-control',
                            'exclude'          => '',
                            'selected'         => array(),
                            'echo'             => 0,
                            'walker'           => new DokanTaxonomyWalker()
                        ) );

                        echo str_replace( '<select', '<select data-placeholder="'.__( 'Select product tags', 'dokan-lite' ).'" multiple="multiple" ', $drop_down_tags ); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
                        ?>
                    </div>

                    <?php do_action( 'dokan_new_product_after_product_tags' ); ?>

                    <div class="dokan-form-group">
                        <textarea name="post_excerpt" id="" class="dokan-form-control" rows="5" placeholder="<?php esc_attr_e( 'Enter some short description about this product...' , 'dokan-lite' ) ?>"></textarea>
                    </div>
                </div>
            </div>
            <div class="product-container-footer">
                <span class="dokan-show-add-product-error"></span>
                <span class="dokan-spinner dokan-add-new-product-spinner dokan-hide"></span>
                <input type="submit" id="dokan-create-new-product-btn" class="dokan-btn dokan-btn-default" data-btn_id="create_new" value="<?php esc_attr_e( 'Create product', 'dokan-lite' ) ?>">
                <input type="submit" id="dokan-create-and-add-new-product-btn" class="dokan-btn dokan-btn-theme" data-btn_id="create_and_new" value="<?php esc_attr_e( 'Create & add new', 'dokan-lite' ) ?>">
            </div>
        </form>
    </div>
</script>
