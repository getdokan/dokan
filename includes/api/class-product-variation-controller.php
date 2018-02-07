<?php

/**
* Product Variation controller
*
* @since 2.8.0
*
* @package dokan
*/
class Dokan_Product_Variation_Controller extends Dokan_Product_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'products/(?P<product_id>[\d]+)/variations';

    /**
     * Post type.
     *
     * @var string
     */
    protected $post_type = 'product_variation';

    /**
     * Load autometically when class initiate
     *
     * @since 2.8.0
     */
    public function __construct() {
        parent::__construct();
    }

    /**
     * Register the routes for products.
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, array(
            'args' => array(
                'product_id' => array(
                    'description' => __( 'Unique identifier for the variable product.', 'dokan' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_items' ),
                'permission_callback' => array( $this, 'get_product_permissions_check' ),
                'args'                => $this->get_collection_params(),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_item' ),
                'permission_callback' => array( $this, 'create_product_permissions_check' ),
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
            ),
            'schema' => array( $this, 'get_public_item_schema' ),
        ) );
        register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
            'args' => array(
                'product_id' => array(
                    'description' => __( 'Unique identifier for the variable product.', 'dokan' ),
                    'type'        => 'integer',
                ),
                'id' => array(
                    'description' => __( 'Unique identifier for the variation.', 'dokan' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_item' ),
                'permission_callback' => array( $this, 'get_single_product_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_item' ),
                'permission_callback' => array( $this, 'update_product_permissions_check' ),
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_item' ),
                'permission_callback' => array( $this, 'delete_product_permissions_check' ),
            ),

            'schema' => array( $this, 'get_public_item_schema' ),
        ) );
    }

    /**
     * Get object.
     *
     * @since  2.8.0
     * @param  int $id Object ID | Object.
     * @return WC_Data
     */
    public function get_object( $id ) {
        return wc_get_product( $id );
    }

    /**
     * Get product data.
     *
     * @param WC_Product $product Product instance.
     * @param string     $context Request context.
     *                            Options: 'view' and 'edit'.
     * @return array
     */
    protected function prepare_data_for_response( $object, $context = 'view' ) {
        $data = array(
            'id'                    => $object->get_id(),
            'date_created'          => wc_rest_prepare_date_response( $object->get_date_created(), false ),
            'date_created_gmt'      => wc_rest_prepare_date_response( $object->get_date_created() ),
            'date_modified'         => wc_rest_prepare_date_response( $object->get_date_modified(), false ),
            'date_modified_gmt'     => wc_rest_prepare_date_response( $object->get_date_modified() ),
            'description'           => wc_format_content( $object->get_description() ),
            'permalink'             => $object->get_permalink(),
            'sku'                   => $object->get_sku(),
            'price'                 => $object->get_price(),
            'regular_price'         => $object->get_regular_price(),
            'sale_price'            => $object->get_sale_price(),
            'date_on_sale_from'     => wc_rest_prepare_date_response( $object->get_date_on_sale_from(), false ),
            'date_on_sale_from_gmt' => wc_rest_prepare_date_response( $object->get_date_on_sale_from() ),
            'date_on_sale_to'       => wc_rest_prepare_date_response( $object->get_date_on_sale_to(), false ),
            'date_on_sale_to_gmt'   => wc_rest_prepare_date_response( $object->get_date_on_sale_to() ),
            'on_sale'               => $object->is_on_sale(),
            'visible'               => $object->is_visible(),
            'purchasable'           => $object->is_purchasable(),
            'virtual'               => $object->is_virtual(),
            'downloadable'          => $object->is_downloadable(),
            'downloads'             => $this->get_downloads( $object ),
            'download_limit'        => '' !== $object->get_download_limit() ? (int) $object->get_download_limit() : -1,
            'download_expiry'       => '' !== $object->get_download_expiry() ? (int) $object->get_download_expiry() : -1,
            'tax_status'            => $object->get_tax_status(),
            'tax_class'             => $object->get_tax_class(),
            'manage_stock'          => $object->managing_stock(),
            'stock_quantity'        => $object->get_stock_quantity(),
            'in_stock'              => $object->is_in_stock(),
            'backorders'            => $object->get_backorders(),
            'backorders_allowed'    => $object->backorders_allowed(),
            'backordered'           => $object->is_on_backorder(),
            'weight'                => $object->get_weight(),
            'dimensions'            => array(
                'length'            => $object->get_length(),
                'width'             => $object->get_width(),
                'height'            => $object->get_height(),
            ),
            'shipping_class'        => $object->get_shipping_class(),
            'shipping_class_id'     => $object->get_shipping_class_id(),
            'image'                 => current( $this->get_images( $object ) ),
            'attributes'            => $this->get_attributes( $object ),
            'menu_order'            => $object->get_menu_order(),
            'meta_data'             => $object->get_meta_data(),
        );

        return apply_filters( "dokan_rest_prepare_{$this->post_type}_object", $data );
    }

    /**
     * Prepare a single variation for create or update.
     *
     * @param  WP_REST_Request $request Request object.
     * @param  bool            $creating If is creating a new object.
     * @return WP_Error|WC_Data
     */
    protected function prepare_object_for_database( $request, $creating = false ) {
        if ( isset( $request['id'] ) ) {
            $variation = wc_get_product( absint( $request['id'] ) );
        } else {
            $variation = new WC_Product_Variation();
        }

        $variation->set_parent_id( absint( $request['product_id'] ) );

        // Status.
        if ( isset( $request['visible'] ) ) {
            $variation->set_status( false === $request['visible'] ? 'private' : 'publish' );
        }

        // SKU.
        if ( isset( $request['sku'] ) ) {
            $variation->set_sku( wc_clean( $request['sku'] ) );
        }

        // Thumbnail.
        if ( isset( $request['image'] ) ) {
            if ( is_array( $request['image'] ) ) {
                $image = $request['image'];
                if ( is_array( $image ) ) {
                    $image['position'] = 0;
                }

                $variation = $this->set_product_images( $variation, array( $image ) );
            } else {
                $variation->set_image_id( '' );
            }
        }

        // Virtual variation.
        if ( isset( $request['virtual'] ) ) {
            $variation->set_virtual( $request['virtual'] );
        }

        // Downloadable variation.
        if ( isset( $request['downloadable'] ) ) {
            $variation->set_downloadable( $request['downloadable'] );
        }

        // Downloads.
        if ( $variation->get_downloadable() ) {
            // Downloadable files.
            if ( isset( $request['downloads'] ) && is_array( $request['downloads'] ) ) {
                $variation = $this->save_downloadable_files( $variation, $request['downloads'] );
            }

            // Download limit.
            if ( isset( $request['download_limit'] ) ) {
                $variation->set_download_limit( $request['download_limit'] );
            }

            // Download expiry.
            if ( isset( $request['download_expiry'] ) ) {
                $variation->set_download_expiry( $request['download_expiry'] );
            }
        }

        // Shipping data.
        $variation = $this->save_product_shipping_data( $variation, $request );

        // Stock handling.
        if ( isset( $request['manage_stock'] ) ) {
            $variation->set_manage_stock( $request['manage_stock'] );
        }

        if ( isset( $request['in_stock'] ) ) {
            $variation->set_stock_status( true === $request['in_stock'] ? 'instock' : 'outofstock' );
        }

        if ( isset( $request['backorders'] ) ) {
            $variation->set_backorders( $request['backorders'] );
        }

        if ( $variation->get_manage_stock() ) {
            if ( isset( $request['stock_quantity'] ) ) {
                $variation->set_stock_quantity( $request['stock_quantity'] );
            } elseif ( isset( $request['inventory_delta'] ) ) {
                $stock_quantity  = wc_stock_amount( $variation->get_stock_quantity() );
                $stock_quantity += wc_stock_amount( $request['inventory_delta'] );
                $variation->set_stock_quantity( $stock_quantity );
            }
        } else {
            $variation->set_backorders( 'no' );
            $variation->set_stock_quantity( '' );
        }

        // Regular Price.
        if ( isset( $request['regular_price'] ) ) {
            $variation->set_regular_price( $request['regular_price'] );
        }

        // Sale Price.
        if ( isset( $request['sale_price'] ) ) {
            $variation->set_sale_price( $request['sale_price'] );
        }

        if ( isset( $request['date_on_sale_from'] ) ) {
            $variation->set_date_on_sale_from( $request['date_on_sale_from'] );
        }

        if ( isset( $request['date_on_sale_from_gmt'] ) ) {
            $variation->set_date_on_sale_from( $request['date_on_sale_from_gmt'] ? strtotime( $request['date_on_sale_from_gmt'] ) : null );
        }

        if ( isset( $request['date_on_sale_to'] ) ) {
            $variation->set_date_on_sale_to( $request['date_on_sale_to'] );
        }

        if ( isset( $request['date_on_sale_to_gmt'] ) ) {
            $variation->set_date_on_sale_to( $request['date_on_sale_to_gmt'] ? strtotime( $request['date_on_sale_to_gmt'] ) : null );
        }

        // Tax class.
        if ( isset( $request['tax_class'] ) ) {
            $variation->set_tax_class( $request['tax_class'] );
        }

        // Description.
        if ( isset( $request['description'] ) ) {
            $variation->set_description( wp_kses_post( $request['description'] ) );
        }

        // Update taxonomies.
        if ( isset( $request['attributes'] ) ) {
            $attributes        = array();
            $parent            = wc_get_product( $variation->get_parent_id() );
            $parent_attributes = $parent->get_attributes();

            foreach ( $request['attributes'] as $attribute ) {
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

                if ( ! isset( $parent_attributes[ $attribute_name ] ) || ! $parent_attributes[ $attribute_name ]->get_variation() ) {
                    continue;
                }

                $attribute_key   = sanitize_title( $parent_attributes[ $attribute_name ]->get_name() );
                $attribute_value = isset( $attribute['option'] ) ? wc_clean( stripslashes( $attribute['option'] ) ) : '';

                if ( $parent_attributes[ $attribute_name ]->is_taxonomy() ) {
                    // If dealing with a taxonomy, we need to get the slug from the name posted to the API.
                    // @codingStandardsIgnoreStart
                    $term = get_term_by( 'name', $attribute_value, $attribute_name );
                    // @codingStandardsIgnoreEnd

                    if ( $term && ! is_wp_error( $term ) ) {
                        $attribute_value = $term->slug;
                    } else {
                        $attribute_value = sanitize_title( $attribute_value );
                    }
                }

                $attributes[ $attribute_key ] = $attribute_value;
            }

            $variation->set_attributes( $attributes );
        }

        // Menu order.
        if ( $request['menu_order'] ) {
            $variation->set_menu_order( $request['menu_order'] );
        }

        // Meta data.
        if ( is_array( $request['meta_data'] ) ) {
            foreach ( $request['meta_data'] as $meta ) {
                $variation->update_meta_data( $meta['key'], $meta['value'], isset( $meta['id'] ) ? $meta['id'] : '' );
            }
        }

        return apply_filters( "dokan_rest_pre_insert_{$this->post_type}_object", $variation, $request, $creating );
    }

    /**
     * Prepare objects query.
     *
     * @since  3.0.0
     * @param  WP_REST_Request $request Full details about the request.
     * @return array
     */
    protected function prepare_objects_query( $request ) {
        $args = parent::prepare_objects_query( $request );

        $args['post_parent'] = $request['product_id'];

        return $args;
    }

    /**
     * Delete a variation.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return bool|WP_Error|WP_REST_Response
     */
    public function delete_item( $request ) {
        $object = $this->get_object( (int) $request['id'] );
        $result = false;

        if ( ! $object || 0 === $object->get_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Invalid ID.', 'dokan' ), array(
                'status' => 404,
            ) );
        }

        $response = $this->prepare_data_for_response( $object, 'edit' );

        // If we're forcing, then delete permanently.
        $object->delete( true );
        $result = 0 === $object->get_id();

        if ( ! $result ) {
            /* translators: %s: post type */
            return new WP_Error( 'dokan_rest_cannot_delete', sprintf( __( 'The %s cannot be deleted.', 'dokan' ), $this->post_type ), array(
                'status' => 500,
            ) );
        }

        // Delete parent product transients.
        if ( 0 !== $object->get_parent_id() ) {
            wc_delete_product_transients( $object->get_parent_id() );
        }

        do_action( "dokan_rest_delete_{$this->post_type}_object", $object, $response, $request );

        return $response;
    }

}