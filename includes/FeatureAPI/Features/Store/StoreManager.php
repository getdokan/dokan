<?php
/**
 * Store Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Store
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Store;

use WeDevs\Dokan\FeatureAPI\Permissions\AdminPermissions;
use WP_Feature as FeatureTypes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Store Manager
 *
 * @since 4.0.0
 */
class StoreManager {

    /**
     * Register store features
     */
    public function register_features() {
        $this->register_store_resources();
        $this->register_store_tools();
    }

    /**
     * Register store resource features (read-only)
     */
    private function register_store_resources() {
        // List stores
        wp_register_feature(
            [
				'id' => 'dokan/stores/list',
				'name' => __( 'List Stores', 'dokan-lite' ),
				'description' => __( 'Get a list of all stores with filtering options', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_stores_list' ],
				'permission_callback' => [ AdminPermissions::class, 'can_list_stores' ],
				'input_schema' => $this->get_stores_list_schema(),
				'output_schema' => $this->get_stores_list_output_schema(),
				'categories' => [ 'dokan', 'store', 'marketplace' ],
			]
        );

        // Get single store
        wp_register_feature(
            [
				'id' => 'dokan/stores/get',
				'name' => __( 'Get Store', 'dokan-lite' ),
				'description' => __( 'Get details of a specific store', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_store' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_store' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Store ID (Vendor ID)', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => $this->get_store_output_schema(),
				'categories' => [ 'dokan', 'store', 'marketplace' ],
			]
        );

        // Get featured stores
        wp_register_feature(
            [
				'id' => 'dokan/stores/featured',
				'name' => __( 'Get Featured Stores', 'dokan-lite' ),
				'description' => __( 'Get a list of featured stores', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_featured_stores' ],
				'permission_callback' => [ AdminPermissions::class, 'can_list_stores' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'number' => [
							'type' => 'integer',
							'description' => __( 'Number of stores to return', 'dokan-lite' ),
							'minimum' => 1,
							'maximum' => 50,
							'default' => 10,
						],
						'offset' => [
							'type' => 'integer',
							'description' => __( 'Number of stores to skip', 'dokan-lite' ),
							'minimum' => 0,
							'default' => 0,
						],
					],
				],
				'output_schema' => $this->get_stores_list_output_schema(),
				'categories' => [ 'dokan', 'store', 'marketplace' ],
			]
        );

        // Search stores
        wp_register_feature(
            [
				'id' => 'dokan/stores/search',
				'name' => __( 'Search Stores', 'dokan-lite' ),
				'description' => __( 'Search stores by name or description', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'search_stores' ],
				'permission_callback' => [ AdminPermissions::class, 'can_search_stores' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'search' ],
					'properties' => [
						'search' => [
							'type' => 'string',
							'description' => __( 'Search term', 'dokan-lite' ),
							'minLength' => 2,
						],
						'number' => [
							'type' => 'integer',
							'description' => __( 'Number of stores to return', 'dokan-lite' ),
							'minimum' => 1,
							'maximum' => 50,
							'default' => 10,
						],
						'offset' => [
							'type' => 'integer',
							'description' => __( 'Number of stores to skip', 'dokan-lite' ),
							'minimum' => 0,
							'default' => 0,
						],
					],
				],
				'output_schema' => $this->get_stores_list_output_schema(),
				'categories' => [ 'dokan', 'store', 'marketplace' ],
			]
        );

        // Get store categories
        wp_register_feature(
            [
				'id' => 'dokan/stores/categories',
				'name' => __( 'Get Store Categories', 'dokan-lite' ),
				'description' => __( 'Get all store categories', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_store_categories' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_store_categories' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'hide_empty' => [
							'type' => 'boolean',
							'description' => __( 'Hide empty categories', 'dokan-lite' ),
							'default' => false,
						],
					],
				],
				'output_schema' => $this->get_store_categories_output_schema(),
				'categories' => [ 'dokan', 'store', 'marketplace' ],
			]
        );
    }

    /**
     * Register store tool features (update, modify)
     */
    private function register_store_tools() {
        // Update store
        wp_register_feature(
            [
				'id' => 'dokan/stores/update',
				'name' => __( 'Update Store', 'dokan-lite' ),
				'description' => __( 'Update store details', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_store' ],
				'permission_callback' => [ AdminPermissions::class, 'can_update_store' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Store ID (Vendor ID)', 'dokan-lite' ),
						],
						'store_name' => [
							'type' => 'string',
							'description' => __( 'Store name', 'dokan-lite' ),
							'maxLength' => 100,
						],
						'store_url' => [
							'type' => 'string',
							'format' => 'uri',
							'description' => __( 'Store URL', 'dokan-lite' ),
						],
						'store_description' => [
							'type' => 'string',
							'description' => __( 'Store description', 'dokan-lite' ),
							'maxLength' => 1000,
						],
						'store_phone' => [
							'type' => 'string',
							'description' => __( 'Store phone', 'dokan-lite' ),
						],
						'store_address' => [
							'type' => 'object',
							'description' => __( 'Store address', 'dokan-lite' ),
							'properties' => [
								'street1' => [
									'type' => 'string',
									'description' => __( 'Street address 1', 'dokan-lite' ),
								],
								'street2' => [
									'type' => 'string',
									'description' => __( 'Street address 2', 'dokan-lite' ),
								],
								'city' => [
									'type' => 'string',
									'description' => __( 'City', 'dokan-lite' ),
								],
								'zip' => [
									'type' => 'string',
									'description' => __( 'ZIP/Postal code', 'dokan-lite' ),
								],
								'country' => [
									'type' => 'string',
									'description' => __( 'Country', 'dokan-lite' ),
								],
								'state' => [
									'type' => 'string',
									'description' => __( 'State/Province', 'dokan-lite' ),
								],
							],
						],
						'store_banner' => [
							'type' => 'integer',
							'description' => __( 'Store banner image ID', 'dokan-lite' ),
						],
						'store_logo' => [
							'type' => 'integer',
							'description' => __( 'Store logo image ID', 'dokan-lite' ),
						],
						'show_email' => [
							'type' => 'boolean',
							'description' => __( 'Show email on store page', 'dokan-lite' ),
						],
						'show_phone' => [
							'type' => 'boolean',
							'description' => __( 'Show phone on store page', 'dokan-lite' ),
						],
						'show_address' => [
							'type' => 'boolean',
							'description' => __( 'Show address on store page', 'dokan-lite' ),
						],
						'show_map' => [
							'type' => 'boolean',
							'description' => __( 'Show map on store page', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => $this->get_store_output_schema(),
				'categories' => [ 'dokan', 'store', 'marketplace' ],
			]
        );

        // Feature store
        wp_register_feature(
            [
				'id' => 'dokan/stores/feature',
				'name' => __( 'Feature Store', 'dokan-lite' ),
				'description' => __( 'Feature or unfeature a store', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'feature_store' ],
				'permission_callback' => [ AdminPermissions::class, 'can_feature_store' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id', 'featured' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Store ID (Vendor ID)', 'dokan-lite' ),
						],
						'featured' => [
							'type' => 'boolean',
							'description' => __( 'Whether to feature the store', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => $this->get_store_output_schema(),
				'categories' => [ 'dokan', 'store', 'marketplace' ],
			]
        );
    }

    /**
     * Get stores list
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_stores_list( $context ) {
        $args = $this->validate_list_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        $query_args = [
            'role' => 'seller',
            'number' => $args['number'] ?? 10,
            'offset' => $args['offset'] ?? 0,
            'orderby' => $args['orderby'] ?? 'registered',
            'order' => $args['order'] ?? 'DESC',
        ];

        // Add status filter
        if ( ! empty( $args['status'] ) ) {
            $query_args['meta_query'][] = [
                'key' => 'dokan_enable_selling',
                'value' => $args['status'] === 'active' ? 'yes' : 'no',
                'compare' => '=',
            ];
        }

        // Add featured filter
        if ( isset( $args['featured'] ) ) {
            $query_args['meta_query'][] = [
                'key' => 'dokan_feature_seller',
                'value' => $args['featured'] ? 'yes' : 'no',
                'compare' => '=',
            ];
        }

        $user_query = new \WP_User_Query( $query_args );
        $stores = [];

        if ( $user_query->get_results() ) {
            foreach ( $user_query->get_results() as $user ) {
                $stores[] = $this->format_store_response( $user );
            }
        }

        return [
            'stores' => $stores,
            'total' => $user_query->get_total(),
            'total_pages' => ceil( $user_query->get_total() / ( $args['number'] ?? 10 ) ),
            'current_page' => ( $args['offset'] ?? 0 ) / ( $args['number'] ?? 10 ) + 1,
        ];
    }

    /**
     * Get single store
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_store( $context ) {
        $store_id = absint( $context['id'] );
        $user = get_user_by( 'ID', $store_id );

        if ( ! $user || ! dokan_is_user_seller( $store_id ) ) {
            return new \WP_Error( 'store_not_found', __( 'Store not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $this->format_store_response( $user );
    }

    /**
     * Get featured stores
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_featured_stores( $context ) {
        $context['featured'] = true;
        return $this->get_stores_list( $context );
    }

    /**
     * Search stores
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function search_stores( $context ) {
        $search = sanitize_text_field( $context['search'] );

        if ( strlen( $search ) < 2 ) {
            return new \WP_Error( 'invalid_search', __( 'Search term must be at least 2 characters', 'dokan-lite' ) );
        }

        $query_args = [
            'role' => 'seller',
            'search' => '*' . $search . '*',
            'search_columns' => [ 'user_login', 'user_email', 'display_name' ],
            'number' => $context['number'] ?? 10,
            'offset' => $context['offset'] ?? 0,
        ];

        $user_query = new \WP_User_Query( $query_args );
        $stores = [];

        if ( $user_query->get_results() ) {
            foreach ( $user_query->get_results() as $user ) {
                $stores[] = $this->format_store_response( $user );
            }
        }

        return [
            'stores' => $stores,
            'total' => $user_query->get_total(),
            'search_term' => $search,
        ];
    }

    /**
     * Get store categories
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_store_categories( $context ) {
        $hide_empty = isset( $context['hide_empty'] ) ? (bool) $context['hide_empty'] : false;

        $categories = get_terms(
            [
				'taxonomy' => 'product_cat',
				'hide_empty' => $hide_empty,
				'orderby' => 'name',
				'order' => 'ASC',
			]
        );

        if ( is_wp_error( $categories ) ) {
            return $categories;
        }

        $formatted_categories = [];
        foreach ( $categories as $category ) {
            $formatted_categories[] = [
                'id' => $category->term_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'count' => $category->count,
                'parent' => $category->parent,
            ];
        }

        return [
            'categories' => $formatted_categories,
            'total' => count( $formatted_categories ),
        ];
    }

    /**
     * Update store
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_store( $context ) {
        $store_id = absint( $context['id'] );
        $user = get_user_by( 'ID', $store_id );

        if ( ! $user || ! dokan_is_user_seller( $store_id ) ) {
            return new \WP_Error( 'store_not_found', __( 'Store not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $args = $this->validate_update_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        // Update store information
        $store_info = dokan_get_store_info( $store_id );

        foreach ( $args as $key => $value ) {
            if ( $key === 'store_address' ) {
                $store_info['address'] = $value;
            } else {
                $store_info[ $key ] = $value;
            }
        }

        update_user_meta( $store_id, 'dokan_store_name', $store_info['store_name'] ?? '' );
        update_user_meta( $store_id, 'dokan_store_url', $store_info['store_url'] ?? '' );
        update_user_meta( $store_id, 'dokan_store_description', $store_info['store_description'] ?? '' );
        update_user_meta( $store_id, 'dokan_store_phone', $store_info['store_phone'] ?? '' );
        update_user_meta( $store_id, 'dokan_store_address', $store_info['address'] ?? [] );
        update_user_meta( $store_id, 'dokan_banner', $store_info['store_banner'] ?? 0 );
        update_user_meta( $store_id, 'dokan_gravatar', $store_info['store_logo'] ?? 0 );
        update_user_meta( $store_id, 'dokan_show_email', $store_info['show_email'] ? 'yes' : 'no' );
        update_user_meta( $store_id, 'dokan_show_phone', $store_info['show_phone'] ? 'yes' : 'no' );
        update_user_meta( $store_id, 'dokan_show_address', $store_info['show_address'] ? 'yes' : 'no' );
        update_user_meta( $store_id, 'dokan_show_map', $store_info['show_map'] ? 'yes' : 'no' );

        // Send notification
        do_action( 'dokan_store_updated', $store_id, $args );

        return $this->format_store_response( $user );
    }

    /**
     * Feature store
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function feature_store( $context ) {
        $store_id = absint( $context['id'] );
        $featured = (bool) $context['featured'];

        $user = get_user_by( 'ID', $store_id );
        if ( ! $user || ! dokan_is_user_seller( $store_id ) ) {
            return new \WP_Error( 'store_not_found', __( 'Store not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        update_user_meta( $store_id, 'dokan_feature_seller', $featured ? 'yes' : 'no' );

        // Send notification
        do_action( 'dokan_store_featured', $store_id, $featured );

        return $this->format_store_response( $user );
    }

    /**
     * Validate list parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    private function validate_list_params( $context ) {
        $args = [];

        // Validate number
        if ( isset( $context['number'] ) ) {
            $number = absint( $context['number'] );
            if ( $number < 1 || $number > 100 ) {
                return new \WP_Error( 'invalid_number', __( 'Number must be between 1 and 100', 'dokan-lite' ) );
            }
            $args['number'] = $number;
        }

        // Validate offset
        if ( isset( $context['offset'] ) ) {
            $offset = absint( $context['offset'] );
            if ( $offset < 0 ) {
                return new \WP_Error( 'invalid_offset', __( 'Offset must be non-negative', 'dokan-lite' ) );
            }
            $args['offset'] = $offset;
        }

        // Validate orderby
        if ( isset( $context['orderby'] ) ) {
            $valid_orderby = [ 'registered', 'display_name', 'user_login', 'user_email' ];
            if ( ! in_array( $context['orderby'], $valid_orderby, true ) ) {
                return new \WP_Error( 'invalid_orderby', __( 'Invalid orderby value', 'dokan-lite' ) );
            }
            $args['orderby'] = $context['orderby'];
        }

        // Validate order
        if ( isset( $context['order'] ) ) {
            $valid_order = [ 'ASC', 'DESC' ];
            if ( ! in_array( strtoupper( $context['order'] ), $valid_order, true ) ) {
                return new \WP_Error( 'invalid_order', __( 'Invalid order value', 'dokan-lite' ) );
            }
            $args['order'] = strtoupper( $context['order'] );
        }

        // Validate status
        if ( isset( $context['status'] ) ) {
            $valid_statuses = [ 'active', 'inactive' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate featured
        if ( isset( $context['featured'] ) ) {
            $args['featured'] = (bool) $context['featured'];
        }

        return $args;
    }

    /**
     * Validate update parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    private function validate_update_params( $context ) {
        $args = [];

        // Validate store_name
        if ( isset( $context['store_name'] ) ) {
            $store_name = sanitize_text_field( $context['store_name'] );
            if ( strlen( $store_name ) > 100 ) {
                return new \WP_Error( 'invalid_store_name', __( 'Store name must be 100 characters or less', 'dokan-lite' ) );
            }
            $args['store_name'] = $store_name;
        }

        // Validate store_url
        if ( isset( $context['store_url'] ) ) {
            $store_url = esc_url_raw( $context['store_url'] );
            if ( ! empty( $store_url ) && ! filter_var( $store_url, FILTER_VALIDATE_URL ) ) {
                return new \WP_Error( 'invalid_store_url', __( 'Invalid store URL', 'dokan-lite' ) );
            }
            $args['store_url'] = $store_url;
        }

        // Validate store_description
        if ( isset( $context['store_description'] ) ) {
            $store_description = sanitize_textarea_field( $context['store_description'] );
            if ( strlen( $store_description ) > 1000 ) {
                return new \WP_Error( 'invalid_store_description', __( 'Store description must be 1000 characters or less', 'dokan-lite' ) );
            }
            $args['store_description'] = $store_description;
        }

        // Validate store_phone
        if ( isset( $context['store_phone'] ) ) {
            $args['store_phone'] = sanitize_text_field( $context['store_phone'] );
        }

        // Validate store_address
        if ( isset( $context['store_address'] ) ) {
            $address = $context['store_address'];
            if ( is_array( $address ) ) {
                $args['store_address'] = [
                    'street1' => sanitize_text_field( $address['street1'] ?? '' ),
                    'street2' => sanitize_text_field( $address['street2'] ?? '' ),
                    'city' => sanitize_text_field( $address['city'] ?? '' ),
                    'zip' => sanitize_text_field( $address['zip'] ?? '' ),
                    'country' => sanitize_text_field( $address['country'] ?? '' ),
                    'state' => sanitize_text_field( $address['state'] ?? '' ),
                ];
            }
        }

        // Validate store_banner
        if ( isset( $context['store_banner'] ) ) {
            $banner_id = absint( $context['store_banner'] );
            if ( $banner_id > 0 && ! wp_attachment_is_image( $banner_id ) ) {
                return new \WP_Error( 'invalid_store_banner', __( 'Invalid banner image ID', 'dokan-lite' ) );
            }
            $args['store_banner'] = $banner_id;
        }

        // Validate store_logo
        if ( isset( $context['store_logo'] ) ) {
            $logo_id = absint( $context['store_logo'] );
            if ( $logo_id > 0 && ! wp_attachment_is_image( $logo_id ) ) {
                return new \WP_Error( 'invalid_store_logo', __( 'Invalid logo image ID', 'dokan-lite' ) );
            }
            $args['store_logo'] = $logo_id;
        }

        // Validate boolean fields
        $boolean_fields = [ 'show_email', 'show_phone', 'show_address', 'show_map' ];
        foreach ( $boolean_fields as $field ) {
            if ( isset( $context[ $field ] ) ) {
                $args[ $field ] = (bool) $context[ $field ];
            }
        }

        return $args;
    }

    /**
     * Format store response
     *
     * @param \WP_User $user
     * @return array
     */
    private function format_store_response( $user ) {
        $store_info = dokan_get_store_info( $user->ID );

        return [
            'id' => $user->ID,
            'name' => $user->display_name,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'store_name' => $store_info['store_name'] ?? '',
            'store_url' => $store_info['store_url'] ?? '',
            'store_description' => $store_info['store_description'] ?? '',
            'store_phone' => $store_info['store_phone'] ?? '',
            'store_address' => $store_info['address'] ?? [],
            'store_banner' => $store_info['banner'] ?? 0,
            'store_logo' => $store_info['gravatar'] ?? 0,
            'show_email' => $store_info['show_email'] === 'yes',
            'show_phone' => $store_info['show_phone'] === 'yes',
            'show_address' => $store_info['show_address'] === 'yes',
            'show_map' => $store_info['show_map'] === 'yes',
            'featured' => $store_info['feature_seller'] === 'yes',
            'status' => $store_info['enable_selling'] === 'yes' ? 'active' : 'inactive',
            'date_created' => $user->user_registered,
            'date_modified' => $user->user_modified ?? $user->user_registered,
        ];
    }

    /**
     * Get stores list input schema
     *
     * @return array
     */
    private function get_stores_list_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'number' => [
                    'type' => 'integer',
                    'description' => __( 'Number of stores to return', 'dokan-lite' ),
                    'minimum' => 1,
                    'maximum' => 100,
                    'default' => 10,
                ],
                'offset' => [
                    'type' => 'integer',
                    'description' => __( 'Number of stores to skip', 'dokan-lite' ),
                    'minimum' => 0,
                    'default' => 0,
                ],
                'orderby' => [
                    'type' => 'string',
                    'description' => __( 'Order by field', 'dokan-lite' ),
                    'enum' => [ 'registered', 'display_name', 'user_login', 'user_email' ],
                    'default' => 'registered',
                ],
                'order' => [
                    'type' => 'string',
                    'description' => __( 'Order direction', 'dokan-lite' ),
                    'enum' => [ 'ASC', 'DESC' ],
                    'default' => 'DESC',
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'active', 'inactive' ],
                    'description' => __( 'Store status', 'dokan-lite' ),
                ],
                'featured' => [
                    'type' => 'boolean',
                    'description' => __( 'Filter by featured status', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get store output schema
     *
     * @return array
     */
    private function get_store_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Store ID (Vendor ID)', 'dokan-lite' ),
                ],
                'name' => [
                    'type' => 'string',
                    'description' => __( 'Store owner name', 'dokan-lite' ),
                ],
                'username' => [
                    'type' => 'string',
                    'description' => __( 'Store owner username', 'dokan-lite' ),
                ],
                'email' => [
                    'type' => 'string',
                    'description' => __( 'Store owner email', 'dokan-lite' ),
                ],
                'store_name' => [
                    'type' => 'string',
                    'description' => __( 'Store name', 'dokan-lite' ),
                ],
                'store_url' => [
                    'type' => 'string',
                    'description' => __( 'Store URL', 'dokan-lite' ),
                ],
                'store_description' => [
                    'type' => 'string',
                    'description' => __( 'Store description', 'dokan-lite' ),
                ],
                'store_phone' => [
                    'type' => 'string',
                    'description' => __( 'Store phone', 'dokan-lite' ),
                ],
                'store_address' => [
                    'type' => 'object',
                    'description' => __( 'Store address', 'dokan-lite' ),
                    'properties' => [
                        'street1' => [
                            'type' => 'string',
                            'description' => __( 'Street address 1', 'dokan-lite' ),
                        ],
                        'street2' => [
                            'type' => 'string',
                            'description' => __( 'Street address 2', 'dokan-lite' ),
                        ],
                        'city' => [
                            'type' => 'string',
                            'description' => __( 'City', 'dokan-lite' ),
                        ],
                        'zip' => [
                            'type' => 'string',
                            'description' => __( 'ZIP/Postal code', 'dokan-lite' ),
                        ],
                        'country' => [
                            'type' => 'string',
                            'description' => __( 'Country', 'dokan-lite' ),
                        ],
                        'state' => [
                            'type' => 'string',
                            'description' => __( 'State/Province', 'dokan-lite' ),
                        ],
                    ],
                ],
                'store_banner' => [
                    'type' => 'integer',
                    'description' => __( 'Store banner image ID', 'dokan-lite' ),
                ],
                'store_logo' => [
                    'type' => 'integer',
                    'description' => __( 'Store logo image ID', 'dokan-lite' ),
                ],
                'show_email' => [
                    'type' => 'boolean',
                    'description' => __( 'Show email on store page', 'dokan-lite' ),
                ],
                'show_phone' => [
                    'type' => 'boolean',
                    'description' => __( 'Show phone on store page', 'dokan-lite' ),
                ],
                'show_address' => [
                    'type' => 'boolean',
                    'description' => __( 'Show address on store page', 'dokan-lite' ),
                ],
                'show_map' => [
                    'type' => 'boolean',
                    'description' => __( 'Show map on store page', 'dokan-lite' ),
                ],
                'featured' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether store is featured', 'dokan-lite' ),
                ],
                'status' => [
                    'type' => 'string',
                    'description' => __( 'Store status', 'dokan-lite' ),
                ],
                'date_created' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date created', 'dokan-lite' ),
                ],
                'date_modified' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date modified', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get stores list output schema
     *
     * @return array
     */
    private function get_stores_list_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'stores' => [
                    'type' => 'array',
                    'description' => __( 'List of stores', 'dokan-lite' ),
                    'items' => $this->get_store_output_schema(),
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of stores', 'dokan-lite' ),
                ],
                'total_pages' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of pages', 'dokan-lite' ),
                ],
                'current_page' => [
                    'type' => 'integer',
                    'description' => __( 'Current page number', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get store categories output schema
     *
     * @return array
     */
    private function get_store_categories_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'categories' => [
                    'type' => 'array',
                    'description' => __( 'List of store categories', 'dokan-lite' ),
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'id' => [
                                'type' => 'integer',
                                'description' => __( 'Category ID', 'dokan-lite' ),
                            ],
                            'name' => [
                                'type' => 'string',
                                'description' => __( 'Category name', 'dokan-lite' ),
                            ],
                            'slug' => [
                                'type' => 'string',
                                'description' => __( 'Category slug', 'dokan-lite' ),
                            ],
                            'description' => [
                                'type' => 'string',
                                'description' => __( 'Category description', 'dokan-lite' ),
                            ],
                            'count' => [
                                'type' => 'integer',
                                'description' => __( 'Number of products in category', 'dokan-lite' ),
                            ],
                            'parent' => [
                                'type' => 'integer',
                                'description' => __( 'Parent category ID', 'dokan-lite' ),
                            ],
                        ],
                    ],
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of categories', 'dokan-lite' ),
                ],
            ],
        ];
    }
}
