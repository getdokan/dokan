<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;

/**
 * Checkbox Field.
 */
class Checkbox extends Text {

	/**
	 * Input Type.
	 *
	 * @var string $input_type Input Type.
	 */
	protected $input_type = 'checkbox';

	/**
	 * Options.
	 *
	 * @var array $options Options.
	 */
	protected $options = array();

	/**
	 * Get options.
	 *
	 * @return array
	 */
	public function get_options(): array {
		return $this->options;
	}

	/**
	 * Set options.
	 *
	 * @param array $options Options.
	 *
	 * @return SettingsElement
	 */
	public function set_options( array $options ) {
		$this->options = $options;

		return $this;
	}

	/**
	 * Add an option.
	 *
	 * @param string      $option option to Display.
	 * @param string|null $value value for the checkbox option. Default is null.
	 *
	 * @return Checkbox|Select|Radio
	 */
	public function add_option( string $option, string $value ) {
		$this->options[] = array(
			'value' => $value,
			'title' => $option,
		);
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
		$data                = parent::populate();
		$data['default']     = $this->get_default();
		$data['placeholder'] = $this->get_placeholder();
		$data['options']     = $this->get_options();

		return $data;
	}
}
