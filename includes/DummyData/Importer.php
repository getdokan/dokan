<?php

namespace WeDevs\Dokan\DummyData;

use \WP_Error;
use \WP_Query;

/**
 * Include dependencies.
 *
 * @since 3.6.2
 */
if ( ! class_exists( 'WC_Product_Importer', false ) ) {
    include_once WC_ABSPATH . 'includes/import/abstract-wc-product-importer.php';
}

if ( ! function_exists( 'wp_delete_user' ) ) {
    require_once ABSPATH . 'wp-admin/includes/user.php';
}

/**
 * Dokan dummy data importer class.
 *
 * @since 3.6.2
 */
class Importer extends \WC_Product_Importer {

    /**
     * Created or existing vendor id
     *
     * @var int
     */
    private $vendor_id = null;

    public function __construct() {
        add_action( 'dokan_clear_dummy_data_vendor_orders', [ $this, 'delete_dummy_vendor_orders' ] );
    }

    /**
     * Create and return dummy vendor or if exists return the existing vendor
     *
     * @since 3.6.2
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
        $data['user_pass']               = isset( $data['user_pass'] ) ? sanitize_text_field( $data['user_pass'] ) : '';
        $data['store_name']              = isset( $data['store_name'] ) ? sanitize_text_field( $data['store_name'] ) : '';
        $data['user_login']              = $data['store_name'];
        $data['social']                  = isset( $data['social'] ) ? json_decode( sanitize_text_field( $data['social'] ), true ) : [];
        $data['payment']                 = isset( $data['payment'] ) ? json_decode( sanitize_text_field( $data['payment'] ), true ) : [];
        $data['phone']                   = isset( $data['phone'] ) ? sanitize_text_field( $data['phone'] ) : '';
        $data['show_email']              = isset( $data['show_email'] ) ? sanitize_text_field( $data['show_email'] ) : '';
        $data['address']                 = isset( $data['address'] ) ? json_decode( sanitize_text_field( $data['address'] ), true ) : [];
        $data['location']                = isset( $data['location'] ) ? sanitize_text_field( $data['location'] ) : '';
        $data['banner']                  = isset( $data['banner'] ) ? sanitize_text_field( $data['banner'] ) : '';
        $data['icon']                    = isset( $data['icon'] ) ? sanitize_text_field( $data['icon'] ) : '';
        $data['gravatar']                = isset( $data['gravatar'] ) ? sanitize_text_field( $data['gravatar'] ) : '';
        $data['show_more_tpab']          = isset( $data['show_more_tpab'] ) ? sanitize_text_field( $data['show_more_tpab'] ) : '';
        $data['show_ppp']                = isset( $data['show_ppp'] ) ? sanitize_text_field( $data['show_ppp'] ) : '';
        $data['enable_tnc']              = isset( $data['enable_tnc'] ) ? sanitize_text_field( $data['enable_tnc'] ) : '';
        $data['store_tnc']               = isset( $data['store_tnc'] ) ? sanitize_text_field( $data['store_tnc'] ) : '';
        $data['show_min_order_discount'] = isset( $data['show_min_order_discount'] ) ? sanitize_text_field( $data['show_min_order_discount'] ) : '';
        $data['store_seo']               = isset( $data['store_seo'] ) ? json_decode( sanitize_text_field( $data['store_seo'] ), true ) : '';
        $data['dokan_store_time']        = isset( $data['dokan_store_time'] ) ? json_decode( sanitize_text_field( $data['dokan_store_time'] ), true ) : [];
        $data['enabled']                 = isset( $data['enabled'] ) ? sanitize_text_field( $data['enabled'] ) : '';
        $data['trusted']                 = isset( $data['trusted'] ) ? sanitize_text_field( $data['trusted'] ) : '';

        $existing_user = get_user_by( 'slug', $data['store_name'] );
        if ( ! $existing_user ) {
            $existing_user = get_user_by( 'login', $data['store_name'] );
        }

        if ( $existing_user ) {
            $current_vendor = dokan()->vendor->get( $existing_user );
        } else {
            $current_vendor = dokan()->vendor->create( $data );
        }

        add_user_meta( $current_vendor->id, 'dokan_dummy_data', true, true );

        return $current_vendor;
    }

    /**
     * Creates dummy vendors and products.
     *
     * @since 3.6.2
     *
     * @param int $vendor_id
     * @param array $products
     *
     * @return array
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
     * @since 3.6.2
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
     * @since 3.6.2
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
     * @since 3.6.2
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
        return $this->vendor_id === dokan_get_vendor_by_product( $product, true );
    }

    /**
     * Remove all dummy data ( products and vendors ) that has 'dokan_dummy_data' meta key
     *
     * @since 3.6.2
     *
     * @return string
     */
    public function clear_all_dummy_data() {
        $args = [
            'post_type'   => 'product',
            'numberposts' => -1,
            'post_status' => 'any',
        ];

        $query = new WP_query( $args );
        $all_products = $query->posts;

        foreach ( $all_products as $product ) {
            wp_delete_post( $product->ID, true );
        }

        $all_vendors = dokan()->vendor->get_vendors(
            array(
                'role__in' => [ 'seller' ],
                'meta_key' => 'dokan_dummy_data', // phpcs:ignore
            )
        );
        foreach ( $all_vendors as $vendor ) {
            wp_delete_user( $vendor->id );

            $task_args = [
                'task'      => 'clear_dummy_vendors_orders',
                'vendor_id' => $vendor->id,
            ];

            WC()->queue()->add( 'dokan_clear_dummy_data_vendor_orders', [ $task_args ] );
        }

        return __( 'Cleared all dummy data successfully.', 'dokan-lite' );
    }

    /**
     * Delete orders data of a dummy vendors from database.
     *
     * @since 3.6.2
     *
     * @param array $args
     *
     * @return void
     */
    public function delete_dummy_vendor_orders( $args ) {
        // Validating args.
        if ( ! isset( $args['task'] ) || 'clear_dummy_vendors_orders' !== $args['task'] ) {
            return;
        }

        $vendor_id = isset( $args['vendor_id'] ) ? $args['vendor_id'] : '';
        if ( empty( $vendor_id ) ) {
            return;
        }

        $args = [
            'post_type'   => 'shop_order',
            'post_status' => 'any',
            'fields'      => 'all',
            'meta_query'  => [  // phpcs:ignore
                [
                    'key'     => '_dokan_vendor_id',
                    'value'   => $vendor_id,
                    'compare' => '=',
                ],
            ],
        ];
        $query = new WP_query( $args );

        // Deleting vendors orders.
        foreach ( $query->posts as $order ) {
            wc_get_order( $order )->delete( true );
        }

        global $wpdb;

        // Deleting orders from dokan orders table.
        $wpdb->delete(
            $wpdb->prefix . 'dokan_orders',
            [ 'seller_id' => $vendor_id ],
            [ '%d' ]
        );

        // Deleting orders from dokan vendors balance table.
        $wpdb->delete(
            $wpdb->prefix . 'dokan_vendor_balance',
            [ 'vendor_id' => $vendor_id ],
            [ '%d' ]
        );

        // Deleting orders from dokan withdraw table.
        $wpdb->delete(
            $wpdb->prefix . 'dokan_withdraw',
            [ 'user_id' => $vendor_id ],
            [ '%d' ]
        );
    }
}
