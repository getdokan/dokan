<?php

namespace WeDevs\Dokan\CJDropshipping\REST;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Catalog;
use WeDevs\Dokan\CJDropshipping\Api\ProductDetails;
use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\CJDropshipping\Vendor\Access;
use WeDevs\Dokan\REST\DokanBaseVendorController;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Vendor endpoints: start step, catalog search and product details.
 *
 * @since DOKAN_SINCE
 */
class VendorController extends DokanBaseVendorController {

    /**
     * Namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'cj-dropshipping';

    /**
     * Register routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/status', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_status' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/accept-terms', [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'accept_terms' ],
                    'permission_callback' => [ $this, 'can_use' ],
                    'args'                => [
                        'accepted' => [
                            'type'     => 'boolean',
                            'required' => true,
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/catalog', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'search' ],
                    'permission_callback' => [ $this, 'can_import' ],
                    'args'                => [
                        'keyword'   => [
                            'type'              => 'string',
                            'default'           => '',
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                        'warehouse' => [
                            'type'              => 'string',
                            'default'           => '',
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                        'page'      => [
                            'type'    => 'integer',
                            'default' => 1,
                            'minimum' => 1,
                            'maximum' => 1000,
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/catalog/(?P<pid>[A-Za-z0-9\-_]+)', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_product' ],
                    'permission_callback' => [ $this, 'can_import' ],
                ],
            ]
        );
    }

    /**
     * Permission: the current user may use CJ (owner, enabled, allowed).
     *
     * @since DOKAN_SINCE
     *
     * @return bool|WP_Error
     */
    public function can_use() {
        $reason = Access::blocked_reason( get_current_user_id() );

        if ( '' === $reason ) {
            return true;
        }

        return new WP_Error( 'dokan_cj_' . $reason, self::reason_message( $reason ), [ 'status' => rest_authorization_required_code() ] );
    }

    /**
     * Permission: the vendor finished the start step and the account is connected.
     *
     * @since DOKAN_SINCE
     *
     * @return bool|WP_Error
     */
    public function can_import() {
        $can_use = $this->can_use();

        if ( true !== $can_use ) {
            return $can_use;
        }

        if ( ! Access::has_accepted_terms( get_current_user_id() ) ) {
            return new WP_Error( 'dokan_cj_terms', __( 'Confirm the CJ Dropshipping terms first.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * What the vendor dashboard needs to show the CJ page.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_status() {
        $user_id = get_current_user_id();
        $reason  = Access::blocked_reason( $user_id );

        return rest_ensure_response(
            [
                'can_use'        => '' === $reason,
                'blocked_reason' => $reason,
                'message'        => $reason ? self::reason_message( $reason ) : '',
                'accepted_terms' => Access::has_accepted_terms( $user_id ),
                'available'      => Status::is_connected(),
                'default_markup' => Settings::default_markup(),
                'terms'          => array_values( array_filter( array_map( 'trim', explode( "\n", Settings::vendor_terms() ) ) ) ),
                'warehouses'     => '' === $reason && Status::is_connected() ? ( new Catalog() )->warehouses() : [],
                'currency'       => get_woocommerce_currency_symbol(),
            ]
        );
    }

    /**
     * Record the vendor's "I understand" (E8).
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function accept_terms( $request ) {
        if ( ! $request['accepted'] ) {
            return new WP_Error( 'dokan_cj_terms', __( 'Tick the box to confirm you understand how CJ Dropshipping works.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        Access::accept_terms( get_current_user_id() );

        return $this->get_status();
    }

    /**
     * Search CJ's catalog.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function search( $request ) {
        try {
            $result = ( new Catalog() )->search(
                [
                    'keyword'   => $request['keyword'],
                    'warehouse' => $request['warehouse'],
                    'page'      => $request['page'],
                    'per_page'  => 20,
                ]
            );
        } catch ( ApiException $e ) {
            return AdminController::to_error( $e );
        }

        $result['items'] = array_map(
            static function ( $item ) {
                $item['cost'] = round( Settings::to_store_currency( (float) $item['price'] ), wc_get_price_decimals() );
                unset( $item['price'] );

                return $item;
            },
            $result['items']
        );

        return rest_ensure_response( $result );
    }

    /**
     * A CJ product with variants, cost and stock per warehouse.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_product( $request ) {
        try {
            $details = ( new ProductDetails() )->get( (string) $request['pid'] );
        } catch ( ApiException $e ) {
            return AdminController::to_error( $e );
        }

        $links     = new LinkRepository();
        $vendor_id = get_current_user_id();

        foreach ( $details['variants'] as &$variant ) {
            unset( $variant['raw_stock'], $variant['cost_usd'] );
            $variant['imported_product_id'] = $links->find_vendor_product( $vendor_id, $variant['vid'] );
        }
        unset( $variant );

        return rest_ensure_response( $details );
    }

    /**
     * Message for a blocked reason.
     *
     * @since DOKAN_SINCE
     *
     * @param string $reason Access::blocked_reason() value.
     *
     * @return string
     */
    public static function reason_message( string $reason ): string {
        $messages = [
            'disabled'    => __( 'CJ Dropshipping is not available on this marketplace.', 'dokan-lite' ),
            'not_vendor'  => __( 'Only vendors can use CJ Dropshipping.', 'dokan-lite' ),
            'staff'       => __( 'Only the store owner can import and fulfil CJ products. Ask the store owner to handle CJ orders.', 'dokan-lite' ),
            'inactive'    => __( 'Your store needs to be enabled for selling before you can use CJ Dropshipping.', 'dokan-lite' ),
            'not_allowed' => __( 'Your subscription plan does not include CJ Dropshipping.', 'dokan-lite' ),
        ];

        return $messages[ $reason ] ?? __( 'You can\'t use CJ Dropshipping.', 'dokan-lite' );
    }
}
