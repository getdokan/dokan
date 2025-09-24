<?php

namespace WeDevs\Dokan\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\TransformerInterface;
use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

class ElementTransformer implements TransformerInterface {
    /**
     * @var array<string, array> $sections
     */
    protected array $sections = [];
    /**
     * @var array<string, array> $fields
     */
    protected array $fields = [];
    /**
     * @inheritDoc
     */
    public function get_target(): string {
        return self::TARGET_ELEMENT;
    }

    /**
     * @inheritDoc
     */
    public function transform( $data ) {
        if ( empty( $this->fields ) ) {
            return [];
        }

        // If data is a string (section key), get fields for that section
        if ( is_string( $data ) && isset( $this->fields[ $data ] ) ) {
            $fields_to_transform = $this->fields[ $data ];
        } elseif ( is_array( $data ) ) {
            // If data is an array, use it directly
            $fields_to_transform = $data;
        } else {
            // Transform all fields
            $fields_to_transform = $this->fields;
        }

        $transformed_elements = [];

        foreach ( $fields_to_transform as $field_id => $field_config ) {
            if ( ! is_array( $field_config ) || ! isset( $field_config['type'] ) ) {
                continue;
            }

            $element = $this->create_element( $field_id, $field_config );
            if ( $element ) {
                $transformed_elements[ $field_id ] = $element;
            }
        }

        return $transformed_elements;
    }

    /**
     * @inheritDoc
     */
    public function set_settings( $data ) {
        if ( ! is_array( $data ) ) {
            throw new \InvalidArgumentException( esc_html__( 'Settings data must be an array.', 'dokan-lite' ) );
        }

        if ( isset( $data['sections'] ) && is_array( $data['sections'] ) ) {
            $this->sections = $data['sections'];
        }

        if ( isset( $data['fields'] ) && is_array( $data['fields'] ) ) {
            $this->fields = $data['fields'];
        }

        return $this;
    }

    /**
     * Create a SettingsElement from field configuration array.
     *
     * @param string $field_id Field ID.
     * @param array  $field_config Field configuration array.
     *
     * @return \WeDevs\Dokan\Abstracts\SettingsElement|null
     */
    private function create_element( string $field_id, array $field_config ) {
        $type = $field_config['type'] ?? 'text';

        // Handle special element types
        switch ( $type ) {
            case 'sub_section':
                $element = ElementFactory::sub_section( $field_id );
                break;
            case 'section':
                $element = ElementFactory::section( $field_id );
                break;
            case 'tab':
                $element = ElementFactory::tab( $field_id );
                break;
            case 'sub_page':
                $element = ElementFactory::sub_page( $field_id );
                break;
            default:
                $mapped_type = $this->map_field_type( $type, $field_config );
                $element = ElementFactory::field( $field_id, $mapped_type );
                break;
        }

        if ( ! $element ) {
            return null;
        }

        // Configure the element with properties from the field config
        $this->configure_element( $element, $field_config );

        return $element;
    }

    /**
     * Map legacy or UI field types to ElementFactory-supported types.
     * Allows 3rd parties to filter the type map.
     *
     * @param string $type
     * @param array  $field_config
     *
     * @return string
     */
    private function map_field_type( string $type, array $field_config ): string {
        $default_map = [
            'switcher' => 'switch',
            // Fallback for some unsupported complex inputs in current UI
            'wpeditor' => 'text',
            'file'     => 'text',
        ];

        $map = apply_filters( 'dokan_settings_element_type_map', $default_map, $type, $field_config );
        if ( is_array( $map ) && isset( $map[ $type ] ) ) {
            return $map[ $type ];
        }

        return $type;
    }

    /**
     * Configure a SettingsElement with properties from field configuration.
     *
     * @param \WeDevs\Dokan\Abstracts\SettingsElement $element Element to configure.
     * @param array                                    $field_config Field configuration array.
     */
    private function configure_element( $element, array $field_config ) {
        // Set title/label
        if ( isset( $field_config['label'] ) ) {
            $element->set_title( $field_config['label'] );
        }

        // Set description
        if ( isset( $field_config['desc'] ) ) {
            $element->set_description( $field_config['desc'] );
        } elseif ( isset( $field_config['description'] ) ) {
            $element->set_description( $field_config['description'] );
        }

        // Set default value
        if ( isset( $field_config['default'] ) ) {
            if ( method_exists( $element, 'set_default' ) ) {
                $element->set_default( $field_config['default'] );
            } else {
                $element->set_value( $field_config['default'] );
            }
        }

        // Set placeholder
        if ( isset( $field_config['placeholder'] ) && method_exists( $element, 'set_placeholder' ) ) {
            $element->set_placeholder( $field_config['placeholder'] );
        }

        // Set options for fields that support them
        if ( isset( $field_config['options'] ) && method_exists( $element, 'set_options' ) ) {
            $options = [];
            foreach ( $field_config['options'] as $value => $title ) {
                $options[] = [
                    'value' => $value,
                    'title' => $title,
                ];
            }
            $element->set_options( $options );
        }

        // Set tooltip as additional description
        if ( isset( $field_config['tooltip'] ) ) {
            $current_desc = $element->get_description();
            $tooltip_desc = $current_desc ? $current_desc . ' ' . $field_config['tooltip'] : $field_config['tooltip'];
            $element->set_description( $tooltip_desc );
        }

        // Set readonly state
        if ( isset( $field_config['readonly'] ) && method_exists( $element, 'set_readonly' ) ) {
            $element->set_readonly( (bool) $field_config['readonly'] );
        }

        // Set disabled state
        if ( isset( $field_config['disabled'] ) && method_exists( $element, 'set_disabled' ) ) {
            $element->set_disabled( (bool) $field_config['disabled'] );
        }

        // Set size
        if ( isset( $field_config['size'] ) && method_exists( $element, 'set_size' ) ) {
            $element->set_size( (int) $field_config['size'] );
        }
    }
}
