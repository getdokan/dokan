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
                    'description' => __( 'Unique identifier for the object.' ),
                    'type'        => 'integer',
                ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'cancel_withdraw_status' ),
                'args'                => array(
                    'status' => array(
                        'type'        => 'string',
                        'description' => __( 'Withdraw status', 'dokan-lite' ),
                        'required'    => false,
                    )
                ),
                'permission_callback' => array( $this, 'get_withdraw_permissions_check' ),
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
            return new WP_Error( 'no_store_found', __( 'No vendor found' ), array( 'status' => 404 ) );
        }

        $status = ! empty( $request['status'] ) ? $request['status'] : '';
        $withdraw = new Dokan_Template_Withdraw();

        if ( ! empty( $status ) ) {
            $withdraws = $withdraw->get_withdraw_requests( $store_id, $this->get_status( $status ), 100 );
        } else {
            $withdraws = $withdraw->get_all_withdraws( $store_id );
        }

        $data = array();
        foreach ( $withdraws as $key => $value ) {
            $resp = $this->prepare_response_for_object( $value, $request );
            $data[] = $this->prepare_response_for_collection( $resp );
        }

        $response = rest_ensure_response( $data );
        return $response;
    }

    /**
     * Cancel withdraw status
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function cancel_withdraw_status( $request ) {
        global $wpdb;
        $store_id = dokan_get_current_user_id();

        if ( empty( $request['id'] ) ) {
            return new WP_Error( 'no_id', __( 'Invalid ID', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No vendor found' ), array( 'status' => 404 ) );
        }

        $status = ! empty( $request['status'] ) ? $request['status'] : 'cancelled';

        if ( $status != 'cancelled' ) {
            return new WP_Error( 'cancel_request', __( 'Vendor can only cancell withdraw status', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $sql    = "SELECT * FROM `{$wpdb->prefix}dokan_withdraw` WHERE `id`={$request['id']}";
        $result = $wpdb->get_row( $sql );

        if ( $result->status != '0' ) {
            return new WP_Error( 'not_cancel_request', __( 'This withdraw is not pending. Only pending request can be cancelled', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $withdraw = new Dokan_Template_Withdraw();
        $withdraw->update_status( $request['id'], $store_id, 2 );

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
            return new WP_Error( 'no_store_found', __( 'No vendor found' ), array( 'status' => 404 ) );
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

        $amount  = floatval( $request['amount'] );
        $method  = $request['method'];
        $notes   = $request['notes'];
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
            return new WP_Error( 'not_updated', __( 'Does not created withdraw request. Try again', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        unset( $data_info['user_id'] );

        $data_info['id']           = $wpdb->insert_id;
        $data_info['user']         = $this->get_user_data( $store_id, $request );
        $data_info['created_data'] = mysql_to_rfc3339( date( 'Y-m-d h:i:s' ) );

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
     * Prepare data for response
     *
     * @since 2.8.0
     *
     * @return data
     */
    public function prepare_response_for_object( $object, $request ) {
        $data = array(
            'id'           => $object->id,
            'user'         => $this->get_user_data( $object->user_id, $request ),
            'amount'       => floatval( $object->amount ),
            'created_data' => mysql_to_rfc3339( $object->date ),
            'status'       => $this->get_status( (int)$object->status ),
            'method'       => $object->method,
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
    public function get_user_data( $user_id, $request ) {
        $store_controller = new Dokan_REST_Store_Controller();
        $user = dokan()->vendor->get( $user_id );
        return $store_controller->prepare_item_for_response( $user, $request );
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
                    'context'     => array( 'view' ),
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