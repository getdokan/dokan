<?php

namespace WeDevs\Dokan\REST;

use WC_Customer_Download;
use WC_Data_Store;
use WC_Product;
use WP_Error;
use WP_REST_Server;

/**
* Dokan Order ControllerV2 Class
*
* @since 3.7.10
*
* @package dokan
*/
class OrderControllerV2 extends OrderController {

    /**
     * Endpoint namespace
     *
     * @since 3.7.10
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';


    /**
     * Register the routes for orders.
     *
     * @since 3.7.10
     *
     * @return void
     */
    public function register_routes() {
        parent::register_routes();
        register_rest_route(
            $this->namespace,
            '/' . $this->base . '/(?P<id>[\d]+)/downloads',
            [
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_order_downloads' ],
					'args'                => $this->get_collection_params(),
					'permission_callback' => [ $this, 'get_single_order_permissions_check' ],
                ],
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'grant_order_downloads' ],
					'permission_callback' => [ $this, 'get_single_order_permissions_check' ],
					'args'                => [
                        'ids' => [
                            'type'        => 'array',
                            'description' => __( 'Download IDs.', 'dokan-lite' ),
                            'required'    => true,
                            'items' => [
                                'type'     => 'integer',
                                'description' => __( 'Download product IDs.', 'dokan-lite' ),
                                'required' => true,
                            ],
                        ],
                        'download_remaining' => [
                            'type'              => 'integer',
                            'description'       => esc_html__( 'Download remaining.', 'dokan-lite' ),
                            'required'          => false,
                            'minimum'           => 0,
                            'sanitize_callback' => 'absint',
                        ],
                        'access_expires' => [
                            'type'              => 'string',
                            'description'       => esc_html__( 'Access expires. Format: YYYY-MM-DD.', 'dokan-lite' ),
                            'required'          => false,
                            'format'            => 'date',
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'revoke_order_downloads' ],
                    'permission_callback' => [ $this, 'get_single_order_permissions_check' ],
                    'args'                => [
                        'download_id' => [
                            'type'        => 'string',
                            'description' => __( 'Download ID.', 'dokan-lite' ),
                            'required'    => false,
                        ],
                        'product_id' => [
                            'type'        => 'integer',
                            'description' => __( 'Product ID.', 'dokan-lite' ),
                            'required'    => false,
                        ],
                        'permission_id' => [
                            'type'        => 'integer',
                            'description' => __( 'Permission ID.', 'dokan-lite' ),
                            'required'    => true,
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->base . '/(?P<id>[\d]+)/downloads/(?P<permission_id>[\d]+)',
            [
                'args' => [
                    'id' => [
                        'description' => esc_html__( 'Unique identifier for the order.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                    'permission_id' => [
                        'description' => esc_html__( 'Unique identifier for the download permission.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_order_download' ],
                    'permission_callback' => [ $this, 'get_single_order_permissions_check' ],
                    'args'                => [
                        'download_remaining' => [
                            'type'              => 'integer',
                            'description'       => esc_html__( 'Download remaining.', 'dokan-lite' ),
                            'required'          => false,
                            'minimum'           => 0,
                            'sanitize_callback' => 'absint',
                        ],
                        'access_expires' => [
                            'type'              => 'string',
                            'description'       => esc_html__( 'Access expires date. Format: YYYY-MM-DD.', 'dokan-lite' ),
                            'required'          => false,
                            'format'            => 'date',
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->base . '/bulk-actions',
            [
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'process_orders_bulk_action' ],
					'args'                => [
						'order_ids' => [
							'type'        => 'array',
							'description' => __( 'Order ids', 'dokan-lite' ),
							'required'    => true,
							'sanitize_callback' => [ $this, 'sanitize_order_ids' ],
                        ],
						'status' => [
							'type'        => 'string',
							'description' => __( 'Order status', 'dokan-lite' ),
							'required'    => true,
							'sanitize_callback' => 'sanitize_text_field',
                        ],
                    ],
					'permission_callback' => [ $this, 'update_order_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Get Order Downloads.
     *
     * @since 3.7.10
     *
     * @param  \WP_REST_Request $request Request object.
     *
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function get_order_downloads( $request ) {
        global $wpdb;

        $download_permissions = $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT * FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions
                WHERE order_id = %d ORDER BY product_id ASC
            ", $request->get_param( 'id' )
            )
        );

        $product_ids = array_unique( array_map( 'intval', wp_list_pluck( $download_permissions, 'product_id' ) ) );

        // Batch-fetch products in a single query and create a lookup map by ID.
        $products = [];
        foreach ( wc_get_products( [ 'include' => $product_ids, 'limit' => -1 ] ) as $product ) {
            $products[ $product->get_id() ] = $product;
        }

        // Filter downloads with existing products and prepare response.
        $downloads = [];
        foreach ( $download_permissions as $download ) {
            $product_id = intval( $download->product_id );
            if ( isset( $products[ $product_id ] ) ) {
                $download->product = $products[ $product_id ];
                $downloads[] = $this->prepare_data_for_response( $download, $request );
            }
        }

        $data = $this->format_downloads_data( $downloads, $products );

        return rest_ensure_response( $data );
    }

    /**
     * Format downloads data.
     *
     * @since 4.0.0
     *
     * @param \stdClass[]   $downloads
     * @param \WC_Product[] $products
     *
     * @return array
     */
    protected function format_downloads_data( $downloads, $products ) {
        $data = [];
        $data['downloads'] = $downloads;
        $data['products'] = array_reduce(
            $products, function ( $acc, $product ) {

				$acc[ $product->get_id() ] = $product->get_formatted_name();

				return $acc;
			}, []
        );

        return apply_filters( 'dokan_rest_prepare_format_downloads_data', $data, $downloads, $products );
    }

    /**
     * Prepare data for response.
     *
     * @since 4.0.0
     *
     * @param \stdClass        $download
     * @param \WP_REST_Request $request
     *
     * @return \stdClass
     */
    public function prepare_data_for_response( $download, $request ) {
        $product = $download->product;
        /** @var WC_Product $product */
        unset( $download->product );
        unset( $download->product_id );

        $download->product = [
            'id'        => $product->get_id(),
            'name'      => $product->get_name(),
            'thumbnail' => wp_get_attachment_url( $product->get_image_id() ),
        ];

        return apply_filters( 'dokan_rest_prepare_order_download_response', $download, $product );
    }

    /**
     * Grant downloadable product access to the given order.
     *
     * @since 3.7.10
     *
     * @param \WP_REST_Request $requests Request object.
     *
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function grant_order_downloads( $requests ) {
        $order_id     = intval( $requests->get_param( 'id' ) );
        $product_ids  = array_filter( array_map( 'absint', (array) wp_unslash( $requests->get_param( 'ids' ) ) ) );
        $remaining    = $requests->get_param( 'download_remaining' );
        $expiry       = $requests->get_param( 'access_expires' );
        $file_counter = 0;
        $order        = dokan()->order->get( $order_id );
        $data         = [];

        foreach ( $product_ids as $product_id ) {
            $product = dokan()->product->get( $product_id );
            if ( ! $product ) {
                continue;
            }

            $files = $product->get_downloads();

            foreach ( $files as $download_id => $file ) {
                $inserted_id = wc_downloadable_file_permission( $download_id, $product_id, $order );
                if ( ! $inserted_id ) {
                    continue;
                }

                if ( null !== $remaining || null !== $expiry ) {
                    $download = new WC_Customer_Download( $inserted_id );
                    if ( null !== $remaining ) {
                        $download->set_downloads_remaining( $remaining );
                    }
                    if ( null !== $expiry ) {
                        $download->set_access_expires( $expiry );
                    }
                    $download->save();
                }

                ++$file_counter;
                if ( $file->get_name() ) {
                    $file_count = $file->get_name();
                } else {
                    /* translators: numeric number of files */
                    $file_count = sprintf( __( 'File %d', 'dokan-lite' ), $file_counter );
                }
                $data[ $inserted_id ] = $file_count;
            }
        }

        return rest_ensure_response( $data );
    }

    /**
     * Update a downloadable product permission for the given order.
     *
     * @since 4.3.1
     *
     * @param \WP_REST_Request $request Request object.
     *
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function update_order_download( $request ) {
        $permission_id = absint( $request->get_param( 'permission_id' ) );

        $download = new WC_Customer_Download( $permission_id );

        if ( ! $download->get_id() ) {
            return new WP_Error(
                'dokan_rest_download_permission_not_found',
                esc_html__( 'Download permission not found.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
        }

        // Verify the permission belongs to this order.
        $order_id = absint( $request->get_param( 'id' ) );
        if ( $download->get_order_id() !== $order_id ) {
            return new WP_Error(
                'dokan_rest_download_permission_invalid_order',
                esc_html__( 'Download permission does not belong to this order.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        $download_remaining = $request->get_param( 'download_remaining' );
        $access_expires     = $request->get_param( 'access_expires' );

        if ( null !== $download_remaining ) {
            $download->set_downloads_remaining( $download_remaining );
        }

        if ( null !== $access_expires ) {
            $download->set_access_expires( $access_expires );
        }

        if ( null !== $download_remaining || null !== $access_expires ) {
            $download->save();
        }

        $expires  = $download->get_access_expires();
        $response = [
            'permission_id'      => $download->get_id(),
            'product_id'         => $download->get_product_id(),
            'download_id'        => $download->get_download_id(),
            'order_id'           => $download->get_order_id(),
            'download_remaining' => $download->get_downloads_remaining(),
            'access_expires'     => $expires ? $expires->date( 'Y-m-d' ) : null,
        ];

        return rest_ensure_response( apply_filters( 'dokan_rest_prepare_order_download_update_response', $response, $download, $request ) );
    }

    /**
     * Revoke downloadable product access to the given order.
     *
     * @since 3.7.10
     *
     * @param \WP_REST_Request $requests Request object.
     *
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function revoke_order_downloads( $requests ) {
        $download_id   = $requests->get_param( 'download_id' );
        $product_id    = $requests->get_param( 'product_id' );
        $order_id      = $requests->get_param( 'id' );
        $permission_id = $requests->get_param( 'permission_id' );

        try {
            $data_store = WC_Data_Store::load( 'customer-download' );
            $data_store->delete_by_id( $permission_id );
        } catch ( \Exception $e ) {
            return new WP_Error( 'dokan_rest_cannot_delete', $e->getMessage(), [ 'status' => 500 ] );
        }

        do_action( 'woocommerce_ajax_revoke_access_to_product_download', $download_id, $product_id, $order_id, $permission_id );
        return rest_ensure_response( array( 'success' => true ) );
    }

    /**
     * Updates bulk orders status.
     *
     * @since 3.7.10
     *
     * @param \WP_REST_Request $requests Request object.
     *
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function process_orders_bulk_action( $requests ) {
        $data = [
            'bulk_orders' => $requests->get_param( 'order_ids' ),
            'status'      => $requests->get_param( 'status' ),
        ];

        dokan_apply_bulk_order_status_change( $data );

        return rest_ensure_response( array( 'success' => true ) );
    }

    /**
     * Sanitizes order ids.
     *
     * @since 3.7.10
     *
     * @param array $order_ids
     *
     * @return array
     */
    public function sanitize_order_ids( $order_ids ) {
        if ( is_array( $order_ids ) ) {
            return array_map( 'absint', $order_ids );
        } else {
            return [];
        }
    }
}
