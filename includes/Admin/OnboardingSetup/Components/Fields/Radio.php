<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Checkbox Field.
 */
class Radio extends Checkbox {

	/**
	 * Input Type.
	 *
	 * @var string $input_type Input Type.
	 */
	protected $input_type = 'radio';

	/**
	 * Data validation.
	 *
	 * @param mixed $data Data for validation.
	 *
	 * @return bool
	 */
	public function data_validation( $data ): bool {
		return isset( $data );
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
