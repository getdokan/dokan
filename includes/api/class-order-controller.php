<?php

/**
* Dokan Order Controller Class
*
* @since 2.8.0
*
* @package dokan
*/
class Dokan_REST_Order_Controller extends Dokan_REST_Controller{

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
    protected $base = 'orders';

    /**
     * Post type
     *
     * @var string
     */
    protected $post_type = 'shop_order';

    /**
     * Post status
     */
    protected $post_status = array();

    /**
     * Stores the request.
     * @var array
     */
    protected $request = array();

    /**
     * Load autometically when class initiate
     *
     * @since 2.8.0
     *
     * @return array
     */
    public function __construct() {
        $this->post_status = array_keys( wc_get_order_statuses() );

        add_filter( 'woocommerce_new_order_data', array( $this, 'set_order_vendor_id' ) );
        add_action( 'woocommerce_rest_insert_shop_order_object', array( $this, 'after_order_create' ), 10, 2 );
    }

    /**
     * Register the routes for orders.
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->base, array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_items' ),
                'permission_callback' => array( $this, 'get_orders_permissions_check' ),
                'args'                => $this->get_collection_params(),
            ),
            'schema' => array( $this, 'get_public_item_schema' ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/', array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                )
            ),
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_item' ),
                'args'                => $this->get_collection_params(),
                'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
            ),

            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_item' ),
                'args'                => array(
                    'status' => array(
                        'type'        => 'string',
                        'description' => __( 'Order Status', 'dokan-lite' ),
                        'required'    => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    )
                ),
                'permission_callback' => array( $this, 'update_order_permissions_check' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/notes', array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                )
            ),
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_order_notes' ),
                'args'                => $this->get_collection_params(),
                'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_order_note' ),
                'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
                'args'                => array_merge( $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ), array(
                    'note' => array(
                        'type'        => 'string',
                        'description' => __( 'Order note content.', 'dokan-lite' ),
                        'required'    => true,
                    ),
                ) ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/notes/(?P<note_id>[\d]+)', array(
            'args' => array(
                'id' => array(
                    'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                    'type'        => 'integer',
                ),
                'note_id' => array(
                    'description' => __( 'Unique identifier for the note object.', 'dokan-lite' ),
                    'type'        => 'integer',
                )
            ),
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_order_note' ),
                'args'                => $this->get_collection_params(),
                'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_order_note' ),
                'args'                => $this->get_collection_params(),
                'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/summary', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_order_summary' ),
                'permission_callback' => array( $this, 'check_orders_summary_permissions' ),
                'args'                => $this->get_collection_params(),
            ),
            'schema' => array( $this, 'get_public_item_schema' ),
        ) );

    }

    /**
     * Get object.
     *
     * @since  2.8.0
     * @param  int $id Object ID.
     * @return WC_Data
     */
    public function get_object( $id ) {
        return wc_get_order( $id );
    }

    /**
     * Validation before update product
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function validation_before_update_item( $request ) {
        $store_id = dokan_get_current_user_id();

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No seller found', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $object = $this->get_object( (int) $request['id'] );

        if ( ! $object || 0 === $object->get_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Invalid ID.', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        $product_author = get_post_field( 'post_author', $object->get_id() );

        if ( $store_id != $product_author ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Sorry, you have no permission to do this. Since it\'s not your product.', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        return true;
    }

    /**
     * Get formatted item data.
     *
     * @since  3.0.0
     * @param  WC_Data $object WC_Data instance.
     * @return array
     */
    protected function get_formatted_item_data( $object ) {
        $data              = $object->get_data();
        $format_decimal    = array( 'discount_total', 'discount_tax', 'shipping_total', 'shipping_tax', 'shipping_total', 'shipping_tax', 'cart_tax', 'total', 'total_tax' );
        $format_date       = array( 'date_created', 'date_modified', 'date_completed', 'date_paid' );
        $format_line_items = array( 'line_items', 'tax_lines', 'shipping_lines', 'fee_lines', 'coupon_lines' );

        // Format decimal values.
        foreach ( $format_decimal as $key ) {
            $data[ $key ] = wc_format_decimal( $data[ $key ], $this->request['dp'] );
        }

        // Format date values.
        foreach ( $format_date as $key ) {
            $datetime              = $data[ $key ];
            $data[ $key ]          = wc_rest_prepare_date_response( $datetime, false );
            $data[ $key . '_gmt' ] = wc_rest_prepare_date_response( $datetime );
        }

        // Format the order status.
        $data['status'] = 'wc-' === substr( $data['status'], 0, 3 ) ? substr( $data['status'], 3 ) : $data['status'];

        // Format line items.
        foreach ( $format_line_items as $key ) {
            $data[ $key ] = array_values( array_map( array( $this, 'get_order_item_data' ), $data[ $key ] ) );
        }

        // Refunds.
        $data['refunds'] = array();
        foreach ( $object->get_refunds() as $refund ) {
            $data['refunds'][] = array(
                'id'     => $refund->get_id(),
                'refund' => $refund->get_reason() ? $refund->get_reason() : '',
                'total'  => '-' . wc_format_decimal( $refund->get_amount(), $this->request['dp'] ),
            );
        }

        return array(
            'id'                   => $object->get_id(),
            'parent_id'            => $data['parent_id'],
            'number'               => $data['number'],
            'order_key'            => $data['order_key'],
            'created_via'          => $data['created_via'],
            'version'              => $data['version'],
            'status'               => $data['status'],
            'currency'             => $data['currency'],
            'date_created'         => $data['date_created'],
            'date_created_gmt'     => $data['date_created_gmt'],
            'date_modified'        => $data['date_modified'],
            'date_modified_gmt'    => $data['date_modified_gmt'],
            'discount_total'       => $data['discount_total'],
            'discount_tax'         => $data['discount_tax'],
            'shipping_total'       => $data['shipping_total'],
            'shipping_tax'         => $data['shipping_tax'],
            'cart_tax'             => $data['cart_tax'],
            'total'                => $data['total'],
            'total_tax'            => $data['total_tax'],
            'prices_include_tax'   => $data['prices_include_tax'],
            'customer_id'          => $data['customer_id'],
            'customer_ip_address'  => $data['customer_ip_address'],
            'customer_user_agent'  => $data['customer_user_agent'],
            'customer_note'        => $data['customer_note'],
            'billing'              => $data['billing'],
            'shipping'             => $data['shipping'],
            'payment_method'       => $data['payment_method'],
            'payment_method_title' => $data['payment_method_title'],
            'transaction_id'       => $data['transaction_id'],
            'date_paid'            => $data['date_paid'],
            'date_paid_gmt'        => $data['date_paid_gmt'],
            'date_completed'       => $data['date_completed'],
            'date_completed_gmt'   => $data['date_completed_gmt'],
            'cart_hash'            => $data['cart_hash'],
            'meta_data'            => $data['meta_data'],
            'line_items'           => $data['line_items'],
            'tax_lines'            => $data['tax_lines'],
            'shipping_lines'       => $data['shipping_lines'],
            'fee_lines'            => $data['fee_lines'],
            'coupon_lines'         => $data['coupon_lines'],
            'refunds'              => $data['refunds'],
        );
    }

    /**
     * Prepare a single order output for response.
     *
     * @since  2.8.0
     *
     * @param  WC_Data         $object  Object data.
     * @param  WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function prepare_data_for_response( $object, $request ) {
        $this->request = $request;
        $data          = $this->get_formatted_item_data( $object );
        $response      = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $object, $request ) );
        return apply_filters( "dokan_rest_prepare_{$this->post_type}_object", $response, $object, $request );
    }

    /**
     * Prepare data for udpate into database
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function prepare_object_for_database( $request ) {
        $id             = isset( $request['id'] ) ? absint( $request['id'] ) : 0;
        $status         = isset( $request['status'] ) ? $request['status'] : '';
        $order_statuses = wc_get_order_statuses();

        if ( empty( $id ) ) {
            return new WP_Error( "dokan_rest_invalid_{$this->post_type}_id", __( 'Invalid order ID', 'dokan-lite' ), array(
                'status' => 404,
            ) );
        }

        if ( empty( $status ) ) {
            return new WP_Error( "dokan_rest_empty_{$this->post_type}_status", __( 'Order status must me required', 'dokan-lite' ), array(
                'status' => 404,
            ) );
        }

        if ( ! in_array( $status, array_keys( $order_statuses ) ) ) {
            return new WP_Error( "dokan_rest_invalid_{$this->post_type}_status", __( 'Order status not valid', 'dokan-lite' ), array(
                'status' => 404,
            ) );
        }

        $order = wc_get_order( $id );

        if ( ! $order ) {
            return new WP_Error( "dokan_rest_invalid_order", __( 'Invalid order', 'dokan-lite' ), array(
                'status' => 404,
            ) );
        }

        $order->set_status( $status );

        return apply_filters( "dokan_rest_pre_insert_{$this->post_type}_object", $order, $request );
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
                'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->rest_base, $object->get_id() ) ),
            ),
            'collection' => array(
                'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ),
            ),
        );

        if ( 0 !== (int) $object->get_customer_id() ) {
            $links['customer'] = array(
                'href' => rest_url( sprintf( '/%s/customers/%d', $this->namespace, $object->get_customer_id() ) ),
            );
        }

        if ( 0 !== (int) $object->get_parent_id() ) {
            $links['up'] = array(
                'href' => rest_url( sprintf( '/%s/orders/%d', $this->namespace, $object->get_parent_id() ) ),
            );
        }

        return $links;
    }

    /**
     * Get order summary report
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_order_summary( $request ) {
        $seller_id = dokan_get_current_user_id();

        $data = array(
            'orders_data'   => dokan_count_orders( $seller_id ),
        );

        return rest_ensure_response( reset( $data ) );
    }

    /**
     * Expands an order item to get its data.
     *
     * @param WC_Order_item $item
     *
     * @return array
     */
    protected function get_order_item_data( $item ) {
        $data           = $item->get_data();
        $format_decimal = array( 'subtotal', 'subtotal_tax', 'total', 'total_tax', 'tax_total', 'shipping_tax_total' );

        // Format decimal values.
        foreach ( $format_decimal as $key ) {
            if ( isset( $data[ $key ] ) ) {
                $data[ $key ] = wc_format_decimal( $data[ $key ], $this->request['dp'] );
            }
        }

        // Add SKU and PRICE to products.
        if ( is_callable( array( $item, 'get_product' ) ) ) {
            $data['sku']   = $item->get_product() ? $item->get_product()->get_sku(): null;
            $data['price'] = (float)( $item->get_total() / max( 1, $item->get_quantity() ) );
        }

        // Format taxes.
        if ( ! empty( $data['taxes']['total'] ) ) {
            $taxes = array();

            foreach ( $data['taxes']['total'] as $tax_rate_id => $tax ) {
                $taxes[] = array(
                    'id'       => $tax_rate_id,
                    'total'    => $tax,
                    'subtotal' => isset( $data['taxes']['subtotal'][ $tax_rate_id ] ) ? $data['taxes']['subtotal'][ $tax_rate_id ] : '',
                );
            }
            $data['taxes'] = $taxes;
        } elseif ( isset( $data['taxes'] ) ) {
            $data['taxes'] = array();
        }

        // Remove names for coupons, taxes and shipping.
        if ( isset( $data['code'] ) || isset( $data['rate_code'] ) || isset( $data['method_title'] ) ) {
            unset( $data['name'] );
        }

        // Remove props we don't want to expose.
        unset( $data['order_id'] );
        unset( $data['type'] );

        return $data;
    }

    /**
     * Get order notes from an order.
     *
     * @param WP_REST_Request $request
     *
     * @return array|WP_Error
     */
    public function get_order_notes( $request ) {
        $order           = wc_get_order( (int) $request['id'] );
        $order_author_id = get_post_field( 'post_author', $order->get_id() );

        if ( $order_author_id != dokan_get_current_user_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_incorrect_order_author", __( 'You have no permission to view this notes', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( ! $order || $this->post_type !== $order->get_type() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Invalid order ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $args = array(
            'post_id' => $order->get_id(),
            'approve' => 'approve',
            'type'    => 'order_note',
        );

        // Allow filter by order note type.
        if ( 'customer' === $request['type'] ) {
            $args['meta_query'] = array(
                array(
                    'key'     => 'is_customer_note',
                    'value'   => 1,
                    'compare' => '=',
                ),
            );
        } elseif ( 'internal' === $request['type'] ) {
            $args['meta_query'] = array(
                array(
                    'key'     => 'is_customer_note',
                    'compare' => 'NOT EXISTS',
                ),
            );
        }

        remove_filter( 'comments_clauses', array( 'WC_Comments', 'exclude_order_comments' ), 10, 1 );

        $notes = get_comments( $args );

        add_filter( 'comments_clauses', array( 'WC_Comments', 'exclude_order_comments' ), 10, 1 );

        $data = array();
        foreach ( $notes as $note ) {
            $order_note = $this->prepare_item_for_response( $note, $request );
            $order_note = $this->prepare_response_for_collection( $order_note );
            $data[]     = $order_note;
        }

        return rest_ensure_response( $data );
    }

    /**
     * Create note for an Order
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function create_order_note( $request ) {
        if ( ! empty( $request['note_id'] ) ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_exists", sprintf( __( 'Cannot create existing %s.', 'dokan-lite' ), $this->post_type ), array( 'status' => 400 ) );
        }

        $order = wc_get_order( (int) $request['id'] );
        $order_author_id = get_post_field( 'post_author', $order->get_id() );

        if ( $order_author_id != dokan_get_current_user_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_incorrect_order_author", __( 'You have no permission to create this notes', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( ! $order || $this->post_type !== $order->get_type() ) {
            return new WP_Error( 'woocommerce_rest_order_invalid_id', __( 'Invalid order ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        // Create the note.
        $note_id = $order->add_order_note( $request['note'], $request['customer_note'] );

        if ( ! $note_id ) {
            return new WP_Error( 'dokan_api_cannot_create_order_note', __( 'Cannot create order note, please try again.', 'dokan-lite' ), array( 'status' => 500 ) );
        }

        $note = get_comment( $note_id );
        $this->update_additional_fields_for_object( $note, $request );

        do_action( 'dokan_rest_insert_order_note', $note, $request, true );

        $request->set_param( 'context', 'edit' );
        $response = $this->prepare_item_for_response( $note, $request );
        $response = rest_ensure_response( $response );
        $response->set_status( 201 );
        $response->header( 'Location', rest_url( sprintf( '/%s/%s/%d', $this->namespace, str_replace( '(?P<id>[\d]+)', $order->get_id(), $this->rest_base ), $note_id ) ) );

        return $response;

    }

    /**
     * Get a single order note.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_order_note( $request ) {
        $id    = (int) $request['note_id'];
        $order = wc_get_order( (int) $request['id'] );

        $order_author_id = get_post_field( 'post_author', $order->get_id() );

        if ( $order_author_id != dokan_get_current_user_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_incorrect_order_author", __( 'You have no permission to view this notes', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( ! $order || $this->post_type !== $order->get_type() ) {
            return new WP_Error( 'dokan_rest_order_invalid_id', __( 'Invalid order ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $note = get_comment( $id );

        if ( empty( $id ) || empty( $note ) || intval( $note->comment_post_ID ) !== intval( $order->get_id() ) ) {
            return new WP_Error( 'dokan_rest_invalid_id', __( 'Invalid resource ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $order_note = $this->prepare_item_for_response( $note, $request );
        $response   = rest_ensure_response( $order_note );

        return $response;
    }

    /**
     * Delete a single order note.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error
     */
    public function delete_order_note( $request ) {
        $id              = (int) $request['note_id'];
        $order           = wc_get_order( (int) $request['id'] );
        $order_author_id = get_post_field( 'post_author', $order->get_id() );

        if ( $order_author_id != dokan_get_current_user_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_incorrect_order_author", __( 'You have no permission to view this notes', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( ! $order || $this->post_type !== $order->get_type() ) {
            return new WP_Error( 'woocommerce_rest_order_invalid_id', __( 'Invalid order ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $note = get_comment( $id );

        if ( empty( $id ) || empty( $note ) || intval( $note->comment_post_ID ) !== intval( $order->get_id() ) ) {
            return new WP_Error( 'dokan_rest_invalid_id', __( 'Invalid resource ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $request->set_param( 'context', 'edit' );
        $response = $this->prepare_item_for_response( $note, $request );

        $result = wc_delete_order_note( $note->comment_ID );

        if ( ! $result ) {
            return new WP_Error( 'dokan_rest_cannot_delete', sprintf( __( 'The %s cannot be deleted.', 'dokan-lite' ), 'order_note' ), array( 'status' => 500 ) );
        }

        do_action( 'dokan_rest_delete_order_note', $note, $response, $request );

        return $response;
    }

    /**
     * Prepare a single order note output for response.
     *
     * @param WP_Comment $note Order note object.
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response $response Response data.
     */
    public function prepare_item_for_response( $note, $request ) {
        $data = array(
            'id'               => (int) $note->comment_ID,
            'date_created'     => wc_rest_prepare_date_response( $note->comment_date ),
            'date_created_gmt' => wc_rest_prepare_date_response( $note->comment_date_gmt ),
            'note'             => $note->comment_content,
            'customer_note'    => (bool) get_comment_meta( $note->comment_ID, 'is_customer_note', true ),
        );

        $context = ! empty( $request['context'] ) ? $request['context'] : 'view';
        $data    = $this->add_additional_fields_to_object( $data, $request );
        $data    = $this->filter_response_by_context( $data, $context );

        // Wrap the data in a response object.
        $response = rest_ensure_response( $data );

        return apply_filters( 'dokan_rest_prepare_order_note', $response, $note, $request );
    }

    /**
     * Checking if have any permission to view orders
     *
     * @since 2.8.0
     *
     * @return boolean
     */
    public function get_orders_permissions_check() {
        return current_user_can( 'dokan_view_order_menu' );
    }

    /**
     * Checking if have any permission to view orders
     *
     * @since 2.8.0
     *
     * @return boolean
     */
    public function get_single_order_permissions_check() {
        return current_user_can( 'dokan_view_order' );
    }

    /**
     * Updat order permission checking
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function update_order_permissions_check() {
        if ( ! current_user_can( 'dokan_manage_order' ) ) {
            return false;
        }

        $has_admin_permission = dokan_get_option( 'order_status_change', 'dokan_selling', 'on' );

        if ( 'off' == $has_admin_permission ) {
            return false;
        }

        return true;
    }

    /**
     * Checking if have any permission to view orders
     *
     * @since 2.8.0
     *
     * @return boolean
     */
    public function check_orders_summary_permissions() {
        return current_user_can( 'dokan_view_order_report' );
    }

    /**
     * Set vendor ID on order when creating from REST API
     *
     * @since 2.8.2
     *
     * @param array $args
     *
     * @return array
     */
    public function set_order_vendor_id( $args ) {

        if ( defined( 'REST_REQUEST' ) ) {
            $args['post_author'] = dokan_get_current_user_id();
        }

        return $args;
    }

    /**
     * Insert into Dokan sync table once an order is created via API
     *
     * @since 2.8.2 [<description>]
     *
     * @param  WC_Order $object
     * @param  WP_REST_Request $request
     *
     * @return void
     */
    public function after_order_create( $object, $request ) {
        dokan()->orders->maybe_split_orders( $object->get_id() );
    }
}