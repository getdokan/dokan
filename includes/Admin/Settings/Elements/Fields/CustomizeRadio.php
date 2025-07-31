<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use InvalidArgumentException;

/**
 * CustomizeRadio Field.
 *
 * Enhanced radio field with support for multiple variants and rich content options.
 */
class CustomizeRadio extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'customize_radio';

    /**
     * Variant type for the radio display.
     *
     * @var string $variant Variant type (simple, card, template).
     */
    protected $variant = 'simple';

    /**
     * Additional CSS classes.
     *
     * @var string $css_class Additional CSS classes.
     */
    protected $css_class = '';

    /**
     * Whether the field is disabled.
     *
     * @var bool $disabled Whether the field is disabled.
     */
    protected $disabled = false;

    /**
     * Grid configuration for layout.
     *
     * @var array $grid_config Grid configuration.
     */
    protected $grid_config = [];

    /**
     * Get variant.
     *
     * @return string
     */
    public function get_variant(): string {
        return $this->variant;
    }
    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }
    /**
     * Set variant.
     *
     * @param string $variant Variant type (simple, card, template).
     *
     * @return CustomizeRadio
     */
    public function set_variant( string $variant ): CustomizeRadio {
        $this->variant = $variant;

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
     * @param string $css_class Additional CSS classes.
     *
     * @return CustomizeRadio
     */
    public function set_css_class( string $css_class ): CustomizeRadio {
        $this->css_class = $css_class;

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
     * Set the field as disabled.
     *
     * @param bool $disabled Whether the field is disabled.
     *
     * @return CustomizeRadio
     */
    public function set_disabled( bool $disabled ): CustomizeRadio {
        $this->disabled = $disabled;

        return $this;
    }

    /**
     * Get grid configuration.
     *
     * @return array
     */
    public function get_grid_config(): array {
        return $this->grid_config;
    }

    /**
     * Set grid configuration.
     *
     * @param array $grid_config Grid configuration.
     *
     * @return CustomizeRadio
     */
    public function set_grid_config( array $grid_config ): CustomizeRadio {
        $this->grid_config = $grid_config;

        return $this;
    }

    /**
     * Add enhanced option with extended properties.
     *
     * @param array $option Option properties array with these keys:
     *                      - title (string) Required: Option title
     *                      - value (string) Required: Option value
     *                      - description (string) Optional: Option description
     *                      - icon (string) Optional: Option icon HTML
     *                      - image (string) Optional: Option image URL
     *                      - preview (boolean) Optional: Option preview HTML
     *
     * @throws \InvalidArgumentException If required fields are missing
     * @return CustomizeRadio
     */
    public function add_enhanced_option( array $option ): CustomizeRadio {
        // Check required fields
        if ( ! isset( $option['title'] ) || ! isset( $option['value'] ) ) {
            throw new InvalidArgumentException( 'Option array must contain "title" and "value" keys' );
        }

        // Create basic option array
        $option_data = [
            'title' => $option['title'],
            'value' => $option['value'],
        ];

        // Add optional fields if they exist
        $optional_fields = [ 'description', 'icon', 'image', 'preview' ];
        foreach ( $optional_fields as $field ) {
            if ( isset( $option[ $field ] ) ) {
                $option_data[ $field ] = $option[ $field ];
            }
        }

        $this->options[] = $option_data;

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
        return isset( $data ) && ! is_array( $data );
    }

    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        return esc_attr( $data );
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                = parent::populate();
        $data['radio_variant']     = $this->get_variant();
        $data['css_class']   = $this->get_css_class();
        $data['disabled']    = $this->is_disabled();
        $data['grid_config'] = $this->get_grid_config();

        return $data;
    }
}
