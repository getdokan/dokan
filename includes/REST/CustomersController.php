<?php

namespace WeDevs\Dokan\REST;

use WC_Data;
use WC_Customer;
use WC_Data_Store;
use WC_REST_Customers_Controller;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class CustomersController extends WC_REST_Customers_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Register the routes for customers.
     */
    public function register_routes() {
        parent::register_routes();

        // Add new route for searching customers
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/search', array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'search_customers' ),
					'permission_callback' => array( $this, 'search_customers_permissions_check' ),
					'args'                => array(
						'search' => array(
							'description' => __( 'Search string.', 'dokan-lite' ),
							'type'        => 'string',
							'required'    => true,
						),
						'exclude' => array(
							'description' => __( 'Comma-separated list of customer IDs to exclude.', 'dokan-lite' ),
							'type'        => 'string',
						),
					),
				),
            )
        );
    }

    /**
     * Check if a given request has access to perform an action.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @param string $action The action to check (view, create, edit, delete).
     *
     * @return WP_Error|boolean
     */
    protected function check_permission( $request, $action ) {
        $messages = [
            'view'   => __( 'Sorry, you cannot list resources.', 'dokan-lite' ),
            'create' => __( 'Sorry, you are not allowed to create resources.', 'dokan-lite' ),
            'edit'   => __( 'Sorry, you are not allowed to edit this resource.', 'dokan-lite' ),
            'delete' => __( 'Sorry, you are not allowed to delete this resource.', 'dokan-lite' ),
            'batch'  => __( 'Sorry, you are not allowed to batch update resources.', 'dokan-lite' ),
            'search' => __( 'Sorry, you are not allowed to search customers.', 'dokan-lite' ),
        ];

        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( "dokan_rest_cannot_$action", $messages[ $action ], [ 'status' => rest_authorization_required_code() ] );
        }

        // CVE-2026-8761: object-level authorization for mutating actions.
        $target_id = isset( $request['id'] ) ? (int) $request['id'] : 0;
        if ( $target_id > 0 && in_array( $action, [ 'view', 'edit', 'delete' ], true ) ) {
            $allowed = $this->is_target_user_allowed( $target_id );
            if ( is_wp_error( $allowed ) ) {
                $status = $allowed->get_error_data();
                $status = isset( $status['status'] ) ? (int) $status['status'] : 403;
                return new WP_Error( "dokan_rest_cannot_$action", $messages[ $action ], [ 'status' => $status ] );
            }
        }

        return true;
    }

    /**
     * Verify the requesting vendor may mutate the target user.
     *
     * Rejects targets that are missing, hold admin-grade capabilities,
     * are themselves a vendor, or have never placed an order with the
     * requesting vendor. CVE-2026-8761.
     *
     * @param int $target_id Target user id.
     *
     * @return true|WP_Error
     */
    protected function is_target_user_allowed( int $target_id ) {
        if ( $target_id <= 0 || ! get_userdata( $target_id ) ) {
            return new WP_Error( 'dokan_rest_invalid_target', __( 'Invalid user.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $protected_caps = apply_filters(
            'dokan_rest_protected_user_caps',
            [
                'manage_options',
				'manage_woocommerce',
                'edit_users',
				'delete_users',
				'list_users',
				'promote_users',
				'create_users',
				'remove_users',
			]
        );
        foreach ( $protected_caps as $cap ) {
            if ( user_can( $target_id, $cap ) ) {
                return new WP_Error( 'dokan_rest_forbidden_target', __( 'You cannot operate on this user.', 'dokan-lite' ), [ 'status' => 403 ] );
            }
        }

        if ( dokan_is_user_seller( $target_id ) ) {
            return new WP_Error( 'dokan_rest_forbidden_target', __( 'You cannot operate on this user.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        if ( ! dokan_customer_has_order_from_this_seller( $target_id, dokan_get_current_user_id() ) ) {
            return new WP_Error( 'dokan_rest_forbidden_target', __( 'You cannot operate on this customer.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * Check if the current user has vendor permissions.
     *
     * Doubles as a callback on the woocommerce_rest_check_permissions
     * filter so WooCommerce's internal capability checks for mutating
     * operations (create/edit/delete/batch) re-validate the target user.
     * Read context is allowed through for the vendor.
     *
     * @param bool|mixed $permission  Original permission decision when used as a filter callback.
     * @param string     $context     Operation context (read/edit/delete/create/batch).
     * @param int        $object_id   Target object id.
     * @param string     $object_type Object type (expected: user).
     *
     * @return bool
     */
    public function check_vendor_permission( $permission = false, $context = '', $object_id = 0, $object_type = '' ): bool {
        if ( ! dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return false;
        }

        $object_id = (int) $object_id;
        if ( $object_id > 0 && ( '' === $object_type || 'user' === $object_type ) && in_array( $context, [ 'create', 'edit', 'delete', 'batch' ], true ) ) {
            return ! is_wp_error( $this->is_target_user_allowed( $object_id ) );
        }

        return true;
    }

    /**
     * Get all customers.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_items( $request ) {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                $response = parent::get_items( $request );
                if ( is_wp_error( $response ) || ! ( $response instanceof WP_REST_Response ) ) {
                    return $response;
                }

                $vendor_id = dokan_get_current_user_id();
                $data = array_values(
                    array_filter(
                        (array) $response->get_data(),
                        static function ( $item ) use ( $vendor_id ) {
							$id = is_array( $item ) ? ( $item['id'] ?? 0 ) : 0;
							return $id && dokan_customer_has_order_from_this_seller( $id, $vendor_id );
                        }
                    )
                );

                $response->set_data( $data );
                return $response;
            }
        );
    }

    /**
     * Get a single customer.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_item( $request ) {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::get_item( $request );
            }
        );
    }

    /**
     * Create a customer.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function create_item( $request ) {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::create_item( $request );
            }
        );
    }

    /**
     * Update a customer.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function update_item( $request ) {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::update_item( $request );
            }
        );
    }

    /**
     * Delete a customer.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function delete_item( $request ) {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::delete_item( $request );
            }
        );
    }

    public function batch_items( $request ) {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::batch_items( $request );
            }
        );
    }

    /**
     * Search customers for the current vendor.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     * @throws \Exception
     */
    public function search_customers( $request ) {
        if ( ! current_user_can( 'edit_shop_orders' ) ) {
            return new WP_Error( 'dokan_rest_cannot_search', __( 'You do not have permission to search customers.', 'dokan-lite' ), [ 'status' => rest_authorization_required_code() ] );
        }

        $term = $request->get_param( 'search' );
        $exclude = $request->get_param( 'exclude' ) ? explode( ',', $request->get_param( 'exclude' ) ) : [];
        $limit = '';

        if ( empty( $term ) ) {
            return new WP_Error( 'dokan_rest_empty_search', __( 'Search term is required.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $ids = [];
        // Search by ID.
        if ( is_numeric( $term ) ) {
            $customer = new WC_Customer( intval( $term ) );

            // Customer exists.
            if ( 0 !== $customer->get_id() ) {
                $ids = [ $customer->get_id() ];
            }
        }

        // Usernames can be numeric so we first check that no users was found by ID before searching for numeric username, this prevents performance issues with ID lookups.
        if ( empty( $ids ) ) {
            $data_store = WC_Data_Store::load( 'customer' );

            // If search is smaller than 3 characters, limit result set to avoid
            // too many rows being returned.
            if ( 3 > strlen( $term ) ) {
                $limit = 20;
            }
            $ids = $data_store->search_customers( $term, $limit );
        }

        $found_customers = [];

        $ids = array_diff( $ids, $exclude );

        foreach ( $ids as $id ) {
            if ( ! dokan_customer_has_order_from_this_seller( $id ) ) {
                continue;
            }

            $customer = new WC_Customer( $id );
            $found_customers[ $id ] = [
                'id' => $id,
                'name' => sprintf(
                    '%s',
                    $customer->get_first_name() . ' ' . $customer->get_last_name()
                ),
                'email' => $customer->get_email(),
            ];
        }

        /**
         * Filter the found customers for Dokan REST API search.
         *
         * This filter allows you to modify the list of customers found during a search
         * before it is returned by the REST API.
         *
         * @since 4.0.0
         *
         * @param array $found_customers An array of found customers. Each customer is an array containing:
         *                               'id'    => (int)    The customer's ID.
         *                               'name'  => (string) The customer's full name.
         *                               'email' => (string) The customer's email address.
         * @param string $term           The search term used to find customers.
         * @param array  $exclude        An array of customer IDs to exclude from the search results.
         * @param int    $limit          The maximum number of results to return (if any).
         *
         * @return array The filtered array of found customers.
         */
        $found_customers = apply_filters( 'dokan_json_search_found_customers', $found_customers, $term, $exclude, $limit );

        return rest_ensure_response( array_values( $found_customers ) );
    }

    /**
     * Prepare a single customer for create or update.
     *
     * @param WP_REST_Request $request Request object.
     * @param bool            $creating If is creating a new object.
     *
     * @return WP_Error|WC_Data
     */
    protected function prepare_object_for_database( $request, $creating = false ) {
        // CVE-2026-8761: never allow role/roles via this endpoint.
        if ( null !== $request->get_param( 'role' ) || null !== $request->get_param( 'roles' ) ) {
            return new WP_Error( 'dokan_rest_forbidden_field', __( 'You cannot modify the role of a user.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        $customer = parent::prepare_object_for_database( $request, $creating );

        if ( is_wp_error( $customer ) ) {
            return $customer;
        }

        if ( ! $customer instanceof WC_Customer ) {
            return new WP_Error( 'dokan_rest_invalid_customer', __( 'Invalid customer.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        // Add any Dokan-specific customer preparation here

        return apply_filters( "dokan_rest_pre_insert_{$this->post_type}_object", $customer, $request, $creating );
    }

    /**
     * Perform an action with vendor permission check.
     *
     * @param callable $action The action to perform.
     *
     * @return mixed The result of the action.
     */
    private function perform_vendor_action( callable $action ) {
        add_filter( 'woocommerce_rest_check_permissions', [ $this, 'check_vendor_permission' ], 10, 4 );
        try {
            return $action();
        } finally {
            remove_filter( 'woocommerce_rest_check_permissions', [ $this, 'check_vendor_permission' ], 10 );
        }
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        return $this->check_permission( $request, 'view' );
    }

    /**
     * Check if a given request has access to get a specific item.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function get_item_permissions_check( $request ) {
        return $this->check_permission( $request, 'view' );
    }

    /**
     * Check if a given request has access to create a customer.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function create_item_permissions_check( $request ) {
        return $this->check_permission( $request, 'create' );
    }

    /**
     * Check if a given request has access to update a customer.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function update_item_permissions_check( $request ) {
        return $this->check_permission( $request, 'edit' );
    }

    /**
     * Check if a given request has access to delete a customer.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function delete_item_permissions_check( $request ) {
        return $this->check_permission( $request, 'delete' );
    }

    /**
     * Check if a given request has access to batch items.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function batch_items_permissions_check( $request ) {
        return $this->check_permission( $request, 'batch' );
    }

    /**
     * Check if a given request has access to search customers.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function search_customers_permissions_check( $request ) {
        return $this->check_permission( $request, 'search' );
    }
}
