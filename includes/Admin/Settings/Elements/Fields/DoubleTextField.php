<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Double Text Field Element Class
 *
 * @since 4.0.3
 */
class DoubleTextField extends Text {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'double_text';

    /**
     * Label for the field.
     *
     * @var string
     */

    protected string $label = '';

    /**
     * First label for the field.
     *
     * @var string
     */
    protected string $first_label = '';

    /**
     * First value for the field.
     *
     * @var string|number
     */
    protected $first_value = '';

    /**
     * Second label for the field.
     *
     * @var string
     */
    protected string $second_label = '';

    /**
     * Second value for the field.
     *
     * @var string|number
     */
    protected $second_value = '';

    /**
     * Label for the field.
     */

    public function set_label( string $label ): self {
        $this->label = $label;

        return $this;
    }

    /**
     * Sets the first label for the field.
     *
     * @since 4.0.3
     *
     * @param string $label
     *
     * @return self
     */
    public function set_first_label( string $label ): self {
        $this->first_label = $label;

        return $this;
    }

    /**
     * Sets the first value for the field.
     *
     * @since 4.0.3
     *
     * @param string|number $value
     *
     * @return self
     */
    public function set_first_value( $value ): self {
        $this->first_value = $value;

        return $this;
    }

    /**
     * Sets the second label for the field.
     *
     * @since 4.0.3
     *
     * @param string $label
     *
     * @return self
     */
    public function set_second_label( string $label ): self {
        $this->second_label = $label;

        return $this;
    }

    /**
     * Sets the second value for the field.
     *
     * @since 4.0.3
     *
     * @param string|number $value
     *
     * @return self
     */
    public function set_second_value( $value ): self {
        $this->second_value = $value;

        return $this;
    }

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
     * To array method.
     *
     * @since 4.0.3
     *
     * @return array
     */
    public function populate(): array {
        $element                = parent::populate();
        $element['label']       = $this->label;
        $element['firstLabel']  = $this->first_label;
        $element['firstValue']  = $this->first_value;
        $element['secondLabel'] = $this->second_label;
        $element['secondValue'] = $this->second_value;

        return $element;
    }
}
