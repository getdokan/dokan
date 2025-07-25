<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Info Field - Displays informational content with optional link.
 */
class InfoField extends Field {

    /**
     * Link text.
     *
     * @var string $link_text Link text.
     */
    protected $input_type = 'info';

    /**
     * Link URL.
     *
     * @var string $link_url Link URL.
     */
    protected $link_url = '';

    /**
     * Whether to show icon.
     *
     * @var bool $show_icon Whether to show icon.
     */
    protected $show_icon = true;

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get link text.
     *
     * @return string
     */
    public function get_link_text(): string {
        return $this->link_text;
    }

    /**
     * Set link text.
     *
     * @param string $link_text Link text.
     *
     * @return SettingsElement
     */
    public function set_link_text( string $link_text ): SettingsElement {
        $this->link_text = $link_text;

        return $this;
    }

    /**
     * Get link URL.
     *
     * @return string
     */
    public function get_link_url(): string {
        return $this->link_url;
    }

    /**
     * Set link URL.
     *
     * @param string $link_url Link URL.
     *
     * @return SettingsElement
     */
    public function set_link_url( string $link_url ): SettingsElement {
        $this->link_url = $link_url;

        return $this;
    }

    /**
     * Get show icon.
     *
     * @return bool
     */
    public function get_show_icon(): bool {
        return $this->show_icon;
    }

    /**
     * Set show icon.
     *
     * @param bool $show_icon Whether to show icon.
     *
     * @return SettingsElement
     */
    public function set_show_icon( bool $show_icon ): SettingsElement {
        $this->show_icon = $show_icon;

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
        return true; // Info fields don't need validation
    }

    /**
     * Populate The Page Object.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();
        $data['link_text'] = $this->link_text;
        $data['link_url'] = $this->link_url;
        $data['show_icon'] = $this->show_icon;

        return $data;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return array|float|string
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
        return parent::escape_element( $data );
    }


}
