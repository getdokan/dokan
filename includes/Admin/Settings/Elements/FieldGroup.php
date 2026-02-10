<?php

namespace WeDevs\Dokan\Admin\Settings\Elements;

use WeDevs\Dokan\Abstracts\SettingsElement;

/**
 * Field Group Class.
 */
class FieldGroup extends SettingsElement {

	/**
	 * Settings Element type.
	 *
	 * @var string $type Settings Element type.
	 */
	protected $type = 'fieldgroup';

    /**
     * Content class for layout styling.
     *
     * @var string $content_class Content class.
     */
    protected $content_class = '';

    /**
     * Set content class.
     *
     * @param string $content_class Content class.
     *
     * @return FieldGroup
     */
    public function set_content_class( string $content_class ): FieldGroup {
        $this->content_class = $content_class;

        return $this;
    }

    /**
     * Get content class.
     *
     * @return string
     */
    public function get_content_class(): string {
        return $this->content_class;
    }

    /**
     * Populate data for display.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();

        $data['content_class'] = $this->get_content_class();

        return $data;
    }

    /**
	 * Data validation.
	 *
	 * @param mixed $data Data for validation.
	 *
	 * @return bool
	 */
	public function data_validation( $data ): bool {
		return is_array( $data );
	}

	/**
	 * Sanitize data for storage.
	 *
	 * @param mixed $data Data for sanitization.
	 *
	 * @return array|string
	 */
	public function sanitize_element( $data ) {
		return wp_unslash( $data );
	}

	/**
	 * Escape data for display.
	 *
	 * @param array $data Data for display.
	 *
	 * @return array
	 */
	public function escape_element( $data ): array {
		return $data;
	}
}
