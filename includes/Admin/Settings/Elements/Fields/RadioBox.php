<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

/**
 * RadioButton Field.
 *
 * Custom field that provides radio options as button with icon support.
 */
class RadioBox extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'radio_box';

    /**
     * Option icons mapping.
     *
     * @var array $option_icons Icons for each option.
     */
    protected $option_icons = array();

    /**
     * Add an option with icon.
     *
     * @param string      $option Option to display.
     * @param string      $value  Value for the radio option.
     * @param string|null $icon   Icon HTML or class for the option.
     *
     * @return RadioBox
     */
    public function add_option_with_icon( string $option, string $value, string $icon = '' ) {
        $this->add_option( $option, $value );

        if ( $icon ) {
            $this->option_icons[ $value ] = $icon;
        }

        return $this;
    }

    /**
     * Set icon for a specific option.
     *
     * @param string $value Option value.
     * @param string $icon  Icon HTML or class.
     *
     * @return RadioBox
     */
    public function set_option_icon( string $value, string $icon ) {
        $this->option_icons[ $value ] = $icon;

        return $this;
    }

    /**
     * Get icon for a specific option.
     *
     * @param string $value Option value.
     *
     * @return string|null
     */
    public function get_option_icon( string $value ) {
        return $this->option_icons[ $value ] ?? null;
    }

    /**
     * Get all option icons.
     *
     * @return array
     */
    public function get_option_icons(): array {
        return $this->option_icons;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();

        // Enhance options with icons
        if ( ! empty( $this->option_icons ) ) {
            $enhanced_options = array();
            foreach ( $data['options'] as $option ) {
                $enhanced_option = $option;
                if ( isset( $this->option_icons[ $option['value'] ] ) ) {
                    $enhanced_option['icon'] = $this->option_icons[ $option['value'] ];
                }
                $enhanced_options[] = $enhanced_option;
            }
            $data['options'] = $enhanced_options;
        }

        return $data;
    }
}
