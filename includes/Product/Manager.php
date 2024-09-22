<?php

namespace WeDevs\Dokan\Product;

use WC_Product;
use WC_Product_Attribute;
use WC_Product_Download;
use WeDevs\Dokan\Cache;
use WP_Query;
use WP_Error;
use WeDevs\Dokan\ProductForm\Elements as FormElements;

defined( 'ABSPATH' ) || exit;

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
            'posts_per_page' => -1,
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
        $product_id = isset( $args[ FormElements::ID ] ) ? absint( $args[ FormElements::ID ] ) : 0;
        $is_update  = ! empty( $product_id );

        // Type is the most important part here because we need to be using the correct class and methods.
        if ( isset( $args[ FormElements::TYPE ] ) ) {
            $classname = \WC_Product_Factory::get_classname_from_product_type( $args[ FormElements::TYPE ] );

            if ( ! class_exists( $classname ) ) {
                $classname = 'WC_Product_Simple';
            }

            $product = new $classname( $product_id );
        } elseif ( isset( $args[ FormElements::ID ] ) ) {
            $product = wc_get_product( $product_id );
        } else {
            $product = new \WC_Product_Simple();
        }

        // Post title.
        if ( isset( $args[ FormElements::NAME ] ) ) {
            $product->set_name( wp_filter_post_kses( $args[ FormElements::NAME ] ) );
        }

        // Post content.
        if ( isset( $args[ FormElements::DESCRIPTION ] ) ) {
            $product->set_description( wp_filter_post_kses( $args[ FormElements::DESCRIPTION ] ) );
        }

        // Post excerpt.
        if ( isset( $args[ FormElements::SHORT_DESCRIPTION ] ) ) {
            $product->set_short_description( wp_filter_post_kses( $args[ FormElements::SHORT_DESCRIPTION ] ) );
        }

        // Post status.
        if ( isset( $args[ FormElements::STATUS ] ) ) {
            $product->set_status( get_post_status_object( $args[ FormElements::STATUS ] ) ? $args[ FormElements::STATUS ] : 'draft' );
        }

        // Post slug.
        if ( isset( $args[ FormElements::SLUG ] ) ) {
            $product->set_slug( $args[ FormElements::SLUG ] );
        }

        // Menu order.
        if ( isset( $args[ FormElements::MENU_ORDER ] ) ) {
            $product->set_menu_order( $args[ FormElements::MENU_ORDER ] );
        }

        // Comment status.
        if ( isset( $args[ FormElements::REVIEWS_ALLOWED ] ) ) {
            $product->set_reviews_allowed( $args[ FormElements::REVIEWS_ALLOWED ] );
        }

        // Virtual.
        if ( isset( $args[ FormElements::VIRTUAL ] ) ) {
            $product->set_virtual( $args[ FormElements::VIRTUAL ] );
        }

        // Tax status.
        if ( isset( $args[ FormElements::TAX_STATUS ] ) ) {
            $product->set_tax_status( $args[ FormElements::TAX_STATUS ] );
        }

        // Tax Class.
        if ( isset( $args[ FormElements::TAX_CLASS ] ) ) {
            $product->set_tax_class( $args[ FormElements::TAX_CLASS ] );
        }

        // Catalog Visibility.
        if ( isset( $args[ FormElements::CATALOG_VISIBILITY ] ) ) {
            $product->set_catalog_visibility( $args[ FormElements::CATALOG_VISIBILITY ] );
        }

        // Purchase Note.
        if ( isset( $args[ FormElements::PURCHASE_NOTE ] ) ) {
            $product->set_purchase_note( wp_kses_post( wp_unslash( $args[ FormElements::PURCHASE_NOTE ] ) ) );
        }

        // Featured Product.
        if ( isset( $args[ FormElements::FEATURED ] ) ) {
            $product->set_featured( $args[ FormElements::FEATURED ] );
        }

        // Shipping data.
        $product = $this->save_product_shipping_data( $product, $args );

        // SKU.
        if ( isset( $args[ FormElements::SKU ] ) ) {
            $product->set_sku( wc_clean( $args[ FormElements::SKU ] ) );
        }

        // Attributes.
        $product = $this->save_product_attribute_data( $product, $args );

        // Sales and prices.
        if ( in_array( $product->get_type(), [ 'variable', 'grouped' ], true ) ) {
            $product->set_regular_price( '' );
            $product->set_sale_price( '' );
            $product->set_date_on_sale_to( '' );
            $product->set_date_on_sale_from( '' );
            $product->set_price( '' );
        } else {
            // Regular Price.
            if ( isset( $args[ FormElements::REGULAR_PRICE ] ) ) {
                $product->set_regular_price( $args[ FormElements::REGULAR_PRICE ] );
            }

            // Sale Price.
            if ( isset( $args[ FormElements::SALE_PRICE ] ) ) {
                $product->set_sale_price( $args[ FormElements::SALE_PRICE ] );
            }

            if ( isset( $args[ FormElements::DATE_ON_SALE_FROM ] ) ) {
                $product->set_date_on_sale_from( $args[ FormElements::DATE_ON_SALE_FROM ] );
            }

            if ( isset( $args[ FormElements::DATE_ON_SALE_FROM_GMT ] ) ) {
                $product->set_date_on_sale_from( $args[ FormElements::DATE_ON_SALE_FROM_GMT ] ? strtotime( $args[ FormElements::DATE_ON_SALE_FROM_GMT ] ) : null );
            }

            if ( isset( $args[ FormElements::DATE_ON_SALE_TO ] ) ) {
                $product->set_date_on_sale_to( $args[ FormElements::DATE_ON_SALE_TO ] );
            }

            if ( isset( $args[ FormElements::DATE_ON_SALE_TO_GMT ] ) ) {
                $product->set_date_on_sale_to( $args[ FormElements::DATE_ON_SALE_TO_GMT ] ? strtotime( $args[ FormElements::DATE_ON_SALE_TO_GMT ] ) : null );
            }
        }

        // Product parent ID.
        if ( isset( $args[ FormElements::PARENT_ID ] ) ) {
            $product->set_parent_id( $args[ FormElements::PARENT_ID ] );
        }

        // Sold individually.
        if ( isset( $args[ FormElements::SOLD_INDIVIDUALLY ] ) ) {
            $product->set_sold_individually( $args[ FormElements::SOLD_INDIVIDUALLY ] );
        }

        // Stock status; stock_status has priority over in_stock.
        if ( isset( $args[ FormElements::STOCK_STATUS ] ) ) {
            $stock_status = $args[ FormElements::STOCK_STATUS ];
        } else {
            $stock_status = $product->get_stock_status();
        }

        // Stock data.
        if ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) {
            // Manage stock.
            if ( isset( $args[ FormElements::MANAGE_STOCK ] ) ) {
                $product->set_manage_stock( $args[ FormElements::MANAGE_STOCK ] );
            }

            if ( isset( $args[ FormElements::LOW_STOCK_AMOUNT ] ) ) {
                $product->set_low_stock_amount( $args[ FormElements::LOW_STOCK_AMOUNT ] );
            }

            // Backorders.
            if ( isset( $args[ FormElements::BACKORDERS ] ) ) {
                $product->set_backorders( $args[ FormElements::BACKORDERS ] );
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
                if ( isset( $args[ FormElements::STOCK_QUANTITY ] ) ) {
                    $product->set_stock_quantity( wc_stock_amount( $args[ FormElements::STOCK_QUANTITY ] ) );
                } elseif ( isset( $args[ FormElements::INVENTORY_DELTA ] ) ) {
                    $stock_quantity = wc_stock_amount( $product->get_stock_quantity() );
                    $stock_quantity += wc_stock_amount( $args[ FormElements::INVENTORY_DELTA ] );
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
        if ( isset( $args[ FormElements::UPSELL_IDS ] ) ) {
            $upsells = [];
            $ids     = $args[ FormElements::UPSELL_IDS ];

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
        if ( isset( $args[ FormElements::CROSS_SELL_IDS ] ) ) {
            $crosssells = [];
            $ids        = $args[ FormElements::CROSS_SELL_IDS ];

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
        if ( isset( $args[ FormElements::CATEGORIES ] ) && is_array( $args[ FormElements::CATEGORIES ] ) ) {
            $product = $this->save_taxonomy_terms( $product, $args[ FormElements::CATEGORIES ] );
        }

        // Product tags.
        if ( isset( $args[ FormElements::TAGS ] ) && is_array( $args[ FormElements::TAGS ] ) ) {
            $product = $this->save_taxonomy_terms( $product, $args[ FormElements::TAGS ], 'tag' );
        }

        // Downloadable.
        if ( isset( $args[ FormElements::DOWNLOADABLE ] ) ) {
            $product->set_downloadable( $args[ FormElements::DOWNLOADABLE ] );
        }

        // Downloadable options.
        if ( $product->get_downloadable() ) {

            // Downloadable files.
            if ( isset( $args[ FormElements::DOWNLOADS ] ) && is_array( $args[ FormElements::DOWNLOADS ] ) ) {
                $product = $this->save_downloadable_files( $product, $args[ FormElements::DOWNLOADS ] );
            }

            // Download limit.
            if ( isset( $args[ FormElements::DOWNLOAD_LIMIT ] ) ) {
                $product->set_download_limit( $args[ FormElements::DOWNLOAD_LIMIT ] );
            }

            // Download expiry.
            if ( isset( $args[ FormElements::DOWNLOAD_EXPIRY ] ) ) {
                $product->set_download_expiry( $args[ FormElements::DOWNLOAD_EXPIRY ] );
            }
        }

        // Product url and button text for external products.
        if ( $product->is_type( 'external' ) ) {
            if ( isset( $args[ FormElements::EXTERNAL_URL ] ) ) {
                $product->set_product_url( $args[ FormElements::EXTERNAL_URL ] );
            }

            if ( isset( $args[ FormElements::BUTTON_TEXT ] ) ) {
                $product->set_button_text( $args[ FormElements::BUTTON_TEXT ] );
            }
        }

        // Save default attributes for variable products.
        if ( $product->is_type( 'variable' ) ) {
            $product = $this->save_default_attributes( $product, $args );
        }

        // Set children for a grouped product.
        if ( $product->is_type( 'grouped' ) && isset( $args[ FormElements::GROUP_PRODUCTS ] ) ) {
            $product->set_children( $args[ FormElements::GROUP_PRODUCTS ] );
        }

        // Set featured image id
        if ( ! empty( $args[ FormElements::FEATURED_IMAGE_ID ] ) ) {
            $product->set_image_id( $args[ FormElements::FEATURED_IMAGE_ID ] );
        }

        // Set gallery image ids
        if ( ! empty( $args[ FormElements::GALLERY_IMAGE_IDS ] ) ) {
            $product->set_gallery_image_ids( $args[ FormElements::GALLERY_IMAGE_IDS ] );
        }

        // Allow set meta_data.
        if ( ! empty( $args[ FormElements::META_DATA ] ) && is_array( $args[ FormElements::META_DATA ] ) ) {
            foreach ( $args[ FormElements::META_DATA ] as $meta ) {
                $product->update_meta_data( $meta['key'], $meta['value'], isset( $meta['id'] ) ? $meta['id'] : '' );
            }
        }

        // Set total sales for newly created product
        if ( ! $is_update ) {
            // Set date created.
            if ( ! empty( $args[ FormElements::DATE_CREATED ] ) ) {
                $date = rest_parse_date( $args[ FormElements::DATE_CREATED ] );

                if ( $date ) {
                    $product->set_date_created( $date );
                }
            }

            // set date created gmt
            if ( ! empty( $args[ FormElements::DATE_CREATED_GMT ] ) ) {
                $date = rest_parse_date( $args[ FormElements::DATE_CREATED_GMT ], true );

                if ( $date ) {
                    $product->set_date_created( $date );
                }
            }

            // Set total sales to zero
            $product->set_total_sales( 0 );
        }

        $product_id = $product->save();

        //call dokan hooks
        if ( ! $is_update ) {
            do_action( 'dokan_new_product_added', $product_id, [] );
        } else {
            do_action( 'dokan_product_updated', $product_id, [] );
        }

        return $this->get( $product_id );
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
     * @return bool
     */
    public function delete( $product_id, $force = false ) {
        $product = $this->get( $product_id );

        if ( ! $product ) {
            return false;
        }

        return $product->delete( [ 'force_delete' => $force ] );
    }

    /**
     * Save default attributes.
     *
     * @since 3.0.0
     *
     * @param WC_Product       $product Product instance.
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
     * Save product shipping data.
     *
     * @param WC_Product $product Product instance.
     * @param array      $data    Shipping data.
     *
     * @return WC_Product
     */
    protected function save_product_shipping_data( $product, $data ) {
        // Virtual.
        if ( isset( $data[ FormElements::VIRTUAL ] ) && true === $data[ FormElements::VIRTUAL ] ) {
            $product->set_weight( '' );
            $product->set_height( '' );
            $product->set_length( '' );
            $product->set_width( '' );
        } else {
            if ( isset( $data[ FormElements::WEIGHT ] ) ) {
                $product->set_weight( $data[ FormElements::WEIGHT ] );
            }

            // Height.
            if ( isset( $data[ FormElements::DIMENSIONS ][ FormElements::DIMENSIONS_HEIGHT ] ) ) {
                $product->set_height( $data[ FormElements::DIMENSIONS ][ FormElements::DIMENSIONS_HEIGHT ] );
            }

            // Width.
            if ( isset( $data[ FormElements::DIMENSIONS ][ FormElements::DIMENSIONS_WIDTH ] ) ) {
                $product->set_width( $data[ FormElements::DIMENSIONS ][ FormElements::DIMENSIONS_WIDTH ] );
            }

            // Length.
            if ( isset( $data[ FormElements::DIMENSIONS ][ FormElements::DIMENSIONS_LENGTH ] ) ) {
                $product->set_length( $data[ FormElements::DIMENSIONS ][ FormElements::DIMENSIONS_LENGTH ] );
            }
        }

        // Shipping class.
        if ( isset( $data[ FormElements::SHIPPING_CLASS ] ) ) {
            $data_store        = $product->get_data_store();
            $shipping_class_id = $data_store->get_shipping_class_id_by_slug( wc_clean( $data[ FormElements::SHIPPING_CLASS ] ) );
            $product->set_shipping_class_id( $shipping_class_id );
        }

        return $product;
    }

    /**
     * Save product attribute data.
     *
     * @param WC_Product $product Product instance.
     * @param array      $args    Product data's.
     *
     * @return WC_Product
     */
    protected function save_product_attribute_data( $product, $args ) {
        if ( isset( $args[ FormElements::ATTRIBUTES ] ) ) {
            $attributes = [];

            foreach ( $args[ FormElements::ATTRIBUTES ] as $attribute ) {
                $attribute_id   = 0;
                $attribute_name = '';

                // Check ID for global attributes or name for product attributes.
                if ( ! empty( $attribute[ FormElements::ATTRIBUTES_ID ] ) ) {
                    $attribute_id   = absint( $attribute[ FormElements::ATTRIBUTES_ID ] );
                    $attribute_name = wc_attribute_taxonomy_name_by_id( $attribute_id );
                } elseif ( ! empty( $attribute[ FormElements::ATTRIBUTES_NAME ] ) ) {
                    $attribute_name = wc_clean( $attribute[ FormElements::ATTRIBUTES_NAME ] );
                }

                if ( ! $attribute_id && ! $attribute_name ) {
                    continue;
                }

                if ( $attribute_id ) {

                    if ( isset( $attribute[ FormElements::ATTRIBUTES_OPTIONS ] ) ) {
                        $options = $attribute[ FormElements::ATTRIBUTES_OPTIONS ];

                        if ( ! is_array( $attribute[ FormElements::ATTRIBUTES_OPTIONS ] ) ) {
                            // Text based attributes - Posted values are term names.
                            $options = explode( WC_DELIMITER, $options );
                        }

                        $values = array_map( 'wc_sanitize_term_text_based', $options );
                        $values = array_filter( $values, 'strlen' );
                    } else {
                        $values = [];
                    }

                    if ( ! empty( $values ) ) {
                        // Add attribute to array, but don't set values.
                        $attribute_object = new WC_Product_Attribute();
                        $attribute_object->set_id( $attribute_id );
                        $attribute_object->set_name( $attribute_name );
                        $attribute_object->set_options( $values );
                        $attribute_object->set_position( isset( $attribute[ FormElements::ATTRIBUTES_POSITION ] ) ? (string) absint( $attribute[ FormElements::ATTRIBUTES_POSITION ] ) : '0' );
                        $attribute_object->set_visible( ( isset( $attribute[ FormElements::ATTRIBUTES_VISIBLE ] ) && $attribute[ FormElements::ATTRIBUTES_VISIBLE ] ) ? 1 : 0 );
                        $attribute_object->set_variation( ( isset( $attribute[ FormElements::ATTRIBUTES_VARIATION ] ) && $attribute[ FormElements::ATTRIBUTES_VARIATION ] ) ? 1 : 0 );
                        $attributes[] = $attribute_object;
                    }
                } elseif ( isset( $attribute[ FormElements::ATTRIBUTES_OPTIONS ] ) ) {
                    // Custom attribute - Add attribute to array and set the values.
                    if ( is_array( $attribute[ FormElements::ATTRIBUTES_OPTIONS ] ) ) {
                        $values = $attribute[ FormElements::ATTRIBUTES_OPTIONS ];
                    } else {
                        $values = explode( WC_DELIMITER, $attribute[ FormElements::ATTRIBUTES_OPTIONS ] );
                    }
                    $attribute_object = new WC_Product_Attribute();
                    $attribute_object->set_name( $attribute_name );
                    $attribute_object->set_options( $values );
                    $attribute_object->set_position( isset( $attribute[ FormElements::ATTRIBUTES_POSITION ] ) ? (string) absint( $attribute[ FormElements::ATTRIBUTES_POSITION ] ) : '0' );
                    $attribute_object->set_visible( ( isset( $attribute[ FormElements::ATTRIBUTES_VISIBLE ] ) && $attribute[ FormElements::ATTRIBUTES_VISIBLE ] ) ? 1 : 0 );
                    $attribute_object->set_variation( ( isset( $attribute[ FormElements::ATTRIBUTES_VARIATION ] ) && $attribute[ FormElements::ATTRIBUTES_VARIATION ] ) ? 1 : 0 );
                    $attributes[] = $attribute_object;
                }
            }
            $product->set_attributes( $attributes );
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
        $term_ids = wp_list_pluck( $terms, 'id' );

        if ( 'cat' === $taxonomy ) {
            $product->set_category_ids( $term_ids );
        } elseif ( 'tag' === $taxonomy ) {
            $product->set_tag_ids( $term_ids );
        }

        return $product;
    }

    /**
     * Save downloadable files.
     *
     * @param WC_Product $product   Product instance.
     * @param array      $downloads Downloads data.
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
        if ( isset( $stock_status ) ) {
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
     * Prepare downloads for save.
     *
     * @since DOKAN_SINCE
     *
     * @param array $file_names  File names.
     * @param array $file_urls   File urls.
     * @param array $file_hashes File hashes.
     *
     * @return array
     */
    public function prepare_downloads( $file_names, $file_urls, $file_hashes ) {
        $downloads = [];

        if ( ! empty( $file_urls ) ) {
            $file_url_size = count( $file_urls );

            for ( $i = 0; $i < $file_url_size; $i++ ) {
                if ( ! empty( $file_urls[ $i ] ) ) {
                    $downloads[] = [
                        'name'        => wc_clean( $file_names[ $i ] ),
                        'file'        => wp_unslash( trim( $file_urls[ $i ] ) ),
                        'download_id' => wc_clean( $file_hashes[ $i ] ),
                    ];
                }
            }
        }

        return $downloads;
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
        $args['tax_query'][]         = [ // phpcs:ignore
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
