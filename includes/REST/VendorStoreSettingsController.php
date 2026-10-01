<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Vendor\Settings\Schema\StoreSettingsSchema;
use WeDevs\Dokan\Vendor\Settings\StoreSettingsWriter;
use WeDevs\Dokan\Vendor\Settings\ValueMapper;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Vendor Store Settings REST Controller.
 *
 * GET /dokan/v1/vendor-settings/store — the flat-array schema with values for
 * the current vendor. PUT saves a flat key-value map through the legacy save
 * pipeline (both Pro seams fire), returning the refreshed schema.
 *
 * @since DOKAN_SINCE
 */
class VendorStoreSettingsController extends DokanBaseVendorController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'vendor-settings';

    /**
     * Value mapper instance.
     *
     * @var ValueMapper
     */
    protected ValueMapper $mapper;

    /**
     * Settings writer instance.
     *
     * @var StoreSettingsWriter
     */
    protected StoreSettingsWriter $writer;

    /**
     * Constructor.
     *
     * @param ValueMapper|null         $mapper Optional mapper instance (for testing).
     * @param StoreSettingsWriter|null $writer Optional writer instance (for testing).
     */
    public function __construct( ?ValueMapper $mapper = null, ?StoreSettingsWriter $writer = null ) {
        $this->mapper = $mapper ?? new ValueMapper();
        $this->writer = $writer ?? new StoreSettingsWriter();
    }

    /**
     * Register REST routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/store',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'values' => [
                            'description' => __( 'Flat key-value map of field values keyed by field id.', 'dokan-lite' ),
                            'type'        => 'object',
                            'required'    => true,
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Permission check — same capability the legacy store settings page uses.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'dokandar' ) && current_user_can( 'dokan_view_store_settings_menu' );
    }

    /**
     * GET handler — flat schema with values for the acting vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_items( $request ) {
        $vendor_id = $this->resolve_vendor_id();

        if ( is_wp_error( $vendor_id ) ) {
            return $vendor_id;
        }

        return rest_ensure_response( $this->get_response_schema( $vendor_id ) );
    }

    /**
     * PUT handler — validate, sanitize, and persist flat values through the
     * legacy save pipeline. Returns the refreshed schema on success.
     *
     * Validation failures return `400` with an `errors` map keyed by field id,
     * which plugin-ui merges into per-field error state.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function update_item( $request ) {
        $vendor_id = $this->resolve_vendor_id();

        if ( is_wp_error( $vendor_id ) ) {
            return $vendor_id;
        }

        $flat_values = $request->get_param( 'values' );

        if ( ! is_array( $flat_values ) ) {
            return new WP_Error(
                'dokan_rest_invalid_values',
                __( 'Values must be an object.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        $fields_by_id = $this->get_fields_by_id( StoreSettingsSchema::get_schema( $vendor_id ) );

        // Sanitize every recognized field up front so cross-field validators (e.g. min ≤ max) see the full submitted set.
        $sanitized = [];

        foreach ( $flat_values as $key => $value ) {
            $field = $fields_by_id[ $this->normalize_field_key( $key ) ] ?? null;

            if ( $field ) {
                $sanitized[ $field['id'] ] = $this->sanitize_field_value( $field, $value );
            }
        }

        // Validate the record the save would produce (submitted values over current ones) so a partial payload can't slip past rules owned by omitted fields.
        $record = array_merge( array_column( $fields_by_id, 'value', 'id' ), $sanitized );

        $validation_errors = [];

        foreach ( $fields_by_id as $field_id => $field ) {
            $errors = $this->validate_field_value( $field, $record[ $field_id ] ?? null, $record, $vendor_id );

            if ( ! empty( $errors ) ) {
                $validation_errors[ $field_id ] = $errors;
            }
        }

        // Whole-payload seam for section-level rules owned by no single field (e.g. the vacation style/message/date-range trio); $record supplies the merged view so consumers don't rebuild it.
        $validation_errors = (array) apply_filters( 'dokan_rest_vendor_settings_validate', $validation_errors, $sanitized, $fields_by_id, $vendor_id, $record );

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

        if ( ! empty( $sanitized ) ) {
            $prev  = get_user_meta( $vendor_id, 'dokan_profile_settings', true );
            $slice = $this->mapper->to_legacy( $sanitized, is_array( $prev ) ? $prev : [], $fields_by_id );

            // A save touching only non_meta fields (e.g. store categories) yields an empty slice — skip the write, still fire the seam.
            if ( ! empty( $slice ) ) {
                $this->writer->save( $vendor_id, $slice );
            }

            /**
             * Fires after vendor Store settings are saved, with the sanitized
             * flat values. Pro persists fields it owns outside
             * `dokan_profile_settings` here — e.g. the taxonomy-backed store
             * category (flagged `non_meta` so the mapper leaves it out of the
             * profile slice). Mirrors admin's `dokan_after_saving_settings`.
             *
             * @since DOKAN_SINCE
             *
             * @param int   $vendor_id    Vendor user ID.
             * @param array $sanitized    Sanitized values keyed by field id.
             * @param array $fields_by_id Schema field elements keyed by id.
             */
            do_action( 'dokan_after_saving_vendor_settings', $vendor_id, $sanitized, $fields_by_id );
        }

        return rest_ensure_response( $this->get_response_schema( $vendor_id ) );
    }

    /**
     * Build the filtered schema response for a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return array
     */
    protected function get_response_schema( int $vendor_id ): array {
        $schema = StoreSettingsSchema::get_schema( $vendor_id );

        /**
         * Filter the vendor Store settings REST response.
         *
         * @since DOKAN_SINCE
         *
         * @param array $schema    Flat schema elements with values.
         * @param int   $vendor_id Vendor user ID.
         */
        $schema = apply_filters( 'dokan_rest_vendor_store_settings_response', $schema, $vendor_id );

        // PHP-side hooks stay on the server: closures would JSON-encode as {} and callable arrays leak internal class names.
        foreach ( array_keys( $schema ) as $index ) {
            unset( $schema[ $index ]['sanitize_callback'], $schema[ $index ]['validation_func'] );
        }

        return $schema;
    }

    /**
     * Resolve the acting vendor, or a 404 error when the user owns no store.
     *
     * @since DOKAN_SINCE
     *
     * @return int|WP_Error Vendor user ID, or an error response.
     */
    protected function resolve_vendor_id() {
        $vendor_id = $this->get_vendor_id_for_user( get_current_user_id() );

        if ( ! $vendor_id ) {
            return new WP_Error(
                'dokan_rest_no_vendor_found',
                __( 'No vendor found for the current user.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
        }

        return $vendor_id;
    }

    /**
     * Reduce a submitted key to its schema field id.
     *
     * plugin-ui emits dot-path keys (`page.subpage.field_id`) that mirror its
     * internal tree; the schema is keyed by the leaf id alone.
     *
     * @since DOKAN_SINCE
     *
     * @param string $key Submitted key.
     *
     * @return string Leaf field id.
     */
    protected function normalize_field_key( $key ): string {
        $key = (string) $key;
        $dot = strrpos( $key, '.' );

        return false === $dot ? $key : substr( $key, $dot + 1 );
    }

    /**
     * Index the schema's field elements by id.
     *
     * @since DOKAN_SINCE
     *
     * @param array $schema Flat schema elements.
     *
     * @return array Field elements keyed by id.
     */
    protected function get_fields_by_id( array $schema ): array {
        $by_id = [];

        foreach ( $schema as $element ) {
            if ( 'field' === ( $element['type'] ?? '' ) && ! empty( $element['id'] ) ) {
                $by_id[ $element['id'] ] = $element;
            }
        }

        return $by_id;
    }

    /**
     * Validate a sanitized value against the field's declared rules.
     *
     * Runs in order: the declarative `validations`, the field's optional
     * `validation_func` closure, then the `dokan_rest_vendor_settings_validate_field`
     * filter. A `validation_func` gets `( $value, $all_values, $vendor_id )` and
     * returns `true`, `false`, a message, or a list of messages — so multi-error
     * and cross-field checks live on the field that owns them.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field      The field schema element.
     * @param mixed $value      The sanitized value.
     * @param array $all_values Every sanitized value keyed by field id.
     * @param int   $vendor_id  Vendor user ID.
     *
     * @return string[] Error messages (empty when valid).
     */
    protected function validate_field_value( array $field, $value, array $all_values = [], int $vendor_id = 0 ): array {
        $errors            = [];
        $variant           = $field['variant'] ?? '';
        $field_validations = (array) ( $field['validations'] ?? [] );

        // Declarative rules — the same `[ { rules, message, params } ]` contract the client runs, so one declaration drives both sides.
        foreach ( $field_validations as $validation ) {
            if ( ! is_array( $validation ) || empty( $validation['rules'] ) ) {
                continue;
            }

            $message = (string) ( $validation['message'] ?? '' );
            $params  = (array) ( $validation['params'] ?? [] );

            foreach ( explode( '|', (string) $validation['rules'] ) as $rule ) {
                $error = $this->validate_rule( trim( $rule ), $value, $params, $message );

                if ( null !== $error ) {
                    $errors[] = $error;
                }
            }
        }

        // Per-field closure declared on the schema (returns true|false|string|string[]).
        if ( ! empty( $field['validation_func'] ) && is_callable( $field['validation_func'] ) ) {
            $result = call_user_func( $field['validation_func'], $value, $all_values, $vendor_id );

            if ( is_array( $result ) ) {
                $errors = array_merge( $errors, array_map( 'strval', $result ) );
            } elseif ( is_string( $result ) && '' !== $result ) {
                $errors[] = $result;
            } elseif ( false === $result ) {
                $errors[] = __( 'This field is invalid.', 'dokan-lite' );
            }
        }

        /**
         * Filter the per-field validation errors for vendor settings.
         *
         * Lets Pro add validation for its own variants or layer cross-field
         * rules on top (mirrors `dokan_rest_admin_settings_validate_field`).
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $errors  Accumulated error messages (may be empty).
         * @param array    $field   The field schema element.
         * @param mixed    $value   The sanitized value.
         * @param string   $variant The field variant.
         */
        return (array) apply_filters( 'dokan_rest_vendor_settings_validate_field', $errors, $field, $value, $variant );
    }

    /**
     * Evaluate one declarative rule against a value.
     *
     * @since DOKAN_SINCE
     *
     * @param string $rule    Rule name (`required`, `not_empty`, `min_value`, `max_value`).
     * @param mixed  $value   The sanitized value.
     * @param array  $params  Rule parameters (`min`/`max`, positional or keyed).
     * @param string $message Custom message; falls back to a built-in default.
     *
     * @return string|null Error message when the rule fails, null otherwise.
     */
    protected function validate_rule( string $rule, $value, array $params, string $message ): ?string {
        switch ( $rule ) {
            case 'required':
            case 'not_empty':
                // Strict blank check (like AdminSettingsController): empty() would also reject '0'/0, diverging from the client's not_empty.
                if ( '' === $value || null === $value || [] === $value ) {
                    return $message ? $message : __( 'This field is required.', 'dokan-lite' );
                }
                break;

            case 'min_value':
                $min = $params['min'] ?? ( $params[0] ?? null );
                if ( null !== $min && is_numeric( $value ) && (float) $value < (float) $min ) {
                    /* translators: %s: minimum value */
                    return $message ? $message : sprintf( __( 'Value must be at least %s.', 'dokan-lite' ), $min );
                }
                break;

            case 'max_value':
                $max = $params['max'] ?? ( $params[0] ?? null );
                if ( null !== $max && is_numeric( $value ) && (float) $value > (float) $max ) {
                    /* translators: %s: maximum value */
                    return $message ? $message : sprintf( __( 'Value must be at most %s.', 'dokan-lite' ), $max );
                }
                break;
        }

        return null;
    }

    /**
     * Sanitize a submitted value based on the field variant.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field The field schema element.
     * @param mixed $value The raw submitted value.
     *
     * @return mixed Sanitized value.
     */
    protected function sanitize_field_value( array $field, $value ) {
        // A per-field sanitize_callback wins (mirrors admin): phone, schedule and ToC rules live on the field, not in a switch here.
        if ( ! empty( $field['sanitize_callback'] ) && is_callable( $field['sanitize_callback'] ) ) {
            return call_user_func( $field['sanitize_callback'], $value );
        }

        $variant = $field['variant'] ?? 'text';

        // No wp_unslash here (unlike legacy $_POST reads): REST params arrive unslashed, so stripping again would eat backslashes the vendor typed.
        switch ( $variant ) {
            case 'textarea':
                return sanitize_textarea_field( (string) $value );

            case 'rich_text':
                return wp_kses_post( (string) $value );

            case 'switch':
                // Only the declared states may be stored — a generic 'on' in a field whose readers expect 'yes' would silently read back as disabled.
                $enabled  = $field['enable_state']['value'] ?? 'on';
                $disabled = $field['disable_state']['value'] ?? 'off';

                return in_array( $value, [ $enabled, $disabled ], true ) ? $value : $disabled;

            case 'number':
                return is_numeric( $value ) ? $value + 0 : 0;

            case 'text':
            case 'select':
            case 'radio':
                return sanitize_text_field( (string) $value );

            case 'vendor_image':
                return absint( $value );

            case 'vendor_address':
                $value = (array) $value;

                return [
                    'street_1' => sanitize_text_field( (string) ( $value['street_1'] ?? '' ) ),
                    'street_2' => sanitize_text_field( (string) ( $value['street_2'] ?? '' ) ),
                    'city'     => sanitize_text_field( (string) ( $value['city'] ?? '' ) ),
                    'zip'      => sanitize_text_field( (string) ( $value['zip'] ?? '' ) ),
                    'country'  => sanitize_text_field( (string) ( $value['country'] ?? '' ) ),
                    'state'    => sanitize_text_field( (string) ( $value['state'] ?? '' ) ),
                ];

            case 'vendor_map':
                $value = (array) $value;

                return [
                    'location'     => sanitize_text_field( (string) ( $value['location'] ?? '' ) ),
                    'find_address' => sanitize_text_field( (string) ( $value['find_address'] ?? '' ) ),
                ];

            default:
                // Strings only (map_deep reaches bare scalars too) — a blanket sanitize_text_field would stringify the booleans/ints structured Pro values carry.
                $value = map_deep(
                    $value,
                    static function ( $item ) {
                        return is_string( $item ) ? sanitize_text_field( $item ) : $item;
                    }
                );

                /**
                 * Filter to sanitize custom vendor-settings field variants.
                 *
                 * Mirrors `dokan_rest_admin_settings_sanitize_field` so Pro can
                 * handle its own variants injected via the schema filter.
                 *
                 * @since DOKAN_SINCE
                 *
                 * @param mixed  $value   The pre-sanitized value.
                 * @param array  $field   The field schema element.
                 * @param string $variant The field variant string.
                 */
                return apply_filters( 'dokan_rest_vendor_settings_sanitize_field', $value, $field, $variant );
        }
    }
}
