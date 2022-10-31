<?php

use WeDevs\Dokan\ProductCategory\Helper;

$created_product      = null;
$feat_image_id        = null;
$regular_price        = '';
$sale_price           = '';
$sale_price_date_from = '';
$sale_price_date_to   = '';
$post_content         = '';
$post_excerpt         = '';
$product_images       = '';
$post_title           = '';
$terms                = [];
$currency_symbol      = get_woocommerce_currency_symbol();

if ( isset( $_REQUEST['_dokan_add_product_nonce'] ) && wp_verify_nonce( sanitize_key( $_REQUEST['_dokan_add_product_nonce'] ), 'dokan_add_product_nonce' ) ) {
    if ( ! empty( $_REQUEST['created_product'] ) ) {
        $created_product = intval( $_REQUEST['created_product'] );
    }

    if ( ! empty( $_REQUEST['feat_image_id'] ) ) {
        $feat_image_id = intval( $_REQUEST['feat_image_id'] );
    }

    if ( ! empty( $_REQUEST['_regular_price'] ) ) {
        $regular_price = floatval( $_REQUEST['_regular_price'] );
    }

    if ( ! empty( $_REQUEST['_sale_price'] ) ) {
        $sale_price = floatval( $_REQUEST['_sale_price'] );
    }

    if ( ! empty( $_REQUEST['_sale_price_dates_from'] ) ) {
        $sale_price_date_from = sanitize_text_field( wp_unslash( $_REQUEST['_sale_price_dates_from'] ) );
    }

    if ( ! empty( $_REQUEST['_sale_price_dates_to'] ) ) {
        $sale_price_date_to = sanitize_text_field( wp_unslash( $_REQUEST['_sale_price_dates_to'] ) );
    }

    if ( ! empty( $_REQUEST['post_content'] ) ) {
        $post_content = wp_kses_post( wp_unslash( $_REQUEST['post_content'] ) );
    }

    if ( ! empty( $_REQUEST['post_excerpt'] ) ) {
        $post_excerpt = sanitize_textarea_field( wp_unslash( $_REQUEST['post_excerpt'] ) );
    }

    if ( ! empty( $_REQUEST['post_title'] ) ) {
        $post_title = sanitize_text_field( wp_unslash( $_REQUEST['post_title'] ) );
    }

    if ( ! empty( $_REQUEST['product_image_gallery'] ) ) {
        $product_images = sanitize_text_field( wp_unslash( $_REQUEST['product_image_gallery'] ) );
    }

    if ( ! empty( $_REQUEST['product_tag'] ) ) {
        $terms = array_map( 'intval', (array) wp_unslash( $_REQUEST['product_tag'] ) );
    }
}

/**
 * Action hook to fire before new product wrap.
 *
 *  @since 2.4
 */
do_action( 'dokan_new_product_wrap_before' );
?>

<?php do_action( 'dokan_dashboard_wrap_start' ); ?>

    <div class="dokan-dashboard-wrap">
        <?php
        /**
         * Action hook to fire before rendering dashboard content.
         *
         *  @hooked get_dashboard_side_navigation
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_before' );

        /**
         * Action hook to fire before rendering product content
         *
         * @since 2.4
         */
        do_action( 'dokan_before_new_product_content_area' );
        ?>


        <div class="dokan-dashboard-content">

            <?php
            /**
             *  Action hook to fire inside new product content before
             *
             *  @since 2.4
             */
            do_action( 'dokan_before_new_product_inside_content_area' );
            ?>

            <header class="dokan-dashboard-header dokan-clearfix">
                <h1 class="entry-title">
                    <?php esc_html_e( 'Add New Product', 'dokan-lite' ); ?>
                </h1>
            </header><!-- .entry-header -->

            <?php do_action( 'dokan_new_product_before_product_area' ); ?>

            <div class="dokan-new-product-area">
                <?php if ( dokan()->dashboard->templates->products->has_errors() ) : ?>
                    <div class="dokan-alert dokan-alert-danger">
                        <a class="dokan-close" data-dismiss="alert">&times;</a>

                        <?php foreach ( dokan()->dashboard->templates->products->get_errors() as $error_msg ) : ?>
                            <strong><?php esc_html_e( 'Error!', 'dokan-lite' ); ?></strong> <?php echo wp_kses_post( $error_msg ); ?>.<br>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if ( ! empty( $created_product ) ) : ?>
                    <div class="dokan-alert dokan-alert-success">
                        <a class="dokan-close" data-dismiss="alert">&times;</a>
                        <strong><?php esc_html_e( 'Success!', 'dokan-lite' ); ?></strong>
                        <?php
                        printf(
                            /* translators: %s: product title with edit link */
                            __( 'You have successfully created %s product', 'dokan-lite' ),
                            sprintf(
                                '<a href="%s"><strong>%s</strong></a>',
                                esc_url( dokan_edit_product_url( $created_product ) ),
                                get_the_title( $created_product )
                            )
                        );
                        ?>
                    </div>
                <?php endif ?>

                <?php
                if ( apply_filters( 'dokan_can_post', true ) ) :
                    $feat_image_url   = '';
                    $hide_instruction = '';
                    $hide_img_wrap    = 'dokan-hide';

                    if ( ! empty( $feat_image_id ) ) {
                        $feat_image_url   = wp_get_attachment_url( $image_id );
                        $hide_instruction = 'dokan-hide';
                        $hide_img_wrap    = '';
                    }

                    if ( dokan_is_seller_enabled( get_current_user_id() ) ) :
                        ?>
                        <form class="dokan-form-container" method="post">
                            <div class="product-edit-container dokan-clearfix">
                                <div class="content-half-part featured-image">
                                    <div class="featured-image">
                                        <div class="dokan-feat-image-upload">
                                            <div class="instruction-inside <?php echo esc_attr( $hide_instruction ); ?>">
                                                <input type="hidden" name="feat_image_id" class="dokan-feat-image-id" value="<?php echo esc_attr( $feat_image_id ); ?>">
                                                <i class="fas fa-cloud-upload-alt"></i>
                                                <a href="#" class="dokan-feat-image-btn dokan-btn"><?php esc_html_e( 'Upload Product Image', 'dokan-lite' ); ?></a>
                                            </div>

                                            <div class="image-wrap <?php echo esc_attr( $hide_img_wrap ); ?>">
                                                <a class="close dokan-remove-feat-image">&times;</a>
                                                    <img src="<?php echo esc_url( $feat_image_url ); ?>" alt="">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="dokan-product-gallery">
                                        <div class="dokan-side-body" id="dokan-product-images">
                                            <div id="product_images_container">
                                                <ul class="product_images dokan-clearfix">
                                                    <?php
                                                    if ( ! empty( $product_images ) ) :
                                                        $gallery = explode( ',', $product_images );
                                                        if ( $gallery ) :
                                                            foreach ( $gallery as $image_id ) :
                                                                if ( empty( $image_id ) ) :
                                                                    continue;
                                                                endif;

                                                                $attachment_image = wp_get_attachment_image_src( $image_id );

                                                                if ( ! $attachment_image ) :
                                                                    continue;
                                                                endif;
                                                                ?>
                                                                <li class="image" data-attachment_id="<?php echo esc_attr( $image_id ); ?>">
                                                                    <img src="<?php echo esc_url( $attachment_image[0] ); ?>" alt="">
                                                                    <a href="#" class="action-delete" title="<?php esc_attr_e( 'Delete image', 'dokan-lite' ); ?>">&times;</a>
                                                                </li>
                                                                <?php
                                                            endforeach;
                                                        endif;
                                                    endif;
                                                    ?>
                                                    <li class="add-image add-product-images tips" data-title="<?php esc_attr_e( 'Add gallery image', 'dokan-lite' ); ?>">
                                                        <a href="#" class="add-product-images"><i class="fas fa-plus" aria-hidden="true"></i></a>
                                                    </li>
                                                </ul>
                                                <input type="hidden" id="product_image_gallery" name="product_image_gallery" value="">
                                            </div>
                                        </div>
                                    </div> <!-- .product-gallery -->
                                    <?php do_action( 'dokan_product_gallery_image_count' ); ?>
                                </div>

                                <div class="content-half-part dokan-product-meta">
                                    <div class="dokan-form-group">
                                        <input class="dokan-form-control" name="post_title" id="post-title" type="text" placeholder="<?php esc_attr_e( 'Product name..', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $post_title ); ?>">
                                    </div>

                                    <div class="dokan-form-group">
                                        <div class="dokan-form-group dokan-clearfix dokan-price-container">
                                            <div class="content-half-part">
                                                <label for="_regular_price" class="dokan-form-label"><?php esc_html_e( 'Price', 'dokan-lite' ); ?></label>
                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php echo esc_attr( $currency_symbol ); ?></span>
                                                    <input type="text" class="dokan-form-control wc_input_price dokan-product-regular-price" name="_regular_price" placeholder="0.00" id="_regular_price" value="<?php echo esc_attr( $regular_price ); ?>">
                                                </div>
                                            </div>

                                            <div class="content-half-part sale-price">
                                                <label for="_sale_price" class="form-label">
                                                    <?php esc_html_e( 'Discounted Price', 'dokan-lite' ); ?>
                                                    <a href="#" class="sale_schedule"><?php esc_html_e( 'Schedule', 'dokan-lite' ); ?></a>
                                                    <a href="#" class="cancel_sale_schedule dokan-hide"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></a>
                                                </label>

                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php echo esc_attr( $currency_symbol ); ?></span>
                                                    <input type="text" class="dokan-form-control wc_input_price dokan-product-sales-price" name="_sale_price" placeholder="0.00" id="_sale_price" value="<?php echo esc_attr( $sale_price ); ?>">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="dokan-hide sale-schedule-container sale_price_dates_fields dokan-clearfix dokan-form-group">
                                            <div class="content-half-part from">
                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'From', 'dokan-lite' ); ?></span>
                                                    <input type="text" name="_sale_price_dates_from" class="dokan-form-control datepicker sale_price_dates_from" maxlength="10" value="<?php echo esc_attr( $sale_price_date_from ); ?>" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_attr_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                                </div>
                                            </div>

                                            <div class="content-half-part to">
                                                <div class="dokan-input-group">
                                                    <span class="dokan-input-group-addon"><?php esc_html_e( 'To', 'dokan-lite' ); ?></span>
                                                    <input type="text" name="_sale_price_dates_to" class="dokan-form-control datepicker sale_price_dates_to" value="<?php echo esc_attr( $sale_price_date_to ); ?>" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" placeholder="<?php esc_attr_e( 'YYYY-MM-DD', 'dokan-lite' ); ?>">
                                                </div>
                                            </div>
                                        </div><!-- .sale-schedule-container -->
                                    </div>

                                    <div class="dokan-form-group">
                                        <textarea name="post_excerpt" id="post-excerpt" rows="5" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Short description of the product...', 'dokan-lite' ); ?>"><?php echo esc_attr( $post_excerpt ); ?></textarea>
                                    </div>

                                    <?php
                                    $can_create_tags        = 'on' === dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling' );
                                    $saved_product_cat_data = array_merge( (array) Helper::get_saved_products_category(), [ 'from' => 'new_product' ] );
                                    dokan_get_template_part( 'products/dokan-category-header-ui', '', $saved_product_cat_data );
                                    ?>

                                    <div class="dokan-form-group">
                                        <label for="product_tag" class="form-label"><?php esc_html_e( 'Tags', 'dokan-lite' ); ?></label>
                                        <select multiple="multiple" name="product_tag[]" id="product_tag_search" class="product_tag_search product_tags dokan-form-control dokan-select2" data-placeholder="<?php echo $can_create_tags ? esc_attr__( 'Select tags/Add tags', 'dokan-lite' ) : esc_attr__( 'Select product tags', 'dokan-lite' ); ?>">
                                            <?php if ( ! empty( $terms ) ) : ?>
                                                <?php foreach ( $terms as $product_term_id ) : ?>
                                                    <?php $product_term = get_term( $product_term_id ); ?>
                                                    <option value="<?php echo esc_attr( $product_term->term_id ); ?>" selected="selected" ><?php echo esc_html( $product_term->name ); ?></option>
                                                <?php endforeach ?>
                                            <?php endif ?>
                                        </select>
                                    </div>

                                    <?php do_action( 'dokan_new_product_after_product_tags' ); ?>
                                </div>
                            </div>

                            <div class="dokan-form-group">
                                <label for="post_content" class="control-label"><?php esc_html_e( 'Description', 'dokan-lite' ); ?> <i class="fas fa-question-circle tips" data-title="<?php esc_attr_e( 'Add your product description', 'dokan-lite' ); ?>" aria-hidden="true"></i></label>
                                <?php
                                wp_editor(
                                    htmlspecialchars_decode( $post_content, ENT_QUOTES ),
                                    'post_content',
                                    [
                                        'editor_height' => 50,
                                        'quicktags'     => false,
                                        'media_buttons' => false,
                                        'teeny'         => true,
                                        'editor_class'  => 'post_content',
                                    ]
                                );
                                ?>
                            </div>

                            <?php do_action( 'dokan_new_product_form' ); ?>

                            <hr>

                            <div class="dokan-form-group dokan-right">
                                <?php
                                wp_nonce_field( 'dokan_add_new_product', 'dokan_add_new_product_nonce' );

                                $show_add_new_button = ! function_exists( 'dokan_pro' ) || ! dokan_pro()->module->is_active( 'product_subscription' ) || \DokanPro\Modules\Subscription\Helper::get_vendor_remaining_products( dokan_get_current_user_id() ) !== 1;

                                if ( $show_add_new_button ) :
                                    ?>
                                    <button type="submit" name="add_product" class="dokan-btn dokan-btn-default" value="create_and_add_new">
                                        <?php esc_attr_e( 'Create & Add New', 'dokan-lite' ); ?>
                                    </button>
                                <?php endif; ?>
                                <button type="submit" name="add_product" class="dokan-btn dokan-btn-default dokan-btn-theme" value="create_new"><?php esc_attr_e( 'Create Product', 'dokan-lite' ); ?></button>
                            </div>
                        </form>
                    <?php else : ?>
                        <?php dokan_seller_not_enabled_notice(); ?>
                    <?php endif; ?>
                <?php else : ?>
                    <?php do_action( 'dokan_can_post_notice' ); ?>
                <?php endif; ?>
            </div>
            <?php
            /**
             * Action hook to fire inside new product content after
             *
             *  @since 2.4
             */
            do_action( 'dokan_after_new_product_inside_content_area' );
            ?>
        </div> <!-- #primary .content-area -->
        <?php
        /**
         * Action hook to fire after rendering dashboard content.
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );

        /**
         * Action hook to fire after rendering product content.
         *
         *  @since 2.4
         */
        do_action( 'dokan_after_new_product_content_area' );
        ?>
    </div><!-- .dokan-dashboard-wrap -->
<?php
/**
 * Action hook to fire at end of the dahboard wrap.
 *
 * @since 2.4
 */
do_action( 'dokan_dashboard_wrap_end' );

/**
 * Action hook to fire after new product wrap.
 *
 *  @since 2.4
 */
do_action( 'dokan_new_product_wrap_after' );
?>
