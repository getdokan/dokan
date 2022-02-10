<?php
    $term_ids  = isset( $terms ) ? $terms : [];
    $term_name = __( '- Select a category -', 'dokan-lite' );
    $pop_up    = isset( $pop_up ) ? true : false;
    $is_single = dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ? true : false;

    $args = array(
           'taxonomy'     => 'product_cat',
           'orderby'      => 'name',
           'show_count'   => 1,      // 1 for yes, 0 for no
           'pad_counts'   => 1,      // 1 for yes, 0 for no
           'hierarchical' => 1,      // 1 for yes, 0 for no
           'title_li'     => '',
           'hide_empty'   => 0,    );
   $all_categories = get_categories( $args );

   foreach ( $all_categories as $key => $value ) {
        $children = get_terms( 'product_cat', array(
            'parent'    => $value->term_id,
            'hide_empty' => false
        ) );

        $children ? $all_categories[$key]->has_child = true : $all_categories[$key]->has_child = false;
        $parents = [];
        $parents = dokan_get_single_cat_parents( $parents, $all_categories, $value, $key );
        $all_categories[$key]->parents = array_reverse( $parents );
   }

   function dokan_get_single_cat_parents ( $parents, $all_categories, $value, $key ) {
        foreach ( $all_categories as $category ) {
            if ( $category->term_id === $value->category_parent && $value->category_parent !== 0 ) {
                array_push( $parents, $category );
                $parents = dokan_get_single_cat_parents( $parents, $all_categories, $category, $key );
            }
        }

        return $parents;
   }

?>

<script>
    const dokan_all_product_categories = <?php echo json_encode( $all_categories ) ?>;
    const dokan_all_saved_product_categories = <?php echo json_encode( $term_ids ) ?>;
</script>


<?php if ( ! $pop_up ) : ?>
<!-- Trigger/Open The Modal -->
<div class="dokan-form-group">
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
                <input type="hidden" name="product_cat[]" class="dokan_product_cat" id="dokan_product_cat">
            </span>
        </div>
    <?php endforeach; ?>
</span>
<?php if ( ! $is_single ) : ?>
    <div class="dokan-form-group dokan-add-more-single-cat-container">
        <div class="dokan-single-cat-add-btn" data-issingle="<?php echo $is_single; ?>">
            <span><i class="fas fa-plus"></i></span>
        </div>
    </div>
<?php endif; ?>
<?php endif; ?>

<!-- The Modal -->
<div id="dokan-single-category-modal" class="dokan-single-category-modal">

    <!-- Modal content -->
    <div class="dokan-single-category-modal-content">
        <div class="dokan-single-category-modal-header">
            <div class="dokan-single-category-title">
                <span class="dokan-single-title"><?php esc_html_e( 'Add new category', 'dokan-lite' ) ?></span>
                <span class="dokan-single-des"><?php esc_html_e( 'Please choose the right category for this product', 'dokan-lite' ) ?></span>
            </div>
            <div class="dokan-single-category-close">
                <span class="close" id="dokan-category-close-modal">&times;</span>
            </div>
        </div>
        <div class="dokan-single-category-modal-body">
            <div class="dokan-category-search-container">
                <div class="dokan-cat-search-box">
                    <span class="dokan-cat-search-icon"><i class="fas fa-search"></i></span>
                    <input maxlength="100" id="dokan-single-cat-search-input" class="dokan-cat-search-input" type="text" placeholder="<?php esc_attr_e( 'Search category', 'dokan-lite' ) ?>">
                    <span class="dokan-cat-search-text-limit"><span id="dokan-cat-search-text-limit">0</span>/100</span>
                </div>
                <div id="dokan-cat-search-res" class="dokan-cat-search-res dokan-hide">
                    <ul id="dokan-cat-search-res-ul" class="dokan-cat-search-res-ul"></ul>
                </div>
            </div>
            <div class="dokan-single-categories-container">
                <span class="dokan-single-categories-left dokan-single-categories-arrow dokan-hide"><span><i class="fas fa-chevron-left"></i></span></span>
                <div class="dokan-single-categories" id="dokan-single-categories"></div>
                <div id="dokan-single-categories-loader" class="dokan-single-categories-loader dokan-hide">
                    <img src="" alt="" class="dokan-cat-loader">
                </div>
                <span class="dokan-single-categories-right dokan-single-categories-arrow dokan-hide"><span><i class="fas fa-chevron-right"></i></span></span>
            </div>

        </div>
        <div class="dokan-single-category-modal-footer">
            <div class="dokan-selected-category-label-container">
                <span class="dokan-selected-category-label">Selected: </span>
                <span class="dokan-selected-category-span" id="dokan-selected-category-span">
                    <span class="dokan-selected-category-single"><?php esc_html_e( 'No category', 'dokan-lite' ) ?></span>
                </span>
            </div>
            <div class="dokan-single-category-button-container">
                <button class="dokan-single-cat-select-btn" id="dokan-single-cat-select-btn" type='button'><?php esc_html_e( 'Done', 'dokan-lite' ); ?></button>
            </div>
        </div>
    </div>

</div>
