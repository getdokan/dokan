<?php

namespace WeDevs\PluginSettings\Elements\Fields;

/**
 * Checkbox Field Class.
 *
 * @since 1.0.0
 */
class Checkbox extends BaseField {

    /**
     * Field variant.
     *
     * @var string
     */
    protected string $variant = 'checkbox';

    /**
     * Data Validation condition.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return is_bool( $data ) || in_array( $data, [ 'on', 'off', '1', '0', 1, 0, '', null ], true );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return bool
     */
    public function sanitize_element( $data ) {
        return filter_var( $data, FILTER_VALIDATE_BOOLEAN );
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return bool
     */
    public function escape_element( $data ) {
        return (bool) $data;
    }
}

