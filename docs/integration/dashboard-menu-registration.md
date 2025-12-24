# Registering Menu in Dokan Dashboard from Third-Party Plugins

This guide explains how to register custom menu items in the Dokan vendor dashboard from a third-party plugin. The process involves two main steps:

1. **PHP Side**: Register the menu item in the navigation menu
2. **React Side**: Register the React routes for the menu pages

## Table of Contents

- [Overview](#overview)
- [PHP Menu Registration](#php-menu-registration)
- [React Route Registration](#react-route-registration)
- [Complete Example](#complete-example)
- [Menu Item Properties](#menu-item-properties)
- [Route Properties](#route-properties)
- [Best Practices](#best-practices)

## Overview

Dokan provides two WordPress filters that allow third-party plugins to extend the vendor dashboard:

- **`dokan_get_dashboard_nav`**: Filter to add menu items to the dashboard navigation
- **`dokan-dashboard-routes`**: Filter to register React routes for the dashboard pages

> **Related Documentation**: For information about declaring React menus in Dokan Lite core and handling template overrides, see [How to define a menu is available in React and its PHP override information](../feature-override/readme.md).

## PHP Menu Registration

To add a menu item to the Dokan vendor dashboard navigation, use the `dokan_get_dashboard_nav` filter in your PHP code.

> **Note**: The `react_route` property is essential for React-based menus. For more details on how Dokan Lite declares React menus internally, see [Declare React menu in Dokan Lite](../feature-override/readme.md#declare-react-menu-in-dokan-lite).

### Basic Structure

```php
<?php
/**
 * Add custom menu to Dokan dashboard navigation
 *
 * @param array $menus Existing dashboard menus
 * @return array Modified menus array
 */
function add_custom_menu_to_dokan_dashboard( $menus ) {
    // Check if we're on the seller dashboard
    if ( ! dokan_is_seller_dashboard() ) {
        return $menus;
    }

    // Add your custom menu item
    $menus['your-menu-key'] = [
        'title'       => esc_html__( 'Your Menu Title', 'your-textdomain' ),
        'icon'        => '<i class="fa-solid fa-icon-name"></i>',
        'url'         => dokan_get_navigation_url( '/your-route' ),
        'pos'         => 10, // Position in menu (lower number = higher position)
        'permission'  => 'dokandar', // Required capability
        'react_route' => 'your-route', // React route path (without leading slash)
    ];

    return $menus;
}
add_filter( 'dokan_get_dashboard_nav', 'add_custom_menu_to_dokan_dashboard' );
```

### Example: BOGO Menu Registration

```php
<?php
/**
 * Add BOGO menu to Dokan Vendor Dashboard
 *
 * @param array $menus Dashboard menus
 * @return array
 */
function add_bogo_menu_to_dokan_dashboard( $menus ) {
    // Optional: Check settings or conditions
    $settings = get_option( 'your_plugin_settings', [] );
    if ( isset( $settings['enable_feature'] ) && ! $settings['enable_feature'] ) {
        return $menus;
    }

    $menus['bogo'] = [
        'title'       => esc_html__( 'BOGO', 'your-textdomain' ),
        'icon'        => '<i class="fa-solid fa-box"></i>',
        'url'         => dokan_get_navigation_url( '/bogo' ),
        'pos'         => 10,
        'permission'  => 'dokandar',
        'react_route' => 'bogo',
    ];

    return $menus;
}
add_filter( 'dokan_get_dashboard_nav', 'add_bogo_menu_to_dokan_dashboard' );
```

## React Route Registration

After registering the PHP menu, you need to register the React routes that will handle the page rendering. This is done using the `dokan-dashboard-routes` filter in JavaScript/TypeScript.

### Basic Structure

```javascript
import { addFilter } from '@wordpress/hooks';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import YourComponent from './components/YourComponent';

domReady(() => {
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'your-plugin-unique-namespace',
        function (routes) {
            routes.push({
                id: 'your-plugin-route-id',
                title: __('Your Page Title', 'your-textdomain'),
                path: '/your-route',
                exact: true,
                element: <YourComponent />,
            });

            return routes;
        }
    );
});
```

### Example: Multiple Routes

```javascript
import { addFilter } from '@wordpress/hooks';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { useParams } from 'react-router-dom';
import BogoList from './components/BogoList';
import CreateBogo from './components/CreateBogo';

// Fallback for useSearchParams (for older Dokan versions)
const useSearchParamsFallback = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return [searchParams, () => {}];
};

domReady(() => {
    // Register list route
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'your-plugin-bogo-list',
        function (routes) {
            routes.push({
                id: 'your-plugin-bogo-list',
                title: __('BOGO Offers', 'your-textdomain'),
                path: '/bogo',
                exact: true,
                element: <BogoList />,
            });

            return routes;
        }
    );

    // Register create route
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'your-plugin-bogo-create',
        function (routes) {
            routes.push({
                id: 'your-plugin-bogo-create',
                title: __('Create BOGO', 'your-textdomain'),
                path: '/bogo/create-bogo',
                exact: true,
                element: (props) => {
                    return (
                        <CreateBogo
                            useParams={useParams}
                            useSearchParams={useSearchParamsFallback}
                            {...props}
                        />
                    );
                },
                backUrl: '/bogo', // Optional: Back button URL
            });

            return routes;
        }
    );

    // Register edit route with dynamic parameter
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'your-plugin-bogo-edit',
        function (routes) {
            routes.push({
                id: 'your-plugin-bogo-edit',
                title: __('Edit BOGO', 'your-textdomain'),
                path: '/bogo/:bogo_id',
                exact: true,
                element: (props) => {
                    return (
                        <CreateBogo
                            useParams={useParams}
                            useSearchParams={useSearchParamsFallback}
                            {...props}
                        />
                    );
                },
                backUrl: '/bogo',
            });

            return routes;
        }
    );
});
```

## Complete Example

Here's a complete example showing both PHP and React registration:

### PHP File: `includes/dokan-dashboard-integration.php`

```php
<?php
/**
 * Plugin Name: Your Plugin
 * Description: Example integration with Dokan dashboard
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Add menu to Dokan dashboard navigation
 *
 * @param array $menus Dashboard menus
 * @return array
 */
function your_plugin_add_dashboard_menu( $menus ) {
    if ( ! dokan_is_seller_dashboard() ) {
        return $menus;
    }

    // Optional: Check if feature is enabled
    $settings = get_option( 'your_plugin_settings', [] );
    if ( isset( $settings['enabled'] ) && ! $settings['enabled'] ) {
        return $menus;
    }

    $menus['your-feature'] = [
        'title'       => esc_html__( 'Your Feature', 'your-textdomain' ),
        'icon'        => '<i class="fa-solid fa-star"></i>',
        'url'         => dokan_get_navigation_url( '/your-feature' ),
        'pos'         => 50, // Position after orders (50)
        'permission'  => 'dokandar',
        'react_route' => 'your-feature',
    ];

    return $menus;
}
add_filter( 'dokan_get_dashboard_nav', 'your_plugin_add_dashboard_menu' );

/**
 * Enqueue scripts for vendor dashboard
 */
function your_plugin_enqueue_dashboard_scripts() {
    if ( ! dokan_is_seller_dashboard() ) {
        return;
    }

    // Get plugin directory path and URL
    $plugin_dir = plugin_dir_path( __FILE__ );
    $plugin_url = plugin_dir_url( __FILE__ );

    $script_assets = $plugin_dir . 'assets/build/your-feature.asset.php';

    if ( ! file_exists( $script_assets ) ) {
        return;
    }

    $assets = include $script_assets;

    wp_enqueue_style(
        'your-plugin-feature-dashboard',
        $plugin_url . 'assets/build/your-feature.css',
        [],
        $assets['version']
    );

    wp_enqueue_script(
        'your-plugin-feature-dashboard',
        $plugin_url . 'assets/build/your-feature.js',
        array_merge( $assets['dependencies'], [ 'dokan-react-components' ] ),
        $assets['version'],
        true
    );

    // Localize script with data
    wp_localize_script(
        'your-plugin-feature-dashboard',
        'yourPluginData',
        [
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'your_plugin_nonce' ),
            'api_url'  => rest_url( 'your-plugin/v1/' ),
        ]
    );
}
add_action( 'wp_enqueue_scripts', 'your_plugin_enqueue_dashboard_scripts' );
```

### React File: `assets/src/dokan/dashboard/your-feature/index.tsx`

```typescript
import './index.scss';
import { addFilter } from '@wordpress/hooks';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { useParams, useSearchParams } from 'react-router-dom';
import YourFeatureList from './components/YourFeatureList';
import CreateYourFeature from './components/CreateYourFeature';

// Fallback for useSearchParams (for older Dokan versions)
const useSearchParamsFallback = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return [searchParams, () => {}];
};

domReady(() => {
    // Register list route
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'your-plugin-feature-list',
        function (routes) {
            routes.push({
                id: 'your-plugin-feature-list',
                title: __('Your Feature', 'your-textdomain'),
                path: '/your-feature',
                exact: true,
                element: <YourFeatureList />,
            });

            return routes;
        }
    );

    // Register create route
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'your-plugin-feature-create',
        function (routes) {
            routes.push({
                id: 'your-plugin-feature-create',
                title: __('Create Feature', 'your-textdomain'),
                path: '/your-feature/create',
                exact: true,
                element: (props) => {
                    return (
                        <CreateYourFeature
                            useParams={useParams}
                            useSearchParams={useSearchParamsFallback}
                            {...props}
                        />
                    );
                },
                backUrl: '/your-feature',
            });

            return routes;
        }
    );

    // Register edit route
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'your-plugin-feature-edit',
        function (routes) {
            routes.push({
                id: 'your-plugin-feature-edit',
                title: __('Edit Feature', 'your-textdomain'),
                path: '/your-feature/:id',
                exact: true,
                element: (props) => {
                    return (
                        <CreateYourFeature
                            useParams={useParams}
                            useSearchParams={useSearchParamsFallback}
                            {...props}
                        />
                    );
                },
                backUrl: '/your-feature',
            });

            return routes;
        }
    );
});
```

## Menu Item Properties

When registering a menu item via `dokan_get_dashboard_nav`, you can use the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | Yes | Menu item title displayed in navigation |
| `icon` | string | No | HTML icon markup (Font Awesome recommended) |
| `url` | string | Yes | Navigation URL (use `dokan_get_navigation_url()`) |
| `pos` | int | No | Position in menu (lower = higher position). Default: 190 |
| `permission` | string | No | Required capability (e.g., `'dokandar'`). Default: no restriction |
| `react_route` | string | No | React route path (without leading slash). See [Declare React menu](../feature-override/readme.md#declare-react-menu-in-dokan-pro-or-external-plugin) for details |
| `target` | string | No | Link target (e.g., `'_blank'`). Default: `'_self'` |
| `submenu` | array | No | Array of submenu items (see below) |

### Submenu Items

You can add submenu items to a main menu:

```php
$menus['main-menu'] = [
    'title'  => esc_html__( 'Main Menu', 'your-textdomain' ),
    'icon'   => '<i class="fa-solid fa-menu"></i>',
    'url'    => dokan_get_navigation_url( '/main-menu' ),
    'pos'    => 50,
    'submenu' => [
        'submenu-1' => [
            'title'      => esc_html__( 'Submenu 1', 'your-textdomain' ),
            'icon'       => '<i class="fa-solid fa-circle"></i>',
            'url'        => dokan_get_navigation_url( '/main-menu/submenu-1' ),
            'pos'        => 10,
            'permission' => 'dokandar',
            'react_route' => 'main-menu/submenu-1',
        ],
        'submenu-2' => [
            'title'      => esc_html__( 'Submenu 2', 'your-textdomain' ),
            'icon'       => '<i class="fa-solid fa-circle"></i>',
            'url'        => dokan_get_navigation_url( '/main-menu/submenu-2' ),
            'pos'        => 20,
            'permission' => 'dokandar',
            'react_route' => 'main-menu/submenu-2',
        ],
    ],
];
```

## Route Properties

When registering React routes via `dokan-dashboard-routes`, you can use the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the route |
| `title` | string | Yes | Page title (used in browser tab and breadcrumbs) |
| `path` | string | Yes | Route path (e.g., `'/your-route'` or `'/your-route/:id'`) |
| `exact` | boolean | No | Whether path should match exactly. Default: `false` |
| `element` | ReactElement/Function | Yes | React component to render |
| `backUrl` | string | No | URL for back button navigation |
| `capabilities` | array | No | Array of required capabilities for route access |

### Dynamic Routes

You can use dynamic route parameters:

```javascript
routes.push({
    id: 'your-plugin-edit',
    title: __('Edit Item', 'your-textdomain'),
    path: '/your-feature/:id', // :id is a dynamic parameter
    exact: true,
    element: (props) => {
        const { id } = useParams();
        return <EditComponent id={id} {...props} />;
    },
});
```

Access the parameter in your component:

```javascript
import { useParams } from 'react-router-dom';

function EditComponent(props) {
    const { id } = useParams();
    // Use id to fetch data
}
```

## Best Practices

### 1. Check Dashboard Context

Always check if you're on the seller dashboard before registering menus:

```php
if ( ! dokan_is_seller_dashboard() ) {
    return $menus;
}
```

### 2. Use Unique Namespaces

Use unique namespaces for your filter callbacks to avoid conflicts:

```javascript
window.wp.hooks.addFilter(
    'dokan-dashboard-routes',
    'your-plugin-unique-namespace', // Use your plugin prefix
    function (routes) {
        // ...
    }
);
```

### 3. Enqueue Scripts Properly

Always check if you're on the seller dashboard before enqueuing scripts:

```php
function your_plugin_enqueue_scripts() {
    if ( ! dokan_is_seller_dashboard() ) {
        return;
    }
    // Enqueue scripts
}
add_action( 'wp_enqueue_scripts', 'your_plugin_enqueue_scripts' );
```

### 4. Include Dependencies

Make sure to include `dokan-react-components` in your script dependencies:

```php
wp_enqueue_script(
    'your-plugin-script',
    $script_url,
    array_merge( $assets['dependencies'], [ 'dokan-react-components' ] ),
    $version,
    true
);
```

### 5. Use Proper Route Paths

- Use lowercase with hyphens for route paths: `/your-feature`
- Match the `react_route` in PHP with the route `path` in React
- Use dynamic parameters for edit pages: `/your-feature/:id`

### 6. Handle Router Props

Pass router props to your components:

```javascript
element: (props) => {
    return (
        <YourComponent
            useParams={useParams}
            useSearchParams={useSearchParamsFallback}
            {...props}
        />
    );
}
```

### 7. Provide Fallbacks

Provide fallbacks for older Dokan versions:

```javascript
const useSearchParamsFallback = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return [searchParams, () => {}];
};
```

### 8. Use Appropriate Menu Positions

Common position values:
- `10` - Near the top (after Dashboard)
- `30` - After Products
- `50` - After Orders
- `70` - After Withdraw
- `200` - Near the bottom (Settings area)

### 9. Set Proper Permissions

Use appropriate capabilities:
- `'dokandar'` - Vendor capability
- `'manage_woocommerce'` - Admin capability
- Custom capability if needed

### 10. Localize Script Data

Use `wp_localize_script` to pass PHP data to JavaScript:

```php
wp_localize_script(
    'your-plugin-script',
    'yourPluginData',
    [
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce'     => wp_create_nonce( 'your_nonce' ),
        'api_url'   => rest_url( 'your-plugin/v1/' ),
    ]
);
```

## References

- [Dokan Dashboard Navigation Filter](https://github.com/getdokan/dokan/blob/0cfc431036c25110654eaffc8a7da8602cc413be/includes/functions-dashboard-navigation.php#L106)
- [Dokan Routing System](https://github.com/getdokan/dokan/blob/0cfc431036c25110654eaffc8a7da8602cc413be/src/routing/index.tsx#L75-L78)
- [Example: BOGO Integration PHP](https://github.com/getdokan/storegrowth-sales-booster/blob/fe8106ac17e7f0f950d885a5d135753a129cdf4d/integrations/includes/Dokan/Dashboard/Bogo.php#L59-L77)
- [Example: BOGO Integration JS](https://github.com/getdokan/dokan/blob/0cfc431036c25110654eaffc8a7da8602cc413be/src/routing/index.tsx#L75-L78)
- [How to define a menu is available in React and its PHP override information](../feature-override/readme.md) - For information about declaring React menus in Dokan Lite core and handling template overrides

## Troubleshooting

### Menu Not Appearing

1. Check if `dokan_is_seller_dashboard()` returns `true`
2. Verify the `permission` capability matches user capabilities
3. Ensure the filter is hooked at the right time (use `init` or later)
4. Verify the `react_route` property matches your React route path (see [Declare React menu](../feature-override/readme.md#1-declare-a-menu-is-available-in-react) for details)

### Routes Not Loading

1. Verify scripts are enqueued properly
2. Check browser console for JavaScript errors
3. Ensure route paths match between PHP and React
4. Verify `dokan-react-components` is included as a dependency

### Component Not Rendering

1. Check if the route is registered correctly
2. Verify the component is imported correctly
3. Ensure router props are passed to the component
4. Check for React errors in the console

