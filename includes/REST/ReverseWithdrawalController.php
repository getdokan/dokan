<?php
namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\ReverseWithdrawal\Helper;
use WeDevs\Dokan\ReverseWithdrawal\Manager;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Controller
 *
 * @package WeDevs\Dokan\ReverseWithdrawal\REST
 *
 * @since 3.5.1
 */
class ReverseWithdrawalController extends WP_REST_Controller {
    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $rest_base = 'reverse-withdrawal';

    /**
     * Register all routes related with reverse withdrawal
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/stores-balance', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_stores_balance' ],
                    'permission_callback' => [ $this, 'get_stores_balance_permissions_check' ],
                    'args'                => $this->get_stores_balance_route_params(),
                ],
                'schema' => [ $this, 'get_public_item_schema_for_store_balance' ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/transactions/(?P<id>[\d]+)', [
                'args' => [
                    'id' => [
                        'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_store_transactions' ],
                    'permission_callback' => [ $this, 'get_store_transactions_permissions_check' ],
                    'args'                => $this->get_store_transactions_route_params(),
                ],
                'schema' => [ $this, 'get_public_item_schema_for_single_store_transactions' ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/transaction-types', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_transaction_types' ],
                    'permission_callback' => [ $this, 'get_transaction_types_permissions_check' ],
                ],
                'schema' => [ $this, 'get_public_item_schema_for_transaction_types' ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/stores', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_stores' ],
                    'permission_callback' => [ $this, 'get_stores_permissions_check' ],
                ],
                'schema' => [ $this, 'get_public_schema_for_stores' ],
            ]
        );
    }

    /**
     * Checks if a given request has access to get items.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @since 3.5.1
     *
     * @return bool True if the request has read access, false otherwise.
     */
    public function get_stores_balance_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * This method will return transactions group by each stores
     *
     * @param WP_REST_Request $request
     *
     * @since 3.5.1
     *
     * @return WP_REST_Response
     */
    public function get_stores_balance( $request ) {
        $manager      = new Manager();
        $items        = [];

        $data = $manager->get_stores_balance( $request->get_params() );

        if ( is_wp_error( $data ) ) {
            return rest_ensure_response( $data );
        }

        if ( ! empty( $data['items'] ) ) {
            foreach ( $data['items'] as $item ) {
                $item    = $this->prepare_balance_for_response( $item, $request );
                $items[] = $this->prepare_response_for_collection( $item );
            }
        }

        $response = rest_ensure_response( $items );
        $response->header( 'X-Status-Total-Transactions', $data['count']['total_transactions'] );
        $response->header( 'X-Status-Total-Vendors', $data['count']['total_vendors'] );
        $response->header( 'X-Status-Debit', $data['count']['debit'] );
        $response->header( 'X-Status-Credit', $data['count']['credit'] );
        $response->header( 'X-Status-Balance', $data['count']['balance'] );
        $response = $this->format_collection_response( $response, $request, $data['count']['total_vendors'] );

        return $response;
    }

    /**
     * Checks if a given request has access to get items.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @since 3.5.1
     *
     * @return bool True if the request has read access, false otherwise.
     */
    public function get_store_transactions_permissions_check( $request ) {
        // admin can access all vendors data
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        // if request is coming from a vendor then check if id is same as logged in vendor
        if ( current_user_can( 'dokandar' ) && isset( $request['id'] ) && get_current_user_id() === intval( $request['id'] ) ) {
            return true;
        }

        return false;
    }

    /**
     * This method will return transactions of a single store
     *
     * @param WP_REST_Request $request
     *
     * @since 3.5.1
     *
     * @return WP_REST_Response
     */
    public function get_store_transactions( $request ) {
        $manager      = new Manager();
        $items        = [];

        $data = $manager->get_store_transactions( $request->get_params() );

        if ( is_wp_error( $data ) ) {
            return rest_ensure_response( $data );
        }

        $current_balance = 0;
        $transactions[] = $data['balance'];
        $transactions   = ! empty( $data['items'] ) ? array_merge( $transactions, $data['items'] ) : $transactions;

        foreach ( $transactions as $item ) {
            $item = $this->prepare_transaction_for_response( $item, $request, $current_balance );
            $items[] = $this->prepare_response_for_collection( $item );
        }

        $response = rest_ensure_response( $items );
        $response->header( 'X-Status-Total-Transactions', $data['count']['total_transactions'] );
        $response->header( 'X-Status-Debit', $data['count']['debit'] );
        $response->header( 'X-Status-Credit', $data['count']['credit'] );
        $response->header( 'X-Status-Balance', $current_balance );
        $response = $this->format_collection_response( $response, $request, $data['count']['total_transactions'] );

        return $response;
    }

    /**
     * Checks if a given request has access to get items.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @since 3.5.1
     *
     * @return bool True if the request has read access, false otherwise.
     */
    public function get_stores_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * This method will return unique stores under reverse withdrawal table
     *
     * @param WP_REST_Request $request
     *
     * @since 3.5.1
     *
     * @return WP_REST_Response
     */
    public function get_stores( $request ) {
        $manager = new Manager();

        $data = $manager->get_stores( $request->get_params() );

        if ( is_wp_error( $data ) ) {
            return rest_ensure_response( $data );
        }

        return rest_ensure_response( $data );
    }

    /**
     * Checks if a given request has access to get items.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @since 3.5.1
     *
     * @return bool True if the request has read access, false otherwise.
     */
    public function get_transaction_types_permissions_check( $request ) {
        return is_user_logged_in();
    }

    /**
     * This method will return transaction types
     *
     * @param WP_REST_Request $request
     *
     * @since 3.5.1
     *
     * @return WP_REST_Response
     */
    public function get_transaction_types( $request ) {
        $transaction_types = Helper::get_transaction_types();
        $items          = [];
        foreach ( $transaction_types as $key => $title ) {
            $items[] = [
                'id'    => $key,
                'title' => $title,
            ];
        }

        $response = rest_ensure_response( $items );
        $response = $this->format_collection_response( $response, $request, count( $transaction_types ) );

        return $response;
    }

    /**
     * Prepare refund for response
     *
     * @since 3.5.1
     *
     * @param array $item
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function prepare_balance_for_response( $item, $request ) {
        $data = [
            'store_name'        => sanitize_text_field( $item['store_name'] ),
            'vendor_id'         => absint( $item['vendor_id'] ),
            'debit'             => $item['debit'],
            'credit'            => $item['credit'],
            'balance'           => (float) wc_format_decimal( $item['debit'] - $item['credit'] ),
            'last_payment_date' => ! empty( $item['last_payment_date'] ) ? dokan_format_date( $item['last_payment_date'] ) : '--',
        ];

        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $item, $request ) ); // todo: fix the links

        return apply_filters( 'dokan_rest_prepare_transaction_object', $response, $item, $request );
    }

    /**
     * Prepare transaction for response
     *
     * @since 3.5.1
     *
     * @param array $item
     * @param WP_REST_Request $request
     * @param float $current_balance
     *
     * @return WP_REST_Response
     */
    public function prepare_transaction_for_response( $item, $request, &$current_balance ) {
        $data = Helper::get_formated_transaction_data( $item, $current_balance );

        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $item, $request ) ); // todo: fix the links

        return apply_filters( 'dokan_rest_prepare_vendor_transaction_object', $response, $item, $request, $current_balance );
    }

    /**
     * Prepare links for the request.
     *
     * @since 3.5.1
     *
     * @param array $item
     * @param WP_REST_Request $request Request object.
     *
     * @return array Links for the given item.
     */
    protected function prepare_links( $item, $request ) {
        $links = [
            'self' => [
                'href' => rest_url( sprintf( '/%s/%s/store/%d', $this->namespace, $this->rest_base, isset( $item['vendor_id'] ) ? $item['vendor_id'] : 0 ) ),
            ],
            'collection' => [
                'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ),
            ],
        ];

        return $links;
    }

    /**
     * Format item's collection for response
     *
     * @since 3.5.1
     *
     * @param  WP_REST_Response|WP_Error $response
     * @param  WP_REST_Request $request
     * @param  int $total_items
     *
     * @return WP_REST_Response|WP_Error
     */
    public function format_collection_response( $response, $request, $total_items ) {
        if ( 0 === $total_items ) {
            return $response;
        }

        // Store pagination values for headers then unset for count query.
        $per_page = ! empty( $request['per_page'] ) ? (int) $request['per_page'] : -1;
        $page     = ! empty( $request['page'] ) ? (int) $request['page'] : 1;

        $response->header( 'X-WP-Total', (int) $total_items );

        $max_pages = ceil( $total_items / $per_page );

        $response->header( 'X-WP-TotalPages', (int) $max_pages );
        $base = add_query_arg( $request->get_query_params(), rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ) );

        // get previous page  link
        if ( $page > 1 ) {
            $prev_page = $page - 1;
            if ( $prev_page > $max_pages ) {
                $prev_page = $max_pages;
            }
            $prev_link = add_query_arg( 'page', $prev_page, $base );
            $response->link_header( 'prev', $prev_link );
        }

        // get next page link
        if ( $max_pages > $page ) {
            $next_page = $page + 1;
            $next_link = add_query_arg( 'page', $next_page, $base );
            $response->link_header( 'next', $next_link );
        }

        return $response;
    }

    /**
     * Retrieves the query params for the collections.
     *
     * @since 3.5.1
     *
     * @return array Query parameters for the collection.
     */
    public function get_stores_balance_route_params() {
        $collection_param = $this->get_collection_params();
        // unsetting search param, we don't need this for balance
        unset( $collection_param['search'] );

        return array_merge(
            $collection_param,
            [
                'vendor_id' => [
                    'description'       => __( 'Vendor ID to filter form', 'dokan-lite' ),
                    'type'              => 'array',
                    'required'          => false,
                    'validate_callback' => 'rest_validate_request_arg',
                    'items'             => [
                        'type' => 'integer',
                    ],
                ],
                'trn_date'  => [
                    'description' => __( 'Get transactions via date range', 'dokan-lite' ),
                    'required'    => false,
                    'type'        => 'object',
                    'properties' => [
                        'from'  => [
                            'type'     => [ 'string', null ],
                            'pattern'  => '^([0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?',
                            'default'  => '',
                            'required' => false,
                        ],
                        'to' => [
                            'type'     => [ 'string' ],
                            'pattern'  => '[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])',
                            'default'  => dokan_current_datetime()->setTime( 23, 59, 59 )->format( 'Y-m-d H:i:s' ),
                            'required' => true,
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Retrieves the query params for the collections.
     *
     * @since 3.5.1
     *
     * @return array Query parameters for the collection.
     */
    public function get_store_transactions_route_params() {
        $default_transaction_date = Helper::get_default_transaction_date();
        return [
			'context'   => $this->get_context_param(),
			'vendor_id' => [
				'description'       => __( 'Vendor ID to filter form', 'dokan-lite' ),
				'type'              => 'integer',
				'required'          => false,
				'validate_callback' => 'rest_validate_request_arg',
			],
			'trn_type' => [
				'description' => __( 'Transaction type to filter form', 'dokan-lite' ),
				'type'              => 'string',
				'required'          => false,
				'enum'              => array_keys( Helper::get_transaction_types() ),
				'validate_callback' => 'rest_validate_request_arg',
			],
			'trn_date'  => [
				'description' => __( 'Get transactions via date range', 'dokan-lite' ),
				'required'    => true,
				'type'        => 'object',
				'properties' => [
					'from'  => [
						'type'    => [ 'string' ],
						'pattern' => '[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])',
						'default' => $default_transaction_date['from'],
					],
					'to' => [
						'type'    => [ 'string' ],
						'pattern' => '[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])',
						'default' => $default_transaction_date['to'],
					],
				],
			],
        ];
    }

    /**
     * Get the Cart schema, conforming to JSON Schema.
     *
     * @since 3.5.1
     *
     * @return array
     */
    public function get_public_item_schema_for_store_balance() {
        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'stores-balance',
            'type'       => 'object',
            'properties' => [
                'store_name' => [
                    'description' => __( 'Store name', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'vendor_id' => [
                    'description' => __( 'ID of the Store', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'debit' => [
                    'description' => __( 'Amount that site admin charged to store owner', 'dokan-lite' ),
                    'type'        => 'number',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'credit' => [
                    'description' => __( 'Amount that has been paid via store owner to site admin', 'dokan-lite' ),
                    'type'        => 'number',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'balance' => [
                    'description' => __( 'Amount currently site owners owns from store owner', 'dokan-lite' ),
                    'type'        => 'number',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'last_payment_date' => [
                    'description' => __( 'Localized date of last payment received date.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
            ],
        ];

        return $this->add_additional_fields_schema( $schema );
    }

    /**
     * Get the Cart schema, conforming to JSON Schema.
     *
     * @since 3.5.1
     *
     * @return array
     */
    public function get_public_item_schema_for_single_store_transactions() {
        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'transactions',
            'type'       => 'object',
            'properties' => [
                'id' => [
                    'description' => __( 'ID of the transaction', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'trn_id' => [
                    'description' => __( 'Transaction ID', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'trn_url' => [
                    'description' => __( 'Transaction URL.', 'dokan-lite' ),
                    'type'        => 'string',
                    'format'      => 'uri',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'trn_date' => [
                    'description' => __( 'Localized date of last payment received date.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'trn_type' => [
                    'description' => __( 'Transaction type to filter form', 'dokan-lite' ),
                    'type'              => 'string',
                    'readonly'          => true,
                    'enum'              => array_keys( Helper::get_transaction_types() ),
                ],
                'vendor_id' => [
                    'description' => __( 'ID of the Store', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'note' => [
                    'description' => __( 'Added note.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'debit' => [
                    'description' => __( 'Amount that site admin charged to store owner', 'dokan-lite' ),
                    'type'        => 'number',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'credit' => [
                    'description' => __( 'Amount that has been paid via store owner to site admin', 'dokan-lite' ),
                    'type'        => 'number',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'balance' => [
                    'description' => __( 'Amount currently site owners owns from store owner', 'dokan-lite' ),
                    'type'        => 'number',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
            ],
        ];

        return $this->add_additional_fields_schema( $schema );
    }

    /**
     * Get the Cart schema, conforming to JSON Schema.
     *
     * @since 3.5.1
     *
     * @return array
     */
    public function get_public_item_schema_for_transaction_types() {
        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'transaction-types',
            'type'       => 'object',
            'properties' => [
                'id' => [
                    'description' => __( 'ID of the transaction type', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'title' => [
                    'description' => __( 'Translated title of the transaction type', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
            ],
        ];

        return $this->add_additional_fields_schema( $schema );
    }

    /**
     * Get the Cart schema, conforming to JSON Schema.
     *
     * @since 3.5.1
     *
     * @return array
     */
    public function get_public_schema_for_stores() {
        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'stores',
            'type'       => 'object',
            'properties' => [
                'id' => [
                    'description' => __( 'ID of the store', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'name' => [
                    'description' => __( 'Name of the store', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
            ],
        ];

        return $this->add_additional_fields_schema( $schema );
    }
}
