<?php
    $term_ids  = isset( $terms ) ? $terms : [];
    $is_single = dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ? true : false;

    if ( count( $term_ids ) < 1 ) {
        array_push( $term_ids, get_term( get_option('default_product_cat') ) );
    }
?>

<!-- Trigger/Open The Modal -->
<div class="dokan-form-group dokan-new-cat-ui-title">
<label for="product_cat" class="form-label"><?php esc_html_e( 'Category', 'dokan-lite' ); ?></label>
</div>
<span class="dokan-add-new-cat-box">
    <?php foreach ( $term_ids as $key => $term ) : ?>
        <div class="dokan-select-single-category-container">
            <div class="dokan-form-group dokan-select-single-category" data-dokansclevel="<?php echo $key; ?>" id="dokan-category-open-modal">
                <span id="dokan_product_cat_res" class="dokan-select-single-category-title dokan-ssct-level-<?php echo $key; ?>"><?php echo get_term_field( 'name', $term, 'product_cat' ) ?></span>
                <span class="dokan-select-single-category-icon"><i class="fas fa-edit"></i></span>

            </div>
            <?php if ( ! $is_single ) : ?>
                <div class="dokan-select-single-category-remove-container">
                    <span class="dokan-select-single-category-remove"><i class="fas fa-times"></i></span>
                </div>
            <?php endif; ?>
            <span class="dokan-cat-inputs-holder dokan-cih-level-<?php echo $key; ?>" >
                <input type="hidden" name="<?php echo $is_single ? 'product_cat' : 'product_cat[]'; ?>" class="dokan_product_cat" id="dokan_product_cat" value="<?php echo esc_attr( $term->term_id ); ?>">
            </span>
        </div>
    <?php endforeach; ?>
</span>
<?php if ( ! $is_single ) : ?>
    <div class="dokan-form-group dokan-add-more-single-cat-container">
        <div class="dokan-single-cat-add-btn">
            <span><i class="fas fa-plus"></i></span>
        </div>
    </div>
<?php endif; ?>
