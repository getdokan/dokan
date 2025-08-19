<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * CheckboxGroup Field.
 */
class Repeater extends Field {

    /**
     * Default Value.
     *
     * @var array $default Default.
     */
    protected $default = [];

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'repeater';

    /**
     * Options.
     *
     * @var array $options Options.
     */
    protected $options = array();

    /**
     * Create New Title.
     *
     * @var string $new_title
     */
    protected $new_title = '';

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
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
     * @param array $options Options.
     *
     * @return SettingsElement
     */
    public function set_options( array $options ) {
        $this->options = $options;

        return $this;
    }

    /**
     * Get options.
     *
     * @return string
     */
    public function get_new_title(): string {
        return $this->new_title ?? esc_html__( 'Add New Item', 'dokan-lite' );
    }

    /**
     * Set a new title.
     *
     * @param string $new_title.
     *
     * @return SettingsElement
     */
    public function set_new_title( string $new_title ): SettingsElement {
        $this->new_title = $new_title;

        return $this;
    }

    /**
     * Add a repeater option.
     *
     * @param string      $option option to Display.
     * @param string|null $value value for the checkbox option. Default is null.
     *
     * @return Repeater
     */
    public function add_option( string $option, string $value ) {
        $this->options[] = [
            'title' => $option,
            'order' => $value,
        ];

        return $this;
    }

    /**
     * Get Default.
     *
     * @return array
     */
    public function get_default(): array {
        return $this->default;
    }

    /**
     * Set Default.
     *
     * @param array $default_value Default value.
     *
     * @return SettingsElement
     */
    public function set_default( $default_value ): SettingsElement {
        $this->default = $default_value;

        return $this;
    }

    /**
     * Get field value with filtering for empty entries.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_value() {
        $value = parent::get_value();

        if ( ! is_array( $value ) ) {
            return $value;
        }

        // Filter out empty entries.
        $filtered_data = array_filter(
            $value,
            function ( $item ) {
                $id    = $this->sanitize_element( $item['id'] ?? '' );
                $order = $this->sanitize_element( $item['order'] ?? '' );
                $title = $this->sanitize_element( $item['title'] ?? '' );

                return ! empty( $id ) && ! empty( $title ) && ( $order !== '' );
            }
        );

        // Reset array keys to maintain proper indexing.
        return array_values( $filtered_data );
    }

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return isset( $data ) && is_array( $data );
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data              = parent::populate();
        $data['value']     = $this->get_value();
        $data['default']   = $this->get_default();
        $data['options']   = $this->get_options();
        $data['new_title'] = $this->get_new_title();

        return $data;
    }
}
