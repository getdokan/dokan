<?php

namespace WeDevs\Dokan\Product;

use WC_Product;
use WC_Product_Download;
use WeDevs\Dokan\Cache;
use WP_Query;
use WP_Error;

/**
 * Product manager Class
 *
 * @since 3.0.0
 */
class Manager {

    /**
     * Get all Product for a vendor
     *
     * @since 1.0.0
     *
     * @return \WP_Post[]
     */
    public function all( $args = [] ) {
        $post_statuses = apply_filters( 'dokan_get_product_status', [ 'publish', 'draft', 'pending', 'future' ] );

        $defaults = [
            'post_type'      => 'product',
            'post_status'    => $post_statuses,
            'posts_per_page' => - 1,
            'orderby'        => 'post_date ID',
            'order'          => 'DESC',
            'paged'          => 1,
        ];

        $args = wp_parse_args( $args, $defaults );
        $args = apply_filters( 'dokan_all_products_query', $args );
        // get cache group and key
        $cache_group = ! empty( $args['author'] ) ? "seller_product_data_{$args['author']}" : 'product_data';
        $cache_key   = 'product_manager_all_' . md5( wp_json_encode( $args ) );

        $products = Cache::get( $cache_key, $cache_group );

        if ( false === $products ) {
            $products = new WP_Query( $args );

            Cache::set( $cache_key, $products, $cache_group );
        }

        return $products;
    }

    /**
     * Get single product
     *
     * @since 3.0.0
     *
     * @return WC_Product|null|false
     */
    public function get( $product_id ) {
        return wc_get_product( $product_id );
    }

    /**
     * Save Product
     *
     * @since 3.0.0
     *
     * @throws \WC_Data_Exception
     * @return WC_Product|null|false
     */
    public function create( $args = [] ) {
        $id = isset( $args['id'] ) ? absint( $args['id'] ) : 0;

        // Type is the most important part here because we need to be using the correct class and methods.
        if ( isset( $args['type'] ) ) {
            $classname = \WC_Product_Factory::get_classname_from_product_type( $args['type'] );

            if ( ! class_exists( $classname ) ) {
                $classname = 'WC_Product_Simple';
            }

            $product = new $classname( $id );
        } elseif ( isset( $args['id'] ) ) {
            $product = wc_get_product( $id );
        } else {
            $product = new \WC_Product_Simple();
        }

        // Post title.
        if ( isset( $args['name'] ) ) {
            $product->set_name( wp_filter_post_kses( $args['name'] ) );
        }

        // Post content.
        if ( isset( $args['description'] ) ) {
            $product->set_description( wp_filter_post_kses( $args['description'] ) );
        }

        // Post excerpt.
        if ( isset( $args['short_description'] ) ) {
            $product->set_short_description( wp_filter_post_kses( $args['short_description'] ) );
        }

        // Post status.
        if ( isset( $args['status'] ) ) {
            $product->set_status( get_post_status_object( $args['status'] ) ? $args['status'] : 'draft' );
        }

        // Post slug.
        if ( isset( $args['slug'] ) ) {
            $product->set_slug( $args['slug'] );
        }

        // Menu order.
        if ( isset( $args['menu_order'] ) ) {
            $product->set_menu_order( $args['menu_order'] );
        }

        // Comment status.
        if ( isset( $args['reviews_allowed'] ) ) {
            $product->set_reviews_allowed( $args['reviews_allowed'] );
        }

        // Virtual.
        if ( isset( $args['virtual'] ) ) {
            $product->set_virtual( $args['virtual'] );
        }

        // Tax status.
        if ( isset( $args['tax_status'] ) ) {
            $product->set_tax_status( $args['tax_status'] );
        }

        // Tax Class.
        if ( isset( $args['tax_class'] ) ) {
            $product->set_tax_class( $args['tax_class'] );
        }

        // Catalog Visibility.
        if ( isset( $args['catalog_visibility'] ) ) {
            $product->set_catalog_visibility( $args['catalog_visibility'] );
        }

        // Purchase Note.
        if ( isset( $args['purchase_note'] ) ) {
            $product->set_purchase_note( wp_kses_post( wp_unslash( $args['purchase_note'] ) ) );
        }

        // Featured Product.
        if ( isset( $args['featured'] ) ) {
            $product->set_featured( $args['featured'] );
        }

        // Shipping data.
        $product = $this->save_product_shipping_data( $product, $args );

        // SKU.
        if ( isset( $args['sku'] ) ) {
            $product->set_sku( wc_clean( $args['sku'] ) );
        }

        // Attributes.
        if ( isset( $args['attributes'] ) ) {
            $product->set_attributes( $args['attributes'] );
        }

        // Sales and prices.
        if ( in_array( $product->get_type(), [ 'variable', 'grouped' ], true ) ) {
            $product->set_regular_price( '' );
            $product->set_sale_price( '' );
            $product->set_date_on_sale_to( '' );
            $product->set_date_on_sale_from( '' );
            $product->set_price( '' );
        } else {
            // Regular Price.
            if ( isset( $args['regular_price'] ) ) {
                $product->set_regular_price( $args['regular_price'] );
            }

            // Sale Price.
            if ( isset( $args['sale_price'] ) ) {
                $product->set_sale_price( $args['sale_price'] );
            }

            if ( isset( $args['date_on_sale_from'] ) ) {
                $product->set_date_on_sale_from( $args['date_on_sale_from'] );
            }

            if ( isset( $args['date_on_sale_from_gmt'] ) ) {
                $product->set_date_on_sale_from( $args['date_on_sale_from_gmt'] ? strtotime( $args['date_on_sale_from_gmt'] ) : null );
            }

            if ( isset( $args['date_on_sale_to'] ) ) {
                $product->set_date_on_sale_to( $args['date_on_sale_to'] );
            }

            if ( isset( $args['date_on_sale_to_gmt'] ) ) {
                $product->set_date_on_sale_to( $args['date_on_sale_to_gmt'] ? strtotime( $args['date_on_sale_to_gmt'] ) : null );
            }
        }

        // Product parent ID.
        if ( isset( $args['parent_id'] ) ) {
            $product->set_parent_id( $args['parent_id'] );
        }

        // Sold individually.
        if ( isset( $args['sold_individually'] ) ) {
            $product->set_sold_individually( $args['sold_individually'] );
        }

        // Stock status; stock_status has priority over in_stock.
        if ( isset( $args['stock_status'] ) ) {
            $stock_status = $args['stock_status'];
        } else {
            $stock_status = $product->get_stock_status();
        }

        // Stock data.
        if ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) {
            // Manage stock.
            if ( isset( $args['manage_stock'] ) ) {
                $product->set_manage_stock( $args['manage_stock'] );
            }

            // Backorders.
            if ( isset( $args['backorders'] ) ) {
                $product->set_backorders( $args['backorders'] );
            }

            if ( $product->is_type( 'grouped' ) ) {
                $product->set_manage_stock( 'no' );
                $product->set_backorders( 'no' );
                $product->set_stock_quantity( '' );
                $product->set_stock_status( $stock_status );
            } elseif ( $product->is_type( 'external' ) ) {
                $product->set_manage_stock( 'no' );
                $product->set_backorders( 'no' );
                $product->set_stock_quantity( '' );
                $product->set_stock_status( 'instock' );
            } elseif ( $product->get_manage_stock() ) {
                // Stock status is always determined by children so sync later.
                if ( ! $product->is_type( 'variable' ) ) {
                    $product->set_stock_status( $stock_status );
                }

                // Stock quantity.
                if ( isset( $args['stock_quantity'] ) ) {
                    $product->set_stock_quantity( wc_stock_amount( $args['stock_quantity'] ) );
                } elseif ( isset( $args['inventory_delta'] ) ) {
                    $stock_quantity = wc_stock_amount( $product->get_stock_quantity() );
                    $stock_quantity += wc_stock_amount( $args['inventory_delta'] );
                    $product->set_stock_quantity( wc_stock_amount( $stock_quantity ) );
                }
            } else {
                // Don't manage stock.
                $product->set_manage_stock( 'no' );
                $product->set_stock_quantity( '' );
                $product->set_stock_status( $stock_status );
            }
        } elseif ( ! $product->is_type( 'variable' ) ) {
            $product->set_stock_status( $stock_status );
        }

        // sync stock status
        $product = $this->maybe_update_stock_status( $product, $stock_status );

        // Upsells.
        if ( isset( $args['upsell_ids'] ) ) {
            $upsells = [];
            $ids     = $args['upsell_ids'];

            if ( ! empty( $ids ) ) {
                foreach ( $ids as $id ) {
                    if ( $id && $id > 0 ) {
                        $upsells[] = $id;
                    }
                }
            }

            $product->set_upsell_ids( $upsells );
        }

        // Cross sells.
        if ( isset( $args['cross_sell_ids'] ) ) {
            $crosssells = [];
            $ids        = $args['cross_sell_ids'];

            if ( ! empty( $ids ) ) {
                foreach ( $ids as $id ) {
                    if ( $id && $id > 0 ) {
                        $crosssells[] = $id;
                    }
                }
            }

            $product->set_cross_sell_ids( $crosssells );
        }

        // Product categories.
        if ( isset( $args['categories'] ) && is_array( $args['categories'] ) ) {
            $product = $this->save_taxonomy_terms( $product, $args['categories'] );
        }

        // Product tags.
        if ( isset( $args['tags'] ) && is_array( $args['tags'] ) ) {
            $product = $this->save_taxonomy_terms( $product, $args['tags'], 'tag' );
        }

        // Downloadable.
        if ( isset( $args['downloadable'] ) ) {
            $product->set_downloadable( $args['downloadable'] );
        }

        // Downloadable options.
        if ( $product->get_downloadable() ) {

            // Downloadable files.
            if ( isset( $args['downloads'] ) && is_array( $args['downloads'] ) ) {
                $product = $this->save_downloadable_files( $product, $args['downloads'] );
            }

            // Download limit.
            if ( isset( $args['download_limit'] ) ) {
                $product->set_download_limit( $args['download_limit'] );
            }

            // Download expiry.
            if ( isset( $args['download_expiry'] ) ) {
                $product->set_download_expiry( $args['download_expiry'] );
            }
        }

        // Product url and button text for external products.
        if ( $product->is_type( 'external' ) ) {
            if ( isset( $args['external_url'] ) ) {
                $product->set_product_url( $args['external_url'] );
            }

            if ( isset( $args['button_text'] ) ) {
                $product->set_button_text( $args['button_text'] );
            }
        }

        // Save default attributes for variable products.
        if ( $product->is_type( 'variable' ) ) {
            $product = $this->save_default_attributes( $product, $args );
        }

        // Set children for a grouped product.
        if ( $product->is_type( 'grouped' ) && isset( $args['grouped_products'] ) ) {
            $product->set_children( $args['grouped_products'] );
        }

        // Set featured image id
        if ( ! empty( $args['featured_image_id'] ) ) {
            $product->set_image_id( $args['featured_image_id'] );
        }

        // Set gallery image ids
        if ( ! empty( $args['gallery_image_ids'] ) ) {
            $product->set_gallery_image_ids( $args['gallery_image_ids'] );
        }

        // Allow set meta_data.
        if ( ! empty( $args['meta_data'] ) && is_array( $args['meta_data'] ) ) {
            foreach ( $args['meta_data'] as $meta ) {
                $product->update_meta_data( $meta['key'], $meta['value'], isset( $meta['id'] ) ? $meta['id'] : '' );
            }
        }

        if ( ! empty( $args['date_created'] ) ) {
            $date = rest_parse_date( $args['date_created'] );

            if ( $date ) {
                $product->set_date_created( $date );
            }
        }

        if ( ! empty( $args['date_created_gmt'] ) ) {
            $date = rest_parse_date( $args['date_created_gmt'], true );

            if ( $date ) {
                $product->set_date_created( $date );
            }
        }

        // Set total sales for newly created product
        if ( ! empty( $id ) ) {
            $product->set_total_sales( 0 );
        }

        $product_id = $product->save();

        return wc_get_product( $product_id );
    }

    /**
     * Save default attributes.
     *
     * @since 3.0.0
     *
     * @param WC_Product      $product Product instance.
     * @param \WP_REST_Request $request Request data.
     *
     * @return WC_Product
     */
    public function save_default_attributes( $product, $request ) {
        if ( isset( $request['default_attributes'] ) && is_array( $request['default_attributes'] ) ) {
            $attributes         = $product->get_attributes();
            $default_attributes = [];

            foreach ( $request['default_attributes'] as $attribute ) {
                $attribute_id   = 0;
                $attribute_name = '';

                // Check ID for global attributes or name for product attributes.
                if ( ! empty( $attribute['id'] ) ) {
                    $attribute_id   = absint( $attribute['id'] );
                    $attribute_name = wc_attribute_taxonomy_name_by_id( $attribute_id );
                } elseif ( ! empty( $attribute['name'] ) ) {
                    $attribute_name = sanitize_title( $attribute['name'] );
                }

                if ( ! $attribute_id && ! $attribute_name ) {
                    continue;
                }

                if ( isset( $attributes[ $attribute_name ] ) ) {
                    $_attribute = $attributes[ $attribute_name ];

                    if ( $_attribute['is_variation'] ) {
                        $value = isset( $attribute['option'] ) ? wc_clean( stripslashes( $attribute['option'] ) ) : '';

                        if ( ! empty( $_attribute['is_taxonomy'] ) ) {
                            // If dealing with a taxonomy, we need to get the slug from the name posted to the API.
                            $term = get_term_by( 'name', $value, $attribute_name );

                            if ( $term && ! is_wp_error( $term ) ) {
                                $value = $term->slug;
                            } else {
                                $value = sanitize_title( $value );
                            }
                        }

                        if ( $value ) {
                            $default_attributes[ $attribute_name ] = $value;
                        }
                    }
                }
            }

            $product->set_default_attributes( $default_attributes );
        }

        return $product;
    }

    /**
     * Update product data
     *
     * @since 3.0.0
     *
     * @return WC_Product|WP_Error|false
     */
    public function update( $args = [] ) {
        $id = isset( $args['id'] ) ? absint( $args['id'] ) : 0;

        if ( empty( $id ) ) {
            return new WP_Error( 'no-id-found', __( 'No product ID found for updating', 'dokan-lite' ), [ 'status' => 401 ] );
        }

        return $this->create( $args );
    }

    /**
     * Delete product data
     *
     * @since 3.0.0
     *
     * @return WC_Product|null|false
     */
    public function delete( $product_id, $force = false ) {
        $product = $this->get( $product_id );
        if ( $product ) {
            $product->delete( [ 'force_delete' => $force ] );
        }

        return $product;
    }

    /**
     * Save product shipping data.
     *
     * @param WC_Product $product Product instance.
     * @param array      $data    Shipping data.
     *
     * @return WC_Product
     */
    protected function save_product_shipping_data( $product, $data ) {
        // Virtual.
        if ( isset( $data['virtual'] ) && true === $data['virtual'] ) {
            $product->set_weight( '' );
            $product->set_height( '' );
            $product->set_length( '' );
            $product->set_width( '' );
        } else {
            if ( isset( $data['weight'] ) ) {
                $product->set_weight( $data['weight'] );
            }

            // Height.
            if ( isset( $data['dimensions']['height'] ) ) {
                $product->set_height( $data['dimensions']['height'] );
            }

            // Width.
            if ( isset( $data['dimensions']['width'] ) ) {
                $product->set_width( $data['dimensions']['width'] );
            }

            // Length.
            if ( isset( $data['dimensions']['length'] ) ) {
                $product->set_length( $data['dimensions']['length'] );
            }
        }

        // Shipping class.
        if ( isset( $data['shipping_class'] ) ) {
            $data_store        = $product->get_data_store();
            $shipping_class_id = $data_store->get_shipping_class_id_by_slug( wc_clean( $data['shipping_class'] ) );
            $product->set_shipping_class_id( $shipping_class_id );
        }

        return $product;
    }

    /**
     * Save taxonomy terms.
     *
     * @param WC_Product $product  Product instance.
     * @param array      $terms    Terms data.
     * @param string     $taxonomy Taxonomy name.
     *
     * @return WC_Product
     */
    protected function save_taxonomy_terms( $product, $terms, $taxonomy = 'cat' ) {
        if ( 'cat' === $taxonomy ) {
            $product->set_category_ids( $terms );
        } elseif ( 'tag' === $taxonomy ) {
            $product->set_tag_ids( $terms );
        }

        return $product;
    }

    /**
     * Save downloadable files.
     *
     * @param WC_Product $product    Product instance.
     * @param array      $downloads  Downloads data.
     *
     * @return WC_Product
     */
    protected function save_downloadable_files( $product, $downloads ) {
        $files = [];
        foreach ( $downloads as $key => $file ) {
            if ( empty( $file['file'] ) ) {
                continue;
            }

            $download = new WC_Product_Download();
            $download->set_id( $key );
            $download->set_name( $file['name'] ? $file['name'] : wc_get_filename_from_url( $file['file'] ) );
            $download->set_file( apply_filters( 'woocommerce_file_download_path', $file['file'], $product, $key ) );
            $files[] = $download;
        }
        $product->set_downloads( $files );

        return $product;
    }

    /**
     * Sync stock stats for variable products.
     *
     * @since 3.4.0
     *
     * @param WC_Product $product
     * @param string     $stock_status
     *
     * @return mixed
     */
    protected function maybe_update_stock_status( $product, $stock_status ) {
        if ( $product->is_type( 'external' ) ) {
            // External products are always in stock.
            $product->set_stock_status( 'instock' );
        } elseif ( isset( $stock_status ) ) {
            if ( $product->is_type( 'variable' ) && ! $product->get_manage_stock() ) {
                // Stock status is determined by children.
                foreach ( $product->get_children() as $child_id ) {
                    $child = wc_get_product( $child_id );
                    if ( ! $product->get_manage_stock() ) {
                        $child->set_stock_status( $stock_status );
                        $child->save();
                    }
                }
                $product = \WC_Product_Variable::sync( $product, false );
            } else {
                $product->set_stock_status( $stock_status );
            }
        }

        return $product;
    }

    /**
     * Get featured products
     *
     * @since 1.0.0
     *
     * @param array $args
     *
     * @return \WP_Post[]
     */
    public function featured( $args = [] ) {
        $product_visibility_term_ids = wc_get_product_visibility_term_ids();

        $args['tax_query'][] = [
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        ];

        $args['tax_query'][] = [
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => $product_visibility_term_ids['featured'],
        ];

        return $this->all( apply_filters( 'dokan_featured_products_query', $args ) );
    }

    /**
     * Get latest product
     *
     * @since 1.0.0
     *
     * @param array $args
     *
     * @return \WP_Post[]
     */
    public function latest( $args = [] ) {
        $product_visibility_term_ids = wc_get_product_visibility_term_ids();

        $args['tax_query'][] = [ // phpcs:ignore
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        ];

        return $this->all( apply_filters( 'dokan_latest_products_query', $args ) );
    }

    /**
     * Best Selling Products
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return \WP_Post[]
     */
    public function best_selling( $args = [] ) {
        $args['meta_key'] = 'total_sales'; // phpcs:ignore
        $args['orderby']  = 'meta_value_num';

        $product_visibility_term_ids = wc_get_product_visibility_term_ids();
        $args['tax_query'][]           = [ // phpcs:ignore
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        ];

        return $this->all( apply_filters( 'dokan_best_selling_products_query', $args ) );
    }

    /**
     * Top-rated product
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return \WP_Post[]
     */
    public function top_rated( $args = [] ) {
        $product_visibility_term_ids = wc_get_product_visibility_term_ids();

        $args['tax_query'][] = [ // phpcs:ignore
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        ];

        add_filter( 'posts_clauses', [ 'WC_Shortcodes', 'order_by_rating_post_clauses' ] );
        $products = $this->all( apply_filters( 'dokan_top_rated_products_query', $args ) );
        remove_filter( 'posts_clauses', [ 'WC_Shortcodes', 'order_by_rating_post_clauses' ] );

        return $products;
    }
}
