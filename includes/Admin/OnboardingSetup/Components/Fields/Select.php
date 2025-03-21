<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Select Field.
 */
class Select extends Checkbox {

	/**
	 * Input Type.
	 *
	 * @var string $input_type Input Type.
	 */
	protected $input_type = 'select';

	/**
	 * Data validation.
	 *
	 * @param mixed $data Data for validation.
	 *
	 * @return bool
	 */
	public function data_validation( $data ): bool {
		return isset( $data ) && ! is_array( $data );
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
