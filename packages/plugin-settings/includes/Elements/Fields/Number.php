<?php

namespace WeDevs\PluginSettings\Elements\Fields;

/**
 * Number Field Class.
 *
 * @since 1.0.0
 */
class Number extends BaseField {

    /**
     * Field variant.
     *
     * @var string
     */
    protected string $variant = 'number';

    /**
     * Minimum value.
     *
     * @var int|float|null
     */
    protected $min = null;

    /**
     * Maximum value.
     *
     * @var int|float|null
     */
    protected $max = null;

    /**
     * Step value.
     *
     * @var int|float
     */
    protected $step = 1;

    /**
     * Get minimum value.
     *
     * @return int|float|null
     */
    public function get_min() {
        return $this->min;
    }

    /**
     * Set minimum value.
     *
     * @param int|float $min Minimum value.
     *
     * @return static
     */
    public function set_min( $min ): self {
        $this->min = $min;

        return $this;
    }

    /**
     * Get maximum value.
     *
     * @return int|float|null
     */
    public function get_max() {
        return $this->max;
    }

    /**
     * Set maximum value.
     *
     * @param int|float $max Maximum value.
     *
     * @return static
     */
    public function set_max( $max ): self {
        $this->max = $max;

        return $this;
    }

    /**
     * Get step value.
     *
     * @return int|float
     */
    public function get_step() {
        return $this->step;
    }

    /**
     * Set step value.
     *
     * @param int|float $step Step value.
     *
     * @return static
     */
    public function set_step( $step ): self {
        $this->step = $step;

        return $this;
    }

    /**
     * Populate The settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();

        $data['min']  = $this->get_min();
        $data['max']  = $this->get_max();
        $data['step'] = $this->get_step();

        return $data;
    }

    /**
     * Data Validation condition.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        if ( ! is_numeric( $data ) && ! is_null( $data ) && '' !== $data ) {
            return false;
        }

        if ( null !== $this->min && (float) $data < $this->min ) {
            return false;
        }

        if ( null !== $this->max && (float) $data > $this->max ) {
            return false;
        }

        return true;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return int|float|string
     */
    public function sanitize_element( $data ) {
        if ( '' === $data || is_null( $data ) ) {
            return '';
        }

        return is_float( $data + 0 ) ? (float) $data : (int) $data;
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return int|float|string
     */
    public function escape_element( $data ) {
        return $this->sanitize_element( $data );
    }
}

