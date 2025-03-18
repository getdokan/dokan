<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Field;

/**
 * CheckboxGroup Field.
 */
class MultiCheck extends Field {

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
    protected $input_type = 'multicheck';

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
     * Add an option.
     *
     * @param string      $option option to Display.
     * @param string|null $value value for the checkbox option. Default is null.
     *
     * @return MultiCheck
     */
    public function add_option( string $option, string $value ) {
        $this->options[] = array(
            'value' => $value,
            'title' => $option,
        );

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
     * @param array $default Default value.
     *
     * @return SettingsElement
     */
    public function set_default( $default ): SettingsElement {
        $this->default = $default;

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
        $data['default'] = $this->get_default();
        $data['options'] = $this->get_options();

        return $data;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return float|string
     */
    public function sanitize_element( $data ) {
        return wc_clean( parent::sanitize_element( $data ) );
    }

    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ) {
        return esc_html( $data );
    }
}
