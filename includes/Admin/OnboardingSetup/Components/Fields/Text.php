<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Field;

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
