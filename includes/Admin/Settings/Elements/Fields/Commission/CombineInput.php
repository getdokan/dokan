<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields\Commission;

use WeDevs\Dokan\Admin\Settings\Elements\Field;

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
     * Additional fee.
     *
     * @var string $additional_fee Fixed value.
     */
    protected $additional_fee = '';

    /**
     * Percentage value.
     *
     * @var string $admin_percentage Percentage value.
     */
    protected $admin_percentage = '';

    /**
     * Is automated.
     *
     * @var bool $is_automated Is automated.
     */
    protected $is_automated = false;

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
    public function get_additional_fee(): string {
        return $this->additional_fee;
    }

    /**
     * Set fixed value.
     *
     * @param string $additional_fee Fixed value.
     *
     * @return CombineInput
     */
    public function set_additional_fee( string $additional_fee ): CombineInput {
        $this->additional_fee = $additional_fee;

        return $this;
    }

    /**
     * Get percentage value.
     *
     * @return string
     */
    public function get_admin_percentage(): string {
        return $this->admin_percentage;
    }

    /**
     * Set percentage value.
     *
     * @param string $percentage Percentage value.
     *
     * @return CombineInput
     */
    public function set_admin_percentage( string $percentage ): CombineInput {
        $this->admin_percentage = $percentage;

        return $this;
    }

    /**
     * Get is automated.
     *
     * @return bool
     */
    public function get_is_automated(): bool {
        return $this->is_automated;
    }

    /**
     * Set is automated.
     *
     * @param bool $is_automated Is automated.
     *
     * @return CombineInput
     */
    public function set_is_automated( bool $is_automated ): CombineInput {
        $this->is_automated = $is_automated;

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
        $data                     = parent::populate();
        $data['additional_fee']   = $this->get_additional_fee();
        $data['admin_percentage'] = $this->get_admin_percentage();
        $data['is_automated']     = $this->get_is_automated();
        $data['value']            = $this->get_value();

        return $data;
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
