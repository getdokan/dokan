# Dokan REST Controllers Documentation

## Table of Contents
- [Introduction](#introduction)
- [Creating a REST Controller](#creating-a-rest-controller)
  - [Extending a Dokan Base Controller](#extending-a-dokan-base-controller)
  - [Extending Other Controllers](#extending-other-controllers)
- [VendorAuthorizable Trait](#vendorauthorizable-trait)
- [Example Implementations](#example-implementations)
  - [Admin Controller Example](#admin-controller-example)
  - [Vendor Controller Example](#vendor-controller-example)

## Introduction
Dokan REST Controllers provide a structured approach to managing REST API endpoints with role-based permissions. The hierarchy consists of a base controller, `DokanBaseBaseController`, and role-specific controllers:

- `DokanBaseAdminController`
- `DokanBaseVendorController`
- `DokanBaseCustomerController`

These controllers extend the core `WP_REST_Controller` and provide predefined functionalities for different user roles.

## Creating a REST Controller

To create a new REST controller, extend one of the Dokan base controllers and override the required methods from `WP_REST_Controller`.

### Extending a Dokan Base Controller

When extending a Dokan base controller, ensure you override the `prepare_item_for_response` method and implement required route registrations.

#### Required Method Implementation

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
        sprintf( __( "Method '%s' not implemented. Must be overridden in subclass." ), __METHOD__ ),
        array( 'status' => 405 )
    );
}
```

### Extending Other Controllers

Dokan provides the `VendorAuthorizable` trait, which can be used to check vendor capabilities in custom controllers that do not directly extend a Dokan base controller.

## VendorAuthorizable Trait

The `VendorAuthorizable` trait provides a way to check vendor permissions in REST controllers. It ensures that only authorized vendors can access or modify specific resources.

### Usage
To use the `VendorAuthorizable` trait, simply include it in your controller class:

```php
use WeDevs\Dokan\Traits\VendorAuthorizable;

class VendorProductController extends \WC_REST_Products_Controller {
    use VendorAuthorizable;
}
```

This trait provides a `check_permission` method, which can be used to verify if a user has the vendor(`dokandar`) capabilities to perform a given action.

## Example Implementations

### Admin Controller Example

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
            return new WP_Error( 'woocommerce_rest_invalid_id', __( 'Invalid resource ID.', 'woocommerce' ), [ 'status' => 404 ] );
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
        return apply_filters( 'dokan_rest_prepare_admin', $response, $user_data, $request );
    }
}
```

This structure ensures that all controllers follow a standardized format while allowing flexibility and extendability.

