<?php

namespace WeDevs\PluginSettings\Elements\Fields;

/**
 * Password Field Class.
 *
 * @since 1.0.0
 */
class Password extends BaseField {

    /**
     * Field variant.
     *
     * @var string
     */
    protected string $variant = 'password';

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
        // Don't sanitize passwords to preserve special characters.
        return (string) $data;
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return string
     */
    public function escape_element( $data ) {
        return esc_attr( (string) $data );
    }
}

