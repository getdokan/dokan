<?php

global $post;

$from_shortcode = false;

if ( !isset( $post->ID ) && ! isset( $_GET['product_id'] ) ) {
    wp_die( __( 'Access Denied, No product found', 'dokan-lite' ) );
}

if( isset( $post->ID ) && $post->ID && $post->post_type == 'product' ) {
    $post_id = $post->ID;
    $post_title = $post->post_title;
    $post_content = $post->post_content;
    $post_excerpt = $post->post_excerpt;
    $post_status = $post->post_status;
    $product        = wc_get_product( $post_id );
}

if ( isset( $_GET['product_id'] ) ) {
    $post_id        = intval( $_GET['product_id'] );
    $post           = get_post( $post_id );
    $post_title     = $post->post_title;
    $post_content   = $post->post_content;
    $post_excerpt   = $post->post_excerpt;
    $post_status    = $post->post_status;
    $product        = wc_get_product( $post_id );
    $from_shortcode = true;
}

if ( ! dokan_is_product_author( $post_id ) ) {
    wp_die( __( 'Access Denied', 'dokan-lite' ) );
    exit();
}

$_regular_price         = get_post_meta( $post_id, '_regular_price', true );
$_sale_price            = get_post_meta( $post_id, '_sale_price', true );
$is_discount            = !empty( $_sale_price ) ? true : false;
$_sale_price_dates_from = get_post_meta( $post_id, '_sale_price_dates_from', true );
$_sale_price_dates_to   = get_post_meta( $post_id, '_sale_price_dates_to', true );

$_sale_price_dates_from = !empty( $_sale_price_dates_from ) ? date_i18n( 'Y-m-d', $_sale_price_dates_from ) : '';
$_sale_price_dates_to   = !empty( $_sale_price_dates_to ) ? date_i18n( 'Y-m-d', $_sale_price_dates_to ) : '';
$show_schedule          = false;

if ( !empty( $_sale_price_dates_from ) && !empty( $_sale_price_dates_to ) ) {
$show_schedule          = true;
}

$_featured              = get_post_meta( $post_id, '_featured', true );
$_downloadable          = get_post_meta( $post_id, '_downloadable', true );
$_virtual               = get_post_meta( $post_id, '_virtual', true );
$_stock                 = get_post_meta( $post_id, '_stock', true );
$_stock_status          = get_post_meta( $post_id, '_stock_status', true );

$_enable_reviews        = $post->comment_status;
$is_downloadable        = ( 'yes' == $_downloadable ) ? true : false;
$is_virtual             = ( 'yes' == $_virtual ) ? true : false;
$_sold_individually     = get_post_meta( $post_id, '_sold_individually', true );

$terms                  = wp_get_object_terms( $post_id, 'product_type' );
$product_type           = ( ! empty( $terms ) ) ? sanitize_title( current( $terms )->name ): 'simple';
$variations_class       = ($product_type == 'simple' ) ? 'dokan-hide' : '';
$_visibility            = ( version_compare( WC_VERSION, '2.7', '>' ) ) ? $product->get_catalog_visibility() : get_post_meta( $post_id, '_visibility', true );
$visibility_options     = dokan_get_product_visibility_options();

if ( ! $from_shortcode ) {
    get_header();
}
?>

<?php

    /**
     *  dokan_dashboard_wrap_before hook
     *
     *  @since 2.4
     */
    do_action( 'dokan_dashboard_wrap_before', $post, $post_id );
?>

<div class="dokan-dashboard-wrap">

    <?php

        /**
         *  dokan_dashboard_content_before hook
         *  dokan_before_product_content_area hook
         *
         *  @hooked get_dashboard_side_navigation
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_before' );
        do_action( 'dokan_before_product_content_area' );
    ?>

    <div class="dokan-dashboard-content dokan-product-edit">

        <?php

            /**
             *  dokan_product_content_inside_area_before hook
             *
             *  @since 2.4
             */
            do_action( 'dokan_product_content_inside_area_before' );
        ?>

        <header class="dokan-dashboard-header dokan-clearfix">
            <h1 class="entry-title">
                <?php _e( 'Edit Product', 'dokan-lite' ); ?>
                <span class="dokan-label <?php echo dokan_get_post_status_label_class( $post->post_status ); ?> dokan-product-status-label">
                    <?php echo dokan_get_post_status( $post->post_status ); ?>
                </span>

                <?php if ( $post->post_status == 'publish' ) { ?>
                    <span class="dokan-right">
                        <a class="dokan-btn dokan-btn-theme dokan-btn-sm" href="<?php echo get_permalink( $post->ID ); ?>" target="_blank"><?php _e( 'View Product', 'dokan-lite' ); ?></a>
                    </span>
                <?php } ?>

                <?php if ( $_visibility == 'hidden' ) { ?>
                    <span class="dokan-right dokan-label dokan-label-default dokan-product-hidden-label"><i class="fa fa-eye-slash"></i> <?php _e( 'Hidden', 'dokan-lite' ); ?></span>
                <?php } ?>
            </h1>
        </header><!-- .entry-header -->

        <div class="product-edit-new-container product-edit-container">
            <?php if ( Dokan_Template_Products::$errors ) { ?>
                <div class="dokan-alert dokan-alert-danger">
                    <a class="dokan-close" data-dismiss="alert">&times;</a>

                    <?php foreach ( Dokan_Template_Products::$errors as $error) { ?>
                        <strong><?php _e( 'Error!', 'dokan-lite' ); ?></strong> <?php echo $error ?>.<br>
                    <?php } ?>
                </div>
            <?php } ?>

            <?php if ( isset( $_GET['message'] ) && $_GET['message'] == 'success') { ?>
                <div class="dokan-message">
                    <button type="button" class="dokan-close" data-dismiss="alert">&times;</button>
                    <strong><?php _e( 'Success!', 'dokan-lite' ); ?></strong> <?php _e( 'The product has been saved successfully.', 'dokan-lite' ); ?>

                    <?php if ( $post->post_status == 'publish' ) { ?>
                        <a href="<?php echo get_permalink( $post_id ); ?>" target="_blank"><?php _e( 'View Product &rarr;', 'dokan-lite' ); ?></a>
                    <?php } ?>
                </div>
            <?php } ?>

            <?php
            $can_sell = apply_filters( 'dokan_can_post', true );

            if ( $can_sell ) {

                if ( dokan_is_seller_enabled( get_current_user_id() ) ) { ?>
                    <form class="dokan-product-edit-form" role="form" method="post">

                        <?php do_action( 'dokan_product_data_panel_tabs' ); ?>
                        <?php do_action( 'dokan_product_edit_before_main' ); ?>

                        <div class="dokan-form-top-area">

                            <div class="content-half-part dokan-product-meta">

                                <div class="dokan-form-group">
                                    <input type="hidden" name="dokan_product_id" id="dokan-edit-product-id" value="<?php echo $post_id; ?>"/>

                                    <label for="post_title" class="form-label"><?php _e( 'Title', 'dokan-lite' ); ?></label>
                                    <?php dokan_post_input_box( $post_id, 'post_title', array( 'placeholder' => __( 'Product name..', 'dokan-lite' ), 'value' => $post_title ) ); ?>
                                    <div class="dokan-product-title-alert dokan-hide">
                                        <?php _e( 'Please enter product title!', 'dokan-lite' ); ?>
                                    </div>
                                </div>

                                <?php $product_types = apply_filters( 'dokan_product_types', 'simple' ); ?>

                                <?php if( 'simple' === $product_types ): ?>
                                        <input type="hidden" id="product_type" name="product_type" value="simple">
                                <?php endif; ?>

                                <?php if ( is_array( $product_types ) ): ?>
                                    <div class="dokan-form-group">
                                        <label for="product_type" class="form-label"><?php _e( 'Product Type', 'dokan-lite' ); ?> <i class="fa fa-question-circle tips" aria-hidden="true" data-title="<?php _e( 'Choose Variable if your product has multiple attributes - like sizes, colors, quality etc', 'dokan-lite' ); ?>"></i></label>
                                        <select name="product_type" class="dokan-form-control" id="product_type">
                                            <?php foreach ( $product_types as $key => $value ) { ?>
                                                <option value="<?php echo $key ?>" <?php selected( $product_type, $key ) ?>><?php echo $value ?></option>
                                            <?php } ?>
                                        </select>
                                    </div>
                                <?php endif; ?>

                                <div class="dokan-form-group dokan-product-type-container show_if_simple">
                                    <div class="content-half-part downloadable-checkbox">
                                        <label>
                                            <input type="checkbox" <?php checked( $is_downloadable, true ); ?> class="_is_downloadable" name="_downloadable" id="_downloadable"> <?php _e( 'Downloadable', 'dokan-lite' ); ?> <i class="fa fa-question-circle tips" aria-hidden="true" data-title="<?php _e( 'Downloadable products give access to a file upon purchase.', 'dokan-lite' ); ?>"></i>
                                        </label>
                                    </div>
                                    <div class="content-half-part virtual-checkbox">
                                        <label>
                                            <input type="checkbox" <?php checked( $is_virtual, true ); ?> class="_is_virtual" name="_virtual" id="_virtual"> <?php _e( 'Virtual', 'dokan-lite' ); ?> <i class="fa fa-question-circle tips" aria-hidden="true" data-title="<?php _e( 'Virtual products are intangible and aren\'t shipped.', 'dokan-lite' ); ?>"></i>
                                        </label>
                                    </div>
                                    <div class="dokan-clearfix"></div>
                                </div>


                                <div class="show_if_simple dokan-clearfix">

                                    <div class="dokan-form-group dokan-clearfix dokan-price-container">

                                        <div class="content-half-part regular-price">
                                            <label for="_regular_price" class="form-label"><?php _e( 'Price', 'dokan-lite' ); ?>
                                                <span class="vendor-earning" data-commission="<?php echo dokan_get_seller_percentage( dokan_get_current_user_id(), $post_id ); ?>" data-commission_type="<?php echo dokan_get_commission_type( dokan_get_current_user_id(), $post_id ); ?>">( <?php _e( ' You Earn : ', 'dokan-lite' ) ?><?php echo get_woocommerce_currency_symbol() ?><span class="vendor-price">0.00</span> )</span>
                                            </label>
                                            <div class="dokan-input-group">
                                                <span class="dokan-input-group-addon"><?php echo get_woocommerce_currency_symbol(); ?></span>
                                                <?php dokan_post_input_box( $post_id, '_regular_price', array( 'class' => 'dokan-product-regular-price', 'placeholder' => __( '0.00', 'dokan-lite' ) ), 'number' ); ?>
                                            </div>
                                        </div>

                                        <div class="content-half-part sale-price">
                                            <label for="_sale_price" class="form-label">
                                                <?php _e( 'Discounted Price', 'dokan-lite' ); ?>
                                                <a href="#" class="sale_schedule <?php echo ($show_schedule ) ? 'dokan-hide' : ''; ?>"><?php _e( 'Schedule', 'dokan-lite' ); ?></a>
                                                <a href="#" class="cancel_sale_schedule <?php echo ( ! $show_schedule ) ? 'dokan-hide' : ''; ?>"><?php _e( 'Cancel', 'dokan-lite' ); ?></a>
                                            </label>

                                            <div class="dokan-input-group">
                                                <span class="dokan-input-group-addon"><?php echo get_woocommerce_currency_symbol(); ?></span>
                                                <?php dokan_post_input_box( $post_id, '_sale_price', array( 'class' => 'dokan-product-sales-price','placeholder' => __( '0.00', 'dokan-lite' ) ), 'number' ); ?>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="dokan-form-group dokan-clearfix dokan-price-container">
                                        <div class="dokan-product-less-price-alert dokan-hide">
                                            <?php _e('Product price can\'t be less than the vendor fee!', 'dokan-lite' ); ?>
                                        </div>
                                    </div>

                                    <div class="sale_price_dates_fields dokan-clearfix dokan-form-group <?php echo ( ! $show_schedule ) ? 'dokan-hide' : ''; ?>">
                                        <div class="content-half-part from">
                                            <div class="dokan-input-group">
                                                <span class="dokan-input-group-addon"><?php _e( 'From', 'dokan-lite' ); ?></span>
                                                <input type="text" name="_sale_price_dates_from" class="dokan-form-control datepicker" value="<?php echo esc_attr( $_sale_price_dates_from ); ?>" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php _e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                            </div>
                                        </div>

                                        <div class="content-half-part to">
                                            <div class="dokan-input-group">
                                                <span class="dokan-input-group-addon"><?php _e( 'To', 'dokan-lite' ); ?></span>
                                                <input type="text" name="_sale_price_dates_to" class="dokan-form-control datepicker" value="<?php echo esc_attr( $_sale_price_dates_to ); ?>" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php _e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                            </div>
                                        </div>
                                    </div><!-- .sale-schedule-container -->
                                </div>

                                <?php if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ): ?>
                                    <div class="dokan-form-group">
                                        <label for="product_cat" class="form-label"><?php _e( 'Category', 'dokan-lite' ); ?></label>
                                        <?php
                                        $product_cat = -1;
                                        $term = array();
                                        $term = wp_get_post_terms( $post_id, 'product_cat', array( 'fields' => 'ids') );

                                        if ( $term ) {
                                            $product_cat = reset( $term );
                                        }
                                        include_once DOKAN_LIB_DIR.'/class.category-walker.php';

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
                                            'walker'           => new DokanCategoryWalker( $post_id )
                                        );

                                        wp_dropdown_categories( apply_filters( 'dokan_product_cat_dropdown_args', $category_args ) );
                                    ?>
                                        <div class="dokan-product-cat-alert dokan-hide">
                                            <?php _e('Please choose a category!', 'dokan-lite' ); ?>
                                        </div>
                                    </div>
                                <?php elseif ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'multiple' ): ?>
                                    <div class="dokan-form-group">
                                        <label for="product_cat" class="form-label"><?php _e( 'Category', 'dokan-lite' ); ?></label>
                                        <?php
                                        $term = array();
                                        $term = wp_get_post_terms( $post_id, 'product_cat', array( 'fields' => 'ids') );
                                        include_once DOKAN_LIB_DIR.'/class.taxonomy-walker.php';
                                        $drop_down_category = wp_dropdown_categories( apply_filters( 'dokan_product_cat_dropdown_args', array(
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
                                            'walker'           => new DokanTaxonomyWalker( $post_id )
                                        ) ) );

                                        echo str_replace( '<select', '<select data-placeholder="'.__( 'Select product category', 'dokan-lite' ).'" multiple="multiple" ', $drop_down_category );
                                        ?>
                                    </div>
                                <?php endif; ?>

                                <div class="dokan-form-group">
                                    <label for="product_tag" class="form-label"><?php _e( 'Tags', 'dokan-lite' ); ?></label>
                                    <?php
                                    require_once DOKAN_LIB_DIR.'/class.taxonomy-walker.php';
                                    $term = wp_get_post_terms( $post_id, 'product_tag', array( 'fields' => 'ids') );
                                    $selected = ( $term ) ? $term : array();
                                    $drop_down_tags = wp_dropdown_categories( array(
                                        'show_option_none' => __( '', 'dokan-lite' ),
                                        'hierarchical'     => 1,
                                        'hide_empty'       => 0,
                                        'name'             => 'product_tag[]',
                                        'id'               => 'product_tag',
                                        'taxonomy'         => 'product_tag',
                                        'title_li'         => '',
                                        'class'            => 'product_tags dokan-form-control dokan-select2',
                                        'exclude'          => '',
                                        'selected'         => $selected,
                                        'echo'             => 0,
                                        'walker'           => new DokanTaxonomyWalker( $post_id )
                                    ) );

                                    echo str_replace( '<select', '<select data-placeholder="'.__( 'Select product tags', 'dokan-lite' ).'" multiple="multiple" ', $drop_down_tags );

                                    ?>
                                </div>
                            </div><!-- .content-half-part -->

                            <div class="content-half-part featured-image">

                                <div class="dokan-feat-image-upload dokan-new-product-featured-img">
                                    <?php
                                    $wrap_class        = ' dokan-hide';
                                    $instruction_class = '';
                                    $feat_image_id     = 0;

                                    if ( has_post_thumbnail( $post_id ) ) {
                                        $wrap_class        = '';
                                        $instruction_class = ' dokan-hide';
                                        $feat_image_id     = get_post_thumbnail_id( $post_id );
                                    }
                                    ?>

                                    <div class="instruction-inside<?php echo $instruction_class; ?>">
                                        <input type="hidden" name="feat_image_id" class="dokan-feat-image-id" value="<?php echo $feat_image_id; ?>">

                                        <i class="fa fa-cloud-upload"></i>
                                        <a href="#" class="dokan-feat-image-btn btn btn-sm"><?php _e( 'Upload a product cover image', 'dokan-lite' ); ?></a>
                                    </div>

                                    <div class="image-wrap<?php echo $wrap_class; ?>">
                                        <a class="close dokan-remove-feat-image">&times;</a>
                                        <?php if ( $feat_image_id ) { ?>
                                            <?php echo get_the_post_thumbnail( $post_id, apply_filters( 'single_product_large_thumbnail_size', 'shop_single' ), array( 'height' => '', 'width' => '' ) ); ?>
                                        <?php } else { ?>
                                            <img height="" width="" src="" alt="">
                                        <?php } ?>
                                    </div>
                                </div><!-- .dokan-feat-image-upload -->

                                <div class="dokan-product-gallery">
                                    <div class="dokan-side-body" id="dokan-product-images">
                                        <div id="product_images_container">
                                            <ul class="product_images dokan-clearfix">
                                                <?php
                                                $product_images = get_post_meta( $post_id, '_product_image_gallery', true );
                                                $gallery = explode( ',', $product_images );

                                                if ( $gallery ) {
                                                    foreach ($gallery as $image_id) {
                                                        if ( empty( $image_id ) ) {
                                                            continue;
                                                        }

                                                        $attachment_image = wp_get_attachment_image_src( $image_id, 'thumbnail' );
                                                        ?>
                                                        <li class="image" data-attachment_id="<?php echo $image_id; ?>">
                                                            <img src="<?php echo $attachment_image[0]; ?>" alt="">
                                                            <a href="#" class="action-delete" title="<?php esc_attr_e( 'Delete image', 'dokan-lite' ); ?>">&times;</a>
                                                        </li>
                                                        <?php
                                                    }
                                                }
                                                ?>
                                                <li class="add-image add-product-images tips" data-title="<?php _e( 'Add gallery image', 'dokan-lite' ); ?>">
                                                    <a href="#" class="add-product-images"><i class="fa fa-plus" aria-hidden="true"></i></a>
                                                </li>
                                            </ul>

                                            <input type="hidden" id="product_image_gallery" name="product_image_gallery" value="<?php echo esc_attr( $product_images ); ?>">
                                        </div>
                                    </div>
                                </div> <!-- .product-gallery -->
                            </div><!-- .content-half-part -->
                        </div><!-- .dokan-form-top-area -->

                        <div class="dokan-product-short-description">
                            <label for="post_excerpt" class="form-label"><?php _e( 'Short Description', 'dokan-lite' ); ?></label>
                            <?php wp_editor( $post_excerpt , 'post_excerpt', array('editor_height' => 50, 'quicktags' => false, 'media_buttons' => false, 'teeny' => true, 'editor_class' => 'post_excerpt') ); ?>
                        </div>

                        <div class="dokan-product-description">
                            <label for="post_content" class="form-label"><?php _e( 'Description', 'dokan-lite' ); ?></label>
                            <?php wp_editor( $post_content , 'post_content', array('editor_height' => 50, 'quicktags' => false, 'media_buttons' => false, 'teeny' => true, 'editor_class' => 'post_content') ); ?>
                        </div>

                        <?php do_action( 'dokan_new_product_form', $post, $post_id ); ?>
                        <?php do_action( 'dokan_product_edit_after_main', $post, $post_id ); ?>

                        <div class="dokan-product-inventory dokan-edit-row">
                            <div class="dokan-section-heading" data-togglehandler="dokan_product_inventory">
                                <h2><i class="fa fa-cubes" aria-hidden="true"></i> <?php _e( 'Inventory', 'dokan-lite' ); ?></h2>
                                <p><?php _e( 'Manage inventory for this product.', 'dokan-lite' ); ?></p>
                                <a href="#" class="dokan-section-toggle">
                                    <i class="fa fa-sort-desc fa-flip-vertical" aria-hidden="true"></i>
                                </a>
                                <div class="dokan-clearfix"></div>
                            </div>

                            <div class="dokan-section-content">

                                <div class="content-half-part dokan-form-group hide_if_variation">
                                    <label for="_sku" class="form-label"><?php _e( 'SKU', 'dokan-lite' ); ?> <span><?php _e( '(Stock Keeping Unit)', 'dokan-lite' ); ?></span></label>
                                    <?php dokan_post_input_box( $post_id, '_sku' ); ?>
                                </div>

                                <div class="content-half-part hide_if_variable">
                                    <label for="_stock_status" class="form-label"><?php _e( 'Stock Status', 'dokan-lite' ); ?></label>

                                    <?php dokan_post_input_box( $post_id, '_stock_status', array( 'options' => array(
                                        'instock'     => __( 'In Stock', 'dokan-lite' ),
                                        'outofstock' => __( 'Out of Stock', 'dokan-lite' ),
                                    ) ), 'select' ); ?>
                                </div>

                                <div class="dokan-clearfix"></div>

                                <div class="dokan-form-group hide_if_variation hide_if_grouped">
                                    <?php dokan_post_input_box( $post_id, '_manage_stock', array( 'label' => __( 'Enable product stock management', 'dokan-lite' ) ), 'checkbox' ); ?>
                                </div>

                                <div class="show_if_stock dokan-stock-management-wrapper dokan-form-group dokan-clearfix">

                                    <div class="content-half-part hide_if_variation">
                                        <label for="_stock" class="form-label"><?php _e( 'Quantity', 'dokan-lite' ); ?></label>
                                        <input type="number" class="dokan-form-control" name="_stock" placeholder="<?php __( '1', 'dokan-lite' ); ?>" value="<?php echo wc_stock_amount( $_stock ); ?>" min="0" step="1">
                                    </div>

                                    <div class="content-half-part hide_if_variation last-child">
                                        <label for="_backorders" class="form-label"><?php _e( 'Allow Backorders', 'dokan-lite' ); ?></label>

                                        <?php dokan_post_input_box( $post_id, '_backorders', array( 'options' => array(
                                            'no'     => __( 'Do not allow', 'dokan-lite' ),
                                            'notify' => __( 'Allow but notify customer', 'dokan-lite' ),
                                            'yes'    => __( 'Allow', 'dokan-lite' )
                                        ) ), 'select' ); ?>
                                    </div>
                                    <div class="dokan-clearfix"></div>
                                </div><!-- .show_if_stock -->

                                <div class="dokan-form-group hide_if_grouped">
                                    <label class="" for="_sold_individually">
                                        <input name="_sold_individually" id="_sold_individually" value="yes" type="checkbox" <?php checked( $_sold_individually, 'yes' ); ?>>
                                        <?php _e( 'Allow only one quantity of this product to be bought in a single order', 'dokan-lite' ) ?>
                                    </label>
                                </div>

                                <?php if ( $post_id ): ?>
                                    <?php do_action( 'dokan_product_edit_after_inventory' ); ?>
                                <?php endif; ?>

                                <?php do_action( 'dokan_product_edit_after_downloadable', $post, $post_id ); ?>
                                <?php do_action( 'dokan_product_edit_after_sidebar', $post, $post_id ); ?>
                                <?php do_action( 'dokan_single_product_edit_after_sidebar', $post, $post_id ); ?>

                            </div><!-- .dokan-side-right -->
                        </div><!-- .dokan-product-inventory -->

                        <div class="dokan-download-options dokan-edit-row dokan-clearfix show_if_downloadable">
                            <div class="dokan-section-heading" data-togglehandler="dokan_download_options">
                                <h2><i class="fa fa-download" aria-hidden="true"></i> <?php _e( 'Downloadable Options', 'dokan-lite' ); ?></h2>
                                <p><?php _e( 'Configure your downloadable product settings', 'dokan-lite' ); ?></p>
                                <a href="#" class="dokan-section-toggle">
                                    <i class="fa fa-sort-desc fa-flip-vertical" aria-hidden="true"></i>
                                </a>
                                <div class="dokan-clearfix"></div>
                            </div>

                            <div class="dokan-section-content">
                                <div class="dokan-divider-top dokan-clearfix">

                                    <?php do_action( 'dokan_product_edit_before_sidebar' ); ?>

                                    <div class="dokan-side-body dokan-download-wrapper">
                                        <table class="dokan-table">
                                            <tfoot>
                                                <tr>
                                                    <th colspan="3">
                                                        <a href="#" class="insert-file-row dokan-btn dokan-btn-sm dokan-btn-success" data-row="<?php
                                                            $file = array(
                                                                'file' => '',
                                                                'name' => ''
                                                            );
                                                            ob_start();
                                                            include DOKAN_INC_DIR . '/woo-views/html-product-download.php';
                                                            echo esc_attr( ob_get_clean() );
                                                        ?>"><?php _e( 'Add File', 'dokan-lite' ); ?></a>
                                                    </th>
                                                </tr>
                                            </tfoot>
                                            <thead>
                                                <tr>
                                                    <th><?php _e( 'Name', 'dokan-lite' ); ?> <span class="tips" title="<?php _e( 'This is the name of the download shown to the customer.', 'dokan-lite' ); ?>">[?]</span></th>
                                                    <th><?php _e( 'File URL', 'dokan-lite' ); ?> <span class="tips" title="<?php _e( 'This is the URL or absolute path to the file which customers will get access to.', 'dokan-lite' ); ?>">[?]</span></th>
                                                    <th><?php _e( 'Action', 'dokan-lite' ); ?></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php
                                                $downloadable_files = get_post_meta( $post_id, '_downloadable_files', true );

                                                if ( $downloadable_files ) {
                                                    foreach ( $downloadable_files as $key => $file ) {
                                                        include DOKAN_INC_DIR . '/woo-views/html-product-download.php';
                                                    }
                                                }
                                                ?>
                                            </tbody>
                                        </table>

                                        <div class="dokan-clearfix">
                                            <div class="content-half-part">
                                                <label for="_download_limit" class="form-label"><?php _e( 'Download Limit', 'dokan-lite' ); ?></label>
                                                <?php dokan_post_input_box( $post_id, '_download_limit', array( 'placeholder' => __( 'e.g. 4', 'dokan-lite' ) ) ); ?>
                                            </div><!-- .content-half-part -->

                                            <div class="content-half-part">
                                                <label for="_download_expiry" class="form-label"><?php _e( 'Download Expiry', 'dokan-lite' ); ?></label>
                                                <?php dokan_post_input_box( $post_id, '_download_expiry', array( 'placeholder' => __( 'Number of days', 'dokan-lite' ) ) ); ?>
                                            </div><!-- .content-half-part -->
                                        </div>

                                    </div> <!-- .dokan-side-body -->
                                </div> <!-- .downloadable -->
                            </div>
                        </div>

                        <?php do_action( 'dokan_product_edit_after_inventory_variants', $post, $post_id ); ?>

                        <div class="dokan-other-options dokan-edit-row dokan-clearfix">
                            <div class="dokan-section-heading" data-togglehandler="dokan_other_options">
                                <h2><i class="fa fa-cog" aria-hidden="true"></i> <?php _e( 'Other Options', 'dokan-lite' ); ?></h2>
                                <p><?php _e( 'Set your extra product options', 'dokan-lite' ); ?></p>
                                <a href="#" class="dokan-section-toggle">
                                    <i class="fa fa-sort-desc fa-flip-vertical" aria-hidden="true"></i>
                                </a>
                                <div class="dokan-clearfix"></div>
                            </div>

                            <div class="dokan-section-content">
                                <div class="dokan-form-group content-half-part">
                                    <label for="post_status" class="form-label"><?php _e( 'Product Status', 'dokan-lite' ); ?></label>
                                    <?php if ( $post_status != 'pending' ) { ?>
                                        <?php $post_statuses = apply_filters( 'dokan_post_status', array(
                                            'publish' => __( 'Online', 'dokan-lite' ),
                                            'draft'   => __( 'Draft', 'dokan-lite' )
                                        ), $post ); ?>

                                        <select id="post_status" class="dokan-form-control" name="post_status">
                                            <?php foreach ( $post_statuses as $status => $label ) { ?>
                                                <option value="<?php echo $status; ?>"<?php selected( $post_status, $status ); ?>><?php echo $label; ?></option>
                                            <?php } ?>
                                        </select>
                                    <?php } else { ?>
                                        <?php $pending_class = $post_status == 'pending' ? '  dokan-label dokan-label-warning': ''; ?>
                                        <span class="dokan-toggle-selected-display<?php echo $pending_class; ?>"><?php echo dokan_get_post_status( $post_status ); ?></span>
                                    <?php } ?>
                                </div>

                                <div class="dokan-form-group content-half-part">
                                    <label for="_visibility" class="form-label"><?php _e( 'Visibility', 'dokan-lite' ); ?></label>
                                    <select name="_visibility" id="_visibility" class="dokan-form-control">
                                        <?php foreach ( $visibility_options as $name => $label ): ?>
                                            <option value="<?php echo $name; ?>" <?php selected( $_visibility, $name ); ?>><?php echo $label; ?></option>
                                        <?php endforeach ?>
                                    </select>
                                </div>

                                <div class="dokan-clearfix"></div>

                                <div class="dokan-form-group">
                                    <label for="_purchase_note" class="form-label"><?php _e( 'Purchase Note', 'dokan-lite' ); ?></label>
                                    <?php dokan_post_input_box( $post_id, '_purchase_note', array( 'placeholder' => __( 'Customer will get this info in their order email', 'dokan-lite' ) ), 'textarea' ); ?>
                                </div>

                                <div class="dokan-form-group">
                                    <?php $_enable_reviews = ( $post->comment_status == 'open' ) ? 'yes' : 'no'; ?>
                                    <?php dokan_post_input_box( $post_id, '_enable_reviews', array('value' => $_enable_reviews, 'label' => __( 'Enable product reviews', 'dokan-lite' ) ), 'checkbox' ); ?>
                                </div>

                            </div>
                        </div><!-- .dokan-other-options -->

                        <?php if ( $post_id ): ?>
                            <?php do_action( 'dokan_product_edit_after_options', $post_id ); ?>
                        <?php endif; ?>

                        <?php wp_nonce_field( 'dokan_edit_product', 'dokan_edit_product_nonce' ); ?>

                        <!--hidden input for Firefox issue-->
                        <input type="hidden" name="dokan_update_product" value="<?php esc_attr_e( 'Save Product', 'dokan-lite' ); ?>"/>
                        <input type="submit" name="dokan_update_product" class="dokan-btn dokan-btn-theme dokan-btn-lg dokan-right" value="<?php esc_attr_e( 'Save Product', 'dokan-lite' ); ?>"/>
                        <div class="dokan-clearfix"></div>
                    </form>
                <?php } else { ?>
                    <div class="dokan-alert dokan-alert">
                        <?php echo dokan_seller_not_enabled_notice(); ?>
                    </div>
                <?php } ?>

            <?php } else { ?>

                <?php do_action( 'dokan_can_post_notice' ); ?>

            <?php } ?>
        </div> <!-- #primary .content-area -->

        <?php

            /**
             *  dokan_product_content_inside_area_after hook
             *
             *  @since 2.4
             */
            do_action( 'dokan_product_content_inside_area_after' );
        ?>
    </div>

    <?php

        /**
         *  dokan_dashboard_content_after hook
         *  dokan_after_product_content_area hook
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );
        do_action( 'dokan_after_product_content_area' );
    ?>

</div><!-- .dokan-dashboard-wrap -->
<div class="dokan-clearfix"></div>

<?php

    /**
     *  dokan_dashboard_content_before hook
     *
     *  @since 2.4
     */
    do_action( 'dokan_dashboard_wrap_after', $post, $post_id );

    wp_reset_postdata();

    if ( ! $from_shortcode ) {
        get_footer();
    }
?>
