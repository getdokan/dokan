<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Switcher Field.
 *
 * Custom field that provides a toggle switch for boolean values.
 */
class Switcher extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'switch';

    /**
     * Active value.
     *
     * @var string $active_value Active value.
     */

    protected $active_value = 'true';


    /**
     * Set active value.
     *
     * @param string $value Active value.
     *
     * @return Switcher
     */

    public function set_active_value( string $value ): Switcher {
        $this->active_value = $value;

        return $this;
    }

    /**
     * Get active value.
     *
     * @return string
     */

    public function get_active_value(): string {
        return $this->active_value;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                 = parent::populate();
        $data['default']      = $this->get_default();
        $data['options']      = $this->get_options();
        $data['active_value'] = $this->get_active_value();

        return $data;
    }
}
