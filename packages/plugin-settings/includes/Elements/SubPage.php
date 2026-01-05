<?php

namespace WeDevs\PluginSettings\Elements;

use WeDevs\PluginSettings\Abstracts\SettingsElement;

/**
 * SubPage Element Class.
 *
 * @since 1.0.0
 */
class SubPage extends SettingsElement {

    /**
     * Settings Type.
     *
     * @var string
     */
    protected string $type = 'subpage';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 100;

    /**
     * Get the page priority.
     *
     * @return int
     */
    public function get_priority(): int {
        return $this->priority;
    }

    /**
     * Set the page priority.
     *
     * @param int $priority Priority value.
     *
     * @return static
     */
    public function set_priority( int $priority ): self {
        $this->priority = $priority;

        return $this;
    }

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

