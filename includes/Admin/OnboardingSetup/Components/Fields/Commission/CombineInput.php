<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Commission;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\Field;

/**
 * CombineInput Field.
 */
class CombineInput extends Field {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'combine_input';

    /**
     * Fixed value.
     *
     * @var string $fixed Fixed value.
     */
    protected $fixed;

    /**
     * Percentage value.
     *
     * @var string $percentage Percentage value.
     */
    protected $percentage;

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get fixed value.
     *
     * @return string
     */
    public function get_fixed(): string {
        return $this->fixed;
    }

    /**
     * Set fixed value.
     *
     * @param string $fixed Fixed value.
     *
     * @return CombineInput
     */
    public function set_fixed( string $fixed ): CombineInput {
        $this->fixed = $fixed;

        return $this;
    }

    /**
     * Get percentage value.
     *
     * @return string
     */
    public function get_percentage(): string {
        return $this->percentage;
    }

    /**
     * Set percentage value.
     *
     * @param string $percentage Percentage value.
     *
     * @return CombineInput
     */
    public function set_percentage( string $percentage ): CombineInput {
        $this->percentage = $percentage;

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
        $data               = parent::populate();
        $data['fixed']      = $this->get_fixed();
        $data['percentage'] = $this->get_percentage();

        return $data;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return array
     */
    public function sanitize_element( $data ): array {
        if ( ! is_array( $data ) ) {
            return [
                'fixed'      => '',
                'percentage' => ''
            ];
        }

        return [
            'fixed'      => isset( $data['fixed'] ) ? sanitize_text_field( $data['fixed'] ) : '',
            'percentage' => isset( $data['percentage'] ) ? sanitize_text_field( $data['percentage'] ) : '',
        ];
//        return wc_clean( parent::sanitize_element( $data ) );
    }

    /**
     * Escape data for display.
     *
     * @param mixed $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        return esc_html( $data );
    }
}
