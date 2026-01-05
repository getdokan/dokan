<?php

namespace WeDevs\PluginSettings\Elements\Fields;

/**
 * Select Field Class.
 *
 * @since 1.0.0
 */
class Select extends BaseField {

    /**
     * Field variant.
     *
     * @var string
     */
    protected string $variant = 'select';

    /**
     * Whether multiple selection is allowed.
     *
     * @var bool
     */
    protected bool $multiple = false;

    /**
     * Check if multiple selection is allowed.
     *
     * @return bool
     */
    public function is_multiple(): bool {
        return $this->multiple;
    }

    /**
     * Set multiple selection.
     *
     * @param bool $multiple Multiple selection state.
     *
     * @return static
     */
    public function set_multiple( bool $multiple ): self {
        $this->multiple = $multiple;

        return $this;
    }

    /**
     * Populate The settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();

        $data['multiple'] = $this->is_multiple();

        return $data;
    }

    /**
     * Data Validation condition.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        if ( $this->multiple ) {
            return is_array( $data );
        }

        return is_string( $data ) || is_numeric( $data ) || is_null( $data );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return string|array
     */
    public function sanitize_element( $data ) {
        if ( $this->multiple && is_array( $data ) ) {
            return array_map( 'sanitize_text_field', $data );
        }

        return sanitize_text_field( (string) $data );
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return string|array
     */
    public function escape_element( $data ) {
        if ( $this->multiple && is_array( $data ) ) {
            return array_map( 'esc_attr', $data );
        }

        return esc_attr( (string) $data );
    }
}

