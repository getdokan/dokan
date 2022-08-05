<?php
    use WeDevs\Dokan\ProductCategory\Helper;

    $default_product_cat = ! empty( $default_product_cat ) ? $default_product_cat : new \WP_Error( 'not_found', __( 'Could not found default product category.', 'dokan' ) );
    $hide_cat_title = ! empty( $hide_cat_title ) && 'yes' === $hide_cat_title;
    $from = ! empty( $from ) ? $from : '-';

    if ( count( $chosen_cat ) < 1 && ! is_wp_error( $default_product_cat ) ) {
        array_push( $chosen_cat, $default_product_cat->term_id );
    }
?>

<!-- Trigger/Open The Modal -->
<?php if( ! $hide_cat_title  ) {?>
<div class="dokan-form-group dokan-new-cat-ui-title">
    <label for="product_cat" class="form-label"><?php esc_html_e( 'Category', 'dokan-lite' ); ?></label>
</div>
<?php } ?>
<span class="dokan-add-new-cat-box cat_box_for_<?php echo esc_attr( $from ); ?>">
    <?php foreach ( $chosen_cat as $key => $term ) : ?>
        <div data-activate="no" class="dokan-select-product-category-container dokan_select_cat_for_<?php echo esc_attr( $from ); ?>_<?php echo esc_attr( $key ); ?>">
            <div data-selectfor="<?php echo esc_attr( $from ); ?>" class="dokan-form-group dokan-select-product-category dokan-category-open-modal" data-dokansclevel="<?php echo esc_attr( $key ); ?>" id="dokan-category-open-modal">
                <span id="dokan_product_cat_res" class="dokan-select-product-category-title dokan-ssct-level-<?php echo esc_attr( $key ); ?>"><?php echo Helper::get_ancestors_html( $term ); ?></span>
                <span class="dokan-select-product-category-icon"><i class="fas fa-edit"></i></span>

            </div>
            <?php if ( ! $is_single ) : ?>
                <div class="dokan-select-product-category-remove-container">
                    <span class="dokan-select-product-category-remove"><i class="fas fa-times"></i></span>
                </div>
            <?php endif; ?>
            <span class="dokan-cat-inputs-holder dokan-cih-level-<?php echo esc_attr( $key ); ?>" >
                <input data-field-name="chosen_product_cat" type="hidden" class="dokan_chosen_product_cat dokan_chosen_product_cat_<?php echo esc_attr( $term ); ?>" name="chosen_product_cat[]" value="<?php echo esc_attr( $term ); ?>"/>
            </span>
        </div>
    <?php endforeach; ?>
</span>
<?php if ( ! $is_single ) : ?>
    <div class="dokan-form-group dokan-add-more-single-cat-container">
        <div class="dokan-single-cat-add-btn" data-selectfor="<?php echo esc_attr( $from ); ?>">
            <span><?php esc_html_e( '+ Add new category', 'dokan-lite' ); ?></span>
        </div>
    </div>
<?php endif; ?>
