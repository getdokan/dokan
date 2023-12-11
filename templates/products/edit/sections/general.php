<?php
/**
 * Product general data panel.
 *
 * @var WC_Product $product
 *
 * @package Dokan\Templates
 */

use WeDevs\Dokan\ProductCategory\Helper;
use WeDevs\Dokan\ProductForm\Elements;
use WeDevs\Dokan\ProductForm\Factory as ProductFormFactory;

defined( 'ABSPATH' ) || exit;

$section = ProductFormFactory::get_section( 'general' );
if ( is_wp_error( $section ) ) {
    return;
}
?>
<form class="dokan-product-edit-form" role="form" method="post" id="post">

    <?php do_action( 'dokan_product_data_panel_tabs', $post, $product->get_id(), $product ); ?>
    <?php do_action( 'dokan_product_edit_before_main', $post, $product->get_id(), $product ); ?>

    <div class="dokan-form-top-area">

        <div class="content-half-part dokan-product-meta">
            <?php
            $product_title = $section->get_field( Elements::NAME );
            if ( ! is_wp_error( $product_title ) && $product_title->is_visible() ) :
                ?>
                <div id="dokan-product-title-area" class="dokan-form-group">
                    <input type="hidden" name="dokan_product_id" id="dokan-edit-product-id" value="<?php echo esc_attr( $product->get_id() ); ?>" />

                    <label for="<?php echo esc_attr( $product_title->get_name() ); ?>" class="form-label"><?php echo esc_html( $product_title->get_title() ); ?></label>
                    <?php
                    dokan_post_input_box(
                        $product->get_id(),
                        $product_title->get_name(),
                        [
                            'name'        => $product_title->get_name(),
                            'placeholder' => $product_title->get_placeholder(),
                            'value'       => $product->get_name(),
                        ]
                    );
                    ?>
                    <div class="dokan-product-title-alert dokan-hide">
                        <?php echo wp_kses_post( $product_title->get_error_message() ); ?>
                    </div>

                    <div id="edit-slug-box" class="hide-if-no-js"></div>
                    <?php wp_nonce_field( 'samplepermalink', 'samplepermalinknonce', false ); ?>
                    <input type="hidden" name="editable-post-name" class="dokan-hide" id="editable-post-name-full-dokan">
                    <input type="hidden" value="<?php echo esc_attr( $product->get_slug() ); ?>" name="edited-post-name" class="dokan-hide" id="edited-post-name-dokan">
                </div>
            <?php endif; ?>

            <?php
            $product_type = $section->get_field( Elements::TYPE );
            if ( ! is_wp_error( $product_type ) && $product_type->is_visible() ) :
                $product_type_options = $product_type->get_options();
                ?>
                <?php if ( count( $product_type_options ) === 1 && array_key_exists( 'simple', $product_type_options ) ) : ?>
                <input type="hidden" id="<?php echo esc_attr( $product_type->get_name() ); ?>" name="<?php echo esc_attr( $product_type->get_name() ); ?>" value="simple">
            <?php else : ?>
                <div class="dokan-form-group">
                    <label for="<?php echo esc_attr( $product_type->get_name() ); ?>" class="form-label">
                        <?php echo esc_html( $product_type->get_title() ); ?>
                        <i
                            class="fas fa-question-circle tips"
                            aria-hidden="true"
                            data-title="<?php echo esc_attr( $product_type->get_help_content() ); ?>">
                        </i>
                    </label>
                    <select name="<?php echo esc_attr( $product_type->get_name() ); ?>" class="dokan-form-control" id="<?php echo esc_attr( $product_type->get_name() ); ?>">
                        <?php foreach ( $product_type_options as $key => $value ) : ?>
                            <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $product->get_type(), $key ); ?>><?php echo esc_html( $value ); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            <?php endif; ?>
            <?php endif; ?>

            <?php do_action( 'dokan_product_edit_after_title', $post, $product->get_id(), $product ); ?>

            <div class="show_if_simple dokan-clearfix show_if_external">
                <div class="dokan-form-group dokan-clearfix dokan-price-container">
                    <?php
                    $regular_price = $section->get_field( Elements::REGULAR_PRICE );
                    if ( ! is_wp_error( $regular_price ) && $regular_price->is_visible() ) :
                        ?>
                        <div class="content-half-part regular-price">
                            <label for="<?php echo esc_attr( $regular_price->get_name() ); ?>" class="form-label"><?php echo esc_html( $regular_price->get_title() ); ?></label>
                            <div class="dokan-input-group">
                                <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                                <?php
                                dokan_post_input_box(
                                    $product->get_id(),
                                    $regular_price->get_name(),
                                    [
                                        'value'       => $product->get_regular_price(),
                                        'class'       => 'dokan-product-regular-price',
                                        'placeholder' => $regular_price->get_placeholder(),
                                    ],
                                    'price'
                                );
                                ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <?php
                    $sale_price                      = $section->get_field( Elements::SALE_PRICE );
                    $sale_price_dates_from_timestamp = $product->get_date_on_sale_from( 'edit' ) ? $product->get_date_on_sale_from( 'edit' )->getOffsetTimestamp() : false;
                    $sale_price_dates_to_timestamp   = $product->get_date_on_sale_to( 'edit' ) ? $product->get_date_on_sale_to( 'edit' )->getOffsetTimestamp() : false;

                    $sale_price_dates_from = $sale_price_dates_from_timestamp ? date_i18n( 'Y-m-d', $sale_price_dates_from_timestamp ) : '';
                    $sale_price_dates_to   = $sale_price_dates_to_timestamp ? date_i18n( 'Y-m-d', $sale_price_dates_to_timestamp ) : '';
                    $show_schedule         = $sale_price_dates_from && $sale_price_dates_to;
                    if ( ! is_wp_error( $sale_price ) && $sale_price->is_visible() ) :
                        ?>
                        <div class="content-half-part sale-price">
                            <label for="<?php echo esc_attr( $sale_price->get_name() ); ?>" class="form-label">
                                <?php echo esc_html( $sale_price->get_title() ); ?>
                                <a href="#" class="sale_schedule <?php echo $show_schedule ? 'dokan-hide' : ''; ?>"><?php esc_html_e( 'Schedule', 'dokan-lite' ); ?></a>
                                <a href="#" class="cancel_sale_schedule <?php echo ( ! $show_schedule ) ? 'dokan-hide' : ''; ?>"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></a>
                            </label>

                            <div class="dokan-input-group">
                                <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                                <?php
                                dokan_post_input_box(
                                    $product->get_id(),
                                    $sale_price->get_name(),
                                    [
                                        'name'        => $sale_price->get_name(),
                                        'value'       => $product->get_sale_price(),
                                        'class'       => 'dokan-product-sales-price',
                                        'placeholder' => $sale_price->get_placeholder(),
                                    ],
                                    'price'
                                );
                                ?>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="dokan-form-group dokan-clearfix dokan-price-container">
                    <div class="dokan-product-less-price-alert dokan-hide">
                        <?php esc_html_e( 'Product price can\'t be less than the vendor fee!', 'dokan-lite' ); ?>
                    </div>
                </div>

                <?php
                if ( ! is_wp_error( $sale_price ) && $sale_price->is_visible() ) :
                    $date_on_sale_from = $section->get_field( Elements::DATE_ON_SALE_FROM );
                    $date_on_sale_to = $section->get_field( Elements::DATE_ON_SALE_TO );
                    ?>
                    <div class="sale_price_dates_fields dokan-clearfix dokan-form-group <?php echo ( ! $show_schedule ) ? 'dokan-hide' : ''; ?>">
                        <div class="content-half-part from">
                            <div class="dokan-input-group">
                                <span class="dokan-input-group-addon"><?php echo esc_html( $date_on_sale_from->get_title() ); ?></span>
                                <input
                                    type="text"
                                    name="<?php echo esc_attr( $date_on_sale_from->get_name() ); ?>"
                                    class="dokan-form-control dokan-start-date"
                                    value="<?php echo esc_attr( $sale_price_dates_from ); ?>"
                                    maxlength="10"
                                    pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])"
                                    placeholder="<?php echo esc_attr( $date_on_sale_from->get_placeholder() ); ?>">
                            </div>
                        </div>

                        <div class="content-half-part to">
                            <div class="dokan-input-group">
                                <span class="dokan-input-group-addon"><?php echo esc_html( $date_on_sale_to->get_title() ); ?></span>
                                <input
                                    type="text"
                                    name="<?php echo esc_attr( $date_on_sale_to->get_name() ); ?>"
                                    class="dokan-form-control dokan-end-date"
                                    value="<?php echo esc_attr( $sale_price_dates_to ); ?>"
                                    maxlength="10"
                                    pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])"
                                    placeholder="<?php echo esc_attr( $date_on_sale_to->get_placeholder() ); ?>">
                            </div>
                        </div>
                    </div><!-- .sale-schedule-container -->
                <?php endif; ?>
            </div>

            <?php do_action( 'dokan_product_edit_after_pricing', $post, $product->get_id(), $product ); ?>

            <?php
            $category = $section->get_field( Elements::CATEGORIES );
            if ( ! is_wp_error( $category ) && $category->is_visible() ) :
                ?>
                <div class="dokan-form-group">
                    <?php
                    $data         = Helper::get_saved_products_category( $product->get_id() );
                    $data['from'] = 'edit_product';

                    dokan_get_template_part( 'products/dokan-category-header-ui', '', $data );
                    ?>
                </div>
            <?php endif; ?>

            <?php
            $tags = $section->get_field( Elements::TAGS );
            if ( ! is_wp_error( $tags ) && $tags->is_visible() ) :
                $terms = $product->get_tag_ids();
                ?>
                <div class="dokan-form-group">
                    <label for="<?php echo esc_attr( $tags->get_name() ); ?>" class="form-label"><?php echo $tags->get_title(); ?></label>
                    <select multiple="multiple" id="<?php echo esc_attr( $tags->get_name() ); ?>" name="<?php echo esc_attr( $tags->get_name() ); ?>" class="product_tag_search dokan-form-control" data-placeholder="<?php echo esc_attr( $tags->get_placeholder() ); ?>">
                        <?php if ( ! empty( $terms ) ) : ?>
                            <?php
                            foreach ( $terms as $tax_term ) :
                                $tax_term = get_term_by( 'id', $tax_term, 'product_tag' );
                                if ( is_wp_error( $tax_term ) ) {
                                    continue;
                                }
                                ?>
                                <option value="<?php echo esc_attr( $tax_term->term_id ); ?>" selected="selected"><?php echo esc_html( $tax_term->name ); ?></option>
                            <?php endforeach ?>
                        <?php endif ?>
                    </select>
                </div>
                <?php do_action( 'dokan_product_edit_after_product_tags', $post, $product->get_id(), $product ); ?>
            <?php endif; ?>
        </div><!-- .content-half-part -->

        <div class="content-half-part featured-image">
            <?php
            $featured_image = $section->get_field( Elements::FEATURED_IMAGE_ID );
            if ( ! is_wp_error( $featured_image ) && $featured_image->is_visible() ) :
                ?>
                <div class="dokan-feat-image-upload dokan-new-product-featured-img">
                    <?php
                    $wrap_class        = ' dokan-hide';
                    $instruction_class = '';
                    $feat_image_id     = $product->get_image_id();

                    if ( $feat_image_id ) {
                        $wrap_class        = '';
                        $instruction_class = ' dokan-hide';
                    }
                    ?>

                    <div class="instruction-inside<?php echo esc_attr( $instruction_class ); ?>">
                        <input type="hidden" name="<?php echo esc_attr( $featured_image->get_name() ); ?>" class="dokan-feat-image-id" value="<?php echo esc_attr( $feat_image_id ); ?>">

                        <i class="fas fa-cloud-upload-alt"></i>
                        <a href="#" class="dokan-feat-image-btn btn btn-sm"><?php esc_html_e( 'Upload a product cover image', 'dokan-lite' ); ?></a>
                    </div>

                    <div class="image-wrap<?php echo esc_attr( $wrap_class ); ?>">
                        <a class="close dokan-remove-feat-image">&times;</a>
                        <?php if ( $feat_image_id ) : ?>
                            <?php
                            // todo: need to change this with $product->get_image()
                            echo get_the_post_thumbnail(
                                $product->get_id(),
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
            <?php endif; ?>

            <?php
            $gallery_images = $section->get_field( Elements::GALLERY_IMAGE_IDS );
            if ( ! is_wp_error( $gallery_images ) && $gallery_images->is_visible() ) :
                ?>
                <div class="dokan-product-gallery">
                    <div class="dokan-side-body" id="dokan-product-images">
                        <div id="product_images_container">
                            <ul class="product_images dokan-clearfix">
                                <?php
                                $product_images = $product->get_gallery_image_ids();

                                if ( $product_images ) :
                                    foreach ( $product_images as $image_id ) :
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

                            <input type="hidden" id="product_image_gallery" name="<?php echo esc_attr( $gallery_images->get_name() ); ?>" value="<?php echo esc_attr( implode( ',', $product_images ) ); ?>">
                        </div>
                    </div>
                </div> <!-- .product-gallery -->

                <?php do_action( 'dokan_product_gallery_image_count' ); ?>
            <?php endif; ?>

        </div><!-- .content-half-part -->
    </div><!-- .dokan-form-top-area -->

    <?php
    $short_description = $section->get_field( Elements::SHORT_DESCRIPTION );
    if ( ! is_wp_error( $short_description ) && $short_description->is_visible() ) :
        ?>
        <div class="dokan-product-short-description">
            <label for="<?php echo esc_attr( $short_description->get_name() ); ?>" class="form-label"><?php echo esc_html( $short_description->get_title() ); ?></label>
            <?php
            wp_editor(
                $product->get_short_description(),
                $short_description->get_name(),
                apply_filters(
                    'dokan_product_short_description',
                    [
                        'editor_height' => 50,
                        'quicktags'     => true,
                        'media_buttons' => false,
                        'teeny'         => false,
                        'editor_class'  => 'post_excerpt',
                    ]
                )
            );
            ?>
        </div>
    <?php endif; ?>

    <?php
    $description = $section->get_field( Elements::DESCRIPTION );
    if ( ! is_wp_error( $description ) && $description->is_visible() ) :
        ?>
        <div class="dokan-product-description">
            <label for="<?php echo esc_attr( $description->get_name() ); ?>" class="form-label"><?php echo esc_html( $description->get_title() ); ?></label>
            <?php
            wp_editor(
                $product->get_description(),
                $description->get_name(),
                apply_filters(
                    'dokan_product_description',
                    [
                        'editor_height' => 50,
                        'quicktags'     => true,
                        'media_buttons' => false,
                        'teeny'         => false,
                        'editor_class'  => 'post_content',
                    ]
                )
            );
            ?>
        </div>
    <?php endif; ?>

    <?php do_action( 'dokan_product_edit_form', $post, $product->get_id(), $product ); ?>
    <?php do_action( 'dokan_product_edit_after_main', $post, $product->get_id(), $product ); ?>
    <?php do_action( 'dokan_product_edit_after_inventory_variants', $post, $product->get_id(), $product ); ?>
    <?php do_action( 'dokan_product_edit_after_options', $product->get_id(), $product ); ?>

    <?php wp_nonce_field( 'dokan_edit_product', 'dokan_edit_product_nonce' ); ?>
    <input type="hidden" name="dokan_product_id" id="dokan_product_id" value="<?php echo esc_attr( $product->get_id() ); ?>" />
    <!--hidden input for Firefox issue-->
    <input type="hidden" name="dokan_update_product" value="<?php esc_attr_e( 'Save Product', 'dokan-lite' ); ?>" />
    <input type="submit" name="dokan_update_product" id="publish" class="dokan-btn dokan-btn-theme dokan-btn-lg dokan-right" value="<?php esc_attr_e( 'Save Product', 'dokan-lite' ); ?>" />
    <div class="dokan-clearfix"></div>
</form>
