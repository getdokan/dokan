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
        $product_controller = new Dokan_Product_Controller();

        $args = array(
            'post_status' => array( 'publish' ),
            'author'      => $request['id']
        );

        $response = $product_controller->get_products( $request, $args );
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