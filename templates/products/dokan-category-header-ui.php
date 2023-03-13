<?php
use WeDevs\Dokan\ProductCategory\Helper;

$from           = ! empty( $from ) ? $from : '-';
$hide_cat_title = ! empty( $hide_cat_title ) && 'yes' === $hide_cat_title;

$initial_category_for_modal = 0;

// If there are no chosen category and also there is a default category set then initial category box set as default category
if ( count( $chosen_cat ) < 1 && ! empty( $default_product_cat->term_id ) ) {
    $initial_category_for_modal = $default_product_cat->term_id;
}

// If no category is set then add a empty category box.
if ( count( $chosen_cat ) < 1 ) {
    array_push( $chosen_cat, $initial_category_for_modal );
}
?>

<!-- Trigger/Open The Modal -->
<?php if ( ! $hide_cat_title ) : ?>
<div class="dokan-form-group dokan-new-cat-ui-title">
    <label for="product_cat" class="form-label"><?php esc_html_e( 'Category', 'dokan-lite' ); ?></label>
</div>
<?php endif; ?>
<span class="dokan-add-new-cat-box cat_box_for_<?php echo esc_attr( $from ); ?>">
    <?php foreach ( $chosen_cat as $key => $term_id ) : ?>
        <div data-activate="no" class="dokan-select-product-category-container dokan_select_cat_for_<?php echo esc_attr( $from ); ?>_<?php echo esc_attr( $key ); ?>">
            <div data-selectfor="<?php echo esc_attr( $from ); ?>" class="dokan-form-group dokan-select-product-category dokan-category-open-modal" data-dokansclevel="<?php echo esc_attr( $key ); ?>" id="dokan-category-open-modal">
                <span id="dokan_product_cat_res" class="dokan-select-product-category-title dokan-ssct-level-<?php echo esc_attr( $key ); ?>"><?php echo empty( $term_id ) ? __( '- Select a category -', 'dokan-lite' ) : Helper::get_ancestors_html( $term_id ); ?></span>
                <span class="dokan-select-product-category-icon"><i class="fas fa-edit"></i></span>

            </div>
            <?php if ( ! $is_single ) : ?>
                <div class="dokan-select-product-category-remove-container">
                    <span class="dokan-select-product-category-remove"><i class="fas fa-times"></i></span>
                </div>
            <?php endif; ?>
            <span class="dokan-cat-inputs-holder dokan-cih-level-<?php echo esc_attr( $key ); ?>" >
                <?php if ( ! empty( $term_id ) ) : ?>
                    <input data-field-name="chosen_product_cat" type="hidden" class="dokan_chosen_product_cat dokan_chosen_product_cat_<?php echo esc_attr( $term_id ); ?>" name="chosen_product_cat[]" value="<?php echo esc_attr( $term_id ); ?>"/>
                <?php endif; ?>
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
