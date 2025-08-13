<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * CheckboxGroup Field.
 */
class Repeater extends Field {

    /**
     * Default Value.
     *
     * @var array $default Default.
     */
    protected $default = [];

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'repeater';

    /**
     * Options.
     *
     * @var array $options Options.
     */
    protected $options = array();

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get options.
     *
     * @return array
     */
    public function get_options(): array {
        return $this->options;
    }

    /**
     * Set options.
     *
     * @param array $options Options.
     *
     * @return SettingsElement
     */
    public function set_options( array $options ) {
        $this->options = $options;

        return $this;
    }

    /**
     * Add a repeater option.
     *
     * @param string      $option option to Display.
     * @param string|null $value value for the checkbox option. Default is null.
     *
     * @return Repeater
     */
    public function add_option( string $option, string $value ) {
        $this->options[] = [
            'title' => $option,
            'order' => $value,
        ];

        return $this;
    }

    /**
     * Get Default.
     *
     * @return array
     */
    public function get_default(): array {
        return $this->default;
    }

    /**
     * Set Default.
     *
     * @param array $default_value Default value.
     *
     * @return SettingsElement
     */
    public function set_default( $default_value ): SettingsElement {
        $this->default = $default_value;

        return $this;
    }

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return isset( $data ) && is_array( $data );
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data            = parent::populate();
        $data['value']   = $this->get_value();
        $data['default'] = $this->get_default();
        $data['options'] = $this->get_options();

        return $data;
    }
}
