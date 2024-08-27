<!-- The Modal -->
<div id="dokan-product-category-modal" class="dokan-product-category-modal">

    <!-- Modal content -->
    <div class="dokan-product-category-modal-content">
        <div class="dokan-product-category-modal-header">
            <div class="dokan-product-category-title">
                <span class="dokan-single-title"><?php esc_html_e( 'Add new category', 'dokan-lite' ); ?></span>
                <span class="dokan-single-des"><?php esc_html_e( 'Please choose the right category for this product', 'dokan-lite' ); ?></span>
            </div>
            <div class="dokan-product-category-close">
                <span class="close" id="dokan-category-close-modal">&times;</span>
            </div>
        </div>
        <div class="dokan-product-category-modal-body">
            <div class="dokan-category-search-container">
                <div class="dokan-cat-search-box">
                    <span class="dokan-cat-search-icon"><i class="fas fa-search"></i></span>
                    <input maxlength="100" id="dokan-single-cat-search-input" class="dokan-cat-search-input" type="text" placeholder="<?php esc_attr_e( 'Search category', 'dokan-lite' ); ?>">
                    <span class="dokan-cat-search-text-limit">
                        <span id="dokan-cat-search-text-limit">
                            <?php echo esc_html( number_format_i18n( 0 ) ); ?>
                        </span>
                        /<?php echo esc_html( number_format_i18n( 100 ) ); ?>
                    </span>
                </div>
                <div id="dokan-cat-search-res" class="dokan-cat-search-res dokan-hide">
                    <ul id="dokan-cat-search-res-ul" class="dokan-cat-search-res-ul"></ul>
                </div>
            </div>
            <div class="dokan-single-categories-container">
                <span class="dokan-single-categories-left dokan-single-categories-arrow dokan-hide">
                    <span class="dokan-single-categories-left-box">
                        <span><i class="fas fa-chevron-left"></i></span>
                    </span>
                </span>
                <div class="dokan-single-categories" id="dokan-single-categories"></div>
                <span class="dokan-single-categories-right dokan-single-categories-arrow dokan-hide">
                    <span class="dokan-single-categories-right-box">
                        <span><i class="fas fa-chevron-right"></i></span>
                    </span>
                </span>
            </div>

        </div>
        <div class="dokan-product-category-modal-footer">
            <div class="dokan-selected-category-label-container">
                <span class="dokan-selected-category-label"><?php esc_html_e( 'Selected: ', 'dokan-lite' ); ?></span>
                <span class="dokan-selected-category-span" id="dokan-selected-category-span">
                    <span class="dokan-selected-category-product"><?php esc_html_e( 'No category', 'dokan-lite' ); ?></span>
                </span>
            </div>
            <div class="dokan-product-category-button-container">
                <button class="dokan-single-cat-select-btn dokan-btn dokan-btn-default dokan-btn-theme" id="dokan-single-cat-select-btn" type='button'><?php esc_html_e( 'Done', 'dokan-lite' ); ?></button>
            </div>
        </div>
    </div>

</div>
