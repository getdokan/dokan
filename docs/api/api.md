# Dokan REST Controllers Documentation

- [Introduction](#introduction)
- [Base REST Controller](#base-rest-controller)
- [1. Role-Specific Controllers.](#1-role-specifix-controllers)
    - [Admin REST Controller.](#admin-rest-controller)
    - [Vendor REST Controller.](#vendor-rest-controller)
    - [Customer REST Controller.](#customer-rest-controller)

## Introduction
The Dokan REST Controllers provide a structured approach to handle REST API endpoints with role-based permissions. The hierarchy consists of a base controller (`DokanRESTBaseController`) and role-specific controllers (`DokanRESTAdminController`, `DokanRESTVendorController`, `DokanRESTCustomerController`).

## Base REST Controller
The `DokanRESTBaseController` extends WordPress's `WP_REST_Controller` and provides common functionality for all Dokan REST endpoints.

### Base Controller Implementation
```php
abstract class DokanRESTBaseController extends WP_REST_Controller {
    protected $namespace = 'dokan/v1';

    public function format_collection_response( $response, $request, $total_items ) {
        // Handles pagination and response formatting
    }
}
```

## Role-Specific Controllers

### Admin REST Controller Implementation

```php
abstract class DokanRESTAdminController extends DokanRESTBaseController {
    protected $namespace = 'dokan/v1/admin';
    
    public function check_permission() {
        return current_user_can( 'manage_woocommerce' );
    }
}
```

### How to extend the Admin REST Controller

```php
class ExampleAdminController extends DokanRESTAdminController {
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

    public function get_items( $request ) {
        $items = []; // Your implementation
        $total = count( $items );
        
        $response = rest_ensure_response( $items );
        return $this->format_collection_response( $response, $request, $total );
    }
}
```

### Override Admin REST Controller permission

```php
class ExampleAdminController extends DokanRESTAdminController {
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
    
    public function check_permission() {
        // Custom permission check for multiple roles
        return current_user_can( 'dokandar' ) || current_user_can( 'manage_woocommerce' );
    }

    public function get_items( $request ) {
        $items = []; // Your implementation
        $total = count( $items );
        
        $response = rest_ensure_response( $items );
        return $this->format_collection_response( $response, $request, $total );
    }
}
```

### Vendor REST Controller Implementation

```php
abstract class DokanRESTVendorController extends DokanRESTBaseController {
    protected $rest_base = 'vendor';
    
    public function check_permission() {
        return current_user_can( 'dokandar' );
    }
}
```

### How to extend the Vendor REST Controller

```php
class ExampleVendorController extends DokanRESTVendorController {
    // protected $namespace = 'dokan/v1'; (namespace will be inherited from the parent class)
    protected $rest_base = 'example-vendor';

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

    public function get_items( $request ) {
        $items = []; // Your implementation
        $total = count( $items );
        
        $response = rest_ensure_response( $items );
        return $this->format_collection_response( $response, $request, $total );
    }
}
```

### Override Vendor REST Controller permission

```php
class ExampleVendorController extends DokanRESTVendorController {
    // protected $namespace = 'dokan/v1'; (namespace will be inherited from the parent class)
    protected $rest_base = 'example-vendor';

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
    
    public function check_permission() {
        // Custom permission check.
        return current_user_can( 'dokandar' ) || is_user_logged_in();
    }

    public function get_items( $request ) {
        $items = []; // Your implementation
        $total = count( $items );
        
        $response = rest_ensure_response( $items );
        return $this->format_collection_response( $response, $request, $total );
    }
}
```

### Customer REST Controller Implementation

```php
abstract class DokanRESTCustomerController extends DokanRESTBaseController {
    // protected $namespace = 'dokan/v1'; (namespace will be inherited from the parent class)
    protected $rest_base = 'customer';
    
    public function check_permission() {
        return is_user_logged_in();
    }
}
```

### How to extend the Customer REST Controller

```php
class ExampleCustomerController extends DokanRESTCustomerController {
    // protected $namespace = 'dokan/v1'; (namespace will be inherited from the parent class)
    protected $rest_base = 'example-customer';

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

    public function get_items( $request ) {
        $items = []; // Your implementation
        $total = count( $items );
        
        $response = rest_ensure_response( $items );
        return $this->format_collection_response( $response, $request, $total );
    }
}
```

### Override Customer REST Controller permission

```php
class ExampleCustomerController extends DokanRESTCustomerController {
    // protected $namespace = 'dokan/v1'; (namespace will be inherited from the parent class)
    protected $rest_base = 'example-customer';

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
    
    public function check_permission() {
        // Custom permission check.
        return is_user_logged_in() || dokan_is_seller_enabled( get_current_user_id() );;
    }

    public function get_items( $request ) {
        $items = []; // Your implementation
        $total = count( $items );
        
        $response = rest_ensure_response( $items );
        return $this->format_collection_response( $response, $request, $total );
    }
}
```
