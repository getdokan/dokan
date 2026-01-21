<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

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
	 * @param string      $option Option to Display.
	 * @param string|null $value  Value for the checkbox option. Default is null.
     * @param string|null $icon   Optional icon name to render before option title.
	 *
	 * @return Checkbox|Select|Radio
	 */
	public function add_option( string $option, string $value, string $icon = '' ) {
        $option = array(
            'value' => $value,
            'title' => $option,
        );

        if ( ! empty( $icon ) ) {
            $option['icon_name'] = $icon;
        }

        $this->options[] = $option;

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
