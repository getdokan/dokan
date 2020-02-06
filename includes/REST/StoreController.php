<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Vendor\Vendor;
use Dokan_REST_Product_Controller;
use WP_Error;
use WP_Query;
use WP_REST_Controller;
use WP_REST_Server;

/**
* Store API Controller
*
* @package dokan
*
* @author weDevs <info@wedevs.com>
*/
class StoreController extends WP_REST_Controller {

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
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_store' ),
                'permission_callback' => array( $this, 'permission_check_for_manageable_part' ),
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
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_store' ),
                'permission_callback' => array( $this, 'update_store_permissions_check' ),
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

        register_rest_route( $this->namespace, '/' . $this->base . '/check', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [ $this, 'check_store_availability' ]
            ]
        ] );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/contact' , array(
            'args' => [
                'id' => [
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                ],
            ],
            [
                'methods'  => WP_REST_Server::CREATABLE,
                'callback' => array( $this, 'send_email' ),
                'args'     => [
                    'name' => [
                        'type'        => 'string',
                        'description' => __( 'Your Name', 'dokan-lite' ),
                        'required'    => true
                    ],
                    'email' => [
                        'type'        => 'string',
                        'format'      => 'email',
                        'description' => __( 'Your email', 'dokan-lite' ),
                        'required'    => true
                    ],
                    'message' => [
                        'type'        => 'string',
                        'description' => __( 'Your Message', 'dokan-lite' ),
                        'required'    => true
                    ]
                ]
            ],
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/status', array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.' ),
                    'type'        => 'integer',
                    'required'    => true
                ),
                'status' => array(
                    'description' => __( 'Status for the store object.' ),
                    'type'        => 'string',
                    'required'    => true
                ),
            ),
            array(
                'methods'  => WP_REST_Server::EDITABLE,
                'callback' => array( $this, 'update_vendor_status' ),
                'permission_callback' => array( $this, 'permission_check_for_manageable_part' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/batch', array(
            array(
                'methods'  => WP_REST_Server::EDITABLE,
                'callback' => array( $this, 'batch_update' ),
                'permission_callback' => array( $this, 'permission_check_for_manageable_part' ),
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
            'number' => (int) $params['per_page'],
            'offset' => (int) ( $params['page'] - 1 ) * $params['per_page']
        );

        if ( ! empty( $params['search'] ) ) {
            $args['search']         = '*' . sanitize_text_field( ( $params['search'] ) ) . '*';
            $args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
        }

        if ( ! empty( $params['status'] ) ) {
            $args['status'] = sanitize_text_field( $params['status'] );
        }

        if ( ! empty( $params['orderby'] ) ) {
            $args['orderby'] = sanitize_sql_orderby( $params['orderby'] );
        }

        if ( ! empty( $params['order'] ) ) {
            $args['order'] = sanitize_text_field( $params['order'] );
        }

        if ( ! empty( $params['featured'] ) ) {
            $args['featured'] = sanitize_text_field( $params['featured'] );
        }

        $args = apply_filters( 'dokan_rest_get_stores_args', $args, $request );

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
        $store_id = (int) $request['id'];

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
        $store_id = ! empty( $request['id'] ) ? (int) $request['id'] : 0;
        $reassign = false === $request['reassign'] ? null : absint( $request['reassign'] );

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_vendor_found', __( 'No vendor found for updating status', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        if ( ! empty( $reassign ) ) {
            if ( $reassign === $store_id || ! get_userdata( $reassign ) ) {
                return new WP_Error( 'rest_user_invalid_reassign', __( 'Invalid user ID for reassignment.', 'dokan-lite' ), array( 'status' => 400 ) );
            }
        }

        $vendor   = dokan()->vendor->delete( $store_id, $reassign );
        $response = rest_ensure_response( $vendor );
        $response->add_links( $this->prepare_links( $vendor, $request ) );

        return $response;
    }

    /**
     * Update store permission check method
     *
     * @since 2.9.2
     *
     * @return bool
     */
    public function update_store_permissions_check( $request ) {
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        if ( current_user_can( 'dokandar' ) ) {
            return dokan_get_current_user_id() === absint( $request->get_param( 'id' ) );
        }
    }

    /**
     * Update Store
     *
     * @since 2.9.2
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function update_store( $request ) {
        $store = dokan()->vendor->get( (int) $request->get_param( 'id' ) );

        if ( empty( $store->get_id() ) ) {
            return new WP_Error( 'no_store_found', __( 'No store found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $params   = $request->get_params();
        $store_id = dokan()->vendor->update( $store->get_id(), $params );

        if ( is_wp_error( $store_id ) ) {
            return new WP_Error( $store_id->get_error_code(), $store_id->get_error_message() );
        }

        $store = dokan()->vendor->get( $store_id );

        do_action( 'dokan_rest_stores_update_store', $store, $request );

        $stores_data = $this->prepare_item_for_response( $store, $request );
        $response    = rest_ensure_response( $stores_data );

        return $response;
    }

    public function create_store( $request ) {
        $params = $request->get_params();

        $store = dokan()->vendor->create( $params );

        if ( is_wp_error( $store ) ) {
            return new WP_Error( $store->get_error_code(), $store->get_error_message() );
        }

        do_action( 'dokan_rest_stores_create_store', $store, $request );

        $stores_data = $this->prepare_item_for_response( $store, $request );
        $response    = rest_ensure_response( $stores_data );

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
        return current_user_can( 'manage_woocommerce' );
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

        if ( function_exists( 'dokan_get_seller_status_count' ) && current_user_can( 'manage_woocommerce' ) ) {
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

        $request->set_param( 'post_status', array( 'publish' ) );
        $request->set_param( 'author', $request['id'] );

        $response = $product_controller->get_items( $request );
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

        $store_id = (int) $params['id'];

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No store found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( class_exists( 'Dokan_Store_Reviews' ) ) {
            $args = array(
                'post_type'      => 'dokan_store_reviews',
                'meta_key'       => 'store_id',
                'meta_value'     => $store_id,
                'post_status'    => 'publish',
                'posts_per_page' => (int) $request['per_page'],
                'paged'          => (int) $request['page'],
                'author__not_in' => array( get_current_user_id(), $store_id )
            );

            $query = new WP_Query( $args );

            if ( empty( $query->posts ) ) {
                return new WP_Error( 'no_reviews_found', __( 'No reviews found', 'dokan-lite' ), array( 'status' => 404 ) );
            }

            $data = array();

            foreach ( $query->posts as $post ) {
                $data[] = $this->prepare_reviews_for_response( $post, $request );
            }

            $total_count = $query->found_posts;
        } else {
            $dokan_template_reviews = dokan_pro()->review;
            $post_type              = 'product';
            $limit                  = (int) $params['per_page'];
            $paged                  = (int) ( $params['page'] - 1 ) * $params['per_page'];
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
        }

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

        // $sql = "SELECT COUNT(*)
        //             FROM $wpdb->comments, $wpdb->posts
        //             WHERE $wpdb->posts.post_author=%d AND
        //             $wpdb->posts.post_status='publish' AND
        //             $wpdb->comments.comment_post_ID=$wpdb->posts.ID AND
        //             $wpdb->comments.comment_approved=%s AND
        //             $wpdb->posts.post_type=%s";

        $total = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*)
            FROM $wpdb->comments, $wpdb->posts
            WHERE $wpdb->posts.post_author=%d AND
            $wpdb->posts.post_status='publish' AND
            $wpdb->comments.comment_post_ID=$wpdb->posts.ID AND
            $wpdb->comments.comment_approved=%s AND
            $wpdb->posts.post_type=%s", $id, $status, $post_type ) );

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
        $data = array_merge( $data, apply_filters( 'dokan_rest_store_additional_fields', $additional_fields, $store, $request ) );
        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $data, $request ) );

        return apply_filters( 'dokan_rest_prepare_store_item_for_response', $response );
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
        if ( class_exists( 'Dokan_Store_Reviews' ) ) {
            $user          = get_user_by( 'id', $item->post_author );
            $user_gravatar = get_avatar_url( $user->user_email );

            $data = [
                'id'            => (int) $item->ID,
                'author'        => array(
                    'id'     => $user->ID,
                    'name'   => $user->user_login,
                    'email'  => $user->user_email,
                    'url'    => $user->user_url,
                    'avatar' => $user_gravatar
                ),
                'title'         => $item->post_title,
                'content'       => $item->post_content,
                'permalink'     => null,
                'product_id'    => null,
                'approved'      => true,
                'date'          => mysql_to_rfc3339( $item->post_date ),
                'rating'        => intval( get_post_meta( $item->ID, 'rating', true ) ),
            ];
        } else {
            $comment_author_img_url = get_avatar_url( $item->comment_author_email );
            $data = [
                'id'            => (int) $item->comment_ID,
                'author'        => array(
                    'id'     => $item->user_id,
                    'name'   => $item->comment_author,
                    'email'  => $item->comment_author_email,
                    'url'    => $item->comment_author_url,
                    'avatar' => $comment_author_img_url
                ),
                'title'         => null,
                'content'       => $item->comment_content,
                'permalink'     => get_comment_link( $item ),
                'product_id'    => $item->comment_post_ID,
                'approved'      => (bool)$item->comment_approved,
                'date'          => mysql_to_rfc3339( $item->comment_date ),
                'rating'        => intval( get_comment_meta( $item->comment_ID, 'rating', true ) ),
            ];
        }

        $data = array_merge( $data, $additional_fields );

        return $data;
    }

    /**
     * Check store availability
     *
     * @param  array $request
     *
     * @since 2.9.13
     *
     * @return reponse
     */
    public function check_store_availability( $request ) {
        $params = $request->get_params();

        // check whether store name is available or not
        if ( ! empty( $params['store_slug'] ) ) {
            $store_slug = sanitize_text_field( $params['store_slug'] );

            if ( get_user_by( 'slug', $store_slug ) ) {
                $response = [
                    'url'       => $store_slug,
                    'available' => false
                ];

                return rest_ensure_response( $response );
            }

            $response = [
                'url'       => sanitize_title( $store_slug ),
                'available' => true
            ];

            return rest_ensure_response( $response );
        }

        // check whether username is available or not
        if ( ! empty( $params['username'] ) ) {
            $username = sanitize_user( $params['username'] );

            if ( get_user_by( 'login', $username ) ) {
                $response = [
                    'username'  => $username,
                    'available' => false
                ];

                return rest_ensure_response( $response );
            }

            $response = [
                'username'  => $username,
                'available' => true
            ];

            return rest_ensure_response( $response );
        }

        // check whether email is available or not
        if ( ! empty( $params['user_email'] ) ) {
            $user_email = $params['user_email'];

            if ( ! is_email( $user_email ) ) {
                $response = [
                    'user_email' => $user_email,
                    'available'  => false,
                    'message'    => __( 'This email address is not valid', 'dokan-lite' )
                ];

                return rest_ensure_response( $response );
            }

            if ( email_exists( $user_email ) ) {
                $response = [
                    'user_email'  => $user_email,
                    'available' => false
                ];

                return rest_ensure_response( $response );
            }

            $response = [
                'user_email'  => $user_email,
                'available' => true
            ];

            return rest_ensure_response( $response );
        }

        return rest_ensure_response( [] );
    }

    /**
     * Send email to vendor
     *
     * @since 2.9.23
     *
     * @param  WP_REST_Request
     *
     * @return WP_REST_Response
     */
    public function send_email( $request ) {
        $params = $request->get_params();
        $vendor = dokan()->vendor->get( $params['id'] );

        if ( ! $vendor instanceof Vendor || ! $vendor->get_id() ) {
            return rest_ensure_response(
                new WP_Error(
                    'vendor_not_found',
                    __( 'No vendor is found to be send an email.', 'dokan-lite' ),
                    [
                        'status' => 404
                    ]
                )
            );
        }

        /**
         * Fires before sedning email to vendor via the REST API.
         *
         * @since  2.9.23
         *
         * @param WP_REST_Request $request   Request object.
         * @param boolean         $creating  True when creating object, false when updating.
         */
        do_action( "dokan_rest_pre_{$this->base}_send_email", $request, true );

        $vendor_email   = $vendor->get_email();
        $sender_name    = $params['name'];
        $sender_email   = $params['email'];
        $sender_message = $params['message'];

        WC()->mailer()->emails['Dokan_Email_Contact_Seller']->trigger( $vendor_email, $sender_name, $sender_email, $sender_message );

        $response = apply_filters( "dokan_{$this->base}_send_email_response", [
            'store_id'       => $vendor->get_id(),
            'data'           => __( 'Email sent successfully!', 'dokan-lite' ),
            'sender_name'    => $sender_name,
            'sender_email'   => $sender_email,
            'sender_message' => $sender_message,
        ] );

        return rest_ensure_response( $response );
    }

    /**
     * update_vendor_status
     *
     * @since 2.9.23
     *
     * @return void
     */
    public function update_vendor_status( $request ) {
        if ( ! in_array( $request['status'], array( 'active', 'inactive' ) ) ) {
            return new WP_Error( 'no_valid_status', __( 'Status parameter must be active or inactive', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        $store_id = ! empty( $request['id'] ) ? $request['id'] : 0;

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_vendor_found', __( 'No vendor found for updating status', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        if ( 'active' == $request['status'] ) {
            $user = dokan()->vendor->get( $store_id )->make_active();
        } else {
            $user = dokan()->vendor->get( $store_id )->make_inactive();
        }

        $response = rest_ensure_response( $user );
        $response->add_links( $this->prepare_links( $user, $request ) );
        return $response;
    }

    /**
     * Batch udpate for vendor listing
     *
     * @since 2.9.23
     *
     * @return void
     */
    public function batch_update( $request ) {
        $params = $request->get_params();

        if ( empty( $params ) ) {
            return new WP_Error( 'no_item_found', __( 'No items found for bulk updating', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $allowed_status = ['approved', 'pending', 'delete'];
        $response       = [];

        foreach ( $params as $status => $value ) {
            if ( in_array( $status, $allowed_status ) ) {

                switch ( $status ) {
                    case 'approved':

                        foreach ( $value as $vendor_id ) {
                            $response['approved'][] = dokan()->vendor->get( $vendor_id )->make_active();
                        }
                        break;

                    case 'pending':

                        foreach ( $value as $vendor_id ) {
                            $response['pending'][] = dokan()->vendor->get( $vendor_id )->make_inactive();
                        }
                        break;

                    case 'delete':

                        foreach ( $value as $vendor_id ) {
                            $user = dokan()->vendor->get( $vendor_id )->delete();
                            $response['delete'][] = $user;
                        }
                        break;
                }
            }
        }

        return $response;
    }
}
