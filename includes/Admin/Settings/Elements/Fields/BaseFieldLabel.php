<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Base Field Label - A label field with advanced styling and content options.
 */
class BaseFieldLabel extends Text {

    /**
     * Input type for this field.
     *
     * @var string $input_type Input type.
     */
    protected $input_type = 'base_field_label';

    /**
     * Icon content.
     *
     * @var string $icon Icon content.
     */
    protected $icon = '';

    /**
     * Image url.
     *
     * @var string $url Image url.
     */
    protected $image_url = '';

    /**
     * Description.
     *
     * @var string $description Description.
     */
    protected $description = '';

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
    public function data_validation( $data ): bool {
        return true; // Labels don't require validation
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                = parent::populate();
        $data['suffix']      = $this->get_suffix();
        $data['icon']        = $this->get_icon();
        $data['description'] = $this->get_description();
        $data['doc_link']    = $this->get_doc_link();
        $data['image_url']   = $this->get_image_url();

        return $data;
    }

    /**
     * Get suffix.
     *
     * @return string
     */
    public function get_suffix(): string {
        return $this->suffix;
    }

    /**
     * Set suffix.
     *
     * @param string $suffix Suffix content.
     *
     * @return BaseFieldLabel
     */
    public function set_suffix( string $suffix ): BaseFieldLabel {
        $this->suffix = $suffix;

        return $this;
    }

    /**
     * Get icon.
     *
     * @return string
     */
    public function get_icon(): string {
        return $this->icon;
    }

    /**
     * Set icon.
     *
     * @param string $icon Icon content.
     *
     * @return BaseFieldLabel
     */
    public function set_icon( string $icon ): BaseFieldLabel {
        $this->icon = $icon;

        return $this;
    }

    /**
     * Get image url.
     *
     * @return string
     */
    public function get_image_url(): string {
        return $this->image_url;
    }

    /**
     * Set image url.
     *
     * @param string $url Image url.
     *
     * @return BaseFieldLabel
     */
    public function set_image_url( string $url ): BaseFieldLabel {
        $this->image_url = $url;

        return $this;
    }

    /**
     * Get description.
     *
     * @return string
     */
    public function get_description(): string {
        return $this->description;
    }

    /**
     * Set description.
     *
     * @param string $description Description.
     *
     * @return BaseFieldLabel
     */
    public function set_description( string $description ): BaseFieldLabel {
        $this->description = $description;

        return $this;
    }


    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        return esc_html( $data );
    }
}
