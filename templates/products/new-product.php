<?php

    /**
     *  dokan_new_product_wrap_before hook
     *
     *  @since 2.4
     */
    do_action( 'dokan_new_product_wrap_before' );
?>
<div class="dokan-dashboard-wrap">

    <?php

        /**
         *  dokan_dashboard_content_before hook
         *  dokan_before_new_product_content_area hook
         *
         *  @hooked get_dashboard_side_navigation
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_before' );
        do_action( 'dokan_before_new_product_content_area' );
    ?>


    <div class="dokan-dashboard-content">

        <?php

            /**
             *  dokan_before_new_product_inside_content_area hook
             *
             *  @since 2.4
             */
            do_action( 'dokan_before_new_product_inside_content_area' );
        ?>

        <header class="dokan-dashboard-header dokan-clearfix">
            <h1 class="entry-title">
                <?php _e( 'Add New Product', 'dokan' ); ?>
            </h1>
        </header><!-- .entry-header -->


        <div class="dokan-new-product-area">
            <?php if ( Dokan_Template_Products::$errors ) { ?>
                <div class="dokan-alert dokan-alert-danger">
                    <a class="dokan-close" data-dismiss="alert">&times;</a>

                    <?php foreach ( Dokan_Template_Products::$errors as $error) { ?>

                        <strong><?php _e( 'Error!', 'dokan' ); ?></strong> <?php echo $error ?>.<br>

                    <?php } ?>
                </div>
            <?php } ?>

            <?php

            $can_sell = apply_filters( 'dokan_can_post', true );

            if ( $can_sell ) {

                if ( dokan_is_seller_enabled( get_current_user_id() ) ) { ?>

                    <form class="dokan-form-container" method="post">

                        <div class="row product-edit-container dokan-clearfix">
                            <div class="content-half-part featured-image">
                                <div class="dokan-feat-image-upload">
                                    <div class="instruction-inside">
                                        <input type="hidden" name="feat_image_id" class="dokan-feat-image-id" value="0">
                                        <i class="fa fa-cloud-upload"></i>
                                        <a href="#" class="dokan-feat-image-btn dokan-btn"><?php _e( 'Upload Product Image', 'dokan' ); ?></a>
                                    </div>

                                    <div class="image-wrap dokan-hide">
                                        <a class="close dokan-remove-feat-image">&times;</a>
                                            <img src="" alt="">
                                    </div>
                                </div>
                            </div>
                            <div class="content-half-part dokan-product-meta">
                                <div class="dokan-form-group">
                                    <input class="dokan-form-control" name="post_title" id="post-title" type="text" placeholder="<?php esc_attr_e( 'Product name..', 'dokan' ); ?>" value="<?php echo dokan_posted_input( 'post_title' ); ?>">
                                </div>

                                <div class="dokan-form-group">
                                    <div class="dokan-input-group">
                                        <span class="dokan-input-group-addon"><?php echo get_woocommerce_currency_symbol(); ?></span>
                                        <input class="dokan-form-control" name="price" id="product-price" type="text" placeholder="0.00" value="<?php echo dokan_posted_input( 'price' ); ?>">
                                    </div>
                                </div>

                                <div class="dokan-form-group">
                                    <textarea name="post_excerpt" id="post-excerpt" rows="5" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Short description of the product...', 'dokan' ); ?>"><?php echo dokan_posted_textarea( 'post_excerpt' ); ?></textarea>
                                </div>

                                <?php if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ): ?>
                                    <div class="dokan-form-group">

                                        <?php
                                        $category_args =  array(
                                            'show_option_none' => __( '- Select a category -', 'dokan' ),
                                            'hierarchical'     => 1,
                                            'hide_empty'       => 0,
                                            'name'             => 'product_cat',
                                            'id'               => 'product_cat',
                                            'taxonomy'         => 'product_cat',
                                            'title_li'         => '',
                                            'class'            => 'product_cat dokan-form-control dokan-select2',
                                            'exclude'          => '',
                                            'selected'         => Dokan_Template_Products::$product_cat,
                                        );

                                        wp_dropdown_categories( apply_filters( 'dokan_product_cat_dropdown_args', $category_args ) );
                                        ?>
                                    </div>
                                <?php elseif ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'multiple' ): ?>
                                    <div class="dokan-form-group">
                                        <?php
                                        $term = array();
                                        include_once DOKAN_LIB_DIR.'/class.taxonomy-walker.php';
                                        $drop_down_category = wp_dropdown_categories( array(
                                            'show_option_none' => __( '', 'dokan' ),
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
                                        ) );

                                        echo str_replace( '<select', '<select data-placeholder="'.__( 'Select product category','dokan' ).'" multiple="multiple" ', $drop_down_category );
                                        ?>
                                    </div>
                                <?php endif; ?>

                                <div class="dokan-form-group">
                                    <?php
                                    require_once DOKAN_LIB_DIR.'/class.taxonomy-walker.php';
                                    $drop_down_tags = wp_dropdown_categories( array(
                                        'show_option_none' => __( '', 'dokan' ),
                                        'hierarchical'     => 1,
                                        'hide_empty'       => 0,
                                        'name'             => 'product_tag[]',
                                        'id'               => 'product_tag',
                                        'taxonomy'         => 'product_tag',
                                        'title_li'         => '',
                                        'class'            => 'product_tags dokan-form-control dokan-select2',
                                        'exclude'          => '',
                                        'selected'         => array(),
                                        'echo'             => 0,
                                        'walker'           => new DokanTaxonomyWalker()
                                    ) );

                                    echo str_replace( '<select', '<select data-placeholder="'.__( 'Select product tags','dokan' ).'" multiple="multiple" ', $drop_down_tags );
                                    ?>
                                </div>
                            </div>
                        </div>

                        <!-- <textarea name="post_content" id="" cols="30" rows="10" class="span7" placeholder="Describe your product..."><?php echo dokan_posted_textarea( 'post_content' ); ?></textarea> -->
                        <div class="dokan-form-group">
                            <?php wp_editor( Dokan_Template_Products::$post_content, 'post_content', array('editor_height' => 50, 'quicktags' => false, 'media_buttons' => false, 'teeny' => true, 'editor_class' => 'post_content') ); ?>
                        </div>

                        <?php do_action( 'dokan_new_product_form' ); ?>

                        <div class="dokan-form-group">
                            <?php wp_nonce_field( 'dokan_add_new_product', 'dokan_add_new_product_nonce' ); ?>
                            <input type="submit" name="add_product" class="dokan-btn dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Add Product', 'dokan' ); ?>"/>
                        </div>

                    </form>

                <?php } else { ?>

                    <?php dokan_seller_not_enabled_notice(); ?>

                <?php } ?>

            <?php } else { ?>

                <?php do_action( 'dokan_can_post_notice' ); ?>

            <?php } ?>
        </div>

        <?php

            /**
             *  dokan_after_new_product_inside_content_area hook
             *
             *  @since 2.4
             */
            do_action( 'dokan_after_new_product_inside_content_area' );
        ?>

    </div> <!-- #primary .content-area -->

    <?php

        /**
         *  dokan_dashboard_content_after hook
         *  dokan_after_new_product_content_area hook
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );
        do_action( 'dokan_after_new_product_content_area' );
    ?>

</div><!-- .dokan-dashboard-wrap -->

<?php

    /**
     *  dokan_new_product_wrap_after hook
     *
     *  @since 2.4
     */
    do_action( 'dokan_new_product_wrap_after' );
?>
