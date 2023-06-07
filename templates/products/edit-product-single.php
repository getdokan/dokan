<?php

use WeDevs\Dokan\ProductCategory\Helper;

// phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited
global $post;

$from_shortcode = false;

if (
    ! isset( $post->ID )
    && (
        ! isset( $_GET['_dokan_edit_product_nonce'] ) ||
        ! wp_verify_nonce( sanitize_key( $_GET['_dokan_edit_product_nonce'] ), 'dokan_edit_product_nonce' ) ||
        ! isset( $_GET['product_id'] )
    )
) {
    wp_die( esc_html__( 'Access Denied, No product found', 'dokan-lite' ) );
}

if ( isset( $post->ID ) && $post->ID && 'product' === $post->post_type ) {
    $post_id      = $post->ID;
    $post_title   = $post->post_title;
    $post_content = $post->post_content;
    $post_excerpt = $post->post_excerpt;
    $post_status  = $post->post_status;
    $product      = wc_get_product( $post_id );
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
    wp_die( esc_html__( 'Access Denied', 'dokan-lite' ) );
}

$_regular_price         = get_post_meta( $post_id, '_regular_price', true );
$_sale_price            = get_post_meta( $post_id, '_sale_price', true );
$is_discount            = ! empty( $_sale_price ) ? true : false;
$_sale_price_dates_from = get_post_meta( $post_id, '_sale_price_dates_from', true );
$_sale_price_dates_to   = get_post_meta( $post_id, '_sale_price_dates_to', true );

$_sale_price_dates_from = ! empty( $_sale_price_dates_from ) ? date_i18n( 'Y-m-d', $_sale_price_dates_from ) : '';
$_sale_price_dates_to   = ! empty( $_sale_price_dates_to ) ? date_i18n( 'Y-m-d', $_sale_price_dates_to ) : '';
$show_schedule          = false;

if ( ! empty( $_sale_price_dates_from ) && ! empty( $_sale_price_dates_to ) ) {
    $show_schedule = true;
}

$_featured        = get_post_meta( $post_id, '_featured', true );
$terms            = wp_get_object_terms( $post_id, 'product_type' );
$product_type     = ( ! empty( $terms ) ) ? sanitize_title( current( $terms )->name ) : 'simple';
$variations_class = ( $product_type === 'simple' ) ? 'dokan-hide' : '';
$_visibility      = ( version_compare( WC_VERSION, '2.7', '>' ) ) ? $product->get_catalog_visibility() : get_post_meta( $post_id, '_visibility', true );

if ( ! $from_shortcode ) {
    get_header();
}

if ( ! empty( $_GET['errors'] ) ) {
    dokan()->dashboard->templates->products->set_errors( array_map( 'sanitize_text_field', wp_unslash( $_GET['errors'] ) ) );
}

/**
 * Action hook to fire before dokan dashboard wrap
 *
 *  @since 2.4
 */
do_action( 'dokan_dashboard_wrap_before', $post, $post_id );
?>

<?php do_action( 'dokan_dashboard_wrap_start' ); ?>

    <div class="dokan-dashboard-wrap">

        <?php
        /**
         * Action took to fire before dashboard content.
         *
         *  @hooked get_dashboard_side_navigation
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_before' );

        /**
         * Action hook to fire before product content area.
         *
         * @since 2.4
         */
        do_action( 'dokan_before_product_content_area' );
        ?>

        <div class="dokan-dashboard-content dokan-product-edit">

            <?php
            /**
             * Action hook to fire inside product content area before
             *
             *  @since 2.4
             */
            do_action( 'dokan_product_content_inside_area_before' );
            ?>

            <header class="dokan-dashboard-header dokan-clearfix">
                <h1 class="entry-title">
                    <?php esc_html_e( 'Edit Product', 'dokan-lite' ); ?>
                    <span class="dokan-label <?php echo esc_attr( dokan_get_post_status_label_class( $post->post_status ) ); ?> dokan-product-status-label">
                        <?php echo esc_html( dokan_get_post_status( $post->post_status ) ); ?>
                    </span>

                    <?php if ( $post->post_status === 'publish' ) : ?>
                        <span class="dokan-right">
                            <a class="dokan-btn dokan-btn-theme dokan-btn-sm" href="<?php echo esc_url( get_permalink( $post->ID ) ); ?>" target="_blank"><?php esc_html_e( 'View Product', 'dokan-lite' ); ?></a>
                        </span>
                    <?php endif; ?>

                    <?php if ( $_visibility === 'hidden' ) : ?>
                        <span class="dokan-right dokan-label dokan-label-default dokan-product-hidden-label"><i class="far fa-eye-slash"></i> <?php esc_html_e( 'Hidden', 'dokan-lite' ); ?></span>
                    <?php endif; ?>
                </h1>
            </header><!-- .entry-header -->

            <div class="product-edit-new-container product-edit-container">
                <?php if ( dokan()->dashboard->templates->products->has_errors() ) : ?>
                    <div class="dokan-alert dokan-alert-danger">
                        <a class="dokan-close" data-dismiss="alert">&times;</a>

                        <?php foreach ( dokan()->dashboard->templates->products->get_errors() as $error ) : ?>
                            <strong><?php esc_html_e( 'Error!', 'dokan-lite' ); ?></strong> <?php echo esc_html( $error ); ?>.<br>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if ( isset( $_GET['message'] ) && $_GET['message'] === 'success' ) : ?>
                    <div class="dokan-message">
                        <button type="button" class="dokan-close" data-dismiss="alert">&times;</button>
                        <strong><?php esc_html_e( 'Success!', 'dokan-lite' ); ?></strong> <?php esc_html_e( 'The product has been saved successfully.', 'dokan-lite' ); ?>

                        <?php if ( $post->post_status === 'publish' ) : ?>
                            <a href="<?php echo esc_url( get_permalink( $post_id ) ); ?>" target="_blank"><?php esc_html_e( 'View Product &rarr;', 'dokan-lite' ); ?></a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <?php if ( apply_filters( 'dokan_can_post', true ) ) : ?>
                    <?php if ( dokan_is_seller_enabled( get_current_user_id() ) ) : ?>
                        <form class="dokan-product-edit-form" role="form" method="post" id="post">

                            <?php do_action( 'dokan_product_data_panel_tabs' ); ?>
                            <?php do_action( 'dokan_product_edit_before_main' ); ?>

                            <div class="dokan-form-top-area">

                                <div class="content-half-part dokan-product-meta">

                                    <div id="dokan-product-title-area" class="dokan-form-group">
                                        <input type="hidden" name="dokan_product_id" id="dokan-edit-product-id" value="<?php echo esc_attr( $post_id ); ?>"/>

                                        <label for="post_title" class="form-label"><?php esc_html_e( 'Title', 'dokan-lite' ); ?></label>
                                        <?php
                                        dokan_post_input_box(
                                            $post_id,
                                            'post_title',
                                            [
                                                'placeholder' => __( 'Product name..', 'dokan-lite' ),
                                                'value'       => $post_title,
                                            ]
                                        );
                                        ?>
                                        <div class="dokan-product-title-alert dokan-hide">
                                            <?php esc_html_e( 'Please enter product title!', 'dokan-lite' ); ?>
                                        </div>

                                        <div id="edit-slug-box" class="hide-if-no-js"></div>
                                        <?php wp_nonce_field( 'samplepermalink', 'samplepermalinknonce', false ); ?>
                                        <input type="hidden" name="editable-post-name" class="dokan-hide" id="editable-post-name-full-dokan">
                                        <input type="hidden" value="<?php echo esc_attr( $post->post_name ); ?>" name="edited-post-name" class="dokan-hide" id="edited-post-name-dokan">
                                    </div>

                                    <?php $product_types = apply_filters( 'dokan_product_types', [ 'simple' => __( 'Simple', 'dokan-lite' ) ] ); ?>

                                    <?php if ( is_array( $product_types ) ) : ?>
                                        <?php if ( count( $product_types ) === 1 && array_key_exists( 'simple', $product_types ) ) : ?>
                                            <input type="hidden" id="product_type" name="product_type" value="simple">
                                        <?php else : ?>
                                            <div class="dokan-form-group">
                                                <label for="product_type" class="form-label"><?php esc_html_e( 'Product Type', 'dokan-lite' ); ?> <i class="fas fa-question-circle tips" aria-hidden="true" data-title="<?php esc_html_e( 'Choose Variable if your product has multiple attributes - like sizes, colors, quality etc', 'dokan-lite' ); ?>"></i></label>
                                                <select name="product_type" class="dokan-form-control" id="product_type">
                                                    <?php foreach ( $product_types as $key => $value ) : ?>
                                                        <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $product_type, $key ); ?>><?php echo esc_html( $value ); ?></option>
                                                    <?php endforeach; ?>
                                                </select>
                                            </div>
                                        <?php endif; ?>
                                    <?php endif; ?>

                                    <?php do_action( 'dokan_product_edit_after_title', $post, $post_id ); ?>

                                    <div class="show_if_simple dokan-clearfix show_if_external">

                                        <div class="dokan-form-group dokan-clearfix dokan-price-container">

                                            <div class="content-half-part regular-price">
                                                <label for="_regular_price" class="form-label"><?php esc_html_e( 'Price', 'dokan-lite' ); ?></label>
                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                                                    <?php
                                                    dokan_post_input_box(
                                                        $post_id,
                                                        '_regular_price',
                                                        [
                                                            'class'       => 'dokan-product-regular-price',
                                                            'placeholder' => __( '0.00', 'dokan-lite' ),
                                                        ],
                                                        'price'
                                                    );
                                                    ?>
                                                </div>
                                            </div>

                                            <div class="content-half-part sale-price">
                                                <label for="_sale_price" class="form-label">
                                                    <?php esc_html_e( 'Discounted Price', 'dokan-lite' ); ?>
                                                    <a href="#" class="sale_schedule <?php echo $show_schedule ? 'dokan-hide' : ''; ?>"><?php esc_html_e( 'Schedule', 'dokan-lite' ); ?></a>
                                                    <a href="#" class="cancel_sale_schedule <?php echo ( ! $show_schedule ) ? 'dokan-hide' : ''; ?>"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></a>
                                                </label>

                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                                                    <?php
                                                    dokan_post_input_box(
                                                        $post_id,
                                                        '_sale_price',
                                                        [
                                                            'class'       => 'dokan-product-sales-price',
                                                            'placeholder' => __( '0.00', 'dokan-lite' ),
                                                        ],
                                                        'price'
                                                    );
                                                    ?>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="dokan-form-group dokan-clearfix dokan-price-container">
                                            <div class="dokan-product-less-price-alert dokan-hide">
                                                <?php esc_html_e( 'Product price can\'t be less than the vendor fee!', 'dokan-lite' ); ?>
                                            </div>
                                        </div>

                                        <div class="sale_price_dates_fields dokan-clearfix dokan-form-group <?php echo ( ! $show_schedule ) ? 'dokan-hide' : ''; ?>">
                                            <div class="content-half-part from">
                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'From', 'dokan-lite' ); ?></span>
                                                    <input type="text" name="_sale_price_dates_from" class="dokan-form-control dokan-start-date" value="<?php echo esc_attr( $_sale_price_dates_from ); ?>" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_html_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                                </div>
                                            </div>

                                            <div class="content-half-part to">
                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'To', 'dokan-lite' ); ?></span>
                                                    <input type="text" name="_sale_price_dates_to" class="dokan-form-control dokan-end-date" value="<?php echo esc_attr( $_sale_price_dates_to ); ?>" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_html_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                                </div>
                                            </div>
                                        </div><!-- .sale-schedule-container -->
                                    </div>

                                    <div class="dokan-form-group">
                                    <?php
                                        do_action( 'dokan_product_edit_after_pricing', $post, $post_id );

                                        $data = Helper::get_saved_products_category( $post_id );
                                        $data['from'] = 'edit_product';

                                        dokan_get_template_part( 'products/dokan-category-header-ui', '', $data );
                                    ?>
                                    </div>

                                    <div class="dokan-form-group">
                                        <label for="product_tag_edit" class="form-label"><?php esc_html_e( 'Tags', 'dokan-lite' ); ?></label>
                                        <?php
                                        $terms            = wp_get_post_terms( $post_id, 'product_tag', array( 'fields' => 'all' ) );
                                        $can_create_tags  = dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling' );
                                        $tags_placeholder = 'on' === $can_create_tags ? __( 'Select tags/Add tags', 'dokan-lite' ) : __( 'Select product tags', 'dokan-lite' );

                                        $drop_down_tags = array(
                                            'hide_empty' => 0,
                                        );
                                        ?>
                                        <select multiple="multiple" id="product_tag_edit" name="product_tag[]" class="product_tag_search dokan-form-control" data-placeholder="<?php echo esc_attr( $tags_placeholder ); ?>">
                                            <?php if ( ! empty( $terms ) ) : ?>
                                                <?php foreach ( $terms as $tax_term ) : ?>
                                                    <option value="<?php echo esc_attr( $tax_term->term_id ); ?>" selected="selected" ><?php echo esc_html( $tax_term->name ); ?></option>
                                                <?php endforeach ?>
                                            <?php endif ?>
                                        </select>
                                    </div>

                                    <?php do_action( 'dokan_product_edit_after_product_tags', $post, $post_id ); ?>
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

                                        <div class="instruction-inside<?php echo esc_attr( $instruction_class ); ?>">
                                            <input type="hidden" name="feat_image_id" class="dokan-feat-image-id" value="<?php echo esc_attr( $feat_image_id ); ?>">

                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <a href="#" class="dokan-feat-image-btn btn btn-sm"><?php esc_html_e( 'Upload a product cover image', 'dokan-lite' ); ?></a>
                                        </div>

                                        <div class="image-wrap<?php echo esc_attr( $wrap_class ); ?>">
                                            <a class="close dokan-remove-feat-image">&times;</a>
                                            <?php if ( $feat_image_id ) : ?>
                                                <?php
                                                echo get_the_post_thumbnail(
                                                    $post_id,
                                                    apply_filters( 'single_product_large_thumbnail_size', 'shop_single' ),
                                                    [
                                                        'height' => '',
                                                        'width'  => '',
                                                    ]
                                                );
                                                ?>
                                            <?php else : ?>
                                                <img height="" width="" src="" alt="">
                                            <?php endif; ?>
                                        </div>
                                    </div><!-- .dokan-feat-image-upload -->

                                        <div class="dokan-product-gallery">
                                            <div class="dokan-side-body" id="dokan-product-images">
                                                <div id="product_images_container">
                                                    <ul class="product_images dokan-clearfix">
                                                        <?php
                                                        $product_images = get_post_meta( $post_id, '_product_image_gallery', true );
                                                        $gallery = explode( ',', $product_images );

                                                        if ( $gallery ) :
                                                            foreach ( $gallery as $image_id ) :
                                                                if ( empty( $image_id ) ) :
                                                                    continue;
                                                                endif;

                                                                $attachment_image = wp_get_attachment_image_src( $image_id, 'thumbnail' );
                                                                ?>
                                                                <li class="image" data-attachment_id="<?php echo esc_attr( $image_id ); ?>">
                                                                    <img src="<?php echo esc_url( $attachment_image[0] ); ?>" alt="">
                                                                    <a href="#" class="action-delete" title="<?php esc_attr_e( 'Delete image', 'dokan-lite' ); ?>">&times;</a>
                                                                </li>
                                                                <?php
                                                            endforeach;
                                                        endif;
                                                        ?>
                                                        <li class="add-image add-product-images tips" data-title="<?php esc_html_e( 'Add gallery image', 'dokan-lite' ); ?>">
                                                            <a href="#" class="add-product-images"><i class="fas fa-plus" aria-hidden="true"></i></a>
                                                        </li>
                                                    </ul>

                                                    <input type="hidden" id="product_image_gallery" name="product_image_gallery" value="<?php echo esc_attr( $product_images ); ?>">
                                                </div>
                                            </div>
                                        </div> <!-- .product-gallery -->

                                    <?php do_action( 'dokan_product_gallery_image_count' ); ?>

                                </div><!-- .content-half-part -->
                            </div><!-- .dokan-form-top-area -->

                            <div class="dokan-product-short-description">
                                <label for="post_excerpt" class="form-label"><?php esc_html_e( 'Short Description', 'dokan-lite' ); ?></label>
                                <?php
                                wp_editor(
                                    $post_excerpt,
                                    'post_excerpt',
                                    apply_filters(
                                        'dokan_product_short_description',
                                        [
                                            'editor_height' => 50,
                                            'quicktags'     => false,
                                            'media_buttons' => false,
                                            'teeny'         => true,
                                            'editor_class'  => 'post_excerpt',
                                        ]
                                    )
                                );
                                ?>
                            </div>

                            <div class="dokan-product-description">
                                <label for="post_content" class="form-label"><?php esc_html_e( 'Description', 'dokan-lite' ); ?></label>
                                <?php
                                wp_editor(
                                    $post_content,
                                    'post_content',
                                    apply_filters(
                                        'dokan_product_description',
                                        [
                                            'editor_height' => 50,
                                            'quicktags'     => false,
                                            'media_buttons' => false,
                                            'teeny'         => true,
                                            'editor_class'  => 'post_content',
                                        ]
                                    )
                                );
                                ?>
                            </div>

                            <?php do_action( 'dokan_new_product_form', $post, $post_id ); ?>
                            <?php do_action( 'dokan_product_edit_after_main', $post, $post_id ); ?>

                            <?php do_action( 'dokan_product_edit_after_inventory_variants', $post, $post_id ); ?>

                            <?php if ( $post_id ) : ?>
                                <?php do_action( 'dokan_product_edit_after_options', $post_id ); ?>
                            <?php endif; ?>

                            <?php wp_nonce_field( 'dokan_edit_product', 'dokan_edit_product_nonce' ); ?>

                            <!--hidden input for Firefox issue-->
                            <input type="hidden" name="dokan_update_product" value="<?php esc_attr_e( 'Save Product', 'dokan-lite' ); ?>"/>
                            <input type="submit" name="dokan_update_product" id="publish" class="dokan-btn dokan-btn-theme dokan-btn-lg dokan-right" value="<?php esc_attr_e( 'Save Product', 'dokan-lite' ); ?>"/>
                            <div class="dokan-clearfix"></div>
                        </form>
                    <?php else : ?>
                        <div class="dokan-alert dokan-alert">
                            <?php echo esc_html( dokan_seller_not_enabled_notice() ); ?>
                        </div>
                    <?php endif; ?>

                <?php else : ?>

                    <?php do_action( 'dokan_can_post_notice' ); ?>

                <?php endif; ?>
            </div> <!-- #primary .content-area -->

            <?php
            /**
             * Action took to fire inside product content after.
             *
             *  @since 2.4
             */
            do_action( 'dokan_product_content_inside_area_after' );
            ?>
        </div>

        <?php
        /**
         * Action took to fire after dashboard content.
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );

        /**
         * Action took to fire after product content area.
         *
         *  @since 2.4
         */
        do_action( 'dokan_after_product_content_area' );
        ?>

    </div><!-- .dokan-dashboard-wrap -->

<?php do_action( 'dokan_dashboard_wrap_end' ); ?>

<div class="dokan-clearfix"></div>

<?php

/**
 * Action hook to fire after dokan dashboard wrap
 *
 *  @since 2.4
 */
do_action( 'dokan_dashboard_wrap_after', $post, $post_id );

wp_reset_postdata();

if ( ! $from_shortcode ) {
    get_footer();
}

// phpcs:enable WordPress.WP.GlobalVariablesOverride.Prohibited
?>
