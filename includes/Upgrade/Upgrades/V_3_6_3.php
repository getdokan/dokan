<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\ProductCategory\Categories;

class V_3_6_3 extends DokanUpgrader {

    /**
     * Updates categories for vendor subscription products.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_vendor_subscription_products_categories() {
        $args = [
            'type'   => 'product_pack',
            'status' => 'any',
            'return' => 'ids',
            'limit'  => -1,
        ];

        $products = wc_get_products( $args );
        $dokan_category = new Categories();
        $all_categories = $dokan_category->get_all_categories( true );

        foreach ( $products as $product_id ) {
            $categories = get_post_meta( $product_id, '_vendor_allowed_categories', true );

            if ( ! empty( $categories ) && is_array( $categories ) ) {
                foreach ( $categories as $cat_index => $category_id ) {
                    if( 0 !== intval( $all_categories[ $category_id]['parent_id'] ) ) {
                        foreach ( $all_categories[ $category_id]['parents'] as $parent_index => $parent_id ) {
                            if ( 0 === intval( $all_categories[$parent_id]['parent_id'] ) ) {
                                $categories[ $cat_index ] = $all_categories[$parent_id][ 'term_id' ];
                            }
                        }
                    }
                }
            }

            update_post_meta( $product_id, '_vendor_allowed_categories', $categories );
        }
    }
}
