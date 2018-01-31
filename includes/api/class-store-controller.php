<?php

/**
* Store API Controller
*
* @package dokan
*
* @author weDevs <info@wedevs.com>
*/
class Dokan_Store_Controller extends WP_REST_Controller {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'stores';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->base, array(
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array( $this, 'get_stores' ),
                'args'     => $this->get_collection_params()
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)', array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array( $this, 'get_store' )
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/products' , array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array( $this, 'get_store_products' ),
                'args'     => $this->get_collection_params()
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/reviews' , array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array( $this, 'get_store_reviews' ),
                'args'     => $this->get_collection_params()
            ),
        ) );

    }

    /**
     * Get stores
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_stores( $request ) {
        $params = $request->get_params();

        $args = array(
            'number' => $params['per_page'],
            'offset' => ( $params['page'] - 1 ) * $params['per_page']
        );

        if ( ! empty( $params['search'] ) ) {
            $args['meta_query'] = array(
                array(
                    'key'     => 'dokan_store_name',
                    'value'   => $params['search'],
                    'compare' => 'LIKE'
                )
            );
        }

        $stores = dokan_get_sellers( $args );

        $stores_data = array();
        foreach ( $stores['users'] as $key => $store ) {
            $stores_data[] = $this->prepare_item_for_response( $store, $request );
        }

        $response = rest_ensure_response( $stores_data );
        $response = $this->format_collection_response( $response, $request, $stores['count'] );
        return $response;
    }

    /**
     * Get singe store
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_store( $request ) {
        $store_id = $request['id'];

        $store = dokan()->vendor->get( $store_id );
        if ( empty( $store->id ) ) {
            return new WP_Error( 'no_store_found', __( 'No store found' ), array( 'status' => 404 ) );
        }

        $stores_data = $this->prepare_item_for_response( $store->data, $request );
        $response    = rest_ensure_response( $stores_data );

        return $response;
    }

    /**
     * Format item's collection for response
     *
     * @param  object $response
     * @param  object $request
     * @param  array $items
     * @param  int $total_items
     *
     * @return object
     */
    public function format_collection_response( $response, $request, $total_items ) {
        if ( $total_items === 0 ) {
            return $response;
        }

        // Store pagation values for headers then unset for count query.
        $per_page = (int) ( ! empty( $request['per_page'] ) ? $request['per_page'] : 20 );
        $page     = (int) ( ! empty( $request['page'] ) ? $request['page'] : 1 );

        $response->header( 'X-WP-Total', (int) $total_items );

        $max_pages = ceil( $total_items / $per_page );

        $response->header( 'X-WP-TotalPages', (int) $max_pages );
        $base = add_query_arg( $request->get_query_params(), rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ) );

        if ( $page > 1 ) {
            $prev_page = $page - 1;
            if ( $prev_page > $max_pages ) {
                $prev_page = $max_pages;
            }
            $prev_link = add_query_arg( 'page', $prev_page, $base );
            $response->link_header( 'prev', $prev_link );
        }
        if ( $max_pages > $page ) {

            $next_page = $page + 1;
            $next_link = add_query_arg( 'page', $next_page, $base );
            $response->link_header( 'next', $next_link );
        }

        return $response;
    }

    /**
     * Get store Products
     *
     * @param object $request
     *
     * @return json
     */
    public function get_store_products( $request ) {
        $params = $request->get_params();

        $store_id = $params['id'];

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No store found' ), array( 'status' => 404 ) );
        }

        $args = array(
            'fields' => 'ids',
            'posts_per_page' => $params['per_page'],
            'paged'          => $params['page'],
            'author'         => $store_id,
            'post_status' => array( 'publish' )
        );

        $product_ids = dokan()->product->all( $args );

        if ( empty( $product_ids->posts ) ) {
            return new WP_Error( 'no_products_found', __( 'No Products found' ), array( 'status' => 404 ) );
        }

        $data = array();
        foreach ( $product_ids->posts as $product_id ) {
            $data[] = $this->get_product_data( wc_get_product( $product_id ) );
        }

        $response = rest_ensure_response( $data );
        $response = $this->format_collection_response( $response, $request, $product_ids->found_posts );

        return $response;
    }

    /**
     * Get store reviews
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_store_reviews( $request ) {
        $params = $request->get_params();

        $store_id = $params['id'];

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No store found' ), array( 'status' => 404 ) );
        }

        $dokan_template_reviews = Dokan_Pro_Reviews::init();
        $post_type              = 'product';
        $limit                  = $params['per_page'];
        $paged                  = ( $params['page'] - 1 ) * $params['per_page'];
        $status                 = '1';
        $comments               = $dokan_template_reviews->comment_query( $store_id, $post_type, $limit, $status, $paged );

        if ( empty( $comments ) ) {
            return new WP_Error( 'no_reviews_found', __( 'No reviews found' ), array( 'status' => 404 ) );
        }

        $data = array();
        foreach ( $comments as $comment ) {
            $data[] = $this->prepare_reviews_for_response( $comment, $request );
        }

        $total_count = $this->get_total_review_count( $store_id, $post_type, $status );

        $response = rest_ensure_response( $data );
        $response = $this->format_collection_response( $response, $request, $total_count );

        return $response;
    }

    /**
     * Get total counting for store review
     *
     * @since 2.8.0
     *
     * @param integer $id [hold store id]
     * @param string $post_type
     * @param string $status
     *
     * @return integer
     */
    public function get_total_review_count( $id, $post_type, $status ) {
        global $wpdb;

        $total = $wpdb->get_var(
            "SELECT COUNT(*)
            FROM $wpdb->comments, $wpdb->posts
            WHERE   $wpdb->posts.post_author='$id' AND
            $wpdb->posts.post_status='publish' AND
            $wpdb->comments.comment_post_ID=$wpdb->posts.ID AND
            $wpdb->comments.comment_approved='$status' AND
            $wpdb->posts.post_type='$post_type'"
        );

        return intval( $total );
    }

    /**
     * Get product data.
     *
     * @param WC_Product $product Product instance.
     * @param string     $context Request context.
     *                            Options: 'view' and 'edit'.
     * @return array
     */
    protected function get_product_data( $product, $context = 'view' ) {
        $data = array(
            'id'                    => $product->get_id(),
            'name'                  => $product->get_name( $context ),
            'slug'                  => $product->get_slug( $context ),
            'permalink'             => $product->get_permalink(),
            'date_created'          => wc_rest_prepare_date_response( $product->get_date_created( $context ), false ),
            'date_created_gmt'      => wc_rest_prepare_date_response( $product->get_date_created( $context ) ),
            'date_modified'         => wc_rest_prepare_date_response( $product->get_date_modified( $context ), false ),
            'date_modified_gmt'     => wc_rest_prepare_date_response( $product->get_date_modified( $context ) ),
            'type'                  => $product->get_type(),
            'status'                => $product->get_status( $context ),
            'featured'              => $product->is_featured(),
            'catalog_visibility'    => $product->get_catalog_visibility( $context ),
            'description'           => 'view' === $context ? wpautop( do_shortcode( $product->get_description() ) ) : $product->get_description( $context ),
            'short_description'     => 'view' === $context ? apply_filters( 'woocommerce_short_description', $product->get_short_description() ) : $product->get_short_description( $context ),
            'sku'                   => $product->get_sku( $context ),
            'price'                 => $product->get_price( $context ),
            'regular_price'         => $product->get_regular_price( $context ),
            'sale_price'            => $product->get_sale_price( $context ) ? $product->get_sale_price( $context ) : '',
            'date_on_sale_from'     => wc_rest_prepare_date_response( $product->get_date_on_sale_from( $context ), false ),
            'date_on_sale_from_gmt' => wc_rest_prepare_date_response( $product->get_date_on_sale_from( $context ) ),
            'date_on_sale_to'       => wc_rest_prepare_date_response( $product->get_date_on_sale_to( $context ), false ),
            'date_on_sale_to_gmt'   => wc_rest_prepare_date_response( $product->get_date_on_sale_to( $context ) ),
            'price_html'            => $product->get_price_html(),
            'on_sale'               => $product->is_on_sale( $context ),
            'purchasable'           => $product->is_purchasable(),
            'total_sales'           => $product->get_total_sales( $context ),
            'virtual'               => $product->is_virtual(),
            'downloadable'          => $product->is_downloadable(),
            'downloads'             => $this->get_downloads( $product ),
            'download_limit'        => $product->get_download_limit( $context ),
            'download_expiry'       => $product->get_download_expiry( $context ),
            'external_url'          => $product->is_type( 'external' ) ? $product->get_product_url( $context ) : '',
            'button_text'           => $product->is_type( 'external' ) ? $product->get_button_text( $context ) : '',
            'tax_status'            => $product->get_tax_status( $context ),
            'tax_class'             => $product->get_tax_class( $context ),
            'manage_stock'          => $product->managing_stock(),
            'stock_quantity'        => $product->get_stock_quantity( $context ),
            'in_stock'              => $product->is_in_stock(),
            'backorders'            => $product->get_backorders( $context ),
            'backorders_allowed'    => $product->backorders_allowed(),
            'backordered'           => $product->is_on_backorder(),
            'sold_individually'     => $product->is_sold_individually(),
            'weight'                => $product->get_weight( $context ),
            'dimensions'            => array(
                'length' => $product->get_length( $context ),
                'width'  => $product->get_width( $context ),
                'height' => $product->get_height( $context ),
            ),
            'shipping_required'     => $product->needs_shipping(),
            'shipping_taxable'      => $product->is_shipping_taxable(),
            'shipping_class'        => $product->get_shipping_class(),
            'shipping_class_id'     => $product->get_shipping_class_id( $context ),
            'reviews_allowed'       => $product->get_reviews_allowed( $context ),
            'average_rating'        => 'view' === $context ? wc_format_decimal( $product->get_average_rating(), 2 ) : $product->get_average_rating( $context ),
            'rating_count'          => $product->get_rating_count(),
            'related_ids'           => array_map( 'absint', array_values( wc_get_related_products( $product->get_id() ) ) ),
            'upsell_ids'            => array_map( 'absint', $product->get_upsell_ids( $context ) ),
            'cross_sell_ids'        => array_map( 'absint', $product->get_cross_sell_ids( $context ) ),
            'parent_id'             => $product->get_parent_id( $context ),
            'purchase_note'         => 'view' === $context ? wpautop( do_shortcode( wp_kses_post( $product->get_purchase_note() ) ) ) : $product->get_purchase_note( $context ),
            'categories'            => $this->get_taxonomy_terms( $product ),
            'tags'                  => $this->get_taxonomy_terms( $product, 'tag' ),
            'images'                => $this->get_images( $product ),
            'attributes'            => $this->get_attributes( $product ),
            'default_attributes'    => $this->get_default_attributes( $product ),
            'variations'            => array(),
            'grouped_products'      => array(),
            'menu_order'            => $product->get_menu_order( $context ),
            'meta_data'             => $product->get_meta_data(),
        );

        return $data;
    }

    /**
     * Get taxonomy terms.
     *
     * @param WC_Product $product  Product instance.
     * @param string     $taxonomy Taxonomy slug.
     * @return array
     */
    protected function get_taxonomy_terms( $product, $taxonomy = 'cat' ) {
        $terms = array();

        foreach ( wc_get_object_terms( $product->get_id(), 'product_' . $taxonomy ) as $term ) {
            $terms[] = array(
                'id'   => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            );
        }

        return $terms;
    }

    /**
     * Get the images for a product or product variation.
     *
     * @param WC_Product|WC_Product_Variation $product Product instance.
     * @return array
     */
    protected function get_images( $product ) {
        $images = array();
        $attachment_ids = array();

        // Add featured image.
        if ( has_post_thumbnail( $product->get_id() ) ) {
            $attachment_ids[] = $product->get_image_id();
        }

        // Add gallery images.
        $attachment_ids = array_merge( $attachment_ids, $product->get_gallery_image_ids() );

        // Build image data.
        foreach ( $attachment_ids as $position => $attachment_id ) {
            $attachment_post = get_post( $attachment_id );
            if ( is_null( $attachment_post ) ) {
                continue;
            }

            $attachment = wp_get_attachment_image_src( $attachment_id, 'full' );
            if ( ! is_array( $attachment ) ) {
                continue;
            }

            $images[] = array(
                'id'                => (int) $attachment_id,
                'date_created'      => wc_rest_prepare_date_response( $attachment_post->post_date, false ),
                'date_created_gmt'  => wc_rest_prepare_date_response( strtotime( $attachment_post->post_date_gmt ) ),
                'date_modified'     => wc_rest_prepare_date_response( $attachment_post->post_modified, false ),
                'date_modified_gmt' => wc_rest_prepare_date_response( strtotime( $attachment_post->post_modified_gmt ) ),
                'src'               => current( $attachment ),
                'name'              => get_the_title( $attachment_id ),
                'alt'               => get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
                'position'          => (int) $position,
            );
        }

        // Set a placeholder image if the product has no images set.
        if ( empty( $images ) ) {
            $images[] = array(
                'id'                => 0,
                'date_created'      => wc_rest_prepare_date_response( current_time( 'mysql' ), false ), // Default to now.
                'date_created_gmt'  => wc_rest_prepare_date_response( current_time( 'timestamp', true ) ), // Default to now.
                'date_modified'     => wc_rest_prepare_date_response( current_time( 'mysql' ), false ),
                'date_modified_gmt' => wc_rest_prepare_date_response( current_time( 'timestamp', true ) ),
                'src'               => wc_placeholder_img_src(),
                'name'              => __( 'Placeholder', 'woocommerce' ),
                'alt'               => __( 'Placeholder', 'woocommerce' ),
                'position'          => 0,
            );
        }

        return $images;
    }

    /**
     * Get attribute taxonomy label.
     *
     * @deprecated 3.0.0
     *
     * @param  string $name Taxonomy name.
     * @return string
     */
    protected function get_attribute_taxonomy_label( $name ) {
        $tax    = get_taxonomy( $name );
        $labels = get_taxonomy_labels( $tax );

        return $labels->singular_name;
    }

    /**
     * Get product attribute taxonomy name.
     *
     * @since  3.0.0
     * @param  string     $slug    Taxonomy name.
     * @param  WC_Product $product Product data.
     * @return string
     */
    protected function get_attribute_taxonomy_name( $slug, $product ) {
        $attributes = $product->get_attributes();

        if ( ! isset( $attributes[ $slug ] ) ) {
            return str_replace( 'pa_', '', $slug );
        }

        $attribute = $attributes[ $slug ];

        // Taxonomy attribute name.
        if ( $attribute->is_taxonomy() ) {
            $taxonomy = $attribute->get_taxonomy_object();
            return $taxonomy->attribute_label;
        }

        // Custom product attribute name.
        return $attribute->get_name();
    }

    /**
     * Get default attributes.
     *
     * @param WC_Product $product Product instance.
     * @return array
     */
    protected function get_default_attributes( $product ) {
        $default = array();

        if ( $product->is_type( 'variable' ) ) {
            foreach ( array_filter( (array) $product->get_default_attributes(), 'strlen' ) as $key => $value ) {
                if ( 0 === strpos( $key, 'pa_' ) ) {
                    $default[] = array(
                        'id'     => wc_attribute_taxonomy_id_by_name( $key ),
                        'name'   => $this->get_attribute_taxonomy_name( $key, $product ),
                        'option' => $value,
                    );
                } else {
                    $default[] = array(
                        'id'     => 0,
                        'name'   => $this->get_attribute_taxonomy_name( $key, $product ),
                        'option' => $value,
                    );
                }
            }
        }

        return $default;
    }

    /**
     * Get attribute options.
     *
     * @param int   $product_id Product ID.
     * @param array $attribute  Attribute data.
     * @return array
     */
    protected function get_attribute_options( $product_id, $attribute ) {
        if ( isset( $attribute['is_taxonomy'] ) && $attribute['is_taxonomy'] ) {
            return wc_get_product_terms( $product_id, $attribute['name'], array(
                'fields' => 'names',
            ) );
        } elseif ( isset( $attribute['value'] ) ) {
            return array_map( 'trim', explode( '|', $attribute['value'] ) );
        }

        return array();
    }

    /**
     * Get the attributes for a product or product variation.
     *
     * @param WC_Product|WC_Product_Variation $product Product instance.
     * @return array
     */
    protected function get_attributes( $product ) {
        $attributes = array();

        if ( $product->is_type( 'variation' ) ) {
            $_product = wc_get_product( $product->get_parent_id() );
            foreach ( $product->get_variation_attributes() as $attribute_name => $attribute ) {
                $name = str_replace( 'attribute_', '', $attribute_name );

                if ( ! $attribute ) {
                    continue;
                }

                // Taxonomy-based attributes are prefixed with `pa_`, otherwise simply `attribute_`.
                if ( 0 === strpos( $attribute_name, 'attribute_pa_' ) ) {
                    $option_term = get_term_by( 'slug', $attribute, $name );
                    $attributes[] = array(
                        'id'     => wc_attribute_taxonomy_id_by_name( $name ),
                        'name'   => $this->get_attribute_taxonomy_name( $name, $_product ),
                        'option' => $option_term && ! is_wp_error( $option_term ) ? $option_term->name : $attribute,
                    );
                } else {
                    $attributes[] = array(
                        'id'     => 0,
                        'name'   => $this->get_attribute_taxonomy_name( $name, $_product ),
                        'option' => $attribute,
                    );
                }
            }
        } else {
            foreach ( $product->get_attributes() as $attribute ) {
                $attributes[] = array(
                    'id'        => $attribute['is_taxonomy'] ? wc_attribute_taxonomy_id_by_name( $attribute['name'] ) : 0,
                    'name'      => $this->get_attribute_taxonomy_name( $attribute['name'], $product ),
                    'position'  => (int) $attribute['position'],
                    'visible'   => (bool) $attribute['is_visible'],
                    'variation' => (bool) $attribute['is_variation'],
                    'options'   => $this->get_attribute_options( $product->get_id(), $attribute ),
                );
            }
        }

        return $attributes;
    }

    /**
     * Get the downloads for a product or product variation.
     *
     * @param WC_Product|WC_Product_Variation $product Product instance.
     * @return array
     */
    protected function get_downloads( $product ) {
        $downloads = array();

        if ( $product->is_downloadable() ) {
            foreach ( $product->get_downloads() as $file_id => $file ) {
                $downloads[] = array(
                    'id'   => $file_id, // MD5 hash.
                    'name' => $file['name'],
                    'file' => $file['file'],
                );
            }
        }

        return $downloads;
    }

    /**
     * Prepare a single user output for response
     *
     * @param object $item
     * @param WP_REST_Request $request Request object.
     * @param array $additional_fields (optional)
     *
     * @return WP_REST_Response $response Response data.
     */
    public function prepare_item_for_response( $item, $request, $additional_fields = [] ) {

        $store_info = dokan_get_store_info( $item->ID );

        $featured             = get_user_meta( $item->ID, 'dokan_feature_seller', true );
        $tnc_enabled          = ( !empty( $store_info['enable_tnc'] ) && $store_info['enable_tnc'] == 'on' ) ? true : false;
        $is_showing_more_ptab = ( !empty( $store_info['show_more_ptab'] ) && $store_info['show_more_ptab'] == 'yes' ) ? true : false;
        $is_featured          = $featured == 'yes' ? true : false;
        $store_location_meta  = !empty( $store_info['location'] ) ? explode(',', $store_info['location'] ) : array();
        $store_location = array();
        if ( !empty( $store_location_meta ) ) {
            $store_location['lat'] = $store_location_meta[0];
            $store_location['lan'] = $store_location_meta[1];
        }

        $data = [
            'id'                     => (int) $item->ID,
            'store_name'             => get_user_meta( $item->ID, 'dokan_store_name', true ),
            'first_name'             => $item->first_name,
            'last_name'              => $item->last_name,
            'email'                  => $item->user_email,
            'social'                 => $store_info['social'],
            'phone'                  => $store_info['phone'],
            'show_email'             => $store_info['show_email'],
            'address'                => $store_info['address'],
            'location'               => $store_location,
            'banner'                 => !empty( $store_info['banner'] ) ? wp_get_attachment_url( $store_info['banner'] ) : 0,
            'gravatar'               => !empty( $store_info['gravatar'] ) ? wp_get_attachment_url( $store_info['gravatar'] ) : 0,
            'store_product_per_page' => !empty( $store_info['store_ppp'] ) ? $store_info['store_ppp'] : 10,
            'show_more_product_tab'  => $is_showing_more_ptab,
            'is_tnc_enabled'         => $tnc_enabled,
            'store_tnc'              => !empty( $store_info['store_tnc'] ) ? $store_info['store_tnc'] : null,
            'is_featured'            => $is_featured,
            'rating'                 => dokan_get_seller_rating( $item->ID )
        ];

        $data = array_merge( $data, $additional_fields );

        return $data;
    }

    /**
     * Prepare a single user output for response
     *
     * @param object $item
     * @param WP_REST_Request $request Request object.
     * @param array $additional_fields (optional)
     *
     * @return WP_REST_Response $response Response data.
     */
    public function prepare_reviews_for_response( $item, $request, $additional_fields = [] ) {

        $comment_author_img_url = get_avatar_url( $item->comment_author_email );
        $data = [
            'comment_id'            => (int) $item->comment_ID,
            'comment_author'        => $item->comment_author,
            'comment_author_email'  => $item->comment_author_email,
            'comment_author_url'    => $item->comment_author_url,
            'comment_author_avatar' => $comment_author_img_url,
            'comment_content'       => $item->comment_content,
            'comment_permalink'     => get_comment_link( $item ),
            'user_id'               => $item->user_id,
            'comment_post_ID'       => $item->comment_post_ID,
            'comment_approved'      => $item->comment_approved,
            'comment_date'          => mysql_to_rfc3339( $item->comment_date ),
            'rating'                => intval( get_comment_meta( $item->comment_ID, 'rating', true ) ),
        ];

        $data = array_merge( $data, $additional_fields );

        return $data;
    }
}