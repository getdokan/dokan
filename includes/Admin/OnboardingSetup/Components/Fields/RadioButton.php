<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * RadioButton Field.
 *
 * Custom field that provides a binary choice between 'show' and 'hide'.
 */
class RadioButton extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'radio_button';

    /**
     * Options.
     *
     * @var array $options Options.
     */
    protected $options = array(
        array(
            'value' => 'hide',
            'title' => 'Hide',
        ),
        array(
            'value' => 'show',
            'title' => 'Show',
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
        return isset( $data ) && in_array( $data, array( 'show', 'hide' ), true );
    }

    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        return esc_attr( $data );
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
     * Get default value.
     *
     * @return string
     */
    public function get_default(): string {
        return $this->default ?: 'hide';
    }
}
