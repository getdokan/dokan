# Dokan Admin Dashboard Pages Documentation

## Table of Contents

- [Introduction](#introduction)
- [Architecture Overview](#architecture-overview)
- [PHP Implementation](#php-implementation)
  - [The Pageable Interface](#the-pageable-interface)
  - [AbstractPage Class](#abstractpage-class)
  - [Creating a Page Class](#creating-a-page-class)
- [JavaScript/React Implementation](#javascriptreact-implementation)
  - [Creating a React Component](#creating-a-react-component)
  - [Routing Configuration](#routing-configuration)
- [Internal Usage (Within Dokan Lite)](#internal-usage-within-dokan-lite)
  - [Step-by-Step: Creating a New Dashboard Page](#step-by-step-creating-a-new-dashboard-page)
- [External Plugin Usage](#external-plugin-usage)
  - [Method 1: Using Service Provider (Recommended)](#method-1-using-service-provider-recommended)
  - [Method 2: Using WordPress Filters](#method-2-using-wordpress-filters)
- [Advanced Topics](#advanced-topics)
  - [Passing Settings from PHP to React](#passing-settings-from-php-to-react)
  - [Adding Custom Scripts and Styles](#adding-custom-scripts-and-styles)
  - [Extending Existing Pages](#extending-existing-pages)

---

## Introduction

The Dokan Admin Dashboard provides a modern, React-based interface for managing marketplace operations. This documentation covers how to create new admin dashboard pages, both within Dokan Lite and from external plugins.

The dashboard architecture follows a hybrid approach:
- **PHP Backend**: Defines page structure, menu items, settings, and assets
- **React Frontend**: Renders the actual UI and handles user interactions

This separation allows for flexible, maintainable code with clear responsibilities.

---

## Architecture Overview

### How It Works

1. **Page Registration**: PHP classes extending `AbstractPage` register themselves via the `dokan_admin_dashboard_pages` filter
2. **Menu Creation**: The `Dashboard` class creates WordPress admin menu items for each page
3. **Settings Localization**: Settings from all pages are collected and passed to JavaScript via `wp_localize_script`
4. **React Routing**: The React app uses hash-based routing to render the appropriate component
5. **Component Rendering**: React components receive settings from PHP and render the UI

### File Structure

```
dokan-lite/
├── includes/Admin/Dashboard/
│   ├── Dashboard.php                    # Main dashboard controller
│   ├── Pageable.php                     # Interface for dashboard pages
│   └── Pages/
│       ├── AbstractPage.php             # Base class for all pages
│       ├── Withdraw.php                 # Example: Withdraw page
│       └── Vendors.php                  # Example: Vendors page
├── src/admin/dashboard/
│   ├── components/
│   │   └── Dashboard.tsx                # React router configuration
│   └── pages/
│       ├── withdraw/
│       │   └── index.tsx                # Withdraw page component
│       └── vendors.tsx                  # Vendors page component
└── includes/DependencyManagement/Providers/
    └── AdminDashboardServiceProvider.php # Service provider for pages
```

---

## PHP Implementation

### The Pageable Interface

All dashboard pages must implement the `Pageable` interface, which defines the contract for a dashboard page.

**Location**: `includes/Admin/Dashboard/Pageable.php`

```php
<?php
namespace WeDevs\Dokan\Admin\Dashboard;

interface Pageable {
    /**
     * Get the unique ID of the page.
     */
    public function get_id(): string;

    /**
     * Get menu arguments for WordPress admin menu.
     *
     * @param string $capability Menu capability
     * @param string $position Menu position
     * @return array Menu configuration
     */
    public function menu( string $capability, string $position ): array;

    /**
     * Get settings to pass to JavaScript.
     *
     * @return array Settings array
     */
    public function settings(): array;

    /**
     * Get script handles to enqueue.
     *
     * @return array Array of script handles
     */
    public function scripts(): array;

    /**
     * Get style handles to enqueue.
     *
     * @return array Array of style handles
     */
    public function styles(): array;

    /**
     * Register scripts and styles.
     */
    public function register(): void;
}
```

### AbstractPage Class

The `AbstractPage` provides a base implementation with automatic registration.

**Location**: `includes/Admin/Dashboard/Pages/AbstractPage.php`

```php
<?php
namespace WeDevs\Dokan\Admin\Dashboard\Pages;

use WeDevs\Dokan\Admin\Dashboard\Pageable;
use WeDevs\Dokan\Contracts\Hookable;

abstract class AbstractPage implements Pageable, Hookable {
    
    /**
     * Register WordPress hooks.
     */
    public function register_hooks(): void {
        if ( ! is_admin() ) {
            return;
        }
        
        add_filter( 'dokan_admin_dashboard_pages', [ $this, 'enlist' ] );
    }
    
    /**
     * Add this page to the pages list.
     */
    public function enlist( $pages ) {
        $pages[] = $this;
        return $pages;
    }
    
    // Abstract methods must be implemented by child classes
    abstract public function get_id(): string;
    abstract public function menu( string $capability, string $position ): array;
    abstract public function settings(): array;
    abstract public function scripts(): array;
    abstract public function styles(): array;
    abstract public function register(): void;
}
```

### Creating a Page Class

Here's a complete example of a dashboard page implementation:

**Location**: `includes/Admin/Dashboard/Pages/MyCustomPage.php`

```php
<?php
namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class MyCustomPage extends AbstractPage {

    /**
     * Get the unique page ID.
     * This should match the route ID in React.
     */
    public function get_id(): string {
        return 'my-custom-page';
    }

    /**
     * Define the menu item.
     *
     * @param string $capability WordPress capability required
     * @param string $position Menu position
     * @return array Menu configuration
     */
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'My Custom Page', 'dokan-lite' ),
            'menu_title' => __( 'Custom Page', 'dokan-lite' ),
            'route'      => 'my-custom-page', // URL hash: #/my-custom-page
            'capability' => $capability,
            'position'   => 150, // Menu order
        ];
    }

    /**
     * Settings to pass to JavaScript.
     * These will be available in React via dokanAdminDashboardSettings.my-custom-page
     */
    public function settings(): array {
        return [
            'api_endpoint' => rest_url( 'dokan/v1/my-custom-endpoint' ),
            'some_option'  => get_option( 'my_custom_option', 'default_value' ),
            'user_can_edit' => current_user_can( 'manage_options' ),
        ];
    }

    /**
     * Register scripts and styles.
     * This is called during the 'dokan_register_scripts' action.
     */
    public function register(): void {
        // Register custom scripts if needed
        $asset_file = DOKAN_DIR . '/assets/js/my-custom-page.asset.php';
        
        if ( file_exists( $asset_file ) ) {
            $asset = require $asset_file;
            
            wp_register_script(
                'dokan-my-custom-page',
                DOKAN_PLUGIN_ASSEST . '/js/my-custom-page.js',
                $asset['dependencies'] ?? [],
                $asset['version'] ?? DOKAN_PLUGIN_VERSION,
                true
            );
            
            wp_register_style(
                'dokan-my-custom-page',
                DOKAN_PLUGIN_ASSEST . '/css/my-custom-page.css',
                [],
                $asset['version'] ?? DOKAN_PLUGIN_VERSION
            );
        }
    }

    /**
     * Get script handles to enqueue.
     * Return empty array if no custom scripts.
     */
    public function scripts(): array {
        return [ 'dokan-my-custom-page' ];
    }

    /**
     * Get style handles to enqueue.
     * Return empty array if no custom styles.
     */
    public function styles(): array {
        return [ 'dokan-my-custom-page' ];
    }
}
```

---

## JavaScript/React Implementation

### Creating a React Component

Create a React component for your page in the `src/admin/dashboard/pages/` directory.

**Location**: `src/admin/dashboard/pages/my-custom-page.tsx`

```tsx
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const MyCustomPage = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Access settings passed from PHP
    const settings = window.dokanAdminDashboardSettings?.['my-custom-page'] || {};
    
    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch({
                path: settings.api_endpoint || '/dokan/v1/my-custom-endpoint',
            });
            setData(response);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="my-custom-page">
            <h2 className="text-2xl font-bold mb-6">
                {__('My Custom Page', 'dokan-lite')}
            </h2>
            
            {isLoading ? (
                <p>{__('Loading...', 'dokan-lite')}</p>
            ) : (
                <div>
                    {/* Your page content here */}
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default MyCustomPage;
```

### Routing Configuration

Add your route to the React router configuration.

**Location**: `src/admin/dashboard/components/Dashboard.tsx`

```tsx
import MyCustomPage from '../pages/my-custom-page';

const getAdminRoutes = () => {
    let routes: Array<DokanAdminRoute> = [
        // ... existing routes ...
        {
            id: 'my-custom-page',
            element: <MyCustomPage />,
            path: '/my-custom-page',
        },
    ];
    
    // Allow external plugins to add routes
    routes = wp.hooks.applyFilters(
        'dokan-admin-dashboard-routes',
        routes
    ) as Array<DokanAdminRoute>;
    
    return routes;
};
```

---

## Internal Usage (Within Dokan Lite)

### Step-by-Step: Creating a New Dashboard Page

Follow these steps to add a new page to the Dokan Admin Dashboard:

#### Step 1: Create the PHP Page Class

Create a new file in `includes/Admin/Dashboard/Pages/`:

```php
<?php
// includes/Admin/Dashboard/Pages/Reports.php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Reports extends AbstractPage {
    
    public function get_id(): string {
        return 'reports';
    }
    
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Reports', 'dokan-lite' ),
            'menu_title' => __( 'Reports', 'dokan-lite' ),
            'route'      => 'reports',
            'capability' => $capability,
            'position'   => 60,
        ];
    }
    
    public function settings(): array {
        return [
            'currency' => get_woocommerce_currency(),
            'date_format' => get_option( 'date_format' ),
        ];
    }
    
    public function scripts(): array {
        return [];
    }
    
    public function styles(): array {
        return [];
    }
    
    public function register(): void {
        // No custom assets needed
    }
}
```

#### Step 2: Register in Service Provider

Add your page to the `AdminDashboardServiceProvider`:

```php
<?php
// includes/DependencyManagement/Providers/AdminDashboardServiceProvider.php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Dashboard\Pages\Reports;
// ... other imports ...

class AdminDashboardServiceProvider extends BaseServiceProvider {
    
    protected $services = [
        Dashboard::class,
        LegacySwitcher::class,
        Modules::class,
        Status::class,
        ProFeatures::class,
        Withdraw::class,
        Vendors::class,
        Reports::class, // Add your new page here
    ];
    
    // ... rest of the class ...
}
```

#### Step 3: Create the React Component

Create the React component:

```tsx
// src/admin/dashboard/pages/reports.tsx

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const ReportsPage = () => {
    const settings = window.dokanAdminDashboardSettings?.reports || {};
    
    return (
        <div className="reports-page">
            <h2 className="text-2xl font-bold mb-6">
                {__('Reports', 'dokan-lite')}
            </h2>
            <p>Currency: {settings.currency}</p>
            <p>Date Format: {settings.date_format}</p>
        </div>
    );
};

export default ReportsPage;
```

#### Step 4: Add Route Configuration

Update the router in `Dashboard.tsx`:

```tsx
// src/admin/dashboard/components/Dashboard.tsx

import ReportsPage from '../pages/reports';

const getAdminRoutes = () => {
    let routes: Array<DokanAdminRoute> = [
        // ... existing routes ...
        {
            id: 'reports',
            element: <ReportsPage />,
            path: '/reports',
        },
    ];
    
    return routes;
};
```

#### Step 5: Build and Test

1. Build the JavaScript assets:
   ```bash
   npm run build
   ```

2. Clear WordPress cache if necessary

3. Navigate to the Dokan dashboard and verify your new page appears in the menu

---

## External Plugin Usage

External plugins can add custom pages to the Dokan Admin Dashboard using two methods.

### Method 1: Using Service Provider (Recommended)

This method integrates cleanly with Dokan's dependency injection container.

#### Step 1: Create Your Page Class

```php
<?php
// your-plugin/includes/Admin/CustomDashboardPage.php

namespace YourPlugin\Admin;

use WeDevs\Dokan\Admin\Dashboard\Pages\AbstractPage;

class CustomDashboardPage extends AbstractPage {
    
    public function get_id(): string {
        return 'your-plugin-page';
    }
    
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Your Plugin Page', 'your-plugin' ),
            'menu_title' => __( 'Your Page', 'your-plugin' ),
            'route'      => 'your-plugin-page',
            'capability' => $capability,
            'position'   => 200,
        ];
    }
    
    public function settings(): array {
        return [
            'plugin_option' => get_option( 'your_plugin_option' ),
            'api_key' => get_option( 'your_plugin_api_key' ),
        ];
    }
    
    public function scripts(): array {
        return [ 'your-plugin-dashboard-script' ];
    }
    
    public function styles(): array {
        return [ 'your-plugin-dashboard-style' ];
    }
    
    public function register(): void {
        wp_register_script(
            'your-plugin-dashboard-script',
            YOUR_PLUGIN_URL . 'assets/js/dashboard.js',
            [ 'dokan-admin-dashboard' ],
            YOUR_PLUGIN_VERSION,
            true
        );
        
        wp_register_style(
            'your-plugin-dashboard-style',
            YOUR_PLUGIN_URL . 'assets/css/dashboard.css',
            [],
            YOUR_PLUGIN_VERSION
        );
    }
}
```

#### Step 2: Register via Service Provider

If you're using Dokan's dependency injection:

```php
<?php
// your-plugin/includes/DependencyManagement/ServiceProvider.php

namespace YourPlugin\DependencyManagement;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use YourPlugin\Admin\CustomDashboardPage;

class ServiceProvider extends BaseServiceProvider {
    
    protected $services = [
        CustomDashboardPage::class,
    ];
    
    public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, [ 'admin-dashboard-service' ] );
        }
    }
}
```

Then register your service provider in your main plugin file:

```php
<?php
// your-plugin/your-plugin.php

use YourPlugin\DependencyManagement\ServiceProvider;

add_action('dokan_loaded', function() {
    if (function_exists('dokan_get_container')) {
        $container = dokan_get_container();
        $provider = new ServiceProvider();
        $provider->setContainer($container);
        $provider->register();
        $provider->boot();
    }
});
```

#### Step 3: Add React Component and Route

Create your React component:

```tsx
// your-plugin/assets/src/admin/YourPluginPage.tsx

import { __ } from '@wordpress/i18n';

const YourPluginPage = () => {
    const settings = window.dokanAdminDashboardSettings?.['your-plugin-page'] || {};
    
    return (
        <div className="your-plugin-page">
            <h2>{__('Your Plugin Page', 'your-plugin')}</h2>
            <p>Plugin Option: {settings.plugin_option}</p>
        </div>
    );
};

export default YourPluginPage;
```

Add the route using WordPress hooks:

```tsx
// your-plugin/assets/src/admin/routes.tsx

import YourPluginPage from './YourPluginPage';

// Add this in your main entry file
wp.hooks.addFilter(
    'dokan-admin-dashboard-routes',
    'your-plugin',
    (routes) => {
        routes.push({
            id: 'your-plugin-page',
            element: <YourPluginPage />,
            path: '/your-plugin-page',
        });
        return routes;
    }
);
```

### Method 2: Using WordPress Filters

A simpler approach using WordPress filters directly (no dependency injection required).

#### Step 1: Register Your Page Class

```php
<?php
// your-plugin/includes/Admin/CustomPage.php

namespace YourPlugin\Admin;

use WeDevs\Dokan\Admin\Dashboard\Pages\AbstractPage;

class CustomPage extends AbstractPage {
    // Same implementation as Method 1
}
```

#### Step 2: Hook into dokan_admin_dashboard_pages Filter

```php
<?php
// your-plugin/your-plugin.php

use YourPlugin\Admin\CustomPage;

add_filter('dokan_admin_dashboard_pages', function($pages) {
    // Instantiate and register your page
    $custom_page = new CustomPage();
    $custom_page->register_hooks();
    
    return $pages;
}, 10, 1);
```

#### Step 3: Add React Route via Filter

```tsx
// In your JavaScript file that gets enqueued

wp.hooks.addFilter(
    'dokan-admin-dashboard-routes',
    'your-plugin/custom-page',
    (routes) => {
        routes.push({
            id: 'custom-page',
            element: <YourCustomComponent />,
            path: '/custom-page',
        });
        return routes;
    }
);
```

---

## Advanced Topics

### Passing Settings from PHP to React

Settings are passed through the `settings()` method and made available in JavaScript:

**PHP Side:**
```php
public function settings(): array {
    return [
        'user_data' => [
            'name' => wp_get_current_user()->display_name,
            'email' => wp_get_current_user()->user_email,
        ],
        'options' => get_option( 'my_plugin_options' ),
        'nonce' => wp_create_nonce( 'my_plugin_action' ),
    ];
}
```

**JavaScript Side:**
```tsx
const MyComponent = () => {
    const settings = window.dokanAdminDashboardSettings?.['your-page-id'] || {};
    
    console.log(settings.user_data.name);
    console.log(settings.options);
    
    return <div>...</div>;
};
```

### Adding Custom Scripts and Styles

#### With Asset Dependencies (Recommended)

If you're using `@wordpress/scripts` for building:

```php
public function register(): void {
    $asset_file = YOUR_PLUGIN_DIR . '/build/dashboard.asset.php';
    
    if ( file_exists( $asset_file ) ) {
        $asset = require $asset_file;
        
        wp_register_script(
            'your-plugin-dashboard',
            YOUR_PLUGIN_URL . 'build/dashboard.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );
        
        wp_set_script_translations(
            'your-plugin-dashboard',
            'your-plugin'
        );
    }
}

public function scripts(): array {
    return [ 'your-plugin-dashboard' ];
}
```

#### Manual Dependencies

```php
public function register(): void {
    wp_register_script(
        'your-plugin-dashboard',
        YOUR_PLUGIN_URL . 'assets/js/dashboard.js',
        [
            'wp-element',
            'wp-i18n',
            'wp-api-fetch',
            'dokan-admin-dashboard',
        ],
        YOUR_PLUGIN_VERSION,
        true
    );
    
    wp_register_style(
        'your-plugin-dashboard',
        YOUR_PLUGIN_URL . 'assets/css/dashboard.css',
        [ 'dokan-admin-dashboard' ],
        YOUR_PLUGIN_VERSION
    );
}
```

### Extending Existing Pages

You can extend existing pages by modifying their settings or adding content via hooks.

#### Modify Page Settings

```php
add_filter('dokan_admin_dashboard_page_settings', function($settings, $page_id, $page) {
    if ($page_id === 'withdraw') {
        $settings['custom_field'] = 'custom_value';
        $settings['extra_data'] = get_option('my_extra_withdraw_data');
    }
    return $settings;
}, 10, 3);
```

#### Add Filters to Existing React Components

If the existing component uses `wp.hooks.applyFilters`:

```tsx
// In your plugin's JavaScript

wp.hooks.addFilter(
    'dokan_admin_vendors_list_filters',
    'your-plugin',
    (filters) => {
        filters.push({
            id: 'custom-filter',
            label: 'Custom Filter',
            field: <YourCustomFilterComponent />,
        });
        return filters;
    }
);
```

#### Extend Routes

Add sub-routes to existing pages:

```tsx
wp.hooks.addFilter(
    'dokan-admin-dashboard-routes',
    'your-plugin',
    (routes) => {
        // Add a sub-route to the vendors page
        routes.push({
            id: 'vendors-custom-view',
            element: <YourCustomVendorView />,
            path: '/vendors/custom-view',
            parent: 'vendors',
        });
        return routes;
    }
);
```

---

## Real-World Examples

### Example 1: Withdraw Page (Internal)

**PHP Implementation**: `includes/Admin/Dashboard/Pages/Withdraw.php`

```php
<?php
namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Withdraw extends AbstractPage {
    
    public function get_id(): string {
        return 'withdraw';
    }
    
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Withdraw Management', 'dokan-lite' ),
            'menu_title' => __( 'Withdraw', 'dokan-lite' ),
            'route'      => 'withdraw',
            'capability' => $capability,
            'position'   => 10,
        ];
    }
    
    public function settings(): array {
        return [];
    }
    
    public function scripts(): array {
        return [];
    }
    
    public function styles(): array {
        return [];
    }
    
    public function register(): void {
        // No custom assets needed - uses main dashboard bundle
    }
}
```

**React Implementation**: `src/admin/dashboard/pages/withdraw/index.tsx`

The Withdraw page demonstrates:
- DataViews for table display
- Status filtering with tabs
- Bulk actions (approve, cancel, delete)
- Modals for user interactions
- Date range filtering
- Vendor filtering
- Export functionality

### Example 2: Vendors Page (Internal)

**PHP Implementation**: `includes/Admin/Dashboard/Pages/Vendors.php`

```php
<?php
namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Vendors extends AbstractPage {
    public function get_id(): string {
        return 'vendors';
    }
    
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Vendors', 'dokan-lite' ),
            'menu_title' => __( 'Vendors', 'dokan-lite' ),
            'route'      => 'vendors',
            'capability' => $capability,
            'position'   => 100,
        ];
    }
    
    // ... other methods
}
```

**React Implementation**: `src/admin/dashboard/pages/vendors.tsx`

The Vendors page demonstrates:
- Extensible filters via WordPress hooks
- Custom filter components
- Pre-request modification hooks
- Integration with existing Dokan components
- External plugin extensibility patterns

---

## Best Practices

1. **Use Semantic IDs**: Choose clear, descriptive IDs for your pages (e.g., 'reports', 'analytics', not 'page1', 'custom')

2. **Follow WordPress Standards**: Use WordPress internationalization functions (`__()`, `_n()`, etc.)

3. **Handle Loading States**: Always show loading indicators while fetching data

4. **Error Handling**: Implement proper error handling and user feedback

5. **Accessibility**: Ensure your components are accessible (ARIA labels, keyboard navigation)

6. **Performance**: Optimize data fetching and rendering for large datasets

7. **Security**: 
   - Use nonces for state-changing operations
   - Verify capabilities on both PHP and JavaScript sides
   - Sanitize and validate all user inputs

8. **Consistency**: Match Dokan's design patterns and UI components

9. **Documentation**: Document your custom pages and any hooks/filters you provide

10. **Testing**: Test your pages with different user roles and scenarios

---

## Troubleshooting

### Page Not Appearing in Menu

- Verify your page class is registered in the service provider
- Check that `register_hooks()` is being called
- Ensure the capability check passes for the current user
- Clear WordPress and browser cache

### React Component Not Rendering

- Verify the route is added in `Dashboard.tsx` or via the filter
- Check browser console for JavaScript errors
- Ensure the path matches between PHP menu and React route
- Verify your JavaScript bundle is being enqueued

### Settings Not Available in JavaScript

- Check that `settings()` returns the correct data
- Verify the page ID matches between PHP and JavaScript
- Look for the settings in `window.dokanAdminDashboardSettings`
- Ensure scripts are enqueued on the correct admin page

### Styles Not Loading

- Verify style handles are returned from `styles()` method
- Check that styles are registered in `register()` method
- Ensure styles are enqueued only on Dokan dashboard pages
- Clear browser cache and rebuild assets

---

## Additional Resources

- [WordPress Admin Menu API](https://developer.wordpress.org/reference/functions/add_submenu_page/)
- [React Router Documentation](https://reactrouter.com/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Dokan Setup Guide Documentation](../admin/setup-guide/readme.md)
- [Dokan Filters and Hooks](../filters-hooks/README.md)

---

## Summary

Creating admin dashboard pages in Dokan involves:

1. **PHP**: Create a class extending `AbstractPage` that defines the page structure
2. **Registration**: Register your page class via service provider or filters
3. **React**: Create a React component for your page UI
4. **Routing**: Add your route to the React router configuration
5. **Settings**: Pass data from PHP to React via the `settings()` method

This architecture provides a clean separation between backend logic and frontend presentation, while maintaining flexibility for both internal development and external plugin integration.
