<?php
    use WeDevs\Dokan\ProductCategory\Helper;

    $default_product_cat = ! empty( $default_product_cat ) ? $default_product_cat : new \WP_Error( 'not_found', __( 'Could not found default product category.', 'dokan' ) );

    if ( count( $chosen_cat ) < 1 && ! is_wp_error( $default_product_cat ) ) {
        array_push( $chosen_cat, $default_product_cat->term_id );
    }
?>

<!-- Trigger/Open The Modal -->
<div class="dokan-form-group dokan-new-cat-ui-title">
    <label for="product_cat" class="form-label"><?php esc_html_e( 'Category', 'dokan-lite' ); ?></label>
</div>
<span class="dokan-add-new-cat-box">
    <?php foreach ( $chosen_cat as $key => $term ) : ?>
        <div class="dokan-select-product-category-container">
            <div class="dokan-form-group dokan-select-product-category dokan-category-open-modal" data-dokansclevel="<?php echo esc_attr( $key ); ?>" id="dokan-category-open-modal">
                <span id="dokan_product_cat_res" class="dokan-select-product-category-title dokan-ssct-level-<?php echo esc_attr( $key ); ?>"><?php echo Helper::get_ancestors_html( $term ); ?></span>
                <span class="dokan-select-product-category-icon"><i class="fas fa-edit"></i></span>

            </div>
            <?php if ( ! $is_single ) : ?>
                <div class="dokan-select-product-category-remove-container">
                    <span class="dokan-select-product-category-remove"><i class="fas fa-times"></i></span>
                </div>
            <?php endif; ?>
            <span class="dokan-cat-inputs-holder dokan-cih-level-<?php echo esc_attr( $key ); ?>" >
                <input type="hidden" class="dokan_chosen_product_cat dokan_chosen_product_cat_<?php echo esc_attr( $term ); ?>" name="chosen_product_cat[]" value="<?php echo esc_attr( $term ); ?>"></input>
            </span>
        </div>
    <?php endforeach; ?>
</span>
<?php if ( ! $is_single ) : ?>
    <div class="dokan-form-group dokan-add-more-single-cat-container">
        <div class="dokan-single-cat-add-btn">
            <span><?php esc_html_e( '+ Add new category', 'dokan' ); ?></span>
        </div>
    </div>
<?php endif; ?>
