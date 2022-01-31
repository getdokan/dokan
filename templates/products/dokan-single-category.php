<?php
    $term_id = isset( $term ) && isset( $term->term_id ) ? $term->term_id : '';
    $term_name = isset( $term ) && isset( $term->name ) ? $term->name : __( '- Select a category -', 'dokan-lite' );
    $pop_up = isset( $pop_up ) ? true : false;
?>


<?php if ( ! $pop_up ) : ?>
<input type="hidden" name="product_cat" class="dokan_product_cat" id="dokan_product_cat" value="<?php echo esc_attr( $term_id ); ?>">
<!-- Trigger/Open The Modal -->
<div class="dokan-form-group dokan-select-single-category" id="dokan-category-open-modal">
    <span id="dokan_product_cat_res" class="dokan-select-single-category-title"><?php echo $term_name; ?></span>
    <span class="dokan-select-single-category-icon"><i class="fas fa-edit"></i></span>

    <div class="dokan-product-cat-alert dokan-hide">
        <?php esc_html_e('Please choose a category!', 'dokan-lite' ); ?>
    </div>
</div>
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
                <span class=" dokan-single-categories-right dokan-single-categories-arrow dokan-hide"><span><i class="fas fa-chevron-right"></i></span></span>
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
                <button id="dokan-single-cat-select-btn" type='button'><?php esc_html_e( 'Done', 'dokan-lite' ); ?></button>
            </div>
        </div>
    </div>

</div>
