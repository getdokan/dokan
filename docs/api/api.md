# Dokan REST Controllers Documentation

## Table of Contents
- [Introduction](#introduction)
- [Implementing a REST Controller](#implementing-a-rest-controller)

## Introduction
Dokan REST Controllers provide a structured approach to managing REST API endpoints with role-based permissions. The hierarchy consists of a base controller, `DokanBaseBaseController`, and role-specific controllers, including:
- `DokanBaseAdminController`
- `DokanBaseVendorController`
- `DokanBaseCustomerController`

## Implementing a REST Controller

To create a new REST controller, extend one of the Dokan base controllers (`DokanBaseBaseController`, `DokanBaseAdminController`, `DokanBaseVendorController`, `DokanBaseCustomerController`) and **override** the required methods from `WP_REST_Controller`.

### Required Method Implementation

```php
/**
 * Prepares the item for the REST response.
 *
 * @since DOKAN_SINCE
 *
 * @param mixed           $item    WordPress representation of the item.
 * @param WP_REST_Request $request Request object.
 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
 */
public function prepare_item_for_response( $item, $request ) {
    return new WP_Error(
        'invalid-method',
        /* translators: %s: Method name. */
        sprintf( __( "Method '%s' not implemented. Must be overridden in subclass." ), __METHOD__ ),
        array( 'status' => 405 )
    );
}
```

In general, the item should be mapped, and a **Filter** should be applied to enable extendibility.

### Example: Creating an Admin REST Controller

```php
use WeDevs\Dokan\REST\DokanBaseAdminController;

class ExampleAdminController extends DokanBaseAdminController {
    protected $namespace = 'dokan/v1';
    protected $rest_base = 'example-admin';

    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_collection_params(),
                ]
            ]
        );
    }

    /**
     * Retrieve a single customer.
     *
     * @param WP_REST_Request $request Request details.
     * @return WP_Error|WP_REST_Response
     */
    public function get_item( $request ) {
        $id        = (int) $request['id'];
        $user_data = get_userdata( $id );

        if ( empty( $id ) || empty( $user_data->ID ) ) {
            return new WP_Error( 'woocommerce_rest_invalid_id', __( 'Invalid resource ID.', 'woocommerce' ), array( 'status' => 404 ) );
        }

        $customer = $this->prepare_item_for_response( $user_data, $request );
        return rest_ensure_response( $customer );
    }

    /**
     * Formats a single customer for response output.
     *
     * @param WP_User         $user_data User object.
     * @param WP_REST_Request $request   Request object.
     * @return WP_REST_Response Response data.
     */
    public function prepare_item_for_response( $user_data, $request ) {
        // TODO: Implement API response formatting

        /**
         * Filter customer data returned from the REST API.
         *
         * @param WP_REST_Response $response   The response object.
         * @param WP_User          $user_data  User object used to create response.
         * @param WP_REST_Request  $request    Request object.
         */
        return apply_filters( 'dokan_rest_prepare_admin', $response, $user_data, $request );
    }
}
```

This structure ensures that all controllers follow a standardized format while allowing flexibility and extendability.

