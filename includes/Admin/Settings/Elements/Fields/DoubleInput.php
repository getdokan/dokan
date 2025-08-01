<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Double Text Field Element Class
 *
 * This field type handles two separate input values with potentially different types,
 * stored as an array structure:
 * [
 *   'first' => string|int|float (configurable),
 *   'second' => string|int|float (configurable)
 * ]
 *
 * Each field can have its own value type set independently.
 *
 * @since DOKAN_SINCE
 */
class DoubleInput extends Field {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'double_input';

    /**
     * First field value type.
     *
     * @var string $first_value_type First field value type.
     */
    protected string $first_value_type = 'string|int|float';

    /**
     * Second field value type.
     *
     * @var string $second_value_type Second field value type.
     */
    protected string $second_value_type = 'string|int|float';

    /**
     * Label for the field.
     *
     * @var string
     */
    protected string $label = '';

    /**
     * First label for the field.
     *
     * @var string
     */
    protected string $first_label = '';

    /**
     * First value for the field.
     *
     * @var string|int|float
     */
    protected $first_value = '';

    /**
     * First placeholder for the field.
     *
     * @var string
     */
    protected string $first_placeholder = '';

    /**
     * Second label for the field.
     *
     * @var string
     */
    protected string $second_label = '';

    /**
     * Second value for the field.
     *
     * @var string|int|float
     */
    protected $second_value = '';

    /**
     * Second placeholder for the field.
     *
     * @var string
     */
    protected string $second_placeholder = '';

    /**
     * First prefix for the field.
     *
     * @var string
     */
    protected string $first_prefix = '';

    /**
     * First suffix for the field.
     *
     * @var string
     */
    protected string $first_suffix = '';

    /**
     * Second prefix for the field.
     *
     * @var string
     */
    protected string $second_prefix = '';

    /**
     * Second suffix for the field.
     *
     * @var string
     */
    protected string $second_suffix = '';

    /**
     * Whether the first field is required.
     *
     * @var bool
     */
    protected bool $first_required = false;

    /**
     * Whether the second field is required.
     *
     * @var bool
     */
    protected bool $second_required = false;

    /**
     * Get the first field value type.
     *
     * @return string
     */
    public function get_first_value_type(): string {
        return $this->first_value_type;
    }

    /**
     * Set the first field value type.
     *
     * @param string $type First field value type.
     *
     * @return self
     */
    public function set_first_value_type( string $type ): self {
        $this->first_value_type = $type;

        return $this;
    }

    /**
     * Get the second field value type.
     *
     * @return string
     */
    public function get_second_value_type(): string {
        return $this->second_value_type;
    }

    /**
     * Set the second field value type.
     *
     * @param string $type Second field value type.
     *
     * @return self
     */
    public function set_second_value_type( string $type ): self {
        $this->second_value_type = $type;

        return $this;
    }

    /**
     * Get the field value type structure.
     *
     * @return array<string, string>
     */
    public function get_value_type(): array {
        return [
            'first'  => $this->first_value_type,
            'second' => $this->second_value_type,
        ];
    }

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get the main label for the field.
     *
     * @return string
     */
    public function get_label(): string {
        return $this->label;
    }

    /**
     * Set the main label for the field.
     *
     * @param string $label Main label.
     *
     * @return self
     */
    public function set_label( string $label ): self {
        $this->label = $label;

        return $this;
    }

    /**
     * Get the first label for the field.
     *
     * @return string
     */
    public function get_first_label(): string {
        return $this->first_label;
    }

    /**
     * Sets the first label for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string $label First field label.
     *
     * @return self
     */
    public function set_first_label( string $label ): self {
        $this->first_label = $label;

        return $this;
    }

    /**
     * Get the first value for the field.
     *
     * @return string|int|float
     */
    public function get_first_value() {
        return $this->first_value;
    }

    /**
     * Sets the first value for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string|int|float $value First field value.
     *
     * @return self
     */
    public function set_first_value( $value ): self {
        $this->first_value = $value;

        return $this;
    }

    /**
     * Get the first placeholder for the field.
     *
     * @return string
     */
    public function get_first_placeholder(): string {
        return $this->first_placeholder;
    }

    /**
     * Set the first placeholder for the field.
     *
     * @param string $placeholder First field placeholder.
     *
     * @return self
     */
    public function set_first_placeholder( string $placeholder ): self {
        $this->first_placeholder = $placeholder;

        return $this;
    }

    /**
     * Get the second label for the field.
     *
     * @return string
     */
    public function get_second_label(): string {
        return $this->second_label;
    }

    /**
     * Sets the second label for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string $label Second field label.
     *
     * @return self
     */
    public function set_second_label( string $label ): self {
        $this->second_label = $label;

        return $this;
    }

    /**
     * Get the second value for the field.
     *
     * @return string|int|float
     */
    public function get_second_value() {
        return $this->second_value;
    }

    /**
     * Sets the second value for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string|int|float $value Second field value.
     *
     * @return self
     */
    public function set_second_value( $value ): self {
        $this->second_value = $value;

        return $this;
    }

    /**
     * Get the second placeholder for the field.
     *
     * @return string
     */
    public function get_second_placeholder(): string {
        return $this->second_placeholder;
    }

    /**
     * Set the second placeholder for the field.
     *
     * @param string $placeholder Second field placeholder.
     *
     * @return self
     */
    public function set_second_placeholder( string $placeholder ): self {
        $this->second_placeholder = $placeholder;

        return $this;
    }

    /**
     * Get the first prefix for the field.
     *
     * @return string
     */
    public function get_first_prefix(): string {
        return $this->first_prefix;
    }

    /**
     * Sets the first prefix for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string $prefix First field prefix.
     *
     * @return self
     */
    public function set_first_prefix( string $prefix ): self {
        $this->first_prefix = $prefix;

        return $this;
    }

    /**
     * Get the first suffix for the field.
     *
     * @return string
     */
    public function get_first_suffix(): string {
        return $this->first_suffix;
    }

    /**
     * Sets the first suffix for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string $suffix First field suffix.
     *
     * @return self
     */
    public function set_first_suffix( string $suffix ): self {
        $this->first_suffix = $suffix;

        return $this;
    }

    /**
     * Get the second prefix for the field.
     *
     * @return string
     */
    public function get_second_prefix(): string {
        return $this->second_prefix;
    }

    /**
     * Sets the second prefix for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string $prefix Second field prefix.
     *
     * @return self
     */
    public function set_second_prefix( string $prefix ): self {
        $this->second_prefix = $prefix;

        return $this;
    }

    /**
     * Get the second suffix for the field.
     *
     * @return string
     */
    public function get_second_suffix(): string {
        return $this->second_suffix;
    }

    /**
     * Sets the second suffix for the field.
     *
     * @since DOKAN_SINCE
     *
     * @param string $suffix Second field suffix.
     *
     * @return self
     */
    public function set_second_suffix( string $suffix ): self {
        $this->second_suffix = $suffix;

        return $this;
    }

    /**
     * Check if the first field is required.
     *
     * @return bool
     */
    public function is_first_required(): bool {
        return $this->first_required;
    }

    /**
     * Set the first field as required.
     *
     * @param bool $required Whether the first field is required.
     *
     * @return self
     */
    public function set_first_required( bool $required ): self {
        $this->first_required = $required;

        return $this;
    }

    /**
     * Check if the second field is required.
     *
     * @return bool
     */
    public function is_second_required(): bool {
        return $this->second_required;
    }

    /**
     * Set the second field as required.
     *
     * @param bool $required Whether the second field is required.
     *
     * @return self
     */
    public function set_second_required( bool $required ): self {
        $this->second_required = $required;

        return $this;
    }

    /**
     * Get the combined value (overrides parent method).
     *
     * @return array{first: mixed, second: mixed}
     */
    public function get_value() {
        return [
            'first'  => $this->first_value,
            'second' => $this->second_value,
        ];
    }

    /**
     * Set the combined value (overrides parent method).
     *
     * @param array{first: mixed, second: mixed}|mixed $value The value to set.
     *
     * @return self
     */
    public function set_value( $value ): self {
        if ( is_array( $value ) ) {
            $this->first_value  = $value['first'] ?? '';
            $this->second_value = $value['second'] ?? '';

            // Also set the base value property for consistency
            $this->value = $value;
        }

        return $this;
    }

    /**
     * Validate the data structure for double input.
     *
     * @param mixed $data Data to validate.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        if ( ! isset( $data ) || ! is_array( $data ) ) {
            return false;
        }

        // Check if required fields are present
        if ( $this->first_required && ( ! isset( $data['first'] ) || empty( $data['first'] ) ) ) {
            return false;
        }

        if ( $this->second_required && ( ! isset( $data['second'] ) || empty( $data['second'] ) ) ) {
            return false;
        }

        return true;
    }

    /**
     * Escape data for display.
     *
     * @param mixed $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        if ( is_array( $data ) ) {
            return wp_json_encode( array_map( 'esc_attr', $data ) );
        }

        return esc_attr( (string) $data );
    }

    /**
     * Sanitize input data.
     *
     * @param mixed $data Data to sanitize.
     *
     * @return array{first: string, second: string}
     */
    public function sanitize_data( $data ): array {
        if ( ! is_array( $data ) ) {
            return [
                'first'  => '',
                'second' => '',
            ];
        }

        return [
            'first'  => isset( $data['first'] ) ? sanitize_text_field( $data['first'] ) : '',
            'second' => isset( $data['second'] ) ? sanitize_text_field( $data['second'] ) : '',
        ];
    }

    /**
     * Convert to array for frontend rendering.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function populate(): array {
        $element = parent::populate();

        // Set the main value property to combined array for consistency
        $element['value'] = $this->escape_element( $this->get_value() );

        $element['label']             = $this->label;
        $element['firstLabel']        = $this->first_label;
        $element['firstValue']        = $this->escape_element( $this->first_value );
        $element['firstPlaceholder']  = $this->first_placeholder;
        $element['firstPrefix']       = $this->first_prefix;
        $element['firstSuffix']       = $this->first_suffix;
        $element['firstRequired']     = $this->first_required;
        $element['secondLabel']       = $this->second_label;
        $element['secondValue']       = $this->escape_element( $this->second_value );
        $element['secondPlaceholder'] = $this->second_placeholder;
        $element['secondPrefix']      = $this->second_prefix;
        $element['secondSuffix']      = $this->second_suffix;
        $element['secondRequired']    = $this->second_required;
        $element['firstValueType']    = $this->first_value_type;
        $element['secondValueType']   = $this->second_value_type;

        return $element;
    }
}
