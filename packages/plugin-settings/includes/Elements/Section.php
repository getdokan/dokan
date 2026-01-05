<?php

namespace WeDevs\PluginSettings\Elements;

use WeDevs\PluginSettings\Abstracts\SettingsElement;

/**
 * Section Element Class.
 *
 * @since 1.0.0
 */
class Section extends SettingsElement {

    /**
     * Settings Type.
     *
     * @var string
     */
    protected string $type = 'section';

    /**
     * Data Validation condition.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return is_array( $data );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return mixed
     */
    public function sanitize_element( $data ) {
        return $data;
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return mixed
     */
    public function escape_element( $data ) {
        return $data;
    }
}

