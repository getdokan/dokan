<?php
    $term_ids   = isset( $terms ) ? $terms : [];
    $chosen_cat = isset( $terms ) ? $chosen_cat : [];
    $is_single  = dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ? true : false;

    if ( count( $chosen_cat ) < 1 ) {
        array_push( $chosen_cat, get_term( get_option('default_product_cat') )->term_id );
    }
?>

<!-- Trigger/Open The Modal -->
<div class="dokan-form-group dokan-new-cat-ui-title">
<label for="product_cat" class="form-label"><?php esc_html_e( 'Category', 'dokan-lite' ); ?></label>
</div>
<span class="dokan-add-new-cat-box">
    <?php foreach ( $chosen_cat as $key => $term ) : ?>
        <div class="dokan-select-product-category-container">
            <div class="dokan-form-group dokan-select-product-category" data-dokansclevel="<?php echo esc_attr( $key ); ?>" id="dokan-category-open-modal">
                <?php
                    $all_parents   = get_ancestors( $term, 'product_cat' );
                    $all_parents   = array_reverse( $all_parents );
                    $parents_count = sizeof( $all_parents );
                    $html          = '';

                    foreach ( $all_parents as $index => $value ) {
                        $label = "<span class='dokan-selected-category-product'>" . get_term_field( 'name', $value, 'product_cat' ) . "</span><span class='dokan-selected-category-icon'><i class='fas fa-chevron-right'></i></span>";
                        $html .= $label;
                    }
                    $html .= "<span class='dokan-selected-category-product dokan-cat-selected'>" . get_term_field( 'name', $term, 'product_cat' ) . "</span>";
                ?>
                <span id="dokan_product_cat_res" class="dokan-select-product-category-title dokan-ssct-level-<?php echo esc_attr( $key ); ?>"><?php echo $html; ?></span>
                <span class="dokan-select-product-category-icon"><i class="fas fa-edit"></i></span>

            </div>
            <?php if ( ! $is_single ) : ?>
                <div class="dokan-select-product-category-remove-container">
                    <span class="dokan-select-product-category-remove"><i class="fas fa-times"></i></span>
                </div>
            <?php endif; ?>
            <span class="dokan-cat-inputs-holder dokan-cih-level-<?php echo esc_attr( $key ); ?>" >
                <input type="hidden" name="product_cat[]" class="dokan_product_cat" id="dokan_product_cat" value="<?php echo esc_attr( $term ); ?>">
                <input type="hidden" class="dokan_chosen_product_cat" name="chosen_product_cat[]" value="<?php echo esc_attr( $term ); ?>"></input>
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
