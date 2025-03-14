<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * ToggleSwitchField Field.
 *
 * Custom field that provides a toggle switch for boolean values.
 */
class ToggleSwitchField extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'toggle_switch';

    /**
     * Switch label.
     *
     * @var string $label Switch label.
     */
    protected $label = 'Enabled';

    /**
     * Options.
     *
     * @var array $options Options.
     */
    protected $options = array(
        array(
            'value' => false,
            'title' => 'Disabled',
        ),
        array(
            'value' => true,
            'title' => 'Enabled',
        ),
    );

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return isset( $data ) && is_bool( $data );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return bool
     */
    public function sanitize_element( $data ) {
        return (bool) $data;
    }

    /**
     * Escape data for display.
     *
     * @param mixed $data Data for display.
     *
     * @return bool
     */
    public function escape_element( $data ): string {
        return (bool) $data;
    }

    /**
     * Set default value.
     *
     * @param bool $default Default value.
     *
     * @return ToggleSwitchField
     */
    public function set_default( bool $default ): ToggleSwitchField {
        $this->default = $default;

        return $this;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data            = parent::populate();
        $data['default'] = $this->get_default();
        $data['label']   = $this->get_label();
        $data['options'] = $this->get_options();

        return $data;
    }

    /**
     * Get default value.
     *
     * @return string
     */
    public function get_default(): string {
        return (bool) $this->default;
    }

    /**
     * Get switch label.
     *
     * @return string
     */
    public function get_label(): string {
        return $this->label;
    }

    /**
     * Set switch label.
     *
     * @param string $label Switch label.
     *
     * @return ToggleSwitchField
     */
    public function set_label( string $label ): ToggleSwitchField {
        $this->label = $label;

        return $this;
    }
}
