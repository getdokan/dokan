<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * Notice Field class.
 *
 * @since 4.0.3
 */
class NoticeField extends Field {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'notice';

    /**
     * Notice type.
     *
     * @var string $notice_type Notice type.
     */
    protected $notice_type = 'info';

    /**
     * Notice icon.
     *
     * @var string $notice_icon Notice icon.
     */
    protected $notice_icon = 'info';

    /**
     * Notice title.
     *
     * @var string $notice_title Notice title.
     */
    protected $notice_title = '';

    /**
     * Notice description.
     *
     * @var string $notice_description Notice description.
     */
    protected $notice_description = '';

    /**
     * Link title.
     *
     * @var string $link_title Link title.
     */
    protected $link_title = '';

    /**
     * Link URL.
     *
     * @var string $link_url Link URL.
     */
    protected $link_url = '';

    /**
     * Link icon.
     *
     * @var string $link_icon Link icon.
     */
    protected $link_icon = '';

    /**
     * Active tab.
     *
     * @var string $active_tab Active tab.
     */
    protected $active_tab = '';

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get active tab.
     *
     * @return string
     */
    public function get_active_tab(): string {
        return $this->active_tab;
    }

    /**
     * Set active tab.
     *
     * @param string $active_tab Active tab.
     *
     * @return NoticeField
     */
    public function set_active_tab( string $active_tab ): NoticeField {
        $this->active_tab = $active_tab;

        return $this;
    }

    /**
     * Get notice type.
     *
     * @return string
     */
    public function get_notice_type(): string {
        return $this->notice_type;
    }

    /**
     * Set notice type.
     *
     * @param string $notice_type Notice type.
     *
     * @return NoticeField
     */
    public function set_notice_type( string $notice_type ): NoticeField {
        $this->notice_type = $notice_type;

        return $this;
    }

    /**
     * Get notice icon.
     *
     * @return string
     */
    public function get_icon(): string {
        return $this->notice_icon;
    }

    /**
     * Set notice icon.
     *
     * @param string $notice_icon Notice icon.
     *
     * @return NoticeField
     */
    public function set_icon( string $notice_icon ): NoticeField {
        $this->notice_icon = $notice_icon;

        return $this;
    }

    /**
     * Get notice title.
     *
     * @return string
     */
    public function get_title(): string {
        return $this->notice_title;
    }

    /**
     * Set notice title.
     *
     * @param string $notice_title Notice title.
     *
     * @return NoticeField
     */
    public function set_title( string $notice_title ): NoticeField {
        $this->notice_title = $notice_title;

        return $this;
    }

    /**
     * Get notice description.
     *
     * @return string
     */
    public function get_description(): string {
        return $this->notice_description;
    }

    /**
     * Set notice description.
     *
     * @param string $notice_description Notice description.
     *
     * @return NoticeField
     */
    public function set_description( string $notice_description ): NoticeField {
        $this->notice_description = $notice_description;

        return $this;
    }

    /**
     * Get link title.
     *
     * @return string
     */
    public function get_link_title(): string {
        return $this->link_title;
    }

    /**
     * Set link title.
     *
     * @param string $link_title Link title.
     *
     * @return NoticeField
     */
    public function set_link_title( string $link_title ): NoticeField {
        $this->link_title = $link_title;

        return $this;
    }

    /**
     * Get link URL.
     *
     * @return string
     */
    public function get_url(): string {
        return $this->link_url;
    }

    /**
     * Set link URL.
     *
     * @param string $link_url Link URL.
     *
     * @return NoticeField
     */
    public function set_url( string $link_url ): NoticeField {
        $this->link_url = $link_url;

        return $this;
    }

    /**
     * Get link icon.
     *
     * @return string
     */
    public function get_link_icon(): string {
        return $this->link_icon;
    }

    /**
     * Set link icon.
     *
     * @param string $link_icon Link icon.
     *
     * @return NoticeField
     */
    public function set_link_icon( string $link_icon ): NoticeField {
        $this->link_icon = $link_icon;

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
        return true;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();
        $data['notice_type']        = $this->get_notice_type();
        $data['notice_icon']        = $this->get_icon();
        $data['notice_title']       = $this->get_title();
        $data['notice_description'] = $this->get_description();
        $data['link_title']         = $this->get_link_title();
        $data['link_url']           = $this->get_url();
        $data['link_icon']          = $this->get_link_icon();
        $data['active_tab']         = $this->get_active_tab();

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
        return $data;
    }
}
