<?php

namespace WeDevs\Dokan\REST;

use WC_Data_Store;
use WP_Error;
use WP_REST_Server;
use WeDevs\Dokan\Abstracts\DokanRESTController;

/**
* Dokan Order Controller Class
*
* @since 2.8.0
*
* @package dokan
*/
class OrderControllerV2 extends OrderController {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';


    /**
     * Register the routes for orders.
     */
    public function register_routes() {
        parent::register_routes();
        register_rest_route(
            $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/downloads', array(
				'args' => array(
					'id' => array(
						'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_order_downloads' ),
					'args'                => $this->get_collection_params(),
					'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'grant_order_downloads' ),
					'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
					'args'                => array(
                        'ids' => array(
                            'type'        => 'array',
                            'description' => __( 'Download IDs.', 'dokan-lite' ),
                            'required'    => true,
                            'items' => array(
                                'type'     => 'integer',
                                'description' => __( 'Download product IDs.', 'dokan-lite' ),
                                'required' => true,
                            ),
                        ),
                    ),
				),
                array(
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'revoke_order_downloads' ),
                    'permission_callback' => array( $this, 'get_single_order_permissions_check' ),
                    'args'                => array(
                        'download_id' => array(
                            'type'        => 'string',
                            'description' => __( 'Download ID.', 'dokan-lite' ),
                            'required'    => false,
                        ),
                        'product_id' => array(
                            'type'        => 'integer',
                            'description' => __( 'Product ID.', 'dokan-lite' ),
                            'required'    => false,
                        ),
                        'permission_id' => array(
                            'type'        => 'integer',
                            'description' => __( 'Permission ID.', 'dokan-lite' ),
                            'required'    => true,
                        ),
                    ),
                ),
            )
        );
    }

    /**
     * Get Order Downloads.
     *
     * @param $requests
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function get_order_downloads( $requests ) {
        global $wpdb;

        $user_id   = dokan_get_current_user_id();
        $data      = [];
        $downloads = [];

        $download_permissions = $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT * FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions
                WHERE order_id = %d ORDER BY product_id
            ", $requests->get_param( 'id' )
            )
        );

        $product = null;
        $loop    = 0;

        if ( $download_permissions && sizeof( $download_permissions ) > 0 ) {
			foreach ( $download_permissions as $download ) {
				if ( ! $product || dokan_get_prop( $product, 'id' ) != $download->product_id ) {
					$product = wc_get_product( absint( $download->product_id ) );
					$file_count = 0;
				}

				// don't show permissions to files that have since been removed
				if ( ! $product || ! $product->exists() || ! $product->has_file( $download->download_id ) ) {
					continue;
				}

				$downloads[] = $download;

				$loop++;
				$file_count++;
			}
        }

        $data['downloads'] = $downloads;

        $products = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT $wpdb->posts.* FROM $wpdb->posts
                        INNER JOIN $wpdb->postmeta
                            ON ( $wpdb->posts.ID = $wpdb->postmeta.post_id )
                        WHERE $wpdb->posts.post_author=%d
                            AND ( $wpdb->postmeta.meta_key = '_downloadable' AND $wpdb->postmeta.meta_value = 'yes' )
                            AND $wpdb->posts.post_type IN ( 'product', 'product_variation' )
                            AND $wpdb->posts.post_status = 'publish'
                        GROUP BY $wpdb->posts.ID
                        ORDER BY $wpdb->posts.post_parent ASC, $wpdb->posts.post_title ASC", $user_id
            )
        );

        if ( $products ) {
			foreach ( $products as $product ) {
				$product_object = wc_get_product( $product->ID );
				$product_name   = $product_object->get_formatted_name();

				$data['products'][ $product->ID ] = esc_html( $product_name );
			}
        }

        return rest_ensure_response( $data );
    }

    /**
     * Grant downloadable product access to the given order.
     *
     * @param $requests
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function grant_order_downloads( $requests ) {
        $order_id     = intval( $requests->get_param( 'id' ) );
        $product_ids  = array_filter( array_map( 'absint', (array) wp_unslash( $requests->get_param( 'ids' ) ) ) );
        $loop         = 0;
        $file_counter = 0;
        $order        = dokan()->order->get( $order_id );
        $data         = [];

        foreach ( $product_ids as $product_id ) {
            $product = dokan()->product->get( $product_id );
            $files   = $product->get_downloads();

            if ( ! $order->get_billing_email() ) {
                wp_die();
            }

            if ( $files ) {
                foreach ( $files as $download_id => $file ) {
                    $inserted_id = wc_downloadable_file_permission( $download_id, $product_id, $order );

                    if ( $inserted_id ) {
                        $download = new \WC_Customer_Download( $inserted_id );
                        $loop ++;
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
        }

        return rest_ensure_response( $data );
    }

    /**
     * Revoke downloadable product access to the given order.
     *
     * @param $requests
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function revoke_order_downloads( $requests ) {
        $download_id   = $requests->get_param( 'download_id' );
        $product_id    = $requests->get_param( 'product_id' );
        $order_id      = $requests->get_param( 'id' );
        $permission_id = $requests->get_param( 'permission_id' );

        $data_store = WC_Data_Store::load( 'customer-download' );
        $data_store->delete_by_id( $permission_id );

        do_action( 'woocommerce_ajax_revoke_access_to_product_download', $download_id, $product_id, $order_id, $permission_id );
        return rest_ensure_response( array( 'success' => true ) );
    }

}
