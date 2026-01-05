<?php

namespace WeDevs\PluginSettings\Elements\Fields;

use WeDevs\PluginSettings\Abstracts\SettingsElement;

/**
 * Base Field Class.
 *
 * @since 1.0.0
 */
abstract class BaseField extends SettingsElement {

    /**
     * Is children Supported.
     *
     * @var bool
     */
    protected bool $support_children = false;

    /**
     * The Settings Element Type.
     *
     * @var string
     */
    protected string $type = 'field';

    /**
     * Field variant (text, number, select, etc.).
     *
     * @var string
     */
    protected string $variant = '';

    /**
     * Default value.
     *
     * @var mixed
     */
    protected $default;

    /**
     * Placeholder text.
     *
     * @var string
     */
    protected string $placeholder = '';

    /**
     * Field options (for select, radio, etc.).
     *
     * @var array
     */
    protected array $options = [];

    /**
     * Whether field is disabled.
     *
     * @var bool
     */
    protected bool $disabled = false;

    /**
     * Whether field is readonly.
     *
     * @var bool
     */
    protected bool $readonly = false;

    /**
     * CSS class for wrapper.
     *
     * @var string
     */
    protected string $css_class = '';

    /**
     * Helper text.
     *
     * @var string
     */
    protected string $helper_text = '';

    /**
     * Get field variant.
     *
     * @return string
     */
    public function get_variant(): string {
        return $this->variant;
    }

    /**
     * Get default value.
     *
     * @return mixed
     */
    public function get_default() {
        return $this->default;
    }

    /**
     * Set default value.
     *
     * @param mixed $default Default value.
     *
     * @return static
     */
    public function set_default( $default ): self {
        $this->default = $default;

        return $this;
    }

    /**
     * Get placeholder.
     *
     * @return string
     */
    public function get_placeholder(): string {
        return $this->placeholder;
    }

    /**
     * Set placeholder.
     *
     * @param string $placeholder Placeholder text.
     *
     * @return static
     */
    public function set_placeholder( string $placeholder ): self {
        $this->placeholder = $placeholder;

        return $this;
    }

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
     * @param array $options Options array.
     *
     * @return static
     */
    public function set_options( array $options ): self {
        $this->options = $options;

        return $this;
    }

    /**
     * Add an option.
     *
     * @param string           $title Option title.
     * @param string|int|float $value Option value.
     *
     * @return static
     */
    public function add_option( string $title, $value ): self {
        $this->options[] = [
            'title' => $title,
            'value' => $value,
        ];

        return $this;
    }

    /**
     * Check if disabled.
     *
     * @return bool
     */
    public function is_disabled(): bool {
        return $this->disabled;
    }

    /**
     * Set disabled state.
     *
     * @param bool $disabled Disabled state.
     *
     * @return static
     */
    public function set_disabled( bool $disabled ): self {
        $this->disabled = $disabled;

        return $this;
    }

    /**
     * Check if readonly.
     *
     * @return bool
     */
    public function is_readonly(): bool {
        return $this->readonly;
    }

    /**
     * Set readonly state.
     *
     * @param bool $readonly Readonly state.
     *
     * @return static
     */
    public function set_readonly( bool $readonly ): self {
        $this->readonly = $readonly;

        return $this;
    }

    /**
     * Get CSS class.
     *
     * @return string
     */
    public function get_css_class(): string {
        return $this->css_class;
    }

    /**
     * Set CSS class.
     *
     * @param string $css_class CSS class.
     *
     * @return static
     */
    public function set_css_class( string $css_class ): self {
        $this->css_class = $css_class;

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
     * @return static
     */
    public function set_helper_text( string $helper_text ): self {
        $this->helper_text = $helper_text;

        return $this;
    }

    /**
     * Populate The settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();

        $data['variant']     = $this->get_variant();
        $data['value']       = $this->get_value();
        $data['default']     = $this->get_default();
        $data['placeholder'] = $this->get_placeholder();
        $data['options']     = $this->get_options();
        $data['disabled']    = $this->is_disabled();
        $data['readonly']    = $this->is_readonly();
        $data['css_class']   = $this->get_css_class();
        $data['helper_text'] = $this->get_helper_text();

        return $data;
    }
}

