<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Test Field.
 */
class Number extends Text {

	/**
	 * Input Type.
	 *
	 * @var string $input_type Input Type.
	 */
	protected $input_type = 'number';

	/**
	 * Minimum.
	 *
	 * @var float $minimum Minimum.
	 */
	protected $minimum;

	/**
	 * Maximum.
	 *
	 * @var float Maximum.
	 */
	protected $maximum;

	/**
	 * Increment number.
	 *
	 * @var float $step Increment number.
	 */
	protected $step = 0.1;

    /**
	 * Get minimum value.
	 *
	 * @return float
	 */
	public function get_minimum(): ?float {
		return $this->minimum;
	}

	/**
	 * Set minimum value.
	 *
	 * @param float $minimum The minimum value.
	 *
	 * @return Number
	 */
	public function set_minimum( float $minimum ): Number {
		$this->minimum = $minimum;

		return $this;
	}

	/**
	 * Get minimum value.
	 *
	 * @return float
	 */
	public function get_maximum(): ?float {
		return $this->maximum;
	}

	/**
	 * Set maximum value.
	 *
	 * @param float $maximum Value.
	 *
	 * @return Number
	 */
	public function set_maximum( float $maximum ): Number {
		$this->maximum = $maximum;

		return $this;
	}

	/**
	 * Get step value.
	 *
	 * @return float
	 */
	public function get_step(): ?float {
		return $this->step;
	}

	/**
	 * Set step value.
	 *
	 * @param float $step Value.
	 *
	 * @return Number
	 */
	public function set_step( float $step ): Number {
		$this->step = $step;

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
		return isset( $data )
			&& is_numeric( $data )
			&& ( ! isset( $this->minimum ) || $data >= $this->minimum )
			&& ( ! isset( $this->maximum ) || $data <= $this->maximum );
	}


	/**
	 * Sanitize data for storage.
	 *
	 * @param mixed $data Data for sanitization.
	 *
	 * @return mixed
	 */
	public function sanitize_element( $data ) {
		return floatval( wc_format_decimal( parent::sanitize_element( $data ) ) );
	}

	/**
	 * Escape data for display.
	 *
	 * @param string $data Data for display.
	 *
	 * @return float
	 */
	public function escape_element( $data ): float {
		return esc_html( $data );
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
		$data['minimum']     = $this->get_minimum();
		$data['maximum']     = $this->get_maximum();
		$data['step']        = $this->get_step();

		return $data;
	}
}
