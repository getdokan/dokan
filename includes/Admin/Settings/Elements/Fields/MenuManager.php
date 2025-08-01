<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Field;

/**
 * MenuManager Field.
 *
 * Custom field that provides a React-based menu manager interface
 * for managing dashboard menu items and their properties.
 */
class MenuManager extends Field {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'menu_manager';

    /**
     * API endpoint for menu data.
     *
     * @var string $api_endpoint API endpoint.
     */
    protected $api_endpoint = '';

    /**
     * Constructor.
     *
     * @param string $id ID of the input field.
     */
    public function __construct( string $id ) {
        $this->id = $id;
        $this->api_endpoint = rest_url( 'dokan/v1/admin/menu-manager' );
    }

    /**
     * Get input type.
     *
     * @return string
     */
    public function get_input_type(): string {
        return $this->input_type;
    }

    /**
     * Get API endpoint.
     *
     * @return string
     */
    public function get_api_endpoint(): string {
        return $this->api_endpoint;
    }

    /**
     * Set API endpoint.
     *
     * @param string $endpoint API endpoint URL.
     *
     * @return MenuManager
     */
    public function set_api_endpoint( string $endpoint ): MenuManager {
        $this->api_endpoint = $endpoint;
        return $this;
    }

    /**
     * Get default value.
     *
     * @return array
     */
    public function get_default(): array {
        return array(
            'left_menus' => array(),
            'settings_sub_menu' => array(),
        );
    }

    /**
     * Set default value.
     *
     * @param mixed $default_value Default menu data.
     *
     * @return SettingsElement
     */
    public function set_default( $default_value ): SettingsElement {
        // Convert string or other types to proper array format
        if ( is_array( $default_value ) ) {
            $this->default = $default_value;
        } else {
            // If not an array, use the default structure
            $this->default = $this->get_default();
        }
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
        if ( ! is_array( $data ) ) {
            return false;
        }

        // Check if required keys exist
        if ( ! isset( $data['left_menus'] ) || ! isset( $data['settings_sub_menu'] ) ) {
            return false;
        }

        // Validate that both are arrays
        if ( ! is_array( $data['left_menus'] ) || ! is_array( $data['settings_sub_menu'] ) ) {
            return false;
        }

        // Validate menu item structure
        foreach ( $data['left_menus'] as $menu_key => $menu_item ) {
            if ( ! $this->validate_menu_item( $menu_item ) ) {
                return false;
            }
        }

        foreach ( $data['settings_sub_menu'] as $menu_key => $menu_item ) {
            if ( ! $this->validate_menu_item( $menu_item ) ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate individual menu item structure.
     *
     * @param array $menu_item Menu item data.
     *
     * @return bool
     */
    private function validate_menu_item( $menu_item ): bool {
        if ( ! is_array( $menu_item ) ) {
            return false;
        }

        // Required fields
        $required_fields = array(
            'title',
            'url',
            'pos',
            'is_switched_on',
            'menu_manager_position',
            'menu_manager_title',
        );

        foreach ( $required_fields as $field ) {
            if ( ! isset( $menu_item[ $field ] ) ) {
                return false;
            }
        }

        // Validate data types
        if ( ! is_string( $menu_item['title'] ) ||
            ! is_string( $menu_item['url'] ) ||
            ! is_string( $menu_item['menu_manager_title'] ) ) {
            return false;
        }

        if ( ! is_bool( $menu_item['is_switched_on'] ) ) {
            return false;
        }

        if ( ! is_numeric( $menu_item['pos'] ) ||
            ! is_numeric( $menu_item['menu_manager_position'] ) ) {
            return false;
        }

        return true;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return array
     */
    public function sanitize_element( $data ) {
        if ( ! is_array( $data ) ) {
            return $this->get_default();
        }

        $sanitized = array(
            'left_menus' => array(),
            'settings_sub_menu' => array(),
        );

        // Sanitize left menus
        if ( isset( $data['left_menus'] ) && is_array( $data['left_menus'] ) ) {
            foreach ( $data['left_menus'] as $key => $menu_item ) {
                $sanitized['left_menus'][ sanitize_key( $key ) ] = $this->sanitize_menu_item( $menu_item );
            }
        }

        // Sanitize settings sub menu
        if ( isset( $data['settings_sub_menu'] ) && is_array( $data['settings_sub_menu'] ) ) {
            foreach ( $data['settings_sub_menu'] as $key => $menu_item ) {
                $sanitized['settings_sub_menu'][ sanitize_key( $key ) ] = $this->sanitize_menu_item( $menu_item );
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize individual menu item.
     *
     * @param array $menu_item Menu item data.
     *
     * @return array
     */
    private function sanitize_menu_item( $menu_item ): array {
        if ( ! is_array( $menu_item ) ) {
            return array();
        }

        $sanitized = array();

        // Sanitize string fields
        $string_fields = array( 'title', 'url', 'menu_manager_title', 'icon', 'permission', 'react_route' );
        foreach ( $string_fields as $field ) {
            if ( isset( $menu_item[ $field ] ) ) {
                $sanitized[ $field ] = sanitize_text_field( $menu_item[ $field ] );
            }
        }

        // Sanitize numeric fields
        $numeric_fields = array( 'pos', 'menu_manager_position', 'static_pos', 'counts' );
        foreach ( $numeric_fields as $field ) {
            if ( isset( $menu_item[ $field ] ) ) {
                $sanitized[ $field ] = intval( $menu_item[ $field ] );
            }
        }

        // Sanitize boolean fields
        $boolean_fields = array( 'is_switched_on', 'is_sortable', 'editable', 'switchable' );
        foreach ( $boolean_fields as $field ) {
            if ( isset( $menu_item[ $field ] ) ) {
                $sanitized[ $field ] = (bool) $menu_item[ $field ];
            }
        }

        // Handle submenu if present
        if ( isset( $menu_item['submenu'] ) && is_array( $menu_item['submenu'] ) ) {
            $sanitized['submenu'] = array();
            foreach ( $menu_item['submenu'] as $sub_key => $sub_item ) {
                $sanitized['submenu'][ sanitize_key( $sub_key ) ] = $this->sanitize_menu_item( $sub_item );
            }
        }

        return $sanitized;
    }

    /**
     * Escape data for display.
     *
     * @param mixed $data Data for display.
     *
     * @return array
     */
    public function escape_element( $data ) {
        if ( ! is_array( $data ) ) {
            return $this->get_default();
        }

        $escaped = array(
            'left_menus' => array(),
            'settings_sub_menu' => array(),
        );

        // Escape left menus
        if ( isset( $data['left_menus'] ) && is_array( $data['left_menus'] ) ) {
            foreach ( $data['left_menus'] as $key => $menu_item ) {
                $escaped['left_menus'][ esc_attr( $key ) ] = $this->escape_menu_item( $menu_item );
            }
        }

        // Escape settings sub menu
        if ( isset( $data['settings_sub_menu'] ) && is_array( $data['settings_sub_menu'] ) ) {
            foreach ( $data['settings_sub_menu'] as $key => $menu_item ) {
                $escaped['settings_sub_menu'][ esc_attr( $key ) ] = $this->escape_menu_item( $menu_item );
            }
        }

        return $escaped;
    }

    /**
     * Escape individual menu item.
     *
     * @param array $menu_item Menu item data.
     *
     * @return array
     */
    private function escape_menu_item( $menu_item ): array {
        if ( ! is_array( $menu_item ) ) {
            return array();
        }

        $escaped = array();

        // Escape string fields
        $string_fields = array( 'title', 'url', 'menu_manager_title', 'permission', 'react_route' );
        foreach ( $string_fields as $field ) {
            if ( isset( $menu_item[ $field ] ) ) {
                $escaped[ $field ] = esc_attr( $menu_item[ $field ] );
            }
        }

        // Icon field needs special handling (contains HTML)
        if ( isset( $menu_item['icon'] ) ) {
            $escaped['icon'] = wp_kses(
                $menu_item['icon'], array(
					'i' => array(
						'class' => array(),
						'aria-hidden' => array(),
					),
                )
            );
        }

        // Numeric and boolean fields don't need escaping, just pass through
        $safe_fields = array( 'pos', 'menu_manager_position', 'static_pos', 'counts', 'is_switched_on', 'is_sortable', 'editable', 'switchable' );
        foreach ( $safe_fields as $field ) {
            if ( isset( $menu_item[ $field ] ) ) {
                $escaped[ $field ] = $menu_item[ $field ];
            }
        }

        // Handle submenu if present
        if ( isset( $menu_item['submenu'] ) && is_array( $menu_item['submenu'] ) ) {
            $escaped['submenu'] = array();
            foreach ( $menu_item['submenu'] as $sub_key => $sub_item ) {
                $escaped['submenu'][ esc_attr( $sub_key ) ] = $this->escape_menu_item( $sub_item );
            }
        }

        return $escaped;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();
        $data['default'] = $this->get_default();
        $data['api_endpoint'] = $this->get_api_endpoint();
        $data['value'] = $this->escape_element( $this->get_value() );

        return $data;
    }
}
