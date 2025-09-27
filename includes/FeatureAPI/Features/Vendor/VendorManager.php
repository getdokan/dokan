<?php
/**
 * Vendor Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Vendor
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Vendor;

use WeDevs\Dokan\FeatureAPI\Schemas\VendorSchema;
use WeDevs\Dokan\FeatureAPI\Validators\VendorValidator;
use WeDevs\Dokan\FeatureAPI\Permissions\VendorPermissions;
use WP_Feature;
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Vendor Manager
 *
 * @since 4.0.0
 */
class VendorManager {

    /**
     * Register vendor features
     */
    public function register_features() {
        $this->register_vendor_resources();
        $this->register_vendor_tools();
    }

    /**
     * Register vendor resource features (read-only)
     */
    private function register_vendor_resources() {
        // List vendors - using REST alias to vendor listing endpoint
        wp_register_feature(
            [
				'id' => 'dokan-vendors-list',
				'name' => __( 'List Vendors', 'dokan-lite' ),
				'description' => __( 'Get a list of all vendors with filtering options', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'rest_alias' => '/dokan/v1/vendors',
				'categories' => [ 'dokan', 'vendor', 'marketplace' ],
			]
        );

        // Get single vendor - using REST alias to single vendor endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/get',
				'name' => __( 'Get Vendor', 'dokan-lite' ),
				'description' => __( 'Get details of a specific vendor', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'rest_alias' => '/dokan/v1/vendors/(?P<id>[\d]+)',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'marketplace' ],
			]
        );

        // Get featured vendors - using REST alias with query parameters
        wp_register_feature(
            [
				'id' => 'dokan/vendors/featured',
				'name' => __( 'Get Featured Vendors', 'dokan-lite' ),
				'description' => __( 'Get a list of featured vendors', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'rest_alias' => '/dokan/v1/vendors?featured=yes',
				'categories' => [ 'dokan', 'vendor', 'marketplace', 'featured' ],
			]
        );

        // Search vendors - using REST alias with search parameter
        wp_register_feature(
            [
				'id' => 'dokan/vendors/search',
				'name' => __( 'Search Vendors', 'dokan-lite' ),
				'description' => __( 'Search vendors by name, email, or store name', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'rest_alias' => '/dokan/v1/vendors',
				'categories' => [ 'dokan', 'vendor', 'marketplace', 'search' ],
			]
        );

        // Get vendor products - using REST alias to vendor products endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/vendor-products',
				'name' => __( 'Get Vendor Products', 'dokan-lite' ),
				'description' => __( 'Get products of a specific vendor', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'rest_alias' => '/dokan/v1/vendors/(?P<vendor_id>[\d]+)/products',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'vendor_id' ],
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'product', 'marketplace' ],
			]
        );

        // Get vendor orders - using REST alias to vendor orders endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/vendor-orders',
				'name' => __( 'Get Vendor Orders', 'dokan-lite' ),
				'description' => __( 'Get orders of a specific vendor', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'rest_alias' => '/dokan/v1/vendors/(?P<vendor_id>[\d]+)/orders',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'vendor_id' ],
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'order', 'marketplace' ],
			]
        );
    }

    /**
     * Register vendor tool features (actions)
     */
    private function register_vendor_tools() {
        // Create vendor - using REST alias to vendor creation endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/create',
				'name' => __( 'Create Vendor', 'dokan-lite' ),
				'description' => __( 'Create a new vendor account', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'rest_alias' => '/dokan/v1/vendors',
				'categories' => [ 'dokan', 'vendor', 'marketplace' ],
			]
        );

        // Update vendor - using REST alias to vendor update endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/update',
				'name' => __( 'Update Vendor', 'dokan-lite' ),
				'description' => __( 'Update vendor information', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'rest_alias' => '/dokan/v1/vendors/(?P<id>[\d]+)',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'marketplace' ],
			]
        );

        // Delete vendor - using REST alias to vendor deletion endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/delete',
				'name' => __( 'Delete Vendor', 'dokan-lite' ),
				'description' => __( 'Delete a vendor account', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'rest_alias' => '/dokan/v1/vendors/(?P<id>[\d]+)',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'marketplace' ],
			]
        );

        // Approve vendor - using REST alias to vendor approval endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/approve',
				'name' => __( 'Approve Vendor', 'dokan-lite' ),
				'description' => __( 'Approve a vendor account', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'rest_alias' => '/dokan/v1/vendors/(?P<id>[\d]+)/approve',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'marketplace' ],
			]
        );

        // Disable vendor - using REST alias to vendor disable endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/disable',
				'name' => __( 'Disable Vendor', 'dokan-lite' ),
				'description' => __( 'Disable a vendor from selling', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'rest_alias' => '/dokan/v1/vendors/(?P<id>[\d]+)/disable',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'marketplace' ],
			]
        );

        // Feature vendor - using REST alias to vendor feature endpoint
        wp_register_feature(
            [
				'id' => 'dokan/vendors/feature',
				'name' => __( 'Feature Vendor', 'dokan-lite' ),
				'description' => __( 'Mark a vendor as featured', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'rest_alias' => '/dokan/v1/vendors/(?P<id>[\d]+)/feature',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'vendor', 'marketplace', 'featured' ],
			]
        );
    }
}
