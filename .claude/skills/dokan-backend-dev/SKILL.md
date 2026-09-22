---
name: dokan-backend-dev
description: Add or modify Dokan backend PHP code following project conventions. Use when creating new classes, methods, hooks, REST controllers, or modifying existing backend code. Invoke before writing PHP unit tests.
---

# Dokan Backend Development

This skill provides guidance for developing Dokan Lite backend PHP code according to project standards.

## When to Use This Skill

**Invoke this skill before:**

-   Writing new PHP unit tests
-   Creating new PHP classes or services
-   Modifying existing backend PHP code
-   Adding hooks, filters, or REST endpoints

## References

-   [`references/authorization.md`](./references/authorization.md) — roles,
    capabilities, ownership scoping, REST permission patterns, `map_meta_cap`,
    and the Abilities/MCP scoping layer. **Read before writing any permission
    callback, capability check, or ownership guard.** Includes verified
    measurements of where WooCommerce's own permission helpers do *not* form an
    authorization boundary.

## Namespace & File Structure

-   **Root namespace:** `WeDevs\Dokan\`
-   **PSR-4 autoloading:** `WeDevs\Dokan\` maps to `includes/`
-   **File path follows namespace:** `WeDevs\Dokan\Order\Manager` → `includes/Order/Manager.php`
-   **Third-party (Mozart):** `WeDevs\Dokan\ThirdParty\Packages\` → `lib/packages/`

## Class Conventions

### Method & Property Naming

-   Methods: `snake_case` (WordPress convention) — e.g., `register_routes()`, `get_stores()`
-   Properties: typed (PHP 7.4+) — e.g., `protected bool $should_adjust_refund = true;`
-   Constants: `UPPER_SNAKE_CASE`

### Manager Pattern

Most subsystems use a `Manager` class as the primary facade:

```php
namespace WeDevs\Dokan\Order;

class Manager {
    public function all( $args = [] ) { ... }
    public function get( $id ) { ... }
    public function create( $args ) { ... }
}
```

Access via: `dokan()->order->all()`

### Hookable Interface

Classes that register WordPress hooks should implement `Hookable`:

```php
namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\Contracts\Hookable;

class Hooks implements Hookable {
    public function register_hooks(): void {
        add_action( 'save_post_product', [ $this, 'handle_product_save' ], 10, 2 );
        add_filter( 'dokan_product_listing_args', [ $this, 'filter_listing_args' ] );
    }
}
```

Classes implementing `Hookable` are auto-registered in `CommonServiceProvider` — their hooks load automatically.

## Dependency Injection

Uses **League Container v4** (namespaced under `WeDevs\Dokan\ThirdParty\Packages\League\Container`).

### Registering Services

Add to the appropriate `ServiceProvider` in `includes/DependencyManagement/Providers/`:

```php
// In ServiceProvider.php (main) for core services:
protected $services = [
    'my_service' => \WeDevs\Dokan\MyDomain\Manager::class,
];

// In CommonServiceProvider.php for Hookable classes:
protected $services = [
    \WeDevs\Dokan\MyDomain\Hooks::class,
];
```

### Accessing Services

```php
// Via magic getter (most common)
dokan()->order->get( $order_id );
dokan()->vendor->get( $vendor_id );

// Via container directly
dokan()->get_container()->get( 'order' );
```

### Base Service Provider Helper

Use `share_with_implements_tags()` to auto-tag services by their interfaces:

```php
$this->share_with_implements_tags( MyService::class );
```

## REST API Controllers

### Controller Hierarchy

```text
WP_REST_Controller (WordPress core)
└── DokanBaseController (dokan/v1)
    ├── DokanBaseAdminController (dokan/v1/admin) — admin-only endpoints
    ├── DokanBaseVendorController (dokan/v1) — vendor endpoints (uses VendorAuthorizable trait)
    └── DokanBaseCustomerController (dokan/v1) — customer endpoints
```

Choose the appropriate base class:

-   `DokanBaseAdminController` — For admin-only endpoints (`dokan/v1/admin/*`). Has built-in `check_permission()` checking `manage_woocommerce` capability.
-   `DokanBaseVendorController` — For vendor endpoints. Includes `VendorAuthorizable` trait for store access checks.
-   `DokanBaseController` — For general endpoints that don't fit the above.

> **Note:** Some older controllers extend `WP_REST_Controller` directly (e.g., `StoreController`, `WithdrawController`). New controllers should extend one of the Dokan base classes.

### Full Controller Example

```php
namespace WeDevs\Dokan\REST;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WeDevs\Dokan\Traits\RESTResponseError;

class MyResourceController extends DokanBaseAdminController {

    use RESTResponseError;

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'my-resource';

    /**
     * Register routes.
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base, [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'args'                => array_merge(
                        $this->get_collection_params(),
                        [
                            'status' => [
                                'description' => __( 'Filter by status.', 'dokan-lite' ),
                                'type'        => 'string',
                                'enum'        => [ 'active', 'inactive' ],
                                'default'     => 'active',
                            ],
                        ]
                    ),
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_item' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                'schema' => [ $this, 'get_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
                'args' => [
                    'id' => [
                        'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Batch endpoint
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/batch', [
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'batch_items' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_public_batch_schema()['properties'],
                ],
                'schema' => [ $this, 'get_public_batch_schema' ],
            ]
        );
    }
}
```

### Prepare Item for Response

Every controller must implement `prepare_item_for_response()`. This method transforms the internal data model into the REST API response shape, adds HATEOAS links, and applies an extensibility filter:

```php
/**
 * Prepare a single item for response.
 *
 * @param MyModel         $item    Data object.
 * @param WP_REST_Request $request Request object.
 *
 * @return WP_REST_Response
 */
public function prepare_item_for_response( $item, $request ) {
    $data = [
        'id'          => absint( $item->get_id() ),
        'title'       => $item->get_title(),
        'status'      => $item->get_status(),
        'amount'      => floatval( $item->get_amount() ),
        'created'     => mysql_to_rfc3339( $item->get_date() ),
    ];

    $data = apply_filters( 'dokan_rest_prepare_my_resource_data', $data, $item, $request );

    $response = rest_ensure_response( $data );
    $response->add_links( $this->prepare_links( $item, $request ) );

    return apply_filters( 'dokan_rest_prepare_my_resource_object', $response, $item, $request );
}
```

### Prepare Links (HATEOAS)

Provide `self` and `collection` links for discoverability:

```php
/**
 * Prepare links for the request.
 *
 * @param MyModel         $item    Object data.
 * @param WP_REST_Request $request Request object.
 *
 * @return array Links for the given item.
 */
protected function prepare_links( $item, $request ) {
    return [
        'self'       => [
            'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->rest_base, $item->get_id() ) ),
        ],
        'collection' => [
            'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ),
        ],
    ];
}
```

### Collection Response with Pagination

Use `format_collection_response()` (inherited from `DokanBaseController`) to add pagination headers:

```php
public function get_items( $request ) {
    $args = [
        'number' => (int) $request['per_page'],
        'offset' => (int) ( $request['page'] - 1 ) * $request['per_page'],
    ];

    $items       = $this->get_my_items( $args );
    $total_items = $this->get_my_items_count( $args );

    $data = [];
    foreach ( $items as $item ) {
        $item_data = $this->prepare_item_for_response( $item, $request );
        $data[]    = $this->prepare_response_for_collection( $item_data );
    }

    $response = rest_ensure_response( $data );
    $response = $this->format_collection_response( $response, $request, $total_items );

    return $response;
}
```

`format_collection_response()` sets these headers automatically:

-   `X-WP-Total` — Total item count
-   `X-WP-TotalPages` — Total page count
-   `Link: <url>; rel="prev"` / `Link: <url>; rel="next"` — Pagination links

### Item Schema

Define `get_item_schema()` to enable automatic argument validation via `get_endpoint_args_for_item_schema()`:

```php
public function get_item_schema() {
    $schema = [
        '$schema'    => 'http://json-schema.org/draft-04/schema#',
        'title'      => 'my-resource',
        'type'       => 'object',
        'properties' => [
            'id'     => [
                'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                'type'        => 'integer',
                'context'     => [ 'view', 'edit' ],
                'readonly'    => true,
            ],
            'title'  => [
                'description' => __( 'Resource title.', 'dokan-lite' ),
                'type'        => 'string',
                'context'     => [ 'view', 'edit' ],
                'required'    => true,
            ],
            'status' => [
                'description' => __( 'Resource status.', 'dokan-lite' ),
                'type'        => 'string',
                'enum'        => [ 'active', 'inactive' ],
                'context'     => [ 'view', 'edit' ],
                'default'     => 'active',
            ],
            'amount' => [
                'description' => __( 'Amount value.', 'dokan-lite' ),
                'type'        => 'number',
                'context'     => [ 'view', 'edit' ],
                'required'    => true,
            ],
        ],
    ];

    return $this->add_additional_fields_schema( $schema );
}
```

### Error Handling

Use `WP_Error` with descriptive error codes and HTTP status:

```php
return new WP_Error(
    'dokan_rest_resource_not_found',
    __( 'Resource not found.', 'dokan-lite' ),
    [ 'status' => 404 ]
);
```

For exception-based error handling, use the `RESTResponseError` trait:

```php
use WeDevs\Dokan\Traits\RESTResponseError;

class MyController extends DokanBaseController {
    use RESTResponseError;

    public function create_item( $request ) {
        try {
            // ... business logic that may throw DokanException
        } catch ( Exception $e ) {
            return $this->send_response_error( $e );
        }
    }
}
```

### Permission Callbacks

**Admin controllers** inherit `check_permission()` from `DokanBaseAdminController`.

**Vendor controllers** use `VendorAuthorizable` trait methods:

```php
// Check if current user can access a vendor's store
$this->can_access_vendor_store( $store_id );

// Resolve vendor ID (handles vendor staff → vendor mapping)
$store_id = $this->get_vendor_id_for_user( $requested_id );
```

**Custom permission checks** — use WordPress capabilities:

```php
public function get_items_permissions_check( $request ) {
    return current_user_can( 'dokan_manage_withdraw' );
}
```

### Route Argument Validation

Define args inline with `type`, `enum`, `required`, `default`, `sanitize_callback`, `validate_callback`:

```php
'args' => [
    'id' => [
        'description'       => __( 'Unique identifier for the object.', 'dokan-lite' ),
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'validate_callback' => [ $this, 'validate_resource_id' ],
    ],
],
```

### Extensibility via Filters

Controllers should apply filters at key extension points:

```php
// Filter collection query args
$args = apply_filters( 'dokan_rest_get_my_resource_args', $args, $request );

// Filter collection endpoint params
'args' => apply_filters( 'dokan_rest_api_my_resource_collection_params', $this->get_collection_params() ),

// Filter prepared response
return apply_filters( 'dokan_rest_prepare_my_resource_object', $response, $item, $request );

// Action after create/update
do_action( 'dokan_rest_insert_my_resource', $item, $request, $creating );
```

### Registering a Controller

Add via the `dokan_rest_api_class_map` filter in `REST\Manager`:

```php
add_filter( 'dokan_rest_api_class_map', function ( $class_map ) {
    $class_map[ DOKAN_DIR . '/includes/REST/MyResourceController.php' ] = '\WeDevs\Dokan\REST\MyResourceController';
    return $class_map;
} );
```

### API Versioning

Multiple versions exist side-by-side: `OrderController.php` (v1), `OrderControllerV2.php`, `OrderControllerV3.php`. Namespace changes accordingly (`dokan/v1`, `dokan/v2`, `dokan/v3`).

### Key REST Reference Files

-   `includes/REST/DokanBaseController.php` — Base controller with `format_collection_response()` pagination
-   `includes/REST/DokanBaseAdminController.php` — Admin base (`dokan/v1/admin`, `check_permission()`)
-   `includes/REST/DokanBaseVendorController.php` — Vendor base (`VendorAuthorizable` trait)
-   `includes/REST/DokanBaseCustomerController.php` — Customer base
-   `includes/REST/Manager.php` — Controller registration & `dokan_rest_api_class_map` filter
-   `includes/Traits/RESTResponseError.php` — Exception-to-WP_Error trait
-   `includes/Traits/VendorAuthorizable.php` — Vendor store access authorization

## Extensibility Patterns

### Filters

```php
$value = apply_filters( 'dokan_get_vendor_orders', $orders, $args );
$params = apply_filters( 'dokan_rest_api_store_collection_params', $this->get_store_collection_params() );
```

### Actions

```php
do_action( 'dokan_rest_insert_product_object', $product, $request, true );
do_action( 'dokan_new_seller_created', $vendor_id, $data );
```

### Plugin Options

```php
$value = dokan_get_option( 'key', 'dokan_option_group', 'default' );
```

## Localization / Translation (PHP)

**Text domain:** `dokan-lite` — used for ALL translatable strings in Lite.

### Translation Functions

| Function | Usage |
|---|---|
| `__( 'Text', 'dokan-lite' )` | Return translated string |
| `_e( 'Text', 'dokan-lite' )` | Echo translated string |
| `esc_html__( 'Text', 'dokan-lite' )` | Return translated + HTML-escaped |
| `esc_html_e( 'Text', 'dokan-lite' )` | Echo translated + HTML-escaped |
| `esc_attr__( 'Text', 'dokan-lite' )` | Return translated + attribute-escaped |
| `esc_attr_e( 'Text', 'dokan-lite' )` | Echo translated + attribute-escaped |
| `_n( 'single', 'plural', $count, 'dokan-lite' )` | Pluralization |
| `_x( 'Text', 'context', 'dokan-lite' )` | Context-aware translation |
| `_nx( 'single', 'plural', $count, 'context', 'dokan-lite' )` | Context-aware pluralization |

### Translator Comments

Always add `/* translators: */` comments before `sprintf()` with placeholders:

```php
/* translators: 1: Required PHP version 2: Running PHP version */
__( 'Minimum PHP version required is %1$s. You are running %2$s.', 'dokan-lite' )
```

### String Formatting

Use `sprintf()` for dynamic content — never concatenate translated strings:

```php
// CORRECT
sprintf( __( 'Account Name: %s', 'dokan-lite' ), $payment['ac_name'] )

// WRONG — don't concatenate
__( 'Account Name: ', 'dokan-lite' ) . $payment['ac_name']
```

### Pluralization

```php
sprintf(
    _n( '%d vendor approved.', '%d vendors approved.', $count, 'dokan-lite' ),
    $count
)
```

### Date/Time Formatting

Always use locale-aware functions:

```php
// WordPress locale-aware date
date_i18n( wc_date_format(), strtotime( $date_string ) );

// Translated day names
dokan_get_translated_days( 'monday' );
```

### Escaping in Templates

In templates, always escape translated output:

```php
// In template files
<?php esc_html_e( 'Payment Methods', 'dokan-lite' ); ?>
<input placeholder="<?php esc_attr_e( 'Search...', 'dokan-lite' ); ?>">
```

### POT File Generation

```bash
npm run makepot    # Generates languages/dokan-lite.pot
```

### Textdomain Loading

Handled in `dokan-class.php` via `load_plugin_textdomain()` on `woocommerce_loaded` hook. No manual setup needed.

## Coding Standards

-   **PHPCS ruleset:** `WordPress-Extra` + `WordPress` (via `phpcs.xml.dist`)
-   **PHP compatibility:** 7.4+
-   **Strict comparisons:** enforced as errors
-   **`in_array()` strict mode:** required
-   **Text domain:** `dokan-lite` for all `__()`, `_e()`, `esc_html__()`, etc.
-   **Custom sanitization:** `wc_clean`, `wc_esc_json`, `dokan_sanitize_phone_number` are registered
-   **Yoda conditions:** not enforced

## Key Reference Files

-   `dokan.php` — Main plugin file, container bootstrap
-   `dokan-class.php` — `WeDevs_Dokan` singleton
-   `includes/DependencyManagement/Providers/ServiceProvider.php` — Main service registration
-   `includes/DependencyManagement/Providers/CommonServiceProvider.php` — Hookable class registration
-   `includes/REST/DokanBaseController.php` — Base REST controller
-   `includes/REST/Manager.php` — REST API management & controller map
-   `includes/Contracts/Hookable.php` — Hookable interface
-   `includes/functions.php` — Core utility functions (3,290 lines)
