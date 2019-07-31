<?php

namespace WeDevs\Dokan\REST;

use WP_Error;
use WP_REST_Controller;
use WP_REST_Server;

/**
* Dokan WIthdraw REST API Controller
*
* @since 2.8.0
*
* @package dokan
*/
class WithdrawController extends WP_REST_Controller {

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
    protected $rest_base = 'withdraw';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_items' ),
                'args'                => array_merge( $this->get_collection_params(),  array(
                    'ids' => array(
                        'description' => __( 'IDs of withdraws', 'dokan-lite' ),
                        'type'        => 'array',
                        'context'     => array( 'view' ),
                        'items'       => array(
                            'type'    => 'integer',
                        ),
                    ),
                ) ),
                'permission_callback' => array( $this, 'get_items_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_item' ),
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
                'permission_callback' => array( $this, 'create_item_permissions_check' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/', array(
            'args' => array(
                'id' => array(
                    'description'       => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'              => 'integer',
                    'validate_callback' => array( $this, 'withdraw_exists' ),
                ),
            ),
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_item' ),
                'permission_callback' => array( $this, 'get_item_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_item' ),
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
                'permission_callback' => array( $this, 'update_item_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_item' ),
                'permission_callback' => array( $this, 'delete_item_permissions_check' ),
            ),

        ) );

        $batch_items_schema = $this->get_public_batch_schema();
        register_rest_route( $this->namespace, '/' . $this->rest_base . '/batch', array(
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'batch_items' ),
                'permission_callback' => array( $this, 'batch_items_permissions_check' ),
                'args'                => $batch_items_schema['properties'],
            ),
            'schema' => array( $this, 'get_public_batch_schema' ),
        ) );
    }

    /**
     * Check permission for getting withdraw
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'dokan_manage_withdraw' );
    }

    /**
     * Check permission for get a withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param \WP_Request $request
     *
     * @return bool
     */
    public function get_item_permissions_check( $request ) {
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        $withdraw = dokan()->withdraw->get( $request['id'] );

        if ( $withdraw ) {
            $user_id = get_current_user_id();
            return $withdraw->get_user_id() === $user_id;
        }

        return false;
    }

    /**
     * Check permission for creating a withdraw request
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_withdraw' );
    }

    /**
     * Check permission for update a withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param \WP_Request $request
     *
     * @return bool
     */
    public function update_item_permissions_check( $request ) {
        return $this->get_item_permissions_check( $request );
    }

    /**
     * Check permission for deleting withdraw
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function delete_item_permissions_check( $request ) {
        return current_user_can( 'manage_woocommerce' );
    }

    /**
     * Check permission for getting withdraw
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function batch_items_permissions_check() {
        return current_user_can( 'manage_woocommerce' );
    }

    /**
     * Validate a withdraw is exists
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $id
     *
     * @return bool|\WP_Error
     */
    public function withdraw_exists( $id ) {
        $withdraw = dokan()->withdraw->get( $id );

        if ( $withdraw ) {
            return true;
        }

        return new WP_Error( 'dokan_rest_withdraw_error', __( 'Withdraw not found', 'dokan-lite' ), array( 'status' => 404 ) );
    }

    /**
     * Get user data
     *
     * @since 2.8.0
     *
     * @return return object
     */
    public function get_user_data( $user_id ) {
        $vendor = dokan()->vendor->get( $user_id );

        return $vendor->to_array();
    }

    /**
     * Get withdraws
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $args = array(
            'status'   => dokan()->withdraw->get_status_code( $request['status'] ),
            'paginate' => true,
            'page'     => $request['page'],
            'limit'    => $request['per_page'],
        );

        $user_id = null;

        if ( ! current_user_can( 'manage_options' ) ) {
            // Vendors can only see their own requests
            $user_id = dokan_get_current_user_id();

            if ( empty( $user_id ) ) {
                return new WP_Error( 'dokan_rest_withdraw_no_vendor_found', __( 'No vendor found', 'dokan-lite' ), array( 'status' => 404 ) );
            }

        } else if ( isset( $request['user_id'] ) ) {
            // Allow manager to filter request with user or vendor id
            $user_id = $request['user_id'];
        }

        if ( $user_id ) {
            $args['user_id'] = $user_id;
        }

        if ( isset( $request['ids'] ) ) {
            $args['ids'] = $request['ids'];
        }

        $withdraws = dokan()->withdraw->all( $args );

        $data = array();
        foreach ( $withdraws->withdraws as $withdraw ) {
            $item   = $this->prepare_item_for_response( $withdraw, $request );
            $data[] = $this->prepare_response_for_collection( $item );
        }

        $response       = rest_ensure_response( $data );
        $withdraw_count = dokan_get_withdraw_count();

        $response->header( 'X-Status-Pending', $withdraw_count['pending'] );
        $response->header( 'X-Status-Completed', $withdraw_count['completed'] );
        $response->header( 'X-Status-Cancelled', $withdraw_count['cancelled'] );

        $response = $this->format_collection_response( $response, $request, $withdraws->total );
        return $response;
    }

    /**
     * Make a withdraw request
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WP_REST_Response
     */
    public function create_item( $request ) {
        // vendors are only allowed to set amount and method params
        $user_id = dokan_get_current_user_id();

        if ( current_user_can( 'manage_woocommerce' ) ) {
            // A user could be both wc manager and a vendor. In that case,
            // we should allow to set `user_id` param for that manager.
            if ( isset( $request['user_id'] ) ) {
                $user_id = $request['user_id'];

                if ( ! user_can( $user_id, 'dokan_manage_withdraw' ) ) {
                    return new WP_Error( 'dokan_rest_withdraw_error', __( 'User does not have permission to withdraw', 'dokan-lite' ) );
                }
            }

            $note = $request['note'];
        } else {
            $note = '';
        }

        if ( empty( $user_id ) ) {
            return new WP_Error( 'dokan_rest_withdraw_error', __( 'No vendor found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $args = array(
            'user_id' => $user_id,
            'amount'  => $request['amount'],
            'date'    => current_time( 'mysql' ),
            'method'  => $request['method'],
            'note'    => $note,
            'ip'      => dokan_get_client_ip(),
        );

        $validate_request = dokan()->withdraw->is_valid_approval_request( $args );

        if ( is_wp_error( $validate_request ) ) {
            return new WP_Error( 'dokan_rest_withdraw_error', $validate_request->get_error_message(), array( 'status' => 400 ) );
        }

        $withdraw = dokan()->withdraw->create( $args );

        if ( is_wp_error( $withdraw ) ) {
            return $withdraw;
        }

        $response = $this->prepare_item_for_response( $withdraw, $request );
        $response = rest_ensure_response( $response );

        $response->set_status( 201 );
        $response->header( 'Location', rest_url( sprintf( '%s/%s/%d', $this->namespace, $this->rest_base, $withdraw->get_id() ) ) );

        return $response;
    }

    /**
     * Get a withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param \WP_Request $request
     *
     * @return \WP_REST_Response
     */
    public function get_item( $request ) {
        $withdraw = dokan()->withdraw->get( $request['id'] );
        $data     = $this->prepare_item_for_response( $withdraw, $request );

        return rest_ensure_response( $data );
    }

    /**
     * Cancel withdraw status
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function update_item( $request ) {
        global $wpdb;

        $withdraw = dokan()->withdraw->get( $request['id'] );

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            $validate_request = dokan()->withdraw->is_valid_cancellation_request( $withdraw->get_withdraw() );

            if ( is_wp_error( $validate_request )  ) {
                return new WP_Error( 'dokan_rest_withdraw_error', $validate_request->get_error_message(), array( 'status' => 422 ) );
            }

            // Vendors are allowed to cancel request only
            $withdraw->set_status( dokan()->withdraw->get_status_code( 'cancelled' ) );
        } else {
            if ( isset( $request['user_id'] ) ) {
                $withdraw->set_user_id( $request['user_id'] );
            }

            if ( isset( $request['amount'] ) ) {
                $withdraw->set_amount( $request['amount'] );
            }

            if ( isset( $request['status'] ) ) {
                if ( 'approved' === $request['status'] ) {
                    $validate_request = dokan()->withdraw->is_valid_approval_request( $withdraw->get_withdraw() );

                    if ( is_wp_error( $validate_request )  ) {
                        return new WP_Error( 'dokan_rest_withdraw_error', $validate_request->get_error_message(), array( 'status' => 422 ) );
                    }
                }

                $withdraw->set_status( dokan()->withdraw->get_status_code( $request['status'] ) );
            }

            if ( isset( $request['method'] ) ) {
                $withdraw->set_method( $request['method'] );
            }

            if ( isset( $request['note'] ) ) {
                $withdraw->set_note( $request['note'] );
            }
        }

        $withdraw->save();

        if ( is_wp_error( $withdraw ) ) {
            return $withdraw;
        }

        $response = $this->prepare_item_for_response( $withdraw, $request );

        return rest_ensure_response( $response );
    }

    /**
     * Delete a withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WP_REST_Request
     */
    public function delete_item( $request ) {
        $withdraw = dokan()->withdraw->get( $request['id'] );

        $withdraw->delete();

        $response = $this->prepare_item_for_response( $withdraw, $request );

        return rest_ensure_response( $response );
    }

    /**
     * Approve, Pending and cancel bulk action
     *
     * JSON data format for sending to API
     *     {
     *         "approved" : [
     *             "1", "9", "7"
     *         ],
     *         "pending" : [
     *             "2"
     *         ],
     *         "delete" : [
     *             "4"
     *         ],
     *         "cancelled" : [
     *             "5"
     *         ]
     *     }
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function batch_items( $request ) {
        $success = array();
        $failed  = array();

        foreach ( $request['approved'] as $id ) {
            $withdraw = dokan()->withdraw->get( $id );

            if ( ! $withdraw ) {
                $failed['approved'][] = $id;
            } else {
                $validate_request = dokan()->withdraw->is_valid_approval_request( $withdraw->get_withdraw() );

                if ( is_wp_error( $validate_request ) ) {
                    $failed['approved'][] = $id;
                } else {
                    $withdraw->set_status( dokan()->withdraw->get_status_code( 'approved' ) );
                    $withdraw = $withdraw->save();

                    if ( is_wp_error( $withdraw ) ) {
                        $failed['approved'][] = $id;
                    } else {
                        $success['approved'][] = $id;
                    }
                }
            }
        }

        foreach ( $request['cancelled'] as $id ) {
            $withdraw = dokan()->withdraw->get( $id );

            if ( ! $withdraw ) {
                $failed['cancelled'][] = $id;
            } else {
                $validate_request = dokan()->withdraw->is_valid_cancellation_request( $withdraw->get_withdraw() );

                if ( is_wp_error( $validate_request ) ) {
                    $failed['cancelled'][] = $id;
                } else {
                    $withdraw->set_status( dokan()->withdraw->get_status_code( 'cancelled' ) );
                    $withdraw = $withdraw->save();

                    if ( is_wp_error( $withdraw ) ) {
                        $failed['cancelled'][] = $id;
                    } else {
                        $success['cancelled'][] = $id;
                    }
                }
            }
        }

        foreach ( $request['delete'] as $id ) {
            $withdraw = dokan()->withdraw->get( $id );

            if ( ! $withdraw ) {
                $failed['delete'][] = $id;
            } else {
                $withdraw = $withdraw->delete();

                if ( is_wp_error( $withdraw ) ) {
                    $failed['delete'][] = $id;
                } else {
                    $success['delete'][] = $id;
                }
            }
        }

        return rest_ensure_response( array(
            'success' => $success,
            'failed'  => $failed,
        ) );
    }

    /**
     * Prepare data for response
     *
     * @since 2.8.0
     *
     * @return data
     */
    public function prepare_item_for_response( $withdraw, $request ) {
        $methods = dokan_withdraw_get_methods();
        $data = array(
            'id'           => absint( $withdraw->get_id() ),
            'user'         => $this->get_user_data( $withdraw->get_user_id() ),
            'amount'       => floatval( $withdraw->get_amount() ),
            'created'      => mysql_to_rfc3339( $withdraw->get_date() ),
            'status'       => dokan()->withdraw->get_status_name( $withdraw->get_status() ),
            'method'       => $withdraw->get_method(),
            'method_title' => array_key_exists( $withdraw->get_method(), $methods ) ? $methods[ $withdraw->get_method() ] : $withdraw->get_method(),
            'note'         => $withdraw->get_note(),
            'ip'           => $withdraw->get_ip()
        );

        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $withdraw, $request ) );

        return apply_filters( "dokan_rest_prepare_withdraw_object", $response, $withdraw, $request );
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
     * Prepare links for the request.
     *
     * @param WC_Data         $object  Object data.
     * @param WP_REST_Request $request Request object.
     *
     * @return array Links for the given post.
     */
    protected function prepare_links( $withdraw, $request ) {
        $links = array(
            'self' => array(
                'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->rest_base, $withdraw->get_id() ) ),
            ),
            'collection' => array(
                'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ),
            ),
        );

        return $links;
    }

    /**
     * Item schema
     *
     * @since DOKAN_LITE
     *
     * @return array
     */
    public function get_item_schema() {
        $schema = array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'Withdraw',
            'type'       => 'object',
            'properties' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view', 'edit' ),
                    'readonly'    => true,
                ),
                'user' => array(
                    'description' => __( 'Requested User', 'dokan-lite' ),
                    'type'        => 'object',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'user_id' => array(
                    'required'    => false,
                    'description' => __( 'Requested User ID', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'edit' ),
                ),
                'amount' => array(
                    'required'    => true,
                    'description' => __( 'The amount of discount. Should always be numeric, even if setting a percentage.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view', 'edit' ),
                ),
                'created_date' => array(
                    'description' => __( "The date the withdraw request has beed created in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'status' => array(
                    'required'    => false,
                    'description' => __( "Withdraw status", 'dokan-lite' ),
                    'type'        => 'string',
                    'enum'        => array( 'pending', 'approved', 'cancelled' ),
                    'context'     => array( 'view', 'edit' ),
                    'default'     => 'pending',
                ),
                'method' => array(
                    'required'    => true,
                    'description' => __( "Withdraw Method", 'dokan-lite' ),
                    'type'        => 'string',
                    'enum'        => array_keys( dokan_withdraw_register_methods() ),
                    'context'     => array( 'view', 'edit' ),
                ),
                'note'   => array(
                    'required'    => false,
                    'description' => __( "Withdraw Notes", 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view', 'edit' ),
                    'default'     => '',
                ),
                'ip'     => array(
                    'description' => __( "User IP", 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
            ),
        );

        return $this->add_additional_fields_schema( $schema );
    }

    /**
     * Schema for batch processing
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function get_public_batch_schema() {
        $schema = array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'batch',
            'type'       => 'object',
            'properties' => array(
                'approved'  => array(
                    'required'    => false,
                    'description' => __( 'List of withdraw IDs to be approved', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'edit' ),
                    'default'     => array(),
                    'items'       => array(
                        'type' => 'integer',
                    ),
                ),
                'cancelled' => array(
                    'required'    => false,
                    'description' => __( 'List of withdraw IDs to be cancelled', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'edit' ),
                    'default'     => array(),
                    'items'       => array(
                        'type' => 'integer',
                    ),
                ),
                'delete'    => array(
                    'required'    => false,
                    'description' => __( 'List of withdraw IDs to be deleted', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'edit' ),
                    'default'     => array(),
                    'items'       => array(
                        'type' => 'integer',
                    ),
                )
            ),
        );

        return $schema;
    }
}
