<?php

namespace WeDevs\Dokan\REST;

use WC_Data_Store;
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
     * @param  \WP_REST_Request $requests Request object.
     *
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function get_order_downloads( $requests ) {
        global $wpdb;

        $user_id   = dokan_get_current_user_id();
        $data      = [];
        $downloads = [];

        // TODO: Need to move this into a separate function.
        $download_permissions = $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT * FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions
                WHERE order_id = %d ORDER BY product_id ASC
            ", $requests->get_param( 'id' )
            )
        );

        foreach ( $download_permissions as $download ) {
            $product = wc_get_product( absint( $download->product_id ) );

            // don't show permissions to files that have since been removed
            if ( ! $product || ! $product->exists() || ! $product->has_file( $download->download_id ) ) {
                continue;
            }

            $downloads[] = $download;
        }

        $data['downloads'] = $downloads;
        $orders_items      = wc_get_order( $requests->get_param( 'id' ) )->get_items();
        $orders_items_ids  = [];

        foreach ( $orders_items as $item ) {
            $orders_items_ids[] = $item->get_product_id();
        }

        $orders_items_ids = implode( ',', $orders_items_ids );
        // @codingStandardsIgnoreStart
        $products = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT $wpdb->posts.* FROM $wpdb->posts
                        INNER JOIN $wpdb->postmeta
                            ON ( $wpdb->posts.ID = $wpdb->postmeta.post_id )
                        WHERE $wpdb->posts.post_author=%d
                            AND ( $wpdb->postmeta.meta_key = '_downloadable' AND $wpdb->postmeta.meta_value = 'yes' )
                            AND $wpdb->posts.post_type IN ( 'product', 'product_variation' )
                            AND $wpdb->posts.post_status = 'publish'
                            AND $wpdb->posts.ID IN ( {$orders_items_ids} )
                        GROUP BY $wpdb->posts.ID
                        ORDER BY $wpdb->posts.post_parent ASC, $wpdb->posts.post_title ASC", $user_id
            )
        );
        // @codingStandardsIgnoreEnd

        foreach ( $products as $product ) {
            $data['products'][ $product->ID ] = esc_html( wc_get_product( $product->ID )->get_formatted_name() );
        }

        return rest_ensure_response( $data );
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

                if ( $inserted_id ) {
                    $file_counter ++;
                    if ( $file->get_name() ) {
                        $file_count = $file->get_name();
                    } else {
                        /* translators: numeric number of files */
                        $file_count = sprintf( __( 'File %d', 'dokan-lite' ), $file_counter );
                    }
                    $data[ $inserted_id ] = $file_count;
                }
            }
        }

        return rest_ensure_response( $data );
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
