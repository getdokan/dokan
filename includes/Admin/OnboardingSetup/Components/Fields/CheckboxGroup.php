<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * CheckboxGroup Field.
 */
class CheckboxGroup extends Checkbox {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'checkbox_group';

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
     * Escape data for display.
     *
     * @param array $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {

        return esc_attr( implode( ',', $data ) );
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
        $data['variant'] = 'checkbox_group';

        return $data;
    }
}
