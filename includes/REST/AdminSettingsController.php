<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Admin Settings REST Controller.
 *
 * GET  /dokan/v1/admin/settings          — Returns the full flat array schema with values.
 * PUT  /dokan/v1/admin/settings/{page_id} — Saves flat values for a specific page.
 *
 * @since DOKAN_SINCE
 */
class AdminSettingsController extends DokanBaseAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'settings';

    /**
     * Settings registry instance.
     *
     * @var SettingsRegistry
     */
    private SettingsRegistry $registry;

    /**
     * Constructor.
     *
     * @param SettingsRegistry|null $registry Optional registry instance (for testing).
     */
    public function __construct( ?SettingsRegistry $registry = null ) {
        $this->registry = $registry ?? new SettingsRegistry();
    }

    /**
     * Register REST routes.
     *
     * @since DOKAN_SINCE
     */
    public function register_routes() {
        // GET /dokan/v1/admin/settings — full schema with values.
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );

        // PUT /dokan/v1/admin/settings/{page_id} — save values for a page.
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<page_id>[a-z_-]+)',
            [
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'page_id' => [
                            'description' => __( 'The page ID to save settings for.', 'dokan-lite' ),
                            'type'        => 'string',
                            'required'    => true,
                        ],
                        'values' => [
                            'description' => __( 'Flat key-value map of field values.', 'dokan-lite' ),
                            'type'        => 'object',
                            'required'    => true,
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * GET handler — returns the full flat array schema with populated values.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function get_items( $request ) {
        $schema = $this->registry->get_schema();

        /**
         * Filter the admin settings REST response.
         *
         * @since DOKAN_SINCE
         *
         * @param array $schema The full flat array schema with values.
         */
        $schema = apply_filters( 'dokan_admin_settings_response', $schema );

        return rest_ensure_response( $schema );
    }

    /**
     * PUT handler — saves field values for a specific page.
     *
     * Expects request body:
     * ```json
     * {
     *   "page_id": "general",
     *   "values": {
     *     "marketplace.marketplace_settings.vendor_store_url": "store",
     *     "dokan_pages.dashboard_section.dashboard": "123"
     *   }
     * }
     * ```
     *
     * The keys in `values` use the dependency_key format (dot-notation path relative to the page).
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function update_item( $request ) {
        $page_id    = $request->get_param( 'page_id' );
        $flat_values = $request->get_param( 'values' );

        if ( ! is_array( $flat_values ) ) {
            return new WP_Error(
                'dokan_rest_invalid_values',
                __( 'Values must be an object.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        // Get the current schema to look up field definitions.
        $schema  = $this->registry->get_schema();
        $fields  = $this->get_fields_by_page( $schema, $page_id );

        if ( empty( $fields ) ) {
            return new WP_Error(
                'dokan_rest_invalid_page',
                /* translators: %s: page ID */
                sprintf( __( 'No fields found for page "%s".', 'dokan-lite' ), $page_id ),
                [ 'status' => 404 ]
            );
        }

        // Find the storage key for this page.
        $storage_key = $this->get_page_storage_key( $schema, $page_id );

        if ( ! $storage_key ) {
            return new WP_Error(
                'dokan_rest_no_storage_key',
                /* translators: %s: page ID */
                sprintf( __( 'Page "%s" has no storage_key configured.', 'dokan-lite' ), $page_id ),
                [ 'status' => 400 ]
            );
        }

        // Build a field lookup: dependency_key => field element.
        $field_lookup = [];
        foreach ( $fields as $field ) {
            $dep_key = $field['dependency_key'] ?? '';
            if ( ! empty( $dep_key ) ) {
                $field_lookup[ $dep_key ] = $field;
            }
        }

        // Validate and sanitize values.
        $validation_errors = [];
        $sanitized_values  = [];

        foreach ( $flat_values as $dep_key => $value ) {
            $field = $field_lookup[ $dep_key ] ?? null;

            if ( ! $field ) {
                // Unknown field — skip silently (could be from an extension not loaded).
                continue;
            }

            // Validate.
            $field_errors = $this->validate_field_value( $field, $value );
            if ( ! empty( $field_errors ) ) {
                $validation_errors[ $dep_key ] = $field_errors;
                continue;
            }

            // Sanitize.
            $sanitized_values[ $dep_key ] = $this->sanitize_field_value( $field, $value );
        }

        if ( ! empty( $validation_errors ) ) {
            return new WP_Error(
                'dokan_rest_validation_failed',
                __( 'Validation failed for one or more fields.', 'dokan-lite' ),
                [
                    'status' => 400,
                    'errors' => $validation_errors,
                ]
            );
        }

        /**
         * Fired before saving admin settings.
         *
         * @since DOKAN_SINCE
         *
         * @param string $page_id          The page being saved.
         * @param array  $sanitized_values  Sanitized flat values (dependency_key => value).
         * @param string $storage_key       The wp_options key.
         */
        do_action( 'dokan_before_saving_settings', $page_id, $sanitized_values, $storage_key );

        // Convert flat dependency_key values to nested array for storage.
        $nested_data = $this->flat_to_nested( $sanitized_values );

        // Merge with existing data (preserve fields not in this save).
        $existing = get_option( $storage_key, [] );
        $merged   = is_array( $existing ) ? $this->deep_merge( $existing, $nested_data ) : $nested_data;

        update_option( $storage_key, $merged, true );

        /**
         * Fired after saving admin settings.
         *
         * @since DOKAN_SINCE
         *
         * @param string $page_id          The page that was saved.
         * @param array  $sanitized_values  Sanitized flat values that were saved.
         * @param string $storage_key       The wp_options key.
         * @param array  $merged            The full merged data written to storage.
         */
        do_action( 'dokan_after_saving_settings', $page_id, $sanitized_values, $storage_key, $merged );

        // Clear registry cache so next GET returns fresh values.
        $this->registry->clear_cache();

        // Return updated schema.
        $updated_schema = $this->registry->get_schema();

        return rest_ensure_response( apply_filters( 'dokan_admin_settings_response', $updated_schema ) );
    }

    /**
     * Get all field elements belonging to a specific page.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $schema  The full schema.
     * @param string $page_id The page ID.
     *
     * @return array Field elements.
     */
    private function get_fields_by_page( array $schema, string $page_id ): array {
        // Collect all element IDs that belong to this page.
        $page_element_ids = $this->collect_page_descendants( $schema, $page_id );

        return array_filter(
            $schema,
            fn( $el ) => 'field' === ( $el['type'] ?? '' ) && in_array( $el['id'], $page_element_ids, true )
        );
    }

    /**
     * Recursively collect all descendant element IDs for a page.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $schema  The full schema.
     * @param string $page_id The page ID.
     *
     * @return string[] All descendant element IDs.
     */
    private function collect_page_descendants( array $schema, string $page_id ): array {
        $parent_pointers = [ 'page_id', 'subpage_id', 'tab_id', 'section_id', 'subsection_id', 'field_group_id' ];
        $ids             = [];
        $queue           = [ $page_id ];

        while ( ! empty( $queue ) ) {
            $parent_id = array_shift( $queue );

            foreach ( $schema as $el ) {
                $el_id = $el['id'] ?? '';

                foreach ( $parent_pointers as $pointer ) {
                    if ( ( $el[ $pointer ] ?? '' ) === $parent_id && ! in_array( $el_id, $ids, true ) ) {
                        $ids[]   = $el_id;
                        $queue[] = $el_id;
                        break;
                    }
                }
            }
        }

        return $ids;
    }

    /**
     * Get the storage_key for a page element.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $schema  The full schema.
     * @param string $page_id The page ID.
     *
     * @return string|null The storage key or null.
     */
    private function get_page_storage_key( array $schema, string $page_id ): ?string {
        // Direct match on page elements.
        foreach ( $schema as $el ) {
            if ( 'page' === ( $el['type'] ?? '' ) && ( $el['id'] ?? '' ) === $page_id ) {
                return $el['storage_key'] ?? null;
            }
        }

        // If not found, the ID may be a subpage — walk up to its parent page.
        foreach ( $schema as $el ) {
            if ( 'subpage' === ( $el['type'] ?? '' ) && ( $el['id'] ?? '' ) === $page_id ) {
                $parent_page_id = $el['page_id'] ?? '';
                if ( $parent_page_id ) {
                    return $this->get_page_storage_key( $schema, $parent_page_id );
                }
            }
        }

        return null;
    }

    /**
     * Validate a field value against the field's validation rules.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field The field schema element.
     * @param mixed $value The submitted value.
     *
     * @return string[] Array of error messages (empty if valid).
     */
    private function validate_field_value( array $field, $value ): array {
        $errors      = [];
        $validations = $field['validations'] ?? [];

        foreach ( $validations as $rule ) {
            if ( is_array( $rule ) ) {
                foreach ( $rule as $rule_key => $rule_value ) {
                    switch ( $rule_key ) {
                        case 'required':
                        case 'not_empty':
                            if ( '' === $value || null === $value ) {
                                $errors[] = is_string( $rule_value ) ? $rule_value : __( 'This field is required.', 'dokan-lite' );
                            }
                            break;

                        case 'min_value':
                            if ( is_numeric( $value ) && (float) $value < (float) $rule_value ) {
                                /* translators: %s: minimum value */
                                $errors[] = sprintf( __( 'Value must be at least %s.', 'dokan-lite' ), $rule_value );
                            }
                            break;

                        case 'max_value':
                            if ( is_numeric( $value ) && (float) $value > (float) $rule_value ) {
                                /* translators: %s: maximum value */
                                $errors[] = sprintf( __( 'Value must be at most %s.', 'dokan-lite' ), $rule_value );
                            }
                            break;

                        case 'not_in':
                            if ( is_array( $rule_value ) && in_array( $value, $rule_value, true ) ) {
                                $errors[] = is_string( $rule_value ) ? $rule_value : __( 'This value is not allowed.', 'dokan-lite' );
                            }
                            break;
                    }
                }
            }
        }

        // Run custom validation_func if present.
        if ( ! empty( $field['validation_func'] ) && is_callable( $field['validation_func'] ) ) {
            $result = call_user_func( $field['validation_func'], $value );
            if ( false === $result ) {
                $errors[] = __( 'Custom validation failed.', 'dokan-lite' );
            } elseif ( is_string( $result ) && '' !== $result ) {
                $errors[] = $result;
            }
        }

        return $errors;
    }

    /**
     * Sanitize a field value based on its variant.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field The field schema element.
     * @param mixed $value The submitted value.
     *
     * @return mixed Sanitized value.
     */
    private function sanitize_field_value( array $field, $value ) {
        // Use custom sanitize_callback if provided.
        if ( ! empty( $field['sanitize_callback'] ) && is_callable( $field['sanitize_callback'] ) ) {
            return call_user_func( $field['sanitize_callback'], $value );
        }

        $variant = $field['variant'] ?? 'text';

        switch ( $variant ) {
            case 'text':
            case 'tel':
            case 'password':
            case 'show_hide':
            case 'copy_field':
            case 'base_field_label':
                return sanitize_text_field( $value );

            case 'textarea':
            case 'rich_text':
                return wp_kses_post( $value );

            case 'number':
            case 'currency':
                return is_numeric( $value ) ? $value + 0 : 0;

            case 'switch':
                return in_array( $value, [ 'on', 'off' ], true ) ? $value : 'off';

            case 'select':
            case 'radio':
            case 'radio_capsule':
            case 'radio_box':
            case 'customize_radio':
            case 'refresh_select':
            case 'select_color_picker':
                return sanitize_text_field( $value );

            case 'checkbox':
            case 'multicheck':
                if ( is_array( $value ) ) {
                    return array_map( 'sanitize_text_field', $value );
                }
                return sanitize_text_field( $value );

            case 'combine_input':
            case 'double_input':
            case 'category_based_commission':
            case 'repeater':
            case 'vendor_info_preview':
            case 'single_product_preview':
                // Complex types — sanitize recursively.
                return $this->sanitize_recursive( $value );

            case 'html':
            case 'notice':
            case 'info':
                // Display-only fields — no user input to sanitize.
                return $value;

            default:
                /**
                 * Filter to sanitize custom field variants.
                 *
                 * @since DOKAN_SINCE
                 *
                 * @param mixed  $value   The raw value.
                 * @param array  $field   The field schema element.
                 * @param string $variant The field variant string.
                 */
                return apply_filters( 'dokan_admin_settings_sanitize_field', $value, $field, $variant );
        }
    }

    /**
     * Recursively sanitize an array/object value.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value The value to sanitize.
     *
     * @return mixed
     */
    private function sanitize_recursive( $value ) {
        if ( is_array( $value ) ) {
            return array_map( [ $this, 'sanitize_recursive' ], $value );
        }

        if ( is_string( $value ) ) {
            return sanitize_text_field( $value );
        }

        if ( is_numeric( $value ) ) {
            return $value + 0;
        }

        if ( is_bool( $value ) ) {
            return $value;
        }

        return $value;
    }

    /**
     * Convert flat dependency_key values to a nested array.
     *
     * E.g., `['a.b.c' => 'val']` becomes `['a' => ['b' => ['c' => 'val']]]`.
     *
     * @since DOKAN_SINCE
     *
     * @param array $flat_values Flat dependency_key => value map.
     *
     * @return array Nested array.
     */
    private function flat_to_nested( array $flat_values ): array {
        $nested = [];

        foreach ( $flat_values as $key => $value ) {
            $keys    = explode( '.', $key );
            $current = &$nested;

            foreach ( $keys as $i => $segment ) {
                if ( $i === count( $keys ) - 1 ) {
                    $current[ $segment ] = $value;
                } else {
                    if ( ! isset( $current[ $segment ] ) || ! is_array( $current[ $segment ] ) ) {
                        $current[ $segment ] = [];
                    }
                    $current = &$current[ $segment ];
                }
            }

            unset( $current );
        }

        return $nested;
    }

    /**
     * Deep merge two arrays. Second array values overwrite first.
     *
     * @since DOKAN_SINCE
     *
     * @param array $base    Base array.
     * @param array $overlay Overlay array.
     *
     * @return array Merged array.
     */
    private function deep_merge( array $base, array $overlay ): array {
        foreach ( $overlay as $key => $value ) {
            if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) ) {
                $base[ $key ] = $this->deep_merge( $base[ $key ], $value );
            } else {
                $base[ $key ] = $value;
            }
        }

        return $base;
    }

    /**
     * REST schema for the settings endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_item_schema(): array {
        return [
            '$schema' => 'http://json-schema.org/draft-04/schema#',
            'title'   => 'dokan_admin_settings',
            'type'    => 'array',
            'items'   => [
                'type'       => 'object',
                'properties' => [
                    'id'           => [
                        'description' => __( 'Settings element ID.', 'dokan-lite' ),
                        'type'        => 'string',
                        'required'    => true,
                    ],
                    'type'         => [
                        'description' => __( 'Element type (page, subpage, section, field, etc.).', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                    'variant'      => [
                        'description' => __( 'Field input variant (text, switch, select, etc.).', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                    'value'        => [
                        'description' => __( 'Field value.', 'dokan-lite' ),
                        'type'        => [ 'string', 'integer', 'array', 'number', 'boolean', 'object' ],
                    ],
                ],
            ],
        ];
    }
}
