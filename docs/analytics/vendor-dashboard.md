

## Vendor Analytics report

**Step 1:** Register WC scripts

Woocommerce registers scripts for Admin Dashboard. We need to register the scripts for resolving the dependencies of the analytics scripts. We may register the script as follows:

```php
$wc_instance = \Automattic\WooCommerce\Internal\Admin\WCAdminAssets;::get_instance();
$wc_instance->register_scripts();
```

- **Step 2:** Register vendor analytics scripts and styles

```php
// Register style
 $dep = array(
            'wc-components',
            'wc-admin-layout',
            'wc-customer-effort-score',
            // 'wc-product-editor',
            'wp-components',
            'wc-experimental',
        );

wp_register_style( 'vendor_analytics_style', $frontend_style, $dep, filemtime( VENDOR_ANALYTICS_DIR . '/assets/frontend/style.css' ) );

// Register scripts
$frontend_script    = VENDOR_ANALYTICS_PLUGIN_BUILD_ASSET . '/index.js';
$asset = include VENDOR_ANALYTICS_DIR . '/build/index.asset.php';

wp_register_script( 'vendor_analytics_script', $frontend_script, $asset['dependencies'] ?? [], $asset['version'] ?? '', true );
```

- **Step 3:** Enqueue vendor analytics scripts and styles

```php
wp_enqueue_script( 'vendor_analytics_script' );
wp_enqueue_style( 'vendor_analytics_style' );
```

## API permissions

WC checks `reports` permission for [REST API](https://github.com/woocommerce/woocommerce/blob/f9cf25e8d79b26c296a3483dd45eae612ed8d3d1/plugins/woocommerce/includes/rest-api/Controllers/Version1/class-wc-rest-reports-v1-controller.php#L60-L65). We may resolve this issue by the following ways:

- **Option 1:** We may assign permission to vendor by default through migration or any other way.

- **Option 2:** We may use `woocommerce_rest_check_permissions` filter to override the permission.

```php

add_filter( 'woocommerce_rest_check_permissions', function(  $permission, $context, $int_val, $object ) {
    if (! $permission && $object === 'reports'  && $context == 'read') {
        $current_user_id =  dokan_get_current_user_id();
        $permission =  dokan_is_user_seller( $current_user_id );
    }
}, 20, 4)

```

## Change Admin Route

We need to change the admin routes
- **Filters Routes**: Routes are changed by the filters. But we don't have control to this since Base Filter is a WC component. That's why, we [changed the route](./src/layout/index.js#L79)through `useEffect` and `useLocation` hooks.


## Add Custom Performance indicator Data

```php
function add_custom_performance_indicator_to_revenue_schema( $reports ) {
        $reports['totals']['properties']['total_seller_earning'] = array(
			'description' => __( 'Total Seller Earning', 'dokan-lite' ),
			'type'        => 'number',
			'context'     => array( 'view', 'edit' ),
			'readonly'    => true,
			'indicator'   => true,
			'format'      => 'currency',
        );

        $reports['totals']['properties']['total_admin_commission'] = array(
			'description' => __( 'Total Admin Earning', 'dokan-lite' ),
			'type'        => 'number',
			'context'     => array( 'view', 'edit' ),
			'readonly'    => true,
			'indicator'   => true,
			'format'      => 'currency',
        );

        return $reports;
    }

    // @see https://github.com/woocommerce/woocommerce/blob/e0e68866a4456a9e355827d5234346e855c21c83/plugins/woocommerce/src/Admin/API/Reports/Revenue/Stats/Controller.php#L216
    add_filter( 'woocommerce_rest_report_revenue_stats_schema', [ $this, 'revenue_stats_schema' ] );
```