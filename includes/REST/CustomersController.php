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
        if ( ! $this->check_vendor_permission() ) {
            $messages = [
                'view'   => __( 'Sorry, you cannot list resources.', 'dokan-lite' ),
                'create' => __( 'Sorry, you are not allowed to create resources.', 'dokan-lite' ),
                'edit'   => __( 'Sorry, you are not allowed to edit this resource.', 'dokan-lite' ),
                'delete' => __( 'Sorry, you are not allowed to delete this resource.', 'dokan-lite' ),
                'batch'  => __( 'Sorry, you are not allowed to batch update resources.', 'dokan-lite' ),
                'search' => __( 'Sorry, you are not allowed to search customers.', 'dokan-lite' ),
            ];
            return new WP_Error( "dokan_rest_cannot_$action", $messages[ $action ], [ 'status' => rest_authorization_required_code() ] );
        }
        return true;
    }

    /**
     * Check if the current user has vendor permissions.
     *
     * @return bool
     */
    public function check_vendor_permission(): bool {
        return dokan_is_user_seller( dokan_get_current_user_id() );
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
                return parent::get_items( $request );
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
        add_filter( 'woocommerce_rest_check_permissions', [ $this, 'check_vendor_permission' ] );
        $result = $action();
        remove_filter( 'woocommerce_rest_check_permissions', [ $this, 'check_vendor_permission' ] );
        return $result;
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
