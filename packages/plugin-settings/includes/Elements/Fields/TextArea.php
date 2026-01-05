<?php

namespace WeDevs\PluginSettings\Elements\Fields;

/**
 * TextArea Field Class.
 *
 * @since 1.0.0
 */
class TextArea extends BaseField {

    /**
     * Field variant.
     *
     * @var string
     */
    protected string $variant = 'textarea';

    /**
     * Number of rows.
     *
     * @var int
     */
    protected int $rows = 5;

    /**
     * Get rows.
     *
     * @return int
     */
    public function get_rows(): int {
        return $this->rows;
    }

    /**
     * Set rows.
     *
     * @param int $rows Number of rows.
     *
     * @return static
     */
    public function set_rows( int $rows ): self {
        $this->rows = $rows;

        return $this;
    }

    /**
     * Populate The settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();

        $data['rows'] = $this->get_rows();

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
        return is_string( $data ) || is_null( $data );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return string
     */
    public function sanitize_element( $data ) {
        return sanitize_textarea_field( (string) $data );
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return string
     */
    public function escape_element( $data ) {
        return esc_textarea( (string) $data );
    }
}

