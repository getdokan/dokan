# How to define a menu is available in `React` and its `PHP` override information.

- [Introduction](#introduction)
- [1. Declare a menu is available in `React`.](#1-declare-a-menu-is-available-in-react)
  - [Declare `React` menu in **Dokan Lite.**](#declare-react-menu-in-dokan-lite)
  - [Declare `React` menu in **Dokan Pro** or **External Plugin**.](#declare-react-menu-in-dokan-pro-or-external-plugin)
- [2. Declare the Override templates for a React route.](#2-declare-the-override-templates-for-a-react-route) 
    - [Define the override templates for a React route in Dokan Lite.](#define-the-override-templates-for-a-react-route-in-dokan-lite)
    - [Define the override templates for a React route in **Dokan Pro** or **External Plugin**.](#define-the-override-templates-for-a-react-route-in-dokan-pro-or-external-plugin)
    - [Define the override templates array structure.](#define-the-override-templates-array-structure)

## Introduction
This document will help you to define a menu is available in `React` and its `PHP` override information.


## 1. Declare a menu is available in `React`.
To declare a menu is available in `React`, you need to define `route` property during the menu registration.

### Declare `React` menu in **Dokan Lite**.
```php
// includes/functions-dashboard-navigation.php#L27-L66
$menus = [
        'dashboard' => [
            'title'      => __( 'Dashboard', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-tachometer-alt"></i>',
            'url'        => dokan_get_navigation_url(),
            'pos'        => 10,
            'permission' => 'dokan_view_overview_menu',
            'route'      => '/', // <-- Define the route here
        ],
        'products'  => [
            'title'      => __( 'Products', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-briefcase"></i>',
            'url'        => dokan_get_navigation_url( 'products' ),
            'pos'        => 30,
            'permission' => 'dokan_view_product_menu',
            'route'      => 'products', // <-- Define the route here
        ],
        'orders'    => [
            'title'      => __( 'Orders', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-shopping-cart"></i>',
            'url'        => dokan_get_navigation_url( 'orders' ),
            'pos'        => 50,
            'permission' => 'dokan_view_order_menu',
            'route'      => 'orders', // <-- Define the route here
        ],
        'withdraw'  => [
            'title'      => __( 'Withdraw', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-upload"></i>',
            'url'        => dokan_get_navigation_url( 'withdraw' ),
            'pos'        => 70,
            'permission' => 'dokan_view_withdraw_menu',
        ],
        'settings'  => [
            'title' => __( 'Settings', 'dokan-lite' ),
            'icon'  => '<i class="fas fa-cog"></i>',
            'url'   => dokan_get_navigation_url( 'settings/store' ),
            'pos'   => 200,
        ],
    ];
```
In the above example, the `route` property is defined for each menu which we are indicating that the react route is available. 
This will be used to determine if the menu is pointing to the react Application or to the Legacy PHP Route.

The `route` property should be the same as the route defined in the `React` application in Router Array.

It is important to note that the `route` property should be defined for the menu which is available in the `React` application. 
If the `route` key is not defined for the menu, then the menu will be considered as a legacy menu and will be rendered using the PHP template.


### Declare `React` menu in **Dokan Pro** or **External Plugin**.

```php
add_filter( 'dokan_get_dashboard_nav', function ( $menus ) {
    $menus['products'] = [
        'title'      => __( 'Products', 'dokan-lite' ),
        'icon'       => '<i class="fas fa-briefcase"></i>',
        'url'        => dokan_get_navigation_url( 'products' ),
        'pos'        => 30,
        'permission' => 'dokan_view_product_menu',
        'route'      => 'products', // <-- Define the route here
    ];

    return $menus;
} );
```


## 2. Declare the Override templates for a React route.
If you are writing a new feature or modifying an existing feature in the `React` application, you do not need to define the override templates for the `React` route.
But if you are modifying or migrating an existing feature written in PHP to the `React` application and you want that if some of the PHP template is overridden by the existing PHP template then the legacy PHP page will be displayed, then you need to define the override templates for the `React` route.
### Define the override templates for a React route in Dokan Lite.
```php
// VendorNavMenuChecker.php#L13-L26
protected array $template_dependencies = [
        '' => [
            [ 'slug' => 'dashboard/dashboard' ],
            [ 'slug' => 'dashboard/orders-widget' ],
            [ 'slug' => 'dashboard/products-widget' ],
        ],
        'products' => [
            [ 'slug' => 'products/products' ],
            [
				'slug' => 'products/products',
				'name' => 'listing',
			],
        ],
    ];
```

In the above example, the `template_dependencies` property is defined for each route which we are indicating that the override templates are available for the route. This will be used to determine if the override templates are available for the route or not.

### Define the override templates for a React route in **Dokan Pro** or **External Plugin**.
From Dokan Pro, we can add dependencies by using the filter `dokan_get_dashboard_nav_template_dependency`.

```php
add_filter( 'dokan_get_dashboard_nav_template_dependency', function ( array $dependencies ) {
    $dependencies['products'] = [
        [ 'slug' => 'products/products' ],
        [
            'slug' => 'products/products',
            'name' => 'listing',
        ],
    ];

    return $dependencies;
} );
```
### Define the override templates array structure.
```php
/**
* @var array $template_dependencies Array of template dependencies for the route.
 */

[ 
    'route_name' => [ 
            [
                'slug' => 'template-slug', 
                'name' => 'template-name' // (Optional),
                'args' = [] // (Optional)
            ], 
        ]
]
```

- **Slug:** The slug of the template file which is used to display the php content.
- **Name:** The name of the template file which is used to display the php content. (Optional)
- **Args:** The arguments which are passed to the template file in `dokan_get_template_part()` function. (Optional)
