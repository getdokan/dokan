<?php

namespace WeDevs\Dokan\REST;

use WC_Customer_Download;
use WC_Data_Store;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Downloadable-product permissions for a Vendor order.
 *
 * REST twin of the legacy AJAX grant/revoke handlers so the Vendor panel's React
 * order-details view can manage download permissions. The AJAX handlers and the
 * legacy template stay untouched — both surfaces wrap the same WooCommerce
 * permission store.
 *
 * @since DOKAN_SINCE
 */
class OrderDownloadController extends DokanBaseController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'orders';

    /**
     * Register routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)/downloads',
            [
                'args'   => [
                    'id' => [
                        'description' => __( 'Unique identifier for the order.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_item' ],
                    'permission_callback' => [ $this, 'manage_items_permissions_check' ],
                    'args'                => [
                        'product_ids' => [
                            'description' => __( 'Downloadable product ids to grant access for.', 'dokan-lite' ),
                            'type'        => 'array',
                            'required'    => true,
                            'items'       => [
                                'type' => 'integer',
                            ],
                        ],
                    ],
                ],
                'schema' => [ $this, 'get_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)/downloads/(?P<permission_id>[\d]+)',
            [
                'args' => [
                    'id'            => [
                        'description' => __( 'Unique identifier for the order.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                    'permission_id' => [
                        'description' => __( 'Unique identifier for the download permission.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'manage_items_permissions_check' ],
                    'args'                => [
                        'downloads_remaining' => [
                            'description' => __( 'Remaining downloads, empty for unlimited.', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'access_expires'      => [
                            'description' => __( 'Access expiry date (Y-m-d), empty for never.', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_item' ],
                    'permission_callback' => [ $this, 'manage_items_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Update a download permission's limit and expiry.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function update_item( $request ) {
        $order_id      = absint( $request['id'] );
        $permission_id = absint( $request['permission_id'] );

        $permission = new WC_Customer_Download( $permission_id );

        if ( ! $permission->get_id() || absint( $permission->get_order_id() ) !== $order_id ) {
            return new WP_Error(
                'dokan_rest_invalid_download_permission',
                __( 'Invalid download permission.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
        }

        if ( null !== $request['downloads_remaining'] ) {
            $remaining = trim( (string) $request['downloads_remaining'] );
            $permission->set_downloads_remaining( '' === $remaining ? '' : absint( $remaining ) );
        }

        if ( null !== $request['access_expires'] ) {
            $expires = trim( (string) $request['access_expires'] );
            // Store the picked day as UTC midnight so the same Y-m-d comes back
            // regardless of site timezone.
            $permission->set_access_expires( '' === $expires ? null : strtotime( $expires . ' 00:00:00 UTC' ) );
        }

        $permission->save();

        return $this->prepare_item_for_response( new WC_Customer_Download( $permission_id ), $request );
    }

    /**
     * Whether the current user may view the order's download permissions.
     *
     * Staff-aware, modeled on the details-html fragment rule: capability check,
     * marketplace-admin bypass, then ownership through the staff-aware current-user
     * helper.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return true|WP_Error
     */
    public function get_items_permissions_check( $request ) {
        return $this->check_order_access( $request, 'dokan_view_order' );
    }

    /**
     * Whether the current user may grant or revoke download permissions.
     *
     * The legacy AJAX handlers gate on `dokandar`; the same capability applies here.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return true|WP_Error
     */
    public function manage_items_permissions_check( $request ) {
        return $this->check_order_access( $request, 'dokandar' );
    }

    /**
     * Shared capability + ownership rule.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request    Request object.
     * @param string          $capability Required capability.
     *
     * @return true|WP_Error
     */
    protected function check_order_access( $request, $capability ) {
        $forbidden = new WP_Error(
            'dokan_rest_cannot_manage_order_downloads',
            __( 'Sorry, you are not allowed to manage downloads for this order.', 'dokan-lite' ),
            [ 'status' => rest_authorization_required_code() ]
        );

        if ( ! current_user_can( $capability ) ) {
            return $forbidden;
        }

        $order = wc_get_order( absint( $request['id'] ) );

        if ( ! $order || 'shop_order' !== $order->get_type() ) {
            return new WP_Error(
                'dokan_rest_invalid_order_id',
                __( 'Invalid order ID.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
        }

        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        if ( dokan_is_seller_has_order( dokan_get_current_user_id(), $order->get_id() ) ) {
            return true;
        }

        return $forbidden;
    }

    /**
     * List the order's download permissions.
     *
     * Mirrors the legacy template: permissions whose product or file has since been
     * removed are skipped rather than rendered dead.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function get_items( $request ) {
        $order_id   = absint( $request['id'] );
        $data_store = WC_Data_Store::load( 'customer-download' );

        $permissions = $data_store->get_downloads(
            [
                'order_id' => $order_id,
                'orderby'  => 'product_id',
            ]
        );

        $items   = [];
        $product = null;

        foreach ( $permissions as $permission ) {
            if ( ! $product || $product->get_id() !== $permission->get_product_id() ) {
                $product = wc_get_product( $permission->get_product_id() );
            }

            if ( ! $product || ! $product->exists() || ! $product->has_file( $permission->get_download_id() ) ) {
                continue;
            }

            $items[] = $this->prepare_response_for_collection(
                $this->prepare_item_for_response( $permission, $request )
            );
        }

        return rest_ensure_response( $items );
    }

    /**
     * Grant download access for the given products.
     *
     * Wraps the legacy AJAX grant logic: only the vendor's own downloadable products
     * qualify, and one permission is created per file, per product.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function create_item( $request ) {
        $order_id    = absint( $request['id'] );
        $product_ids = array_filter( array_map( 'absint', (array) $request['product_ids'] ) );
        $order       = wc_get_order( $order_id );

        if ( empty( $product_ids ) ) {
            return new WP_Error(
                'dokan_rest_no_downloadable_products',
                __( 'No downloadable products were given.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        if ( ! $order->get_billing_email() ) {
            return new WP_Error(
                'dokan_rest_order_missing_billing_email',
                __( 'The order has no billing email, so download access cannot be granted.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        $created = [];

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );

            // Only grant downloads for the vendor's own products, never another vendor's files.
            if ( ! $product || ! dokan_is_product_author( $product_id ) ) {
                continue;
            }

            foreach ( $product->get_downloads() as $download_id => $file ) {
                $inserted_id = wc_downloadable_file_permission( $download_id, $product_id, $order );

                if ( ! $inserted_id ) {
                    continue;
                }

                $permission = new WC_Customer_Download( $inserted_id );

                /**
                 * Fires after the Vendor grants a download permission over REST.
                 *
                 * @since DOKAN_SINCE
                 *
                 * @param WC_Customer_Download $permission Created permission.
                 * @param \WC_Order            $order      Order the permission belongs to.
                 */
                do_action( 'dokan_rest_order_download_access_granted', $permission, $order );

                $created[] = $this->prepare_response_for_collection(
                    $this->prepare_item_for_response( $permission, $request )
                );
            }
        }

        $response = rest_ensure_response( $created );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Revoke a download permission.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function delete_item( $request ) {
        $order_id      = absint( $request['id'] );
        $permission_id = absint( $request['permission_id'] );

        $permission = new WC_Customer_Download( $permission_id );

        if ( ! $permission->get_id() || absint( $permission->get_order_id() ) !== $order_id ) {
            return new WP_Error(
                'dokan_rest_invalid_download_permission',
                __( 'Invalid download permission.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
        }

        $previous = $this->prepare_item_for_response( $permission, $request );

        $data_store = WC_Data_Store::load( 'customer-download' );
        $data_store->delete_by_id( $permission_id );

        /** This action is documented in WooCommerce and fired by the legacy revoke handler. */
        do_action( 'woocommerce_ajax_revoke_access_to_product_download', $permission->get_download_id(), $permission->get_product_id(), $order_id, $permission_id );

        return rest_ensure_response(
            [
                'deleted'  => true,
                'previous' => $previous->get_data(),
            ]
        );
    }

    /**
     * Shape a download permission for the response.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Customer_Download $item    Download permission.
     * @param WP_REST_Request      $request Request object.
     *
     * @return WP_REST_Response
     */
    public function prepare_item_for_response( $item, $request ) {
        $product   = wc_get_product( $item->get_product_id() );
        $file      = $product && $product->has_file( $item->get_download_id() ) ? $product->get_file( $item->get_download_id() ) : null;
        $file_name = $file && ! empty( $file['name'] ) ? $file['name'] : '';

        $access_expires = $item->get_access_expires();
        $image_id       = $product ? $product->get_image_id() : 0;

        $data = [
            'permission_id'       => absint( $item->get_id() ),
            'product_id'          => absint( $item->get_product_id() ),
            'product_name'        => $product ? $product->get_name() : '',
            'product_image'       => $image_id ? (string) wp_get_attachment_image_url( $image_id, 'thumbnail' ) : (string) wc_placeholder_img_src(),
            'download_id'         => (string) $item->get_download_id(),
            'file_name'           => $file_name,
            'download_count'      => absint( $item->get_download_count() ),
            'downloads_remaining' => '' === (string) $item->get_downloads_remaining() ? '' : (string) $item->get_downloads_remaining(),
            'access_expires'      => $access_expires ? $access_expires->date( 'Y-m-d' ) : null,
        ];

        $data = apply_filters( 'dokan_rest_prepare_order_download_data', $data, $item, $request );

        return rest_ensure_response( $data );
    }

    /**
     * Schema for a download permission.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_item_schema() {
        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'order-download',
            'type'       => 'object',
            'properties' => [
                'permission_id'       => [
                    'description' => __( 'Unique identifier for the download permission.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'product_id'          => [
                    'description' => __( 'Downloadable product id.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                ],
                'product_name'        => [
                    'description' => __( 'Downloadable product name.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                ],
                'download_id'         => [
                    'description' => __( 'Downloadable file id.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                ],
                'file_name'           => [
                    'description' => __( 'Downloadable file name.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                ],
                'downloads_remaining' => [
                    'description' => __( 'Remaining downloads, empty for unlimited.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                ],
                'access_expires'      => [
                    'description' => __( 'Access expiry date, null for never.', 'dokan-lite' ),
                    'type'        => [ 'string', 'null' ],
                    'context'     => [ 'view' ],
                ],
            ],
        ];

        return $this->add_additional_fields_schema( $schema );
    }
}
