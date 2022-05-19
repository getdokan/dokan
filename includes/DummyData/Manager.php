<?php

namespace WeDevs\Dokan\DummyData;

use \WP_Error;

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
     * Created or existing vendor id
     *
     * @var int
     */
    private $vendor_id = null;

    /**
     * Save existing user here for creating dummy data.
     *
     * @var array
     */
    private $user = [];

    /**
     * Saves user by slug, of not found save user by login.
     *
     * @since DOKAN_SINCE
     *
     * @param sting $store_name
     * @param sting $key
     *
     * @return void
     */
    private function set_user( $store_name, $key ) {
        if ( 'slug' === $key ) {
            $this->user[ $key ] = get_user_by( $key, $store_name );
        } elseif ( 'login' === $key && ! empty( $this->user['slug'] ) ) {
            $this->user[ $key ] = get_user_by( $key, $store_name );
        }
    }

    /**
     * Create and return dummy vendor or if exists return the existing vendor
     *
     * @since DOKAN_SINCE
     *
     * @param array $data
     *
     * @return object|Vendor instance
     */
    public function create_dummy_vendor( $data ) {
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
        $data['show_min_order_discount'] = isset( $data['show_min_order_discount'] ) ? sanitize_text_field( $data['show_min_order_discount'] ) : '';
        $data['store_seo']               = isset( $data['store_seo'] ) ? maybe_unserialize( sanitize_text_field( $data['store_seo'] ) ) : '';
        $data['dokan_store_time']        = isset( $data['dokan_store_time'] ) ? maybe_unserialize( sanitize_text_field( $data['dokan_store_time'] ) ) : [];
        $data['enabled']                 = isset( $data['enabled'] ) ? sanitize_text_field( $data['enabled'] ) : '';
        $data['trusted']                 = isset( $data['trusted'] ) ? sanitize_text_field( $data['trusted'] ) : '';

        // set user by key
        $this->set_user( 'slug', $data['store_name'] );
        $this->set_user( 'login', $data['store_name'] );

        if ( $this->user['slug'] ) {
            $current_vendor = dokan()->vendor->get( $this->user['slug'] );
        } elseif ( $this->user['login'] ) {
            $current_vendor = dokan()->vendor->get( $this->user['login'] );
        } else {
            $current_vendor = dokan()->vendor->create( $data );
        }

        add_user_meta( $current_vendor->id, 'dokan_dummy_data', true, true );

        return $current_vendor;
    }

    /**
     * Creates dummy vendors and products.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id
     * @param array $products
     *
     * @return void
     */
    public function create_dummy_products_for_vendor( $vendor_id, $products ) {
        foreach ( $products as $product_key => $product ) {
            $products[ $product_key ]['category_ids']          = $this->formate_product_categories_or_tags( $product, 'product_cat', 'category_ids' );
            $products[ $product_key ]['tag_ids']               = $this->formate_product_categories_or_tags( $product, 'product_tag', 'tag_ids' );
            $products[ $product_key ]['raw_gallery_image_ids'] = $this->formate_string_by_separator( $product['raw_gallery_image_ids'] );
        }

        $this->parsed_data = $products;
        $this->vendor_id = $vendor_id;

        return $this->import();
    }

    /**
     * Formats category / tags ids for products
     *
     * @since DOKAN_SINCE
     *
     * @param array $value
     *
     * @return array
     */
    private function formate_product_categories_or_tags( $value, $taxonomy, $category_or_tag ) {
        $all_category_or_tags = $this->formate_string_by_separator( $value[ $category_or_tag ] );
        $all_ids              = [];

        foreach ( $all_category_or_tags as $item ) {
            $term = term_exists( $item, $taxonomy );

            if ( ! $term && ! empty( $item ) ) {
                $term = wp_insert_term( $item, $taxonomy );
            } elseif ( empty( $item ) ) {
                continue;
            }

            array_push( $all_ids, $term['term_id'] );
        }

        return $all_ids;
    }

    /**
     * Formats string by a separator
     *
     * @since DOKAN_SINCE
     *
     * @param string $data
     *
     * @param string $separator
     *
     * @return array
     */
    private function formate_string_by_separator( $data = '', $separator = ',' ) {
        return explode( $separator, $data );
    }

    /**
     * Process importer.
     *
     * Do not import products with IDs or SKUs that already exist if option
     * update existing is false, and likewise, if updating products, do not
     * process rows which do not exist if an SKU is provided.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function import() {
        $index            = 0;
        $update_existing  = false;
        $data             = array(
            'imported' => array(),
            'failed'   => array(),
            'updated'  => array(),
            'skipped'  => array(),
        );

        foreach ( $this->parsed_data as $parsed_data_key => $parsed_data ) {
            unset( $parsed_data['id'] );
            $sku        = isset( $parsed_data['sku'] ) ? $parsed_data['sku'] : '';
            $sku_exists = false;

            if ( $sku ) {
                $id_from_sku = wc_get_product_id_by_sku( $sku );
                $product     = $id_from_sku ? wc_get_product( $id_from_sku ) : false;
                $sku_exists  = $product ? true : false;
            }

            if ( $sku_exists && ! $this->is_my_product( $product ) ) {
                $data['skipped'][] = new WP_Error(
                    'woocommerce_product_importer_error',
                    __( 'A product with this SKU already exists in another vendor.', 'dokan-lite' ),
                    array(
                        'sku'  => $sku,
                        'item' => $parsed_data,
                    )
                );
                continue;
            }

            if ( $sku_exists && ! $update_existing ) {
                $data['skipped'][] = new WP_Error(
                    'woocommerce_product_importer_error',
                    esc_html__( 'A product with this SKU already exists.', 'dokan-lite' ),
                    array(
                        'sku'  => esc_attr( $sku ),
                        'item' => $parsed_data,
                    )
                );
                continue;
            }

            if ( $update_existing && isset( $parsed_data['sku'] ) && ! $sku_exists ) {
                $data['skipped'][] = new WP_Error(
                    'woocommerce_product_importer_error',
                    esc_html__( 'No matching product exists to update.', 'dokan-lite' ),
                    array(
                        'sku'  => esc_attr( $sku ),
                        'item' => $parsed_data,
                    )
                );
                continue;
            }

            $result = $this->process_item( $parsed_data );

            if ( is_wp_error( $result ) ) {
                $data['failed'][] = [
                    'error_data' => $result->get_error_message(),
                    'item'       => $parsed_data,
                ];
            } elseif ( $result['updated'] ) {
                $data['updated'][] = $result['id'];
            } else {
                $data['imported'][] = $result['id'];

                add_post_meta( $result['id'], 'dokan_dummy_data', true, true );
                wp_update_post(
                    array(
                        'ID'          => $result['id'],
                        'post_author' => $this->vendor_id,
                    )
                );
            }

            $index ++;
        }

        return $data;
    }

    /**
     * Check if the product is from my store
     *
     * @param int|WC_Product $product
     *
     * @return bool
     */
    private function is_my_product( $product ) {
        return $this->vendor_id === dokan_get_vendor_by_product( $product )->get_id();
    }

    /**
     * Remove all dummy data ( products and vendors ) that has 'dokan_dummy_data' meta key
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function clear_all_dummy_data() {
        $allProducts = get_posts(
            array(
                'post_type'   => 'product',
                'numberposts' => -1,
                'meta_key'    => 'dokan_dummy_data', // phpcs:ignore
                'post_status' => 'any',
            )
        );
        foreach ( $allProducts as $product ) {
            wp_delete_post( $product->ID, true );
        }

        $all_vendors = dokan()->vendor->get_vendors( [
            'role__in' => [ 'seller' ],
            'meta_key' => 'dokan_dummy_data', // phpcs:ignore
        ] );
        foreach ( $all_vendors as $vendor ) {
            wp_delete_user( $vendor->id );
        }

        return __( 'Cleared all dummy data successfully.', 'dokan-lite' );
    }
}
