<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Utilities\RichTextSanitizerUtil;
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
        $vendor_id = $this->get_vendor_id_for_user( get_current_user_id() );

        if ( ! $vendor_id ) {
            return new WP_Error(
                'dokan_rest_no_vendor_found',
                __( 'No vendor found for the current user.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
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
        $vendor_id = $this->get_vendor_id_for_user( get_current_user_id() );

        if ( ! $vendor_id ) {
            return new WP_Error(
                'dokan_rest_no_vendor_found',
                __( 'No vendor found for the current user.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
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

        $validation_errors = [];
        $sanitized         = [];

        foreach ( $flat_values as $key => $value ) {
            // plugin-ui emits dot-path keys (`page.subpage.field_id`) reflecting
            // its internal tree — normalize to the schema's leaf field id.
            $leaf_id = false !== strpos( (string) $key, '.' )
                ? substr( (string) $key, strrpos( (string) $key, '.' ) + 1 )
                : (string) $key;

            $field = $fields_by_id[ $leaf_id ] ?? null;

            if ( ! $field ) {
                continue;
            }

            $clean  = $this->sanitize_field_value( $field, $value );
            $errors = $this->validate_field_value( $field, $clean );

            if ( ! empty( $errors ) ) {
                $validation_errors[ $leaf_id ] = $errors;
                continue;
            }

            $sanitized[ $leaf_id ] = $clean;
        }

        // Cross-field rule from the legacy validator: enabling ToC requires content.
        if (
            'on' === ( $sanitized['enable_tnc'] ?? '' )
            && array_key_exists( 'store_tnc', $sanitized )
            && '' === RichTextSanitizerUtil::sanitize_richtext_content( (string) $sanitized['store_tnc'] )
        ) {
            $validation_errors['store_tnc'][] = __( 'Please add Terms & Conditions content before saving the settings.', 'dokan-lite' );
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

        if ( ! empty( $sanitized ) ) {
            $prev  = get_user_meta( $vendor_id, 'dokan_profile_settings', true );
            $slice = $this->mapper->to_legacy( $sanitized, is_array( $prev ) ? $prev : [], $fields_by_id );

            // A save with only `non_meta` fields (e.g. store categories) yields an
            // empty meta slice — skip the redundant profile write, still fire the seam.
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
        return apply_filters( 'dokan_rest_vendor_store_settings_response', $schema, $vendor_id );
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
     * Rules use the plugin-ui client contract — `[ { rules: 'not_empty|…',
     * message: '…' } ]` — so a single declaration drives both client and
     * server validation.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field The field schema element.
     * @param mixed $value The sanitized value.
     *
     * @return string[] Error messages (empty when valid).
     */
    protected function validate_field_value( array $field, $value ): array {
        $errors  = [];
        $variant = $field['variant'] ?? '';

        foreach ( (array) ( $field['validations'] ?? [] ) as $validation ) {
            if ( ! is_array( $validation ) || empty( $validation['rules'] ) ) {
                continue;
            }

            $message = isset( $validation['message'] ) ? (string) $validation['message'] : '';

            foreach ( explode( '|', (string) $validation['rules'] ) as $rule ) {
                switch ( trim( $rule ) ) {
                    case 'required':
                    case 'not_empty':
                        if ( '' === $value || null === $value || [] === $value ) {
                            $errors[] = '' !== $message ? $message : __( 'This field is required.', 'dokan-lite' );
                        }
                        break;

                    case 'min_value':
                        $min = $validation['params']['min'] ?? ( $validation['params'][0] ?? null );
                        if ( null !== $min && is_numeric( $value ) && (float) $value < (float) $min ) {
                            /* translators: %s: minimum value */
                            $errors[] = '' !== $message ? $message : sprintf( __( 'Value must be at least %s.', 'dokan-lite' ), $min );
                        }
                        break;

                    case 'max_value':
                        $max = $validation['params']['max'] ?? ( $validation['params'][0] ?? null );
                        if ( null !== $max && is_numeric( $value ) && (float) $value > (float) $max ) {
                            /* translators: %s: maximum value */
                            $errors[] = '' !== $message ? $message : sprintf( __( 'Value must be at most %s.', 'dokan-lite' ), $max );
                        }
                        break;
                }
            }
        }

        if ( 'vendor_store_schedule' === $variant ) {
            $errors = array_merge( $errors, $this->validate_store_time( (array) $value ) );
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
        $variant = $field['variant'] ?? 'text';

        switch ( $variant ) {
            case 'text':
                // The phone field keeps the legacy dedicated sanitizer.
                if ( 'phone' === ( $field['id'] ?? '' ) ) {
                    return dokan_sanitize_phone_number( wp_unslash( (string) $value ) );
                }
                return sanitize_text_field( wp_unslash( (string) $value ) );

            case 'textarea':
                return sanitize_textarea_field( wp_unslash( (string) $value ) );

            case 'rich_text':
                $html = wp_kses_post( wp_unslash( (string) $value ) );

                // store_tnc keeps the legacy semantics: effectively-empty markup collapses to ''.
                if ( 'store_tnc' === ( $field['id'] ?? '' ) && '' === RichTextSanitizerUtil::sanitize_richtext_content( $html ) ) {
                    return '';
                }

                return $html;

            case 'switch':
                $allowed  = [ 'on', 'off' ];
                $disabled = 'off';

                if ( isset( $field['enable_state']['value'] ) ) {
                    $allowed[] = $field['enable_state']['value'];
                }
                if ( isset( $field['disable_state']['value'] ) ) {
                    $allowed[] = $field['disable_state']['value'];
                    $disabled  = $field['disable_state']['value'];
                }

                return in_array( $value, $allowed, true ) ? $value : $disabled;

            case 'number':
                return is_numeric( $value ) ? $value + 0 : 0;

            case 'select':
            case 'radio':
                return sanitize_text_field( wp_unslash( (string) $value ) );

            case 'vendor_image':
                return absint( $value );

            case 'vendor_address':
                $value = (array) $value;

                return [
                    'street_1' => sanitize_text_field( wp_unslash( (string) ( $value['street_1'] ?? '' ) ) ),
                    'street_2' => sanitize_text_field( wp_unslash( (string) ( $value['street_2'] ?? '' ) ) ),
                    'city'     => sanitize_text_field( wp_unslash( (string) ( $value['city'] ?? '' ) ) ),
                    'zip'      => sanitize_text_field( wp_unslash( (string) ( $value['zip'] ?? '' ) ) ),
                    'country'  => sanitize_text_field( wp_unslash( (string) ( $value['country'] ?? '' ) ) ),
                    'state'    => sanitize_text_field( wp_unslash( (string) ( $value['state'] ?? '' ) ) ),
                ];

            case 'vendor_map':
                $value = (array) $value;

                return [
                    'location'     => sanitize_text_field( wp_unslash( (string) ( $value['location'] ?? '' ) ) ),
                    'find_address' => sanitize_text_field( wp_unslash( (string) ( $value['find_address'] ?? '' ) ) ),
                ];

            case 'vendor_store_schedule':
                return $this->sanitize_store_time( (array) $value );

            default:
                if ( is_array( $value ) ) {
                    return map_deep( wp_unslash( $value ), 'sanitize_text_field' );
                }

                /**
                 * Filter to sanitize custom vendor-settings field variants.
                 *
                 * Mirrors `dokan_rest_admin_settings_sanitize_field` so Pro can
                 * handle its own variants injected via the schema filter.
                 *
                 * @since DOKAN_SINCE
                 *
                 * @param mixed  $value   The raw value.
                 * @param array  $field   The field schema element.
                 * @param string $variant The field variant string.
                 */
                return apply_filters( 'dokan_rest_vendor_settings_sanitize_field', sanitize_text_field( wp_unslash( (string) $value ) ), $field, $variant );
        }
    }

    /**
     * Normalize a submitted store schedule into the exact legacy shape:
     * per-day `{ status: 'open'|'close', opening_time: string[], closing_time: string[] }`
     * with canonical `g:i a` time strings. Closed days carry empty arrays.
     *
     * @since DOKAN_SINCE
     *
     * @param array $value Submitted schedule keyed by day.
     *
     * @return array
     */
    protected function sanitize_store_time( array $value ): array {
        $schedule = [];

        foreach ( array_keys( dokan_get_translated_days() ) as $day ) {
            $day_data = isset( $value[ $day ] ) && is_array( $value[ $day ] ) ? $value[ $day ] : [];
            $status   = 'open' === ( $day_data['status'] ?? '' ) ? 'open' : 'close';

            $opening = 'open' === $status
                ? array_values( array_map( 'sanitize_text_field', (array) ( $day_data['opening_time'] ?? [] ) ) )
                : [];
            $closing = 'open' === $status
                ? array_values( array_map( 'sanitize_text_field', (array) ( $day_data['closing_time'] ?? [] ) ) )
                : [];

            $schedule[ $day ] = [
                'status'       => $status,
                'opening_time' => $opening,
                'closing_time' => $closing,
            ];
        }

        return $schedule;
    }

    /**
     * Validate a normalized store schedule: open days need matching time
     * pairs, each in `g:i a` format with the opening time before the closing
     * time (the full-day `12:00 am` – `11:59 pm` pair satisfies this).
     *
     * @since DOKAN_SINCE
     *
     * @param array $schedule Normalized schedule keyed by day.
     *
     * @return string[] Error messages.
     */
    protected function validate_store_time( array $schedule ): array {
        $errors = [];

        foreach ( $schedule as $day => $day_data ) {
            if ( 'open' !== ( $day_data['status'] ?? '' ) ) {
                continue;
            }

            $day_label = dokan_get_translated_days( $day );
            $opening   = (array) ( $day_data['opening_time'] ?? [] );
            $closing   = (array) ( $day_data['closing_time'] ?? [] );

            if ( empty( $opening ) || count( $opening ) !== count( $closing ) ) {
                /* translators: %s: day name */
                $errors[] = sprintf( __( '%s: opening and closing times are required for open days.', 'dokan-lite' ), $day_label );
                continue;
            }

            foreach ( $opening as $index => $opening_time ) {
                $closing_time = $closing[ $index ];
                $open         = \DateTime::createFromFormat( 'g:i a', strtolower( trim( (string) $opening_time ) ) );
                $close        = \DateTime::createFromFormat( 'g:i a', strtolower( trim( (string) $closing_time ) ) );

                if ( false === $open || false === $close ) {
                    /* translators: %s: day name */
                    $errors[] = sprintf( __( '%s: times must use the h:mm am/pm format.', 'dokan-lite' ), $day_label );
                    continue;
                }

                if ( $open->getTimestamp() >= $close->getTimestamp() ) {
                    /* translators: %s: day name */
                    $errors[] = sprintf( __( '%s: the opening time must be earlier than the closing time.', 'dokan-lite' ), $day_label );
                }
            }
        }

        return $errors;
    }
}
