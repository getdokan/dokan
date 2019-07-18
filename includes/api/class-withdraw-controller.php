<?php

/**
* Dokan WIthdraw API Controller
*
* @since 2.8.0
*
* @package dokan
*/
class Dokan_REST_Withdraw_Controller extends WP_REST_Controller {

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
    protected $base = 'withdraw';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->base, array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_withdraws' ),
                'args'                => array_merge( $this->get_collection_params(),  array(
                    'status' => array(
                        'type'        => 'string',
                        'description' => __( 'Withdraw status', 'dokan-lite' ),
                        'required'    => false,
                    ),
                ) ),
                'permission_callback' => array( $this, 'get_withdraw_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_withdraw' ),
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
                'permission_callback' => array( $this, 'get_withdraw_permissions_check' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/', array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'change_withdraw_status' ),
                'args'                => array(
                    'status' => array(
                        'type'        => 'string',
                        'description' => __( 'Withdraw status', 'dokan-lite' ),
                        'required'    => false,
                    )
                ),
                'permission_callback' => array( $this, 'get_withdraw_permissions_check' ),
            ),

            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_withdraw' ),
                'permission_callback' => array( $this, 'delete_withdraw_permissions_check' ),
            ),

        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/note', array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_withdraw_note' ),
                'args'                => array(
                    'note' => array(
                        'description' => __( 'Withdraw Note', 'dokan-lite' ),
                        'type'        => 'string',
                        'required'    => false,
                    )
                ),
                'permission_callback' => array( $this, 'update_withdraw_note_permission' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/balance/', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_balance' ),
                'args'                => array(
                    'formatted' => array(
                        'type'        => 'boolean',
                        'description' => __( 'Formatted balance', 'dokan-lite' ),
                        'required'    => false,
                    )
                ),
                'permission_callback' => array( $this, 'get_withdraw_permissions_check' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/batch', array(
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'batch_items' ),
                'permission_callback' => array( $this, 'batch_items_permissions_check' ),
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
            ),
        ) );
    }

    /**
     * Map withdraw status
     *
     * @since 2.8.0
     *
     * @return array
     */
    protected function get_status( $status ) {
        $statuses = array(
            0 => 'pending',
            1 => 'approved',
            2 => 'cancelled'
        );

        if ( is_string( $status ) ) {
            return array_search( $status, $statuses );
        } else{
            return isset( $statuses[$status] ) ? $statuses[$status] : '';
        }

        return $statuses;
    }

    /**
     * Get withdraws
     *
     * @since 2.8.0
     *
     * @return object
     */
    public function get_withdraws( $request ) {
        $store_id = dokan_get_current_user_id();

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No vendor found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $status   = ! empty( $request['status'] ) ? sanitize_text_field( $request['status'] ) : '';
        $withdraw = new Dokan_Template_Withdraw();

        $limit  = (int) $request['per_page'];
        $offset = (int) ( $request['page'] - 1 ) * $request['per_page'];

        $withdraw_count = dokan_get_withdraw_count();

        if ( current_user_can( 'manage_options' ) ) {
            $store_id = '';
        }

        if ( ! empty( $status ) ) {
            if ( $status == 'pending' ) {
                $total_count = $withdraw_count['pending'];
            } elseif( $status == 'approved' ) {
                $total_count = $withdraw_count['completed'];
            } else {
                $total_count = $withdraw_count['cancelled'];
            }

            $withdraws = $withdraw->get_withdraw_requests( $store_id, $this->get_status( $status ), $limit, $offset );
        } else {
            $withdraws = $withdraw->get_all_withdraws( $store_id, $limit, $offset );
            $total_count = array_sum( $withdraw_count );
        }

        $data = array();
        foreach ( $withdraws as $key => $value ) {
            $resp   = $this->prepare_response_for_object( $value, $request );
            $data[] = $this->prepare_response_for_collection( $resp );
        }

        $response       = rest_ensure_response( $data );
        $withdraw_count = dokan_get_withdraw_count();

        $response->header( 'X-Status-Pending', $withdraw_count['pending'] );
        $response->header( 'X-Status-Completed', $withdraw_count['completed'] );
        $response->header( 'X-Status-Cancelled', $withdraw_count['cancelled'] );

        $response = $this->format_collection_response( $response, $request, $total_count );
        return $response;
    }

    /**
     * Cancel withdraw status
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function change_withdraw_status( $request ) {
        global $wpdb;

        $store_id = dokan_get_current_user_id();

        if ( empty( $request['id'] ) ) {
            return new WP_Error( 'no_id', __( 'Invalid ID', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $request_id = (int) $request['id'];

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No vendor found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $status = ! empty( $request['status'] ) ? sanitize_text_field( $request['status'] ) : 'cancelled';

        if ( $status != 'cancelled' && ! current_user_can( 'manage_options' ) ) {
            return new WP_Error( 'cancel_request', __( 'Vendor can only cancel withdraw request', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        // $sql    = "SELECT * FROM `{$wpdb->prefix}dokan_withdraw` WHERE `id`={$request['id']}";
        $result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}dokan_withdraw WHERE id=%d", $request_id ) );

        if ( $result->status != '0' && ! current_user_can( 'manage_options' ) ) {
            return new WP_Error( 'not_cancel_request', __( 'This withdraw is not pending. Only pending request can be cancelled', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        if ( $result->user_id != $store_id && ! current_user_can( 'manage_options' ) ) {
            return new WP_Error( 'other_vendor_withdraw', __( 'You can not cancel other vendor withdraw request', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        $withdraw = new Dokan_Template_Withdraw();

        if ( current_user_can( 'manage_options' ) ) {
            $user_id = $result->user_id;
            $status_code = $this->get_status( $status );
        } else {
            $user_id = $store_id;
            $status_code = 2;
        }

        // if its an approve request and don't have enough balance then return early
        if ( $status_code === 1 ) {
            if ( round( dokan_get_seller_balance( $result->user_id, false ), 2 ) < $result->amount ) {
                return;
            }

            // $balance_sql    = "SELECT * FROM `{$wpdb->prefix}dokan_vendor_balance` WHERE `trn_id`={$request['id']} AND `trn_type` = 'dokan_withdraw'";
            $balance_result = $wpdb->get_row(
                $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}dokan_vendor_balance WHERE trn_id=%d AND trn_type = %s", $request_id, 'dokan_withdraw' ) );

            if ( empty( $balance_result ) ) {
                $wpdb->insert( $wpdb->prefix . 'dokan_vendor_balance',
                    array(
                        'vendor_id'     => $user_id,
                        'trn_id'        => $request_id,
                        'trn_type'      => 'dokan_withdraw',
                        'perticulars'   => 'Approve withdraw request',
                        'debit'         => 0,
                        'credit'        => $result->amount,
                        'status'        => 'approved',
                        'trn_date'      => current_time( 'mysql' ),
                        'balance_date'  => current_time( 'mysql' ),
                    ),
                    array(
                        '%d',
                        '%d',
                        '%s',
                        '%s',
                        '%f',
                        '%f',
                        '%s',
                        '%s',
                        '%s',
                    )
                );
            }
        }

        $withdraw->update_status( $request_id, $user_id, $status_code );
        // $response = $wpdb->get_row( $sql );
        $response = $result;

        if ( $status_code === 1 ) {
            do_action( 'dokan_withdraw_request_approved', $user_id, $response );
        } elseif ( $status_code === 2 ) {
            do_action( 'dokan_withdraw_request_cancelled', $user_id, $response );
        }

        return rest_ensure_response( $this->prepare_response_for_object( $response, $request ) );
    }

    /**
     * Delete a withdraw
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function delete_withdraw( $request ) {
        global $wpdb;

        $withdraw_id = !empty( $request['id'] ) ? (int) $request['id'] : 0;

        if ( !$withdraw_id ) {
            return new WP_Error( 'no_id', __( 'Invalid ID', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        // $sql    = "SELECT * FROM `{$wpdb->prefix}dokan_withdraw` WHERE `id`={$withdraw_id}";
        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}dokan_withdraw WHERE id=%d", $withdraw_id
            )
        );

        if ( empty( $result->id ) ) {
            return new WP_Error( 'no_withdraw', __( 'No withdraw found for deleting', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $deleted = $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}dokan_withdraw WHERE id = %d", $withdraw_id ) );

        return rest_ensure_response( $this->prepare_response_for_object( $result, $request ) );
    }

    /**
     * Get balance
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_balance( $request ) {
        $store_id = dokan_get_current_user_id();

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No vendor found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $formatted = false;

        if ( $request['formatted'] ) {
            $formatted = true;
        }

        $balance        = dokan_get_seller_balance( $store_id, false );
        $withdraw_limit = dokan_get_option( 'withdraw_limit', 'dokan_withdraw', -1 );
        $threshold      = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', -1 );

        $data = array(
            'current_balance'    => $balance,
            'withdraw_limit'     => $withdraw_limit,
            'withdraw_threshold' => $threshold,
        );

        return rest_ensure_response( $data );
    }

    /**
     * Make a withdraw request
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function create_withdraw( $request ) {
        global $wpdb;
        $store_id = dokan_get_current_user_id();

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No vendor found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $amount  = (float) $request['amount'];
        $method  = sanitize_text_field( $request['method'] );
        $notes   = sanitize_textarea_field( $request['notes'] );
        $limit   = $this->get_withdraw_limit();
        $balance = dokan_get_seller_balance( $store_id, false );

        if ( empty( $amount ) ) {
            return new WP_Error( 'no_amount_found', __( 'Requested amount must be grater than 0', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( $amount > $balance ) {
            return new WP_Error( 'enough_balance', __( 'You don\'t have enough balance for this request', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( $amount < $limit ) {
            return new WP_Error( 'dokan_withdraw_amount', sprintf( __( 'Withdraw amount must be greater than %d', 'dokan-lite' ), $this->get_withdraw_limit() ), array( 'status' => 404 ) );
        }

        if ( empty( $method ) ) {
            return new WP_Error( 'no_payment_method', __( 'Withdraw method must be required', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $withdraw = new Dokan_Template_Withdraw();

        $data_info = array(
            'user_id' => $store_id,
            'amount'  => $amount,
            'status'  => 0,
            'method'  => $method,
            'ip'      => dokan_get_client_ip(),
            'notes'   => $notes
        );

        $update = $withdraw->insert_withdraw( $data_info );

        if ( ! $update ) {
            return new WP_Error( 'not_updated', __( 'Does not created withdraw request. Try again', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        unset( $data_info['user_id'] );

        $data_info['id']      = $wpdb->insert_id;
        $data_info['user']    = $this->get_user_data( $store_id );
        $data_info['created'] = mysql_to_rfc3339( date( 'Y-m-d h:i:s' ) );

        return rest_ensure_response( $data_info );
    }

    /**
     * Get the system withdraw limit
     *
     * @return integer
     */
    function get_withdraw_limit() {
        return (int) dokan_get_option( 'withdraw_limit', 'dokan_withdraw', 0 );
    }

    /**
     * Update withdraw notes
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function update_withdraw_note( $request ) {
        global $wpdb;

        $withdraw_id = isset( $request['id'] ) ? (int) $request['id'] : 0;
        $note        = isset( $request['note'] ) ? sanitize_textarea_field( $request['note'] ) : '';

        if ( empty( $withdraw_id ) ) {
            return new WP_Error( 'no_withdraw', __( 'No withdraw id found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $table_name = $wpdb->prefix . 'dokan_withdraw';
        $update     = $wpdb->update( $table_name, array( 'note' => $note ), array( 'id' => $withdraw_id ) );

        if ( ! $update ) {
            return new WP_Error( 'note_not_udpated', __( 'Something wrong, Note not updated', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        // $withdraw = $wpdb->get_row( "SELECT * from {$table_name} WHERE id = $withdraw_id" );
        $withdraw = $wpdb->get_row( $wpdb->prepare("SELECT * from {$wpdb->prefix}dokan_withdraw WHERE id = %d", $withdraw_id ) );

        $response = $this->prepare_response_for_object( $withdraw, $request );

        return $response;
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
        global $wpdb;

        $params = $request->get_params();

        if ( empty( $params ) ) {
            return new WP_Error( 'no_item_found', __( 'No items found for bulk updating', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $allowed_status = array( 'approved', 'cancelled', 'pending', 'delete' );

        foreach ( $params as $status => $value ) {
            if ( in_array( $status, $allowed_status ) ) {
                if ( 'delete' == $status ) {
                    foreach ( $value as $withdraw_id ) {
                        $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}dokan_withdraw WHERE id = %d", (int) $withdraw_id ) );
                    }
                } else {
                    foreach ( $value as $withdraw_id ) {
                        $status_code = $this->get_status( $status );
                        $user = $wpdb->get_row( $wpdb->prepare("SELECT user_id, amount FROM {$wpdb->prefix}dokan_withdraw WHERE id = %d", (int) $withdraw_id ) );

                        if ( $status_code === 1 ) {
                            if ( dokan_get_seller_balance( $user->user_id, false ) < $user->amount ) {
                                continue;
                            }

                            // $balance_sql    = "SELECT * FROM `{$wpdb->prefix}dokan_vendor_balance` WHERE `trn_id`={$withdraw_id} AND `trn_type` = 'dokan_withdraw'";
                            $balance_result = $wpdb->get_row(
                                $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}dokan_vendor_balance WHERE trn_id=%d AND trn_type = 'dokan_withdraw'", (int) $withdraw_id )
                            );

                            if ( ! count( $balance_result ) ) {
                                $wpdb->insert( $wpdb->prefix . 'dokan_vendor_balance',
                                    array(
                                        'vendor_id'     => (int) $user->user_id,
                                        'trn_id'        => (int) $withdraw_id,
                                        'trn_type'      => 'dokan_withdraw',
                                        'perticulars'   => 'Approve withdraw request',
                                        'debit'         => 0,
                                        'credit'        => (float) $user->amount,
                                        'status'        => 'approved',
                                        'trn_date'      => current_time( 'mysql' ),
                                        'balance_date'  => current_time( 'mysql' ),
                                    ),
                                    array(
                                        '%d',
                                        '%d',
                                        '%s',
                                        '%s',
                                        '%f',
                                        '%f',
                                        '%s',
                                        '%s',
                                        '%s',
                                    )
                                );
                            }
                        }

                        $wpdb->query( $wpdb->prepare(
                            "UPDATE {$wpdb->prefix}dokan_withdraw
                            SET status = %d WHERE id = %d",
                            (int) $status_code, (int) $withdraw_id
                        ) );
                    }
                }
            }
        }

        return true;
    }

    /**
     * Prepare data for response
     *
     * @since 2.8.0
     *
     * @return data
     */
    public function prepare_response_for_object( $object, $request ) {
        $methods = dokan_withdraw_get_methods();
        $data = array(
            'id'           => $object->id,
            'user'         => $this->get_user_data( $object->user_id ),
            'amount'       => floatval( $object->amount ),
            'created'      => mysql_to_rfc3339( $object->date ),
            'status'       => $this->get_status( (int) $object->status ),
            'method'       => $object->method,
            'method_title' => array_key_exists( $object->method, $methods ) ? $methods[ $object->method ] : $object->method,
            'note'         => $object->note,
            'ip'           => $object->ip
        );

        $response      = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $object, $request ) );

        return apply_filters( "dokan_rest_prepare_withdraw_object", $response, $object, $request );
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
                'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->base, $object->id ) ),
            ),
            'collection' => array(
                'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->base ) ),
            ),
        );

        return $links;
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
     * Check permission for getting withdraw
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_withdraw_permissions_check() {
        return current_user_can( 'dokan_manage_withdraw' );
    }

    /**
     * Check permission for deleting withdraw
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function delete_withdraw_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Check permission for getting withdraw
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function batch_items_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Update withdraw note permission
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function update_withdraw_note_permission() {
        return current_user_can( 'manage_options' );
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
     * Get the Coupon's schema, conforming to JSON Schema.
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
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'user' => array(
                    'description' => __( 'Requested User', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view' ),
                ),
                'amount' => array(
                    'description' => __( 'The amount of discount. Should always be numeric, even if setting a percentage.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                ),
                'created_data' => array(
                    'description' => __( "The date the withdraw request has beed created in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view' ),
                ),
                'status' => array(
                    'description' => __( "Withdraw status", 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view' ),
                ),
                'method' => array(
                    'description' => __( "Withdraw Method", 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                ),
                'notes' => array(
                    'description' => __( "Withdraw Notes", 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view', 'edit' ),
                ),
                'ip' => array(
                    'description' => __( "User IP", 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                ),
            ),
        );

        return $this->add_additional_fields_schema( $schema );
    }


}
