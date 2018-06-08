<?php

/**
* Store API Controller
*
* @package dokan
*
* @author weDevs <info@wedevs.com>
*/
class Dokan_REST_Store_Controller extends WP_REST_Controller {

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
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array( $this, 'get_store' )
            ),
            array(
                'methods'  => WP_REST_Server::DELETABLE,
                'callback' => array( $this, 'delete_store' ),
                'permission_callback' => array( $this, 'permission_check_for_manageable_part' ),
                'args' =>  array(
                    'reassign' => array(
                        'type'        => 'integer',
                        'description' => __( 'Reassign the deleted user\'s posts and links to this user ID.', 'dokan-lite' ),
                        'required'    => true,
                    ),
                )
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/products' , array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
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
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
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
            $args['search']         = '*' . esc_attr( $params['search'] ) . '*';
            $args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
        }

        if ( ! empty( $params['status'] ) ) {
            $args['status'] = $params['status'];
        }

        if ( ! empty( $params['orderby'] ) ) {
            $args['orderby'] = $params['orderby'];
        }

        if ( ! empty( $params['order'] ) ) {
            $args['order'] = $params['order'];
        }

        $stores       = dokan()->vendor->get_vendors( $args );
        $data_objects = array();

        foreach ( $stores as $store ) {
            $stores_data    = $this->prepare_item_for_response( $store, $request );
            $data_objects[] = $this->prepare_response_for_collection( $stores_data );
        }

        $response = rest_ensure_response( $data_objects );
        $response = $this->format_collection_response( $response, $request, dokan()->vendor->get_total() );

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
            return new WP_Error( 'no_store_found', __( 'No store found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $stores_data = $this->prepare_item_for_response( $store, $request );
        $response    = rest_ensure_response( $stores_data );

        return $response;
    }

    /**
     * Delete store
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function delete_store( $request ) {
        $store_id = !empty( $request['id'] ) ? $request['id'] : 0;
        $reassign = false === $request['reassign'] ? null : absint( $request['reassign'] );

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_vendor_found', __( 'No vendor found for updating status', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        if ( ! empty( $reassign ) ) {
            if ( $reassign === $store_id || ! get_userdata( $reassign ) ) {
                return new WP_Error( 'rest_user_invalid_reassign', __( 'Invalid user ID for reassignment.', 'dokan-lite' ), array( 'status' => 400 ) );
            }
        }

        $vendor = dokan()->vendor->get( intval( $store_id ) )->delete( $reassign );
        $response = rest_ensure_response( $vendor );
        $response->add_links( $this->prepare_links( $vendor, $request ) );

        return $response;
    }

    /**
     * undocumented function
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function permission_check_for_manageable_part() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Prepare links for the request.
     *
     * @param WC_Data         $object  Object data.
     * @param WP_REST_Request $request Request object.
     *
     * @return array                   Links for the given post.
     */
    protected function prepare_links( $object, $request ) {
        $links = array(
            'self' => array(
                'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->base, $object['id'] ) ),
            ),
            'collection' => array(
                'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->base ) ),
            ),
        );

        return $links;
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

        // Store pagation values for headers then unset for count query.
        $per_page  = (int) ( ! empty( $request['per_page'] ) ? $request['per_page'] : 20 );
        $page      = (int) ( ! empty( $request['page'] ) ? $request['page'] : 1 );
        $max_pages = ceil( $total_items / $per_page );

        if ( function_exists( 'dokan_get_seller_status_count' ) && current_user_can( 'manage_options' ) ) {
            $counts = dokan_get_seller_status_count();
            $response->header( 'X-Status-Pending', (int) $counts['inactive'] );
            $response->header( 'X-Status-Approved', (int) $counts['active'] );
            $response->header( 'X-Status-All', (int) $counts['total'] );
        }

        $response->header( 'X-WP-Total', (int) $total_items );
        $response->header( 'X-WP-TotalPages', (int) $max_pages );

        if ( $total_items === 0 ) {
            return $response;
        }

        $base = add_query_arg( $request->get_query_params(), rest_url( sprintf( '/%s/%s', $this->namespace, $this->base ) ) );

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
        $product_controller = new Dokan_REST_Product_Controller();

        $args = array(
            'post_status' => array( 'publish' ),
            'author'      => $request['id']
        );

        $response = $product_controller->get_items( $request, $args );
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
            return new WP_Error( 'no_store_found', __( 'No store found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $dokan_template_reviews = Dokan_Pro_Reviews::init();
        $post_type              = 'product';
        $limit                  = $params['per_page'];
        $paged                  = ( $params['page'] - 1 ) * $params['per_page'];
        $status                 = '1';
        $comments               = $dokan_template_reviews->comment_query( $store_id, $post_type, $limit, $status, $paged );

        if ( empty( $comments ) ) {
            return new WP_Error( 'no_reviews_found', __( 'No reviews found', 'dokan-lite' ), array( 'status' => 404 ) );
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
    public function prepare_item_for_response( $store, $request, $additional_fields = [] ) {

        $data = $store->to_array();
        $data = array_merge( $data, $additional_fields );
        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $data, $request ) );
        return $response;
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
