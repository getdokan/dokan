<?php

namespace WeDevs\Dokan\REST;

use WC_Order;
use WC_Order_Refund;
use WP_Comment;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WeDevs\Dokan\Abstracts\DokanRESTController;

/**
* Dokan Order Controller Class
*
* @since 2.8.0
*
* @package dokan
*/
class OrderController extends DokanRESTController {

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
        add_filter( 'woocommerce_rest_pre_insert_shop_order_object', array( $this, 'pre_insert_shop_order' ), 10, 3 );
        add_action( 'woocommerce_rest_insert_shop_order_object', array( $this, 'after_order_create' ), 10, 2 );
    }

    /**
     * Register the routes for orders.
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base, array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_orders_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
            )
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/', array(
				'args' => array(
					'id' => array(
						'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
						'type'        => 'integer',
					),
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
						),
					),
					'permission_callback' => array( $this, 'update_order_permissions_check' ),
				),
            )
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/notes', array(
				'args' => array(
					'id' => array(
						'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
						'type'        => 'integer',
					),
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
					'args'                => array_merge(
						$this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ), array(
							'note' => array(
								'type'        => 'string',
								'description' => __( 'Order note content.', 'dokan-lite' ),
								'required'    => true,
							),
						)
					),
				),
            )
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/notes/(?P<note_id>[\d]+)', array(
				'args' => array(
					'id' => array(
						'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
						'type'        => 'integer',
					),
					'note_id' => array(
						'description' => __( 'Unique identifier for the note object.', 'dokan-lite' ),
						'type'        => 'integer',
					),
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
            )
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/summary', array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_order_summary' ),
					'permission_callback' => array( $this, 'check_orders_summary_permissions' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
            )
        );
    }

    /**
     * Get object.
     *
     * @since  2.8.0
     *
     * @param  int $id Object ID.
     *
     * @return bool|WC_Order|WC_Order_Refund
     */
    public function get_object( $id ) {
        return wc_get_order( $id );
    }

    /**
     * Validation before update product
     *
     * @since 2.8.0
     *
     * @return bool|WP_Error
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

        $product_author = dokan_get_seller_id_by_order( $object->get_id() );

        if ( $store_id !== intval( $product_author ) ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Sorry, you have no permission to do this. Since it\'s not your product.', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        return true;
    }

    /**
     * Get formatted item data.
     *
     * @since  3.0.0
     * @param  \WC_Data $object WC_Data instance.
     * @return array
     */
    protected function get_formatted_item_data( $object ) {
        $data              = $object->get_data();
        $format_decimal    = array( 'discount_total', 'discount_tax', 'shipping_total', 'shipping_tax', 'shipping_total', 'shipping_tax', 'cart_tax', 'total', 'total_tax' );
        $format_date       = array( 'date_created', 'date_modified', 'date_completed', 'date_paid' );
        $format_line_items = array( 'line_items', 'tax_lines', 'shipping_lines', 'fee_lines', 'coupon_lines' );

        // Format decimal values.
        foreach ( $format_decimal as $key ) {
            $data[ $key ] = wc_format_decimal( $data[ $key ], '' );
        }

        // Format date values.
        foreach ( $format_date as $key ) {
            $datetime              = $data[ $key ];
            $data[ $key ]          = wc_rest_prepare_date_response( $datetime, false );
            $data[ $key . '_gmt' ] = wc_rest_prepare_date_response( $datetime );
        }

        // Format the order status.
        $data['status'] = 'wc-' === substr( $data['status'], 0, 3 ) ? substr( $data['status'], 3 ) : $data['status'];

        // Order shipment status.
        $data['order_shipment'] = function_exists( 'dokan_get_order_shipment_current_status' ) ? dokan_get_order_shipment_current_status( $data['id'], true ) : '--';

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
                'total'  => '-' . wc_format_decimal( $refund->get_amount(), '' ),
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
            'order_shipment'       => $data['order_shipment'],
        );
    }

    /**
     * Prepare a single order output for response.
     *
     * @since  2.8.0
     *
     * @param  \WC_Data         $object  Object data.
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
     * @return WP_Error|WC_Order|WC_Order_Refund
     */
    public function prepare_object_for_database( $request ) {
        $id             = isset( $request['id'] ) ? absint( $request['id'] ) : 0;
        $status         = isset( $request['status'] ) ? sanitize_text_field( $request['status'] ) : '';
        $order_statuses = wc_get_order_statuses();

        if ( empty( $id ) ) {
            return new WP_Error(
                "dokan_rest_invalid_{$this->post_type}_id", __( 'Invalid order ID', 'dokan-lite' ), array(
					'status' => 404,
                )
            );
        }

        if ( empty( $status ) ) {
            return new WP_Error(
                "dokan_rest_empty_{$this->post_type}_status", __( 'Order status must me required', 'dokan-lite' ), array(
					'status' => 404,
                )
            );
        }

        if ( ! in_array( $status, array_keys( $order_statuses ), true ) ) {
            return new WP_Error(
                "dokan_rest_invalid_{$this->post_type}_status", __( 'Order status not valid', 'dokan-lite' ), array(
					'status' => 404,
                )
            );
        }

        $order = wc_get_order( $id );

        if ( ! $order ) {
            return new WP_Error(
                'dokan_rest_invalid_order', __( 'Invalid order', 'dokan-lite' ), array(
					'status' => 404,
                )
            );
        }

        $order->set_status( $status );

        return apply_filters( "dokan_rest_pre_insert_{$this->post_type}_object", $order, $request );
    }

    /**
     * Prepare links for the request.
     *
     * @param \WC_Data         $object  Object data.
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
     * Get a collection of posts.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_items( $request ) {
        $args = [
            'status'      => $request['status'],
            'order_date'  => $request['order_date'],
            'limit'       => $request['per_page'],
            'paged'       => isset( $request['page'] ) ? absint( $request['page'] ) : 1,
            'customer_id' => $request['customer_id'],
            'seller_id'   => dokan_get_current_user_id(),
            'date'        => [
                'from' => isset( $request['after'] ) ? sanitize_text_field( wp_unslash( $request['after'] ) ) : '',
                'to'   => isset( $request['before'] ) ? sanitize_text_field( wp_unslash( $request['before'] ) ) : '',
            ]
        ];

        if ( ! empty( $request['search'] ) ) {
            $args['search'] = absint( $request['search'] );
        }

        $orders = dokan()->order->all( $args );

        $data_objects = array();
        $total_orders = 0;

        if ( ! empty( $orders ) ) {
            foreach ( $orders as $wc_order ) {
                $data           = $this->prepare_data_for_response( $wc_order, $request );
                $data_objects[] = $this->prepare_response_for_collection( $data );
            }

            $order_counts = dokan_count_orders( $request['seller_id'] );
            $total_orders = $order_counts->total;
        }

        $response = rest_ensure_response( $data_objects );
        $response = $this->format_collection_response( $response, $request, $total_orders );

        return $response;
    }

    /**
     * Get order summary report
     *
     * @since 2.8.0
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_order_summary( $request ) {
        $seller_id = dokan_get_current_user_id();

        $data = array(
            'orders_data' => dokan_count_orders( $seller_id ),
        );

        return rest_ensure_response( reset( $data ) );
    }

    /**
     * Expands an order item to get its data.
     *
     * @param \WC_Order_item $item
     *
     * @return array
     */
    protected function get_order_item_data( $item ) {
        $data           = $item->get_data();
        $format_decimal = array( 'subtotal', 'subtotal_tax', 'total', 'total_tax', 'tax_total', 'shipping_tax_total' );

        // Format decimal values.
        foreach ( $format_decimal as $key ) {
            if ( isset( $data[ $key ] ) ) {
                $data[ $key ] = wc_format_decimal( $data[ $key ], '' );
            }
        }

        // Add SKU and PRICE to products.
        if ( is_callable( array( $item, 'get_product' ) ) ) {
            $data['sku']   = $item->get_product() ? $item->get_product()->get_sku() : null;
            $data['image'] = ( is_a( $item->get_product(), \WC_Product::class ) && wp_get_attachment_image_url( $item->get_product()->get_image_id() ) ) ? wp_get_attachment_image_url( $item->get_product()->get_image_id(), 'full' ) : wc_placeholder_img_src();
            $data['price'] = (float) ( $item->get_total() / max( 1, $item->get_quantity() ) );
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
        $order = wc_get_order( (int) $request['id'] );

        if ( ! $order || $this->post_type !== $order->get_type() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Invalid order ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $order_author_id = (int) dokan_get_seller_id_by_order( $order->get_id() );

        if ( $order_author_id !== dokan_get_current_user_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_incorrect_order_author", __( 'You have no permission to view this notes', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $args = array(
            'post_id' => $order->get_id(),
            'approve' => 'approve',
            'type'    => 'order_note',
        );

        // Allow filter by order note type.
        if ( 'customer' === $request['type'] ) {
            $args['meta_query'] = array( // phpcs:ignore
                array(
                    'key'     => 'is_customer_note',
                    'value'   => 1,
                    'compare' => '=',
                ),
            );
        } elseif ( 'internal' === $request['type'] ) {
            $args['meta_query'] = array( // phpcs:ignore
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
            $order_note = $this->prepare_note_item_for_response( $note, $request );
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
     * @return WP_REST_Response|WP_Error
     */
    public function create_order_note( $request ) {
        if ( ! empty( $request['note_id'] ) ) {
            // translators: 1) %s: post type name
            return new WP_Error( "dokan_rest_{$this->post_type}_exists", sprintf( __( 'Cannot create existing %s.', 'dokan-lite' ), $this->post_type ), array( 'status' => 400 ) );
        }

        $order = wc_get_order( (int) $request['id'] );
        $order_author_id = (int) dokan_get_seller_id_by_order( $order->get_id() );

        if ( $order_author_id !== dokan_get_current_user_id() ) {
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
        $response = $this->prepare_note_item_for_response( $note, $request );
        $response = rest_ensure_response( $response );
        $response->set_status( 201 );
        $response->header( 'Location', rest_url( sprintf( '/%s/%s/%d', $this->namespace, str_replace( '(?P<id>[\d]+)', $order->get_id(), $this->rest_base ), $note_id ) ) );

        return $response;
    }

    /**
     * Get a single order note.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_order_note( $request ) {
        $id    = (int) $request['note_id'];
        $order = wc_get_order( (int) $request['id'] );

        $order_author_id = (int) dokan_get_seller_id_by_order( $order->get_id() );

        if ( $order_author_id !== dokan_get_current_user_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_incorrect_order_author", __( 'You have no permission to view this notes', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        if ( ! $order || $this->post_type !== $order->get_type() ) {
            return new WP_Error( 'dokan_rest_order_invalid_id', __( 'Invalid order ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $note = get_comment( $id );

        if ( empty( $id ) || empty( $note ) || intval( $note->comment_post_ID ) !== intval( $order->get_id() ) ) {
            return new WP_Error( 'dokan_rest_invalid_id', __( 'Invalid resource ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $order_note = $this->prepare_note_item_for_response( $note, $request );
        $response   = rest_ensure_response( $order_note );

        return $response;
    }

    /**
     * Delete a single order note.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function delete_order_note( $request ) {
        $id              = (int) $request['note_id'];
        $order           = wc_get_order( (int) $request['id'] );
        $order_author_id = (int) dokan_get_seller_id_by_order( $order->get_id() );

        if ( $order_author_id !== dokan_get_current_user_id() ) {
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
        $response = $this->prepare_note_item_for_response( $note, $request );

        $result = wc_delete_order_note( $note->comment_ID );

        if ( ! $result ) {
            return new WP_Error( 'dokan_rest_cannot_delete', sprintf( __( 'Given order note cannot be deleted.', 'dokan-lite' ) ), array( 'status' => 500 ) );
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
    public function prepare_note_item_for_response( $note, $request ) {
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
    public function get_single_order_permissions_check( $request ) {
        if ( current_user_can( 'shop_manager' ) || current_user_can( 'administrator' ) ) {
            return true;
        }

        $seller_id = dokan_get_seller_id_by_order( $request['id'] );

        if ( $seller_id === get_current_user_id() ) {
            return true;
        }

        return false;
    }

    /**
     * Updat order permission checking
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function update_order_permissions_check() {
        if ( ! current_user_can( 'dokan_manage_order' ) ) {
            return false;
        }

        $has_admin_permission = dokan_get_option( 'order_status_change', 'dokan_selling', 'on' );

        if ( 'off' === $has_admin_permission ) {
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
     * Mark order as parent when it has products from multiple vendors
     *
     * @since 2.9.11
     *
     * @param WC_Order        $order
     * @param WP_REST_Request $request
     * @param bool            $creating
     *
     * @return WC_Order
     */
    public function pre_insert_shop_order( $order, $request, $creating ) {
        if ( $creating ) {
            $vendors = dokan_get_sellers_by( $order );

            if ( count( $vendors ) > 1 ) {
                $order->update_meta_data( 'has_sub_order', true );
            }
        }

        return $order;
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
        dokan()->order->maybe_split_orders( $object->get_id() );
    }

    /**
     * Get order statuses without prefixes.
     *
     * @return array
     */
    protected function get_order_statuses() {
        $order_statuses = array();

        foreach ( array_keys( wc_get_order_statuses() ) as $status ) {
            $order_statuses[] = str_replace( 'wc-', '', $status );
        }

        return $order_statuses;
    }

    /**
     * Get the Order's schema, conforming to JSON Schema.
     *
     * @return array
     */
    public function get_item_schema() {
        $schema = array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => $this->post_type,
            'type'       => 'object',
            'properties' => array(
                'id'                   => array(
                    'description' => __( 'Unique identifier for the resource.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view', 'edit' ),
                    'readonly'    => true,
                ),
                'parent_id'            => array(
                    'description' => __( 'Parent order ID.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view' ),
                ),
                'seller_id'            => array(
                    'description' => __( 'Orders belongs to specific seller', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view' ),
                ),
                'number'               => array(
                    'description' => __( 'Order number.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'order_key'            => array(
                    'description' => __( 'Order key.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'created_via'          => array(
                    'description' => __( 'Shows where the order was created.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'version'              => array(
                    'description' => __( 'Version of WooCommerce which last updated the order.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'status'               => array(
                    'description' => __( 'Order status.', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => 'all',
                    'enum'        => $this->get_order_statuses(),
                    'context'     => array( 'view', 'edit' ),
                ),
                'currency'             => array(
                    'description' => __( 'Currency the order was created with, in ISO format.', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => get_woocommerce_currency(),
                    'enum'        => array_keys( get_woocommerce_currencies() ),
                    'context'     => array( 'view' ),
                ),
                'date_created'         => array(
                    'description' => __( "The date the order was created, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'default'     => null,
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'date_created_gmt'     => array(
                    'description' => __( 'The date the order was created, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'date_modified'        => array(
                    'description' => __( "The date the order was last modified, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view', 'edit' ),
                    'readonly'    => true,
                ),
                'date_modified_gmt'    => array(
                    'description' => __( 'The date the order was last modified, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view', 'edit' ),
                    'readonly'    => true,
                ),
                'discount_total'       => array(
                    'description' => __( 'Total discount amount for the order.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'discount_tax'         => array(
                    'description' => __( 'Total discount tax amount for the order.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'shipping_total'       => array(
                    'description' => __( 'Total shipping amount for the order.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'shipping_tax'         => array(
                    'description' => __( 'Total shipping tax amount for the order.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'cart_tax'             => array(
                    'description' => __( 'Sum of line item taxes only.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'total'                => array(
                    'description' => __( 'Grand total.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'total_tax'            => array(
                    'description' => __( 'Sum of all taxes.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'prices_include_tax'   => array(
                    'description' => __( 'True the prices included tax during checkout.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'customer_id'          => array(
                    'description' => __( 'User ID who owns the order. 0 for guests.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'default'     => 0,
                    'context'     => array( 'view' ),
                ),
                'search'          => array(
                    'description' => __( 'Order id to search order', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => '',
                    'context'     => array( 'view' ),
                ),
                'customer_ip_address'  => array(
                    'description' => __( "Customer's IP address.", 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'customer_user_agent'  => array(
                    'description' => __( 'User agent of the customer.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'customer_note'        => array(
                    'description' => __( 'Note left by customer during checkout.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view', 'edit' ),
                ),
                'billing'              => array(
                    'description' => __( 'Billing address.', 'dokan-lite' ),
                    'type'        => 'object',
                    'context'     => array( 'view' ),
                    'properties'  => array(
                        'first_name' => array(
                            'description' => __( 'First name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'last_name'  => array(
                            'description' => __( 'Last name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'company'    => array(
                            'description' => __( 'Company name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'address_1'  => array(
                            'description' => __( 'Address line 1', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'address_2'  => array(
                            'description' => __( 'Address line 2', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'city'       => array(
                            'description' => __( 'City name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'state'      => array(
                            'description' => __( 'ISO code or name of the state, province or district.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'postcode'   => array(
                            'description' => __( 'Postal code.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'country'    => array(
                            'description' => __( 'Country code in ISO 3166-1 alpha-2 format.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'email'      => array(
                            'description' => __( 'Email address.', 'dokan-lite' ),
                            'type'        => 'string',
                            'format'      => 'email',
                            'context'     => array( 'view' ),
                        ),
                        'phone'      => array(
                            'description' => __( 'Phone number.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                    ),
                ),
                'shipping'             => array(
                    'description' => __( 'Shipping address.', 'dokan-lite' ),
                    'type'        => 'object',
                    'context'     => array( 'view' ),
                    'properties'  => array(
                        'first_name' => array(
                            'description' => __( 'First name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'last_name'  => array(
                            'description' => __( 'Last name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'company'    => array(
                            'description' => __( 'Company name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'address_1'  => array(
                            'description' => __( 'Address line 1', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'address_2'  => array(
                            'description' => __( 'Address line 2', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'city'       => array(
                            'description' => __( 'City name.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'state'      => array(
                            'description' => __( 'ISO code or name of the state, province or district.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'postcode'   => array(
                            'description' => __( 'Postal code.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                        'country'    => array(
                            'description' => __( 'Country code in ISO 3166-1 alpha-2 format.', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => array( 'view' ),
                        ),
                    ),
                ),
                'payment_method'       => array(
                    'description' => __( 'Payment method ID.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                ),
                'payment_method_title' => array(
                    'description' => __( 'Payment method title.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                ),
                'transaction_id'       => array(
                    'description' => __( 'Unique transaction ID.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                ),
                'date_paid'            => array(
                    'description' => __( "The date the order was paid, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'date_paid_gmt'        => array(
                    'description' => __( 'The date the order was paid, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'date_completed'       => array(
                    'description' => __( "The date the order was completed, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'date_completed_gmt'   => array(
                    'description' => __( 'The date the order was completed, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'cart_hash'            => array(
                    'description' => __( 'MD5 hash of cart items to ensure orders are not modified.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'meta_data'            => array(
                    'description' => __( 'Meta data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'view' ),
                    'items'       => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'    => array(
                                'description' => __( 'Meta ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'key'   => array(
                                'description' => __( 'Meta key.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'value' => array(
                                'description' => __( 'Meta value.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => array( 'view' ),
                            ),
                        ),
                    ),
                ),
                'line_items'           => array(
                    'description' => __( 'Line items data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'view' ),
                    'items'       => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'           => array(
                                'description' => __( 'Item ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'name'         => array(
                                'description' => __( 'Product name.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => array( 'view' ),
                            ),
                            'product_id'   => array(
                                'description' => __( 'Product ID.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => array( 'view' ),
                            ),
                            'variation_id' => array(
                                'description' => __( 'Variation ID, if applicable.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                            ),
                            'quantity'     => array(
                                'description' => __( 'Quantity ordered.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                            ),
                            'tax_class'    => array(
                                'description' => __( 'Tax class of product.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'subtotal'     => array(
                                'description' => __( 'Line subtotal (before discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'subtotal_tax' => array(
                                'description' => __( 'Line subtotal tax (before discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'total'        => array(
                                'description' => __( 'Line total (after discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'total_tax'    => array(
                                'description' => __( 'Line total tax (after discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'taxes'        => array(
                                'description' => __( 'Line taxes.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'       => array(
                                            'description' => __( 'Tax rate ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                        ),
                                        'total'    => array(
                                            'description' => __( 'Tax total.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                        ),
                                        'subtotal' => array(
                                            'description' => __( 'Tax subtotal.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                        ),
                                    ),
                                ),
                            ),
                            'meta_data'    => array(
                                'description' => __( 'Meta data.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'    => array(
                                            'description' => __( 'Meta ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'key'   => array(
                                            'description' => __( 'Meta key.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                        ),
                                        'value' => array(
                                            'description' => __( 'Meta value.', 'dokan-lite' ),
                                            'type'        => 'mixed',
                                            'context'     => array( 'view' ),
                                        ),
                                    ),
                                ),
                            ),
                            'sku'          => array(
                                'description' => __( 'Product SKU.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view', 'edit' ),
                                'readonly'    => true,
                            ),
                            'price'        => array(
                                'description' => __( 'Product price.', 'dokan-lite' ),
                                'type'        => 'number',
                                'context'     => array( 'view', 'edit' ),
                                'readonly'    => true,
                            ),
                        ),
                    ),
                ),
                'tax_lines'            => array(
                    'description' => __( 'Tax lines data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                    'items'       => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'                 => array(
                                'description' => __( 'Item ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'rate_code'          => array(
                                'description' => __( 'Tax rate code.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'rate_id'            => array(
                                'description' => __( 'Tax rate ID.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'label'              => array(
                                'description' => __( 'Tax rate label.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'compound'           => array(
                                'description' => __( 'Show if is a compound tax rate.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'tax_total'          => array(
                                'description' => __( 'Tax total (not including shipping taxes).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'shipping_tax_total' => array(
                                'description' => __( 'Shipping tax total.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'meta_data'          => array(
                                'description' => __( 'Meta data.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'    => array(
                                            'description' => __( 'Meta ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'key'   => array(
                                            'description' => __( 'Meta key.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                        ),
                                        'value' => array(
                                            'description' => __( 'Meta value.', 'dokan-lite' ),
                                            'type'        => 'mixed',
                                            'context'     => array( 'view' ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
                'shipping_lines'       => array(
                    'description' => __( 'Shipping lines data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'view' ),
                    'items'       => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'           => array(
                                'description' => __( 'Item ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'method_title' => array(
                                'description' => __( 'Shipping method name.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => array( 'view' ),
                            ),
                            'method_id'    => array(
                                'description' => __( 'Shipping method ID.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => array( 'view' ),
                            ),
                            'total'        => array(
                                'description' => __( 'Line total (after discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'total_tax'    => array(
                                'description' => __( 'Line total tax (after discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'taxes'        => array(
                                'description' => __( 'Line taxes.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'    => array(
                                            'description' => __( 'Tax rate ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'total' => array(
                                            'description' => __( 'Tax total.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                    ),
                                ),
                            ),
                            'meta_data'    => array(
                                'description' => __( 'Meta data.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'    => array(
                                            'description' => __( 'Meta ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'key'   => array(
                                            'description' => __( 'Meta key.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                        ),
                                        'value' => array(
                                            'description' => __( 'Meta value.', 'dokan-lite' ),
                                            'type'        => 'mixed',
                                            'context'     => array( 'view' ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
                'fee_lines'            => array(
                    'description' => __( 'Fee lines data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'view' ),
                    'items'       => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'         => array(
                                'description' => __( 'Item ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'name'       => array(
                                'description' => __( 'Fee name.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => array( 'view' ),
                            ),
                            'tax_class'  => array(
                                'description' => __( 'Tax class of fee.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'tax_status' => array(
                                'description' => __( 'Tax status of fee.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'enum'        => array( 'taxable', 'none' ),
                            ),
                            'total'      => array(
                                'description' => __( 'Line total (after discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'total_tax'  => array(
                                'description' => __( 'Line total tax (after discounts).', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'taxes'      => array(
                                'description' => __( 'Line taxes.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'       => array(
                                            'description' => __( 'Tax rate ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'total'    => array(
                                            'description' => __( 'Tax total.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'subtotal' => array(
                                            'description' => __( 'Tax subtotal.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                    ),
                                ),
                            ),
                            'meta_data'  => array(
                                'description' => __( 'Meta data.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'    => array(
                                            'description' => __( 'Meta ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'key'   => array(
                                            'description' => __( 'Meta key.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                        ),
                                        'value' => array(
                                            'description' => __( 'Meta value.', 'dokan-lite' ),
                                            'type'        => 'mixed',
                                            'context'     => array( 'view' ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
                'coupon_lines'         => array(
                    'description' => __( 'Coupons line data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'view' ),
                    'items'       => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'           => array(
                                'description' => __( 'Item ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'code'         => array(
                                'description' => __( 'Coupon code.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => array( 'view' ),
                            ),
                            'discount'     => array(
                                'description' => __( 'Discount total.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                            ),
                            'discount_tax' => array(
                                'description' => __( 'Discount total tax.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'meta_data'    => array(
                                'description' => __( 'Meta data.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => array( 'view' ),
                                'items'       => array(
                                    'type'       => 'object',
                                    'properties' => array(
                                        'id'    => array(
                                            'description' => __( 'Meta ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => array( 'view' ),
                                            'readonly'    => true,
                                        ),
                                        'key'   => array(
                                            'description' => __( 'Meta key.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => array( 'view' ),
                                        ),
                                        'value' => array(
                                            'description' => __( 'Meta value.', 'dokan-lite' ),
                                            'type'        => 'mixed',
                                            'context'     => array( 'view' ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
                'refunds'              => array(
                    'description' => __( 'List of refunds.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                    'items'       => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'     => array(
                                'description' => __( 'Refund ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'reason' => array(
                                'description' => __( 'Refund reason.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                            'total'  => array(
                                'description' => __( 'Refund total.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => array( 'view' ),
                                'readonly'    => true,
                            ),
                        ),
                    ),
                ),
                'set_paid'             => array(
                    'description' => __( 'Define if the order is paid. It will set the status to processing and reduce stock items.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => false,
                    'context'     => array( 'edit' ),
                ),
            ),
        );

        return $this->add_additional_fields_schema( $schema );
    }

    /**
     * Retrieves the query params for the posts collection.
     *
     * @since 4.7.0
     *
     * @return array Collection parameters.
     */
    public function get_collection_params() {
        $query_params = parent::get_collection_params();

        $query_params['context']['default'] = 'view';

        $schema            = $this->get_item_schema();
        $schema_properties = $schema['properties'];

        $query_params['seller_id'] = array(
            'required'    => false,
            'default'     => dokan_get_current_user_id(),
            'description' => $schema_properties['seller_id']['description'],
            'type'        => $schema_properties['seller_id']['type'],
        );

        $query_params['status'] = array(
            'required'    => false,
            'default'     => $schema_properties['status']['default'],
            'description' => $schema_properties['status']['description'],
            'type'        => $schema_properties['status']['type'],
        );

        $query_params['date_created'] = array(
            'required'    => false,
            'default'     => $schema_properties['date_created']['default'],
            'description' => $schema_properties['date_created']['description'],
            'type'        => $schema_properties['date_created']['type'],
        );

        $query_params['customer_id'] = array(
            'required'    => false,
            'default'     => $schema_properties['customer_id']['default'],
            'description' => $schema_properties['customer_id']['description'],
            'type'        => $schema_properties['customer_id']['type'],
        );

        $query_params['search'] = array(
            'required'    => false,
            'default'     => $schema_properties['search']['default'],
            'description' => $schema_properties['search']['description'],
            'type'        => $schema_properties['search']['type'],
        );

        $params['after'] = array(
            'description'        => __( 'Limit response to resources published after a given ISO8601 compliant date.', 'dokan-lite' ),
            'type'               => 'string',
            'format'             => 'date-time',
            'validate_callback'  => 'rest_validate_request_arg',
        );

        $params['before'] = array(
            'description'        => __( 'Limit response to resources published before a given ISO8601 compliant date.', 'dokan-lite' ),
            'type'               => 'string',
            'format'             => 'date-time',
            'validate_callback'  => 'rest_validate_request_arg',
        );

        return $query_params;
    }
}
