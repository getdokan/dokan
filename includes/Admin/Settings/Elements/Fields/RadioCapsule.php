<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

class RadioCapsule extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'radio_capsule';

    /**
     * Add an option.
     *
     * @param string      $option option to Display.
     * @param string|null $value  value for the checkbox option. Default is null.
     * @param string|null $icon   icon for the option this is optional.
     *
     * @return Checkbox|Radio|RadioCapsule
     */
    public function add_option( string $option, string $value, ?string $icon = '' ) {
        $this->options[] = [
            'value' => $value,
            'title' => $option,
            'icon'  => $icon,
        ];

        return $this;
    }
}
