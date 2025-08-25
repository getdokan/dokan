<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Test Field.
 */
class Text extends Field {

    /**
     * Default Value.
     *
     * @var string $default Default.
     */
    protected $default = '';

    /**
     * Placeholder.
     *
     * @var string $placeholder Placeholder.
     */
    protected $placeholder = '';

    /**
     * Input field is read-only.
     *
     * @var bool $is_readonly Whether to read only.
     */
    protected $is_readonly = false;

    /**
     * Whether the field is disabled.
     *
     * @var bool $disabled Whether the field is disabled.
     */
    protected $disabled = false;

    /**
     * The size of the field.
     *
     * @var int $size The size of the field.
     */
    protected $size = 20;

    /**
     *  Helper text for the field.
     *
     * @var string $helper_text Helper text.
     */
    protected $helper_text = '';

    /**
     * Postfix.
     *
     * @var mixed $postfix
     */
    protected $postfix = '';

    /**
     * Input Type.
     *
     * @var mixed $prefix
     */
    protected $prefix = '';

    /**
     * Image URL.
     *
     * @var string $image_url Image URL.
     */
    protected $image_url = '';
    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get Default.
     *
     * @return string
     */
    public function get_default(): string {
        return $this->default;
    }

    /**
     * Get Prefix.
     *
     * @return mixed
     */
    public function get_prefix() {
        return $this->prefix;
    }

    /**
     * Set Prefix.
     *
     * @param string $prefix Prefix.
     *
     * @return SettingsElement
     */
    public function set_prefix( string $prefix ): SettingsElement {
        $this->prefix = $prefix;

        return $this;
    }

    /**
     * Get Postfix.
     *
     * @return mixed
     */
    public function get_postfix() {
        return $this->postfix;
    }

    /**
     * Set Postfix.
     *
     * @param string $postfix Postfix.
     *
     * @return SettingsElement
     */
    public function set_postfix( string $postfix ): SettingsElement {
        $this->postfix = $postfix;

        return $this;
    }

    /**
     * Set Default.
     *
     * @param string $default_value Default value.
     *
     * @return SettingsElement
     */
    public function set_default( string $default_value ): SettingsElement {
        $this->default = $default_value;

        return $this;
    }

    /**
     * Get Placeholder.
     *
     * @return string
     */
    public function get_placeholder(): string {
        return $this->placeholder;
    }

    /**
     * Set placeholder.
     *
     * @param string $placeholder Placeholder.
     *
     * @return SettingsElement
     */
    public function set_placeholder( string $placeholder ): SettingsElement {
        $this->placeholder = $placeholder;

        return $this;
    }

    /**
     * Is field read only or not.
     *
     * @return bool
     */
    public function is_readonly(): bool {
        return $this->is_readonly;
    }

    /**
     * Get image url data.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_image_url(): string {
        return $this->image_url;
    }

    /**
     * Set image url data.
     *
     * @since DOKAN_SINCE
     *
     * @param string $url Getting image source url
     *
     * @return Text
     */
    public function set_image_url( string $url ): Text {
        $this->image_url = $url;

        return $this;
    }

    /**
     * Set readonly flag.
     *
     * @param bool $is_readonly Readonly flag.
     *
     * @return Text
     */
    public function set_readonly( bool $is_readonly ): Text {
        $this->is_readonly = $is_readonly;

        return $this;
    }

    /**
     * Check if the field is disabled.
     *
     * @return bool
     */
    public function is_disabled(): bool {
        return $this->disabled;
    }

    /**
     * Set the field as disabled state.
     *
     * @param bool $disabled Whether the field is disabled.
     *
     * @return Text
     */
    public function set_disabled( bool $disabled ): Text {
        $this->disabled = $disabled;

        return $this;
    }

    /**
     * Get the field size.
     *
     * @return int
     */
    public function get_size(): int {
        return $this->size;
    }

    /**
     * Set the field size.
     *
     * @param int $size The size of the field.
     *
     * @return Text
     */
    public function set_size( int $size ): Text {
        $this->size = $size;

        return $this;
    }

    /**
     * Get helper text.
     *
     * @return string
     */
    public function get_helper_text(): string {
        return $this->helper_text;
    }

    /**
     * Set helper text.
     *
     * @param string $helper_text Helper text.
     *
     * @return Text
     */
    public function set_helper_text( string $helper_text ): Text {
        $this->helper_text = $helper_text;

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
        return isset( $data ) && is_string( $data );
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
        $data['readonly']    = $this->is_readonly();
        $data['disabled']    = $this->is_disabled();
        $data['size']        = $this->get_size();
        $data['helper_text'] = $this->get_helper_text();
        $data['postfix'] = $this->get_postfix();
        $data['prefix'] = $this->get_prefix();
        $data['image_url'] = $this->get_image_url();
        return $data;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return float|string
     */
    public function sanitize_element( $data ) {
        return sanitize_text_field( parent::sanitize_element( $data ) );
    }

    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ) {
        return esc_html( $data );
    }
}
