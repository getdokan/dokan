<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Base Field Label - A label field with advanced styling and content options.
 */
class BaseFieldLabel extends Field {

    /**
     * Input type for this field.
     *
     * @var string $input_type Input type.
     */
    protected $input_type = 'base_field_label';


    /**
     * Tooltip text.
     *
     * @var string $tooltip Tooltip text.
     */
    protected $tooltip = '';


    /**
     * Icon content.
     *
     * @var string $icon Icon content.
     */
    protected $icon = '';

    /**
     * Helper text.
     *
     * @var string $helper_text Helper text.
     */
    protected $helper_text = '';

    /**
     * Suffix content.
     *
     * @var string $suffix Suffix content.
     */
    protected $suffix = '';


    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data )
    : bool {
        return true; // Labels don't require validation
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate()
    : array {
        $data                = parent::populate();
        $data['suffix']      = $this->get_suffix();
        $data['icon']        = $this->get_icon();
        $data['helper_text'] = $this->get_helper_text();

        return $data;
    }

    /**
     * Get suffix.
     *
     * @return string
     */
    public function get_suffix()
    : string {
        return $this->suffix;
    }

    /**
     * Set suffix.
     *
     * @param string $suffix Suffix content.
     *
     * @return BaseFieldLabel
     */
    public function set_suffix( string $suffix )
    : BaseFieldLabel {
        $this->suffix = $suffix;

        return $this;
    }

    /**
     * Get icon.
     *
     * @return string
     */
    public function get_icon()
    : string {
        return $this->icon;
    }

    /**
     * Set icon.
     *
     * @param string $icon Icon content.
     *
     * @return BaseFieldLabel
     */
    public function set_icon( string $icon )
    : BaseFieldLabel {
        $this->icon = $icon;

        return $this;
    }

    /**
     * Get helper text.
     *
     * @return string
     */
    public function get_helper_text()
    : string {
        return $this->helper_text;
    }

    /**
     * Set helper text.
     *
     * @param string $helper_text Helper text.
     *
     * @return BaseFieldLabel
     */
    public function set_helper_text( string $helper_text )
    : BaseFieldLabel {
        $this->helper_text = $helper_text;

        return $this;
    }


    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data )
    : string {
        return esc_html( $data );
    }
}
