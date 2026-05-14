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
                    'permission_callback' => '__return_true',
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
     *     "custom_store_url": "store",
     *     "admin_percentage": "10"
     *   }
     * }
     * ```
     *
     * The keys in `values` are field ids (globally unique, matching dependency_key).
     * Values are merged into the single `dokan_settings` wp_option.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function update_item( $request ) {
        $page_id     = $request->get_param( 'page_id' );
        $flat_values = $request->get_param( 'values' );

        if ( ! is_array( $flat_values ) ) {
            return new WP_Error(
                'dokan_rest_invalid_values',
                __( 'Values must be an object.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        $schema = $this->registry->get_schema();
        $fields = $this->get_fields_by_page( $schema, $page_id );

        if ( empty( $fields ) ) {
            return new WP_Error(
                'dokan_rest_invalid_page',
                /* translators: %s: page ID */
                sprintf( __( 'No fields found for page "%s".', 'dokan-lite' ), $page_id ),
                [ 'status' => 404 ]
            );
        }

        // Build lookup by field id (each id is globally unique per SchemaValidator).
        $by_id = [];
        foreach ( $fields as $field ) {
            if ( ! empty( $field['id'] ) ) {
                $by_id[ $field['id'] ] = $field;
            }
        }

        $validation_errors = [];
        $sanitized         = [];

        foreach ( $flat_values as $key => $value ) {
            $field = $by_id[ $key ] ?? null;

            // Plugin-ui's <Settings> rebuilds dependency_key as a dot-path
            // (parent.child.field) regardless of what the backend emits, so
            // saved payloads arrive keyed by dot-path. Fall back to the last
            // segment, which always equals the field id.
            if ( ! $field && false !== strpos( $key, '.' ) ) {
                $parts = explode( '.', $key );
                $last  = end( $parts );
                $field = $by_id[ $last ] ?? null;
                if ( $field ) {
                    $key = $last;
                }
            }

            if ( ! $field ) {
                continue;
            }

            $errors = $this->validate_field_value( $field, $value );
            if ( ! empty( $errors ) ) {
                $validation_errors[ $key ] = $errors;
                continue;
            }

            $sanitized[ $key ] = $this->sanitize_field_value( $field, $value );
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

        $existing = get_option( 'dokan_settings', [] );
        if ( ! is_array( $existing ) ) {
            $existing = [];
        }

        /**
         * Fired before saving admin settings.
         *
         * Signature retained at 3 args for backward compatibility with Pro and
         * 3rd-party listeners that registered with `accepted_args=3`. The third
         * argument is the wp_option key being written (always `'dokan_settings'`
         * in the new flat-storage model) — kept as the original `$storage_key`
         * slot so existing callbacks that gated on a specific option name still
         * receive arg 3 they expect.
         *
         * @since DOKAN_SINCE
         *
         * @param string $page_id     The page being saved.
         * @param array  $sanitized   Sanitized values keyed by field id.
         * @param string $storage_key The wp_options key (always 'dokan_settings').
         */
        do_action( 'dokan_before_saving_settings', $page_id, $sanitized, 'dokan_settings' );

        $merged = array_merge( $existing, $sanitized );

        update_option( 'dokan_settings', $merged, true );

        /**
         * Fired after saving admin settings.
         *
         * Signature retained at 4 args for backward compatibility with Pro and
         * 3rd-party listeners.
         *
         * @since DOKAN_SINCE
         *
         * @param string $page_id     The page that was saved.
         * @param array  $sanitized   Sanitized values that were saved.
         * @param string $storage_key The wp_options key (always 'dokan_settings').
         * @param array  $merged      The full merged dokan_settings array.
         */
        do_action( 'dokan_after_saving_settings', $page_id, $sanitized, 'dokan_settings', $merged );

        $this->registry->clear_cache();

        return rest_ensure_response( apply_filters( 'dokan_admin_settings_response', $this->registry->get_schema() ) );
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
