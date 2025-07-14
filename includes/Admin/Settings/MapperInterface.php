<?php

namespace WeDevs\Dokan\Admin\Settings;

interface MapperInterface {
    /**
     * Get the settings map.
     *
     * @return array<string, array|string>
     */
    public function get_map(): array;

    public function set_from( $form ): MapperInterface;
    public function get_to();
}
