<?php

namespace WeDevs\Dokan\Dashboard\Templates;

/**
 * Multi step category ui class.
 *
 * @since 3.6.2
 */
class MultiStepCategories {

    /**
     * Class constructor.
     *
     * @since 3.6.2
     */
    public function __construct() {
        add_action( 'dokan_before_product_content_area', array( $this, 'load_add_category_modal' ), 10 );
        add_action( 'dokan_before_new_product_content_area', array( $this, 'load_add_category_modal' ), 10 );
        add_action( 'dokan_before_listing_product', array( $this, 'load_add_category_modal' ), 10 );
    }

    /**
     * Returns new category select ui html elements.
     *
     * @since 3.6.2
     *
     * @return html
     */
    public function load_add_category_modal() {
        /**
         * Checking if dokan dashboard or add product page or product edit page or product list.
         * Because without those page we don't need to load category modal.
         */
        global $wp;
        if ( ( dokan_is_seller_dashboard() && isset( $wp->query_vars['products'] ) )
        || ( isset( $wp->query_vars['products'], $_GET['product_id'] ) )
        || ( isset( $wp->query_vars['new-product'] ) )
        ) {
            dokan_get_template_part( 'products/dokan-category-ui', '', array() );
        }
    }
}
