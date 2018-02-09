<?php

/**
* Dokan WIthdraw API Controller
*
* @since 2.8.0
*
* @package dokan
*/
class Dokan_Withdraw_Controller extends WP_REST_Controller {

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
            // array(
            //     'methods'             => WP_REST_Server::CREATABLE,
            //     'callback'            => array( $this, 'create_item' ),
            //     'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
            //     'permission_callback' => array( $this, 'create_product_permissions_check' ),
            // ),
            // 'schema' => array( $this, 'get_public_item_schema' ),
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

        $status = ! empty( $request['status'] ) ? $request['status'] : 'pending';
        $withdraw = new Dokan_Template_Withdraw();

        if ( ! empty( $status ) ) {
            $withdraws = $withdraw->get_withdraw_requests( $store_id, $this->get_status( $status ), $request['per_page'] );
        }

        $data = array();
        foreach ( $withdraws as $key => $value ) {
            $data[] = $this->prepare_response_for_object( $value, $request );
        }

        $response = rest_ensure_response( $data );
        return $response;
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
            'user'         => $this->get_user_data( $object, $request ),
            'amount'       => $object->amount,
            'created_data' => mysql_to_rfc3339( $object->date ),
            'status'       => $this->get_status( (int)$object->status ),
            'method'       => $object->method,
            'note'         => $object->note,
            'ip'           => $object->ip
        );

        return apply_filters( "dokan_rest_prepare_withdraw_object", $data );
    }

    /**
     * Get user data
     *
     * @since 2.8.0
     *
     * @return return object
     */
    public function get_user_data( $object, $request ) {
        $store_controller = new Dokan_Store_Controller();
        $user = new WP_User( $object->user_id );
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

}