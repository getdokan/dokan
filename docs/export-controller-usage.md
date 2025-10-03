# Export Controller Usage Guide

This document explains how to create custom export controllers for Dokan that integrate with WooCommerce's export system.

## Overview

Dokan now provides an export system that integrates with WooCommerce's export functionality, allowing you to create exportable reports for any Dokan data type. This guide will walk you through creating a new exporter using the withdraw exporter as an example.

## Architecture

The export system consists of three main components:

1. **ExportController** - REST API controller that extends WooCommerce's Export Controller
2. **ExportableController** - Individual report controllers that implement `ExportableInterface`
3. **Registration** - Filter hooks to register controllers in the system

## Creating a New Exporter

### Step 1: Create the Exportable Controller

Create a controller that extends WooCommerce's `GenericController` and implements `ExportableInterface`:

```php
<?php

namespace WeDevs\Dokan\REST;

use Automattic\WooCommerce\Admin\API\Reports\GenericController;
use Automattic\WooCommerce\Admin\API\Reports\ExportableInterface;

class YourCustomExportController extends GenericController implements ExportableInterface {

    /**
     * Route base for this controller
     */
    protected $rest_base = 'dokan/v1/reports/your-report-type';

    /**
     * Get the column names for export.
     *
     * @return array Key value pair of Column ID => Label.
     */
    public function get_export_columns() {
        return array(
            'id'     => __( 'ID', 'dokan-lite' ),
            'name'   => __( 'Name', 'dokan-lite' ),
            'amount' => __( 'Amount', 'dokan-lite' ),
            'date'   => __( 'Date', 'dokan-lite' ),
            // Add more columns as needed
        );
    }

    /**
     * Get the column values for export.
     *
     * @param array $item Single report item/row.
     * @return array Key value pair of Column ID => Value.
     */
    public function prepare_item_for_export( $item ) {
        return array(
            'id'     => $item['id'],
            'name'   => $item['name'],
            'amount' => $item['amount'],
            'date'   => $item['date'],
            // Map your data structure to export columns
        );
    }

    /**
     * Get items for export.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_items( $request ) {
        // Your logic to fetch data
        $args = array();
        
        // Parse request parameters
        if ( ! empty( $request['your_filter'] ) ) {
            $args['your_filter'] = $request['your_filter'];
        }
        
        // Set pagination
        $args['limit'] = $request['per_page'] ?? 25;
        $args['offset'] = ( ( $request['page'] ?? 1 ) - 1 ) * $args['limit'];

        // Get your data
        $items = your_data_fetching_function( $args );
        $total_items = your_total_count_function( $args );

        // Format data for export
        $data = array();
        foreach ( $items as $item ) {
            $data[] = array(
                'id'     => $item->id,
                'name'   => $item->name,
                'amount' => $item->amount,
                'date'   => $item->date,
                // Map your object properties
            );
        }

        $response = rest_ensure_response( $data );

        // Add pagination headers (required)
        $response->header( 'X-WP-Total', $total_items );
        $response->header( 'X-WP-TotalPages', ceil( $total_items / $args['limit'] ) );

        return $response;
    }

    /**
     * Get the query params for collections.
     *
     * @return array
     */
    public function get_collection_params() {
        $params = parent::get_collection_params();

        // Add your custom filter parameters
        $params['your_filter'] = array(
            'description'       => __( 'Your filter description', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
        );

        return $params;
    }

    /**
     * Check permissions for the request.
     *
     * @param  \WP_REST_Request $request Full details about the request.
     * @return \WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'dokan_view_reports' ) ) {
            return new \WP_Error( 'woocommerce_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        return true;
    }
}
```

### Step 2: Register the Controller

Add your controller to the export controller mapping in the REST Manager class. Modify the `register_export_controllers` method in `includes/REST/Manager.php`:

```php
public function register_export_controllers( $controller_map ) {
    $controller_map['withdraws'] = '\WeDevs\Dokan\REST\WithdrawExportController';
    $controller_map['your-report-type'] = '\WeDevs\Dokan\REST\YourCustomExportController'; // Add this line
    
    return $controller_map;
}
```

### Step 3: Register the Controller File (Optional)

If you want your controller to be automatically loaded as a REST endpoint, add it to the `dokan_rest_api_class_map` filter in `includes/REST/Manager.php`:

```php
DOKAN_DIR . '/includes/REST/YourCustomExportController.php' => '\WeDevs\Dokan\REST\YourCustomExportController',
```

## Usage Examples

### Basic Export Request

Once your controller is registered, you can export data by making a POST request to:

```
POST /wp-json/dokan/v1/reports/your-report-type/export
```

With optional parameters:
```json
{
    "report_args": {
        "your_filter": "value",
        "after": "2023-01-01T00:00:00",
        "before": "2023-12-31T23:59:59"
    },
    "email": false
}
```

### Check Export Status

```
GET /wp-json/dokan/v1/reports/your-report-type/export/{export_id}/status
```

### Withdraw Export Example

```bash
# Start withdraw export
curl -X POST "https://yoursite.com/wp-json/dokan/v1/reports/withdraws/export" \
  -H "Content-Type: application/json" \
  -d '{
    "report_args": {
      "status": "approved",
      "user_id": 123,
      "after": "2023-01-01T00:00:00"
    },
    "email": false
  }'

# Response
{
  "message": "Your report file is being generated.",
  "export_id": "1642534567890"
}

# Check status
curl "https://yoursite.com/wp-json/dokan/v1/reports/withdraws/export/1642534567890/status"

# Response when complete
{
  "percent_complete": 100,
  "download_url": "https://yoursite.com/wp-admin/admin.php?action=woocommerce_admin_download_report_csv&filename=wc-withdraws-report-export-1642534567890"
}
```

## Key Requirements

1. **Extend GenericController**: Your controller must extend `Automattic\WooCommerce\Admin\API\Reports\GenericController`
2. **Implement ExportableInterface**: Must implement both `get_export_columns()` and `prepare_item_for_export()` methods
3. **Provide get_items() method**: Must return paginated data with proper headers
4. **Permission checks**: Implement proper permission checking
5. **Pagination headers**: Must set `X-WP-Total` and `X-WP-TotalPages` headers

## Advanced Features

### Email Notifications

Set `"email": true` in your export request to automatically email the download link when the export is complete.

### Custom Data Endpoints

You can override the data endpoint by using the `woocommerce_export_report_data_endpoint` filter:

```php
add_filter( 'woocommerce_export_report_data_endpoint', function( $endpoint, $type ) {
    if ( $type === 'your-report-type' ) {
        return '/custom/endpoint/path';
    }
    return $endpoint;
}, 10, 2 );
```

### Background Processing

All exports are processed in the background using WooCommerce's Action Scheduler, so large datasets won't timeout or block the user interface.

## Troubleshooting

### Common Issues

1. **Controller not found**: Ensure your controller is properly registered in the `woocommerce_export_report_controller_map` filter
2. **Permission errors**: Check that your `get_items_permissions_check()` method allows the current user
3. **Empty exports**: Verify that your `get_items()` method returns data and sets pagination headers
4. **Column mismatch**: Ensure your `prepare_item_for_export()` returns all columns defined in `get_export_columns()`

### Debug Tips

- Check the export status endpoint for error messages
- Verify your data fetching functions return the expected format
- Use WP_DEBUG to see any PHP errors during export processing
- Check the Action Scheduler logs for background processing issues

## Conclusion

This export system provides a flexible way to create exportable reports that integrate seamlessly with WooCommerce's existing infrastructure. Follow the withdraw exporter example as a template for creating your own custom exporters.
