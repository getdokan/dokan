<?php
/**
 * Base implementation for field elements.
 *
 * @package WeDevs\Dokan\FieldFactory\Abstracts
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Abstracts;

use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;

abstract class AbstractField extends AbstractElement implements FieldInterface {

    /**
     * Field type.
     *
     * One of: text, integer, number, datetime, date, media, boolean,
     * email, password, telephone, color, url, array.
     *
     * @var string
     */
    protected string $field_type = 'text';

    /**
     * Field variant (Edit control type).
     *
     * One of: array, checkbox, color, date, datetime, email, integer,
     * number, password, radio, select, telephone, text, textarea,
     * toggle, toggleGroup, url.
     *
     * @var string
     */
    protected string $variant = 'text';

    /**
     * Field label (defaults to title if not set).
     *
     * @var string
     */
    protected string $label = '';

    /**
     * Current value.
     *
     * @var mixed
     */
    protected $value = null;

    /**
     * Default value.
     *
     * @var mixed
     */
    protected $default = null;

    /**
     * Elements (options) for select, radio, checkbox fields.
     *
     * Each element should have: value, label, description (optional).
     *
     * @var array
     */
    protected array $elements = [];

    /**
     * Placeholder text.
     *
     * @var string
     */
    protected string $placeholder = '';

    /**
     * Whether sorting is enabled.
     *
     * @var bool
     */
    protected bool $enable_sorting = true;

    /**
     * Whether hiding is enabled.
     *
     * @var bool
     */
    protected bool $enable_hiding = true;

    /**
     * Validation rules configuration.
     *
     * Structure: [
     *   'required' => bool,
     *   'elements' => bool (restrict to elements list),
     *   'custom'   => callable
     * ]
     *
     * @var array
     */
    protected array $is_valid = [];

    /**
     * Visibility callback configuration.
     *
     * Can reference another field for conditional visibility.
     *
     * @var array
     */
    protected array $visibility = [];

    /**
     * Helper text displayed below field.
     *
     * @var string
     */
    protected string $helper_text = '';

    /**
     * Size/width of the field.
     *
     * @var int
     */
    protected int $size = 20;

    /**
     * Prefix element/text.
     *
     * @var string
     */
    protected string $prefix = '';

    /**
     * Postfix/suffix element/text.
     *
     * @var string
     */
    protected string $postfix = '';

    /**
     * Enable state configuration (for switches/toggles).
     *
     * @var array
     */
    protected array $enable_state = [];

    /**
     * Disable state configuration (for switches/toggles).
     *
     * @var array
     */
    protected array $disable_state = [];

    /**
     * Parent section ID.
     *
     * @var string
     */
    protected string $section_id = '';

    /**
     * Hidden scope configuration.
     *
     * @var array
     */
    protected array $hidden_scope = [];

    /**
     * Legacy dependency condition (converted to visibility).
     *
     * @var array
     */
    protected array $dependency_condition = [];

    /**
     * Validation errors.
     *
     * @var array
     */
    protected array $errors = [];

    /**
     * Legacy options format (converted to elements).
     *
     * @var array
     */
    protected array $options = [];

    /**
     * Whether field is required (shorthand for is_valid.required).
     *
     * @var bool
     */
    protected bool $required = false;

    /**
     * Whether field is disabled.
     *
     * @var bool
     */
    protected bool $disabled = false;

    /**
     * {@inheritdoc}
     */
    public function get_category(): string {
        return 'field';
    }

    /**
     * {@inheritdoc}
     */
    public function get_field_type(): string {
        return $this->field_type;
    }

    /**
     * {@inheritdoc}
     */
    public function get_variant(): string {
        return $this->variant;
    }

    /**
     * {@inheritdoc}
     */
    public function get_label(): string {
        return ! empty( $this->label ) ? $this->label : $this->title;
    }

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'field_type',
                'variant',
                'label',
                'value',
                'default',
                'elements',
                'options', // Legacy alias for elements
                'placeholder',
                'enable_sorting',
                'enable_hiding',
                'is_valid',
                'visibility',
                'helper_text',
                'size',
                'prefix',
                'postfix',
                'enable_state',
                'disable_state',
                'section_id',
                'hidden_scope',
                'dependency_condition',
                'required',
                'disabled',
            ]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function fill( array $config ): self {
        parent::fill( $config );

        // Handle field_type as variant alias (legacy)
        if ( empty( $this->variant ) && ! empty( $config['field_type'] ) ) {
            $this->variant = $config['field_type'];
        }

        // Convert legacy options to elements format
        if ( ! empty( $this->options ) && empty( $this->elements ) ) {
            $this->elements = $this->normalize_elements( $this->options );
        }

        // Convert required shorthand to is_valid structure
        if ( $this->required && empty( $this->is_valid['required'] ) ) {
            $this->is_valid['required'] = true;
        }

        // Convert legacy dependency_condition to visibility
        if ( ! empty( $this->dependency_condition ) && empty( $this->visibility ) ) {
            $this->visibility = $this->convert_legacy_dependency( $this->dependency_condition );
        }

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function get_value( array $item = [] ) {
        // If item provided, extract value using dot notation from id
        if ( ! empty( $item ) ) {
            return $this->get_nested_value( $item, $this->id );
        }

        return $this->value ?? $this->default;
    }

    /**
     * Get nested value from array using dot notation.
     *
     * @param array  $item Array to extract from.
     * @param string $path Dot notation path.
     *
     * @return mixed
     */
    protected function get_nested_value( array $item, string $path ) {
        $keys  = explode( '.', $path );
        $value = $item;

        foreach ( $keys as $key ) {
            if ( ! is_array( $value ) || ! array_key_exists( $key, $value ) ) {
                return $this->default;
            }
            $value = $value[ $key ];
        }

        return $value;
    }

    /**
     * {@inheritdoc}
     */
    public function set_value( $value ): array {
        $this->value = $value;

        // Build nested structure from dot notation id
        return $this->build_nested_value( $this->id, $value );
    }

    /**
     * Build nested array from dot notation path.
     *
     * @param string $path  Dot notation path.
     * @param mixed  $value Value to set.
     *
     * @return array
     */
    protected function build_nested_value( string $path, $value ): array {
        $keys   = explode( '.', $path );
        $result = [];
        $ref    = &$result;

        foreach ( $keys as $i => $key ) {
            if ( $i === count( $keys ) - 1 ) {
                $ref[ $key ] = $value;
            } else {
                $ref[ $key ] = [];
                $ref         = &$ref[ $key ];
            }
        }

        return $result;
    }

    /**
     * Get raw value without item context.
     *
     * @return mixed
     */
    public function get_raw_value() {
        return $this->value;
    }

    // get_value_formatted() and low-level format helpers have been removed from
    // the core FieldFactory abstraction to keep the API focused on value
    // management and validation. Formatting is expected to be handled at the
    // presentation layer (e.g., React components or view templates).

    /**
     * {@inheritdoc}
     */
    public function get_default() {
        return $this->default;
    }

    /**
     * Set default value.
     *
     * @param mixed $default_data Default value.
     *
     * @return self
     */
    public function set_default( $default_data ): self {
        $this->default = $default_data;
        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function get_elements(): array {
        return $this->elements;
    }

    /**
     * Normalize options to elements format.
     *
     * @param array $options Legacy options array.
     *
     * @return array Normalized elements.
     */
    protected function normalize_elements( array $options ): array {
        $elements = [];

        foreach ( $options as $key => $option ) {
            if ( is_array( $option ) ) {
                $elements[] = [
                    'value'       => $option['value'] ?? $key,
                    'label'       => $option['label'] ?? $option['title'] ?? (string) $key,
                    'description' => $option['description'] ?? '',
                ];
            } else {
                $elements[] = [
                    'value'       => $key,
                    'label'       => (string) $option,
                    'description' => '',
                ];
            }
        }

        return $elements;
    }

    /**
     * Set elements.
     *
     * @param array $elements Elements array.
     *
     * @return self
     */
    public function set_elements( array $elements ): self {
        $this->elements = $this->normalize_elements( $elements );
        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function get_placeholder(): string {
        return $this->placeholder;
    }

    /**
     * {@inheritdoc}
     */
    public function is_required(): bool {
        return $this->required || ! empty( $this->is_valid['required'] );
    }

    /**
     * {@inheritdoc}
     */
    public function is_read_only(): bool {
        // Core FieldFactory no longer manages read-only state; callers
        // can treat all FieldFactory fields as editable by default.
        return false;
    }

    /**
     * Check if field is disabled.
     *
     * @return bool
     */
    public function is_disabled(): bool {
        return $this->disabled;
    }

    /**
     * {@inheritdoc}
     */
    public function is_visible( array $item = [] ): bool {
        if ( empty( $this->visibility ) ) {
            return true;
        }

        // Simple field reference check
        if ( isset( $this->visibility['field'] ) ) {
            $field_value    = $this->get_nested_value( $item, $this->visibility['field'] );
            $expected_value = $this->visibility['value'] ?? null;
            $operator       = $this->visibility['operator'] ?? 'equal';

            return $this->compare_values( $field_value, $expected_value, $operator );
        }

        return true;
    }

    /**
     * Compare values using operator.
     *
     * @param mixed  $actual   Actual value.
     * @param mixed  $expected Expected value.
     * @param string $operator Comparison operator.
     *
     * @return bool
     */
    protected function compare_values( $actual, $expected, string $operator ): bool {
        switch ( $operator ) {
            case 'equal':
            case '===':
                return $actual === $expected;
            case 'not_equal':
            case '!==':
                return $actual !== $expected;
            case 'contains':
                return is_string( $actual ) && strpos( $actual, $expected ) !== false;
            case 'in':
                return is_array( $expected ) && in_array( $actual, $expected, true );
            case 'not_in':
                return is_array( $expected ) && ! in_array( $actual, $expected, true );
            case 'empty':
                return empty( $actual );
            case 'not_empty':
                return ! empty( $actual );
            case 'gt':
            case '>':
                return $actual > $expected;
            case 'lt':
            case '<':
                return $actual < $expected;
            case 'gte':
            case '>=':
                return $actual >= $expected;
            case 'lte':
            case '<=':
                return $actual <= $expected;
            default:
                return $actual === $expected;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        $this->errors = [];
        $value        = $this->get_value( $item );

        // Required validation
        if ( $this->is_required() ) {
            if ( $value === null || $value === '' || $value === [] ) {
                $this->errors['required'] = [
                    'type'    => 'invalid',
                    'message' => sprintf(
                        /* translators: %s: field label */
                        __( '%s is required.', 'dokan-lite' ),
                        $this->get_label()
                    ),
                ];
            }
        }

        // Elements validation (if enabled)
        $validate_elements = $this->is_valid['elements'] ?? true;
        if ( $validate_elements && ! empty( $this->elements ) && $value !== null && $value !== '' ) {
            $valid_values = array_column( $this->elements, 'value' );
            if ( ! in_array( $value, $valid_values, true ) ) {
                $this->errors['elements'] = [
                    'type'    => 'invalid',
                    'message' => __( 'Value must be one of the allowed options.', 'dokan-lite' ),
                ];
            }
        }

        // Custom validation
        if ( isset( $this->is_valid['custom'] ) && is_callable( $this->is_valid['custom'] ) ) {
            $custom_result = call_user_func( $this->is_valid['custom'], $item, $this );
            if ( is_string( $custom_result ) ) {
                $this->errors['custom'] = [
                    'type'    => 'invalid',
                    'message' => $custom_result,
                ];
            }
        }

        return [
            'valid'  => empty( $this->errors ),
            'errors' => $this->errors,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function get_validation_rules(): array {
        return $this->is_valid;
    }

    /**
     * Get validation errors.
     *
     * @return array
     */
    public function get_errors(): array {
        return $this->errors;
    }

	/**
	 * {@inheritdoc}
	 */
	public function is_sorting_enabled(): bool {
		return $this->enable_sorting;
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_hiding_enabled(): bool {
		return $this->enable_hiding;
	}

    /**
     * Get helper text.
     *
     * @return string
     */
    public function get_helper_text(): string {
        return $this->helper_text;
    }

    /**
     * Get size.
     *
     * @return int
     */
    public function get_size(): int {
        return $this->size;
    }

    /**
     * Get prefix.
     *
     * @return string
     */
    public function get_prefix(): string {
        return $this->prefix;
    }

    /**
     * Get postfix.
     *
     * @return string
     */
    public function get_postfix(): string {
        return $this->postfix;
    }

    /**
     * Get enable state.
     *
     * @return array
     */
    public function get_enable_state(): array {
        return $this->enable_state;
    }

    /**
     * Get disable state.
     *
     * @return array
     */
    public function get_disable_state(): array {
        return $this->disable_state;
    }

    /**
     * Get section ID.
     *
     * @return string
     */
    public function get_section_id(): string {
        return $this->section_id;
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'field_type'           => $this->field_type,
                'variant'              => $this->variant,
                'label'                => $this->get_label(),
                'value'                => $this->get_value(),
                'default'              => $this->default,
                'elements'             => $this->elements,
                'placeholder'          => $this->placeholder,
                'required'             => $this->is_required(),
                'disabled'             => $this->disabled,
                'enable_sorting'       => $this->enable_sorting,
                'enable_hiding'        => $this->enable_hiding,
                'is_valid'             => $this->is_valid,
                'visibility'           => $this->visibility,
                'helper_text'          => $this->helper_text,
                'size'                 => $this->size,
                'prefix'               => $this->prefix,
                'postfix'              => $this->postfix,
                'enable_state'         => $this->enable_state,
                'disable_state'        => $this->disable_state,
            ]
        );
    }

    /**
     * Convert legacy dependency_condition to visibility format.
     *
     * @param array $condition Legacy condition.
     *
     * @return array Visibility configuration.
     */
    protected function convert_legacy_dependency( array $condition ): array {
        if ( empty( $condition['field'] ) ) {
            return [];
        }

        $field = $condition['field'];
        if ( ! empty( $this->section_id ) ) {
            $field = $this->section_id . '.' . $field;
        }

        return [
            'field'    => $field,
            'value'    => $condition['value'] ?? '',
            'operator' => $condition['operator'] ?? 'equal',
        ];
    }

    /**
     * Sort comparison function.
     *
     * @param array  $a         First item.
     * @param array  $b         Second item.
     * @param string $direction Sort direction ('asc' or 'desc').
     *
     * @return int
     */
    public function sort( array $a, array $b, string $direction = 'asc' ): int {
        $val_a = $this->get_value( $a );
        $val_b = $this->get_value( $b );

        $result = 0;

        switch ( $this->field_type ) {
            case 'integer':
            case 'number':
                $result = ( (float) $val_a ) <=> ( (float) $val_b );
                break;
            case 'date':
            case 'datetime':
                $time_a = is_numeric( $val_a ) ? $val_a : strtotime( $val_a );
                $time_b = is_numeric( $val_b ) ? $val_b : strtotime( $val_b );
                $result = $time_a <=> $time_b;
                break;
            case 'boolean':
                $result = ( (int) $val_a ) <=> ( (int) $val_b );
                break;
            default:
                if ( is_string( $val_a ) && is_string( $val_b ) ) {
                    $result = strcasecmp( $val_a, $val_b );
                } else {
                    $result = $val_a <=> $val_b;
                }
        }

        return $direction === 'desc' ? -$result : $result;
    }
}
