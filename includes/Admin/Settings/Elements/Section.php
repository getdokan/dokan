<?php

namespace WeDevs\Dokan\Admin\Settings\Elements;

use WeDevs\Dokan\Abstracts\SettingsElement;

/**
 * Section Class.
 */
class Section extends SettingsElement {

	/**
	 * Settings Element type.
	 *
	 * @var string $type Settings Element type.
	 */
	protected $type = 'section';

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
     * Populate The subpage data.
     *
     * @return array
     */
    public function populate(): array {
        $data             = parent::populate();
        $data['doc_link'] = esc_url( $this->get_doc_link() );

        return apply_filters( 'dokan_settings_section_data', $data, $this );
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
