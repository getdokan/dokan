<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * HTML Field - Displays custom HTML content with various configuration options.
 *
 * @since 4.0.3
 */
class HtmlField extends Field {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'html';

    /**
     * HTML content to display.
     *
     * @var string $html_content HTML content.
     */
    protected $html_content = '';

    /**
     * CSS classes for the HTML container.
     *
     * @var string $css_classes CSS classes.
     */
    protected $css_classes = '';

    /**
     * Whether to escape the HTML content.
     *
     * @var bool $escape_html Whether to escape HTML.
     */
    protected $escape_html = false;

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
     * Whether to allow shortcodes in the HTML content.
     *
     * @var bool $allow_shortcodes Whether to allow shortcodes.
     */
    protected $allow_shortcodes = false;

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get HTML content.
     *
     * @return string
     */
    public function get_html_content(): string {
        return $this->html_content;
    }

    /**
     * Set HTML content.
     *
     * @param string $html_content HTML content.
     *
     * @return HtmlField
     */
    public function set_html_content( string $html_content ): HtmlField {
        $this->html_content = $html_content;

        return $this;
    }

    /**
     * Get CSS classes.
     *
     * @return string
     */
    public function get_css_classes(): string {
        return $this->css_classes;
    }

    /**
     * Set CSS classes.
     *
     * @param string $css_classes CSS classes.
     *
     * @return HtmlField
     */
    public function set_css_classes( string $css_classes ): HtmlField {
        $this->css_classes = $css_classes;

        return $this;
    }

    /**
     * Check if HTML should be escaped.
     *
     * @return bool
     */
    public function should_escape_html(): bool {
        return $this->escape_html;
    }

    /**
     * Set whether to escape HTML.
     *
     * @param bool $escape_html Whether to escape HTML.
     *
     * @return HtmlField
     */
    public function set_escape_html( bool $escape_html ): HtmlField {
        $this->escape_html = $escape_html;

        return $this;
    }

    /**
     * Check if shortcodes are allowed.
     *
     * @return bool
     */
    public function should_allow_shortcodes(): bool {
        return $this->allow_shortcodes;
    }

    /**
     * Set whether to allow shortcodes.
     *
     * @param bool $allow_shortcodes Whether to allow shortcodes.
     *
     * @return HtmlField
     */
    public function set_allow_shortcodes( bool $allow_shortcodes ): HtmlField {
        $this->allow_shortcodes = $allow_shortcodes;

        return $this;
    }

    /**
     * Get tooltip text.
     *
     * @return string
     */
    public function get_tooltip(): string {
        return $this->tooltip;
    }

    /**
     * Set tooltip text.
     *
     * @param string $tooltip Tooltip text.
     *
     * @return HtmlField
     */
    public function set_tooltip( string $tooltip ): HtmlField {
        $this->tooltip = $tooltip;

        return $this;
    }

    /**
     * Get icon content.
     *
     * @return string
     */
    public function get_icon(): string {
        return $this->icon;
    }

    /**
     * Set icon content.
     *
     * @param string $icon Icon content.
     *
     * @return HtmlField
     */
    public function set_icon( string $icon ): HtmlField {
        $this->icon = $icon;

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
        return true; // HTML fields don't require validation
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();
        $data['html_content'] = $this->get_html_content();
        $data['css_classes'] = $this->get_css_classes();
        $data['escape_html'] = $this->should_escape_html();
        $data['allow_shortcodes'] = $this->should_allow_shortcodes();
        $data['tooltip'] = $this->get_tooltip();
        $data['icon'] = $this->get_icon();
        return $data;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return mixed
     */
    public function sanitize_element( $data ) {
        return parent::sanitize_element( $data );
    }

    /**
     * Escape data for display.
     *
     * @param mixed $data Data for display.
     *
     * @return mixed
     */
    public function escape_element( $data ) {
        if ( $this->should_escape_html() ) {
            return wp_kses_post( $data );
        }

        if ( $this->should_allow_shortcodes() ) {
            return do_shortcode( $data );
        }

        return $data;
    }
}
