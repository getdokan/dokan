<?php

namespace WeDevs\PluginSettings\Elements\Fields;

/**
 * Switcher (Toggle) Field Class.
 *
 * @since 1.0.0
 */
class Switcher extends BaseField {

    /**
     * Field variant.
     *
     * @var string
     */
    protected string $variant = 'switch';

    /**
     * Enable state configuration.
     *
     * @var array
     */
    protected array $enable_state = [
        'label' => 'On',
        'value' => 'on',
    ];

    /**
     * Disable state configuration.
     *
     * @var array
     */
    protected array $disable_state = [
        'label' => 'Off',
        'value' => 'off',
    ];

    /**
     * Get enable state.
     *
     * @return array
     */
    public function get_enable_state(): array {
        return $this->enable_state;
    }

    /**
     * Set enable state.
     *
     * @param string           $label State label.
     * @param string|int|float $value State value.
     *
     * @return static
     */
    public function set_enable_state( string $label, $value ): self {
        $this->enable_state = [
            'label' => $label,
            'value' => $value,
        ];

        return $this;
    }

    /**
     * Get disable state.
     *
     * @return array
     */
    public function get_disable_state(): array {
        return $this->disable_state;
    }

    /**
     * Set disable state.
     *
     * @param string           $label State label.
     * @param string|int|float $value State value.
     *
     * @return static
     */
    public function set_disable_state( string $label, $value ): self {
        $this->disable_state = [
            'label' => $label,
            'value' => $value,
        ];

        return $this;
    }

    /**
     * Populate The settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();

        $data['enable_state']  = $this->get_enable_state();
        $data['disable_state'] = $this->get_disable_state();

        return $data;
    }

    /**
     * Data Validation condition.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        $valid_values = [
            $this->enable_state['value'],
            $this->disable_state['value'],
        ];

        return in_array( $data, $valid_values, true )
            || is_bool( $data )
            || is_null( $data );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return mixed
     */
    public function sanitize_element( $data ) {
        if ( is_bool( $data ) ) {
            return $data ? $this->enable_state['value'] : $this->disable_state['value'];
        }

        return sanitize_text_field( (string) $data );
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return mixed
     */
    public function escape_element( $data ) {
        return esc_attr( (string) $data );
    }
}

