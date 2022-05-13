<?php

namespace WeDevs\Dokan\DummyData;

/**
 * Include dependencies.
 *
 * @since DOKAN_SINCE
 */
if ( ! class_exists( 'WC_Product_Importer', false ) ) {
    include_once WC_ABSPATH . 'includes/import/abstract-wc-product-importer.php';
}

/**
 * Dokan dummy data importer manager class.
 *
 * @since DOKAN_SINCE
 */
class Manager extends \WC_Product_Importer {

    /**
     * Create and return dummy vendor or if exists return the existing vendor
     *
     * @since DOKAN_SINCE
     *
     * @param array $data
     *
     * @return object|Vendor instance
     */
    public function create_dummy_vendor($data) {
        $data['name']                    = isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : '';
        $data['featured']                = isset( $data['featured'] ) ? sanitize_text_field( $data['featured'] ) : '';
        $data['description']             = isset( $data['description'] ) ? sanitize_text_field( $data['description'] ) : '';
        $data['email']                   = isset( $data['email'] ) ? sanitize_text_field( $data['email'] ) : '';
        $data['password']                = isset( $data['password'] ) ? sanitize_text_field( $data['password'] ) : '';
        $data['store_name']              = isset( $data['store_name'] ) ? sanitize_text_field( $data['store_name'] ) : '';
        $data['user_login']              = $data['store_name'];
        $data['social']                  = isset( $data['social'] ) ? maybe_unserialize( sanitize_text_field( $data['social'] ) ) : [];
        $data['payment']                 = isset( $data['payment'] ) ? maybe_unserialize( sanitize_text_field( $data['payment'] ) ) : [];
        $data['phone']                   = isset( $data['phone'] ) ? sanitize_text_field( $data['phone'] ) : '';
        $data['show_email']              = isset( $data['show_email'] ) ? sanitize_text_field( $data['show_email'] ) : '';
        $data['address']                 = isset( $data['address'] ) ? maybe_unserialize( sanitize_text_field( $data['address'] ) ) : [];
        $data['location']                = isset( $data['location'] ) ? sanitize_text_field( $data['location'] ) : '';
        $data['banner']                  = isset( $data['banner'] ) ? sanitize_text_field( $data['banner'] ) : '';
        $data['icon']                    = isset( $data['icon'] ) ? sanitize_text_field( $data['icon'] ) : '';
        $data['gravatar']                = isset( $data['gravatar'] ) ? sanitize_text_field( $data['gravatar'] ) : '';
        $data['show_more_tpab']          = isset( $data['show_more_tpab'] ) ? sanitize_text_field( $data['show_more_tpab'] ) : '';
        $data['show_ppp']                = isset( $data['show_ppp'] ) ? sanitize_text_field( $data['show_ppp'] ) : '';
        $data['enable_tnc']              = isset( $data['enable_tnc'] ) ? sanitize_text_field( $data['enable_tnc'] ) : '';
        $data['store_tnc']               = isset( $data['store_tnc'] ) ? sanitize_text_field( $data['store_tnc'] ) : '';
        $data['show_min_order_discount'] = isset( $data['show_min_order_discount'] ) ? sanitize_text_field( $data['show_min_order_discount'] ): '';
        $data['store_seo']               = isset( $data['store_seo'] ) ? maybe_unserialize( sanitize_text_field( $data['store_seo'] ) ) : '';
        $data['dokan_store_time']        = isset( $data['dokan_store_time'] ) ? maybe_unserialize( sanitize_text_field( $data['dokan_store_time'] ) ) : [];
        $data['enabled']                 = isset( $data['enabled'] ) ? sanitize_text_field( $data['enabled'] ) : '';
        $data['trusted']                 = isset( $data['trusted'] ) ? sanitize_text_field( $data['trusted'] ) : '';

        if ( get_user_by( 'slug', $data['store_name'] ) ) {
            return dokan()->vendor->get( get_user_by( 'slug', $data['store_name'] ) );
        } elseif ( get_user_by( 'login', $data['store_name'] ) ) {
            return dokan()->vendor->get( get_user_by( 'login', $data['store_name'] ) );
        }

        return dokan()->vendor->create($data);
    }

    public function create_dummy_products_for_vendor( $vendor_id, $products ) {
        foreach ( $products as $product_key => $product ) {
            $product['category_ids'] = $this->formate_product_categories( $product );

            error_log( print_r( $product , 1 ) );
        }

        return [$vendor_id, $products];
    }

    /**
     * Formats category ids for products
     *
     * @since DOKAN_SINCE
     *
     * @param array $value
     *
     * @return array
     */
    private function formate_product_categories($value) {
        $category_ids     = explode( ',', $value['category_ids'] );
        $all_category_ids = [];
        foreach ( $category_ids as $category ) {
            $term = term_exists( $category, 'product_cat' );

            if ( ! $term ) {
                $term = wp_insert_term( $category, 'product_cat' );
            }

            array_push( $all_category_ids, $term['term_id'] );
        }

        return $all_category_ids;
    }

    /**
     * Process importer.
     *
     * Do not import products with IDs or SKUs that already exist if option
     * update existing is false, and likewise, if updating products, do not
     * process rows which do not exist if an ID/SKU is provided.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function import() {}
}
