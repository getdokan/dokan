<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Recipient Selector Field.
 */
class RecipientSelector extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'recipient_selector';

    /**
     * Options.
     *
     * @var array $options Options.
     */
    protected $options = array(
        array(
            'value' => 'admin',
            'title' => 'Admin',
        ),
        array(
            'value' => 'vendor',
            'title' => 'Vendor',
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
        return isset( $data ) && in_array( $data, array( 'admin', 'vendor' ), true );
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
}
