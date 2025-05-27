<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Test Field.
 */
class Tel extends Text {

	/**
	 * Input Type.
	 *
	 * @var string $input_type Input Type.
	 */
	protected $input_type = 'tel';

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
	 * Populate settings array.
	 *
	 * @return array
	 */
	public function populate(): array {
		$data                = parent::populate();
		$data['default']     = $this->get_default();
		$data['placeholder'] = $this->get_placeholder();

		return $data;
	}
}
