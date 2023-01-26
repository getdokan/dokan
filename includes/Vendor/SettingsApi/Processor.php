<?php

namespace WeDevs\Dokan\Vendor\SettingsApi;

use Exception;
use WeDevs\Dokan\Vendor\Vendor;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Dokan Vendor Settings API Processor.
 *
 * @since 3.7.10
 */
class Processor {

    /**
     * The Vendor Of the Settings.
     *
     * @since 3.7.10
     *
     * @var Vendor
     */
    protected $vendor;

    /**
     * Constructor.
     *
     * @param int $vendor Vendor ID.
     *
     * @return void
     */
    public function __construct( $vendor = 0 ) {
        if ( empty( $vendor ) ) {
            $vendor = dokan()->vendor->get( get_current_user_id() );
        } else {
            $vendor = dokan()->vendor->get( $vendor );
        }

        $this->vendor = $vendor;
    }

    /**
     * Get main Settings page list.
     *
     * @since 3.7.10
     *
     * @return array
     */
    public function get_settings_page_list() {
        return array_map(
            [ $this, 'populate_settings_links_value' ],
            apply_filters( 'dokan_vendor_rest_settings_page_list', [] )
        );
    }

    /**
     * Get settings Group or page.
     *
     * @param string $group_id Group or page ID.
     *
     * @return array|WP_Error
     */
    public function get_settings_group( string $group_id ) {
        $group_exist = $this->search_group( $group_id );

        if ( is_wp_error( $group_exist ) ) {
            return $group_exist;
        }

        $settings = apply_filters( 'dokan_vendor_rest_settings_for' . $group_id . '_page', [] );

        return array_map( [ $this, 'populate_settings_elements' ], $settings );
    }

    /**
     * Get A single Settings Element.
     *
     * @since 3.7.10
     *
     * @param string $group_id Group or page key.
     * @param string $id Settings Element id.
     *
     * @return array|WP_Error
     */
    public function get_single_settings( string $group_id, string $id ) {
        $group_exist = $this->search_group( $group_id );

        if ( is_wp_error( $group_exist ) ) {
            return $group_exist;
        }

        return $this->search_single_settings( $group_id, $id );
    }

    /**
     * Get Single Settings Fiend from a settings Section.
     *
     * @since 3.7.10
     *
     * @param string $group_id Group or page key.
     * @param string $parent_id Settings Element ID.
     * @param string $id Settings Element Field ID.
     *
     * @return array|WP_Error
     */
    public function get_single_settings_field( string $group_id, string $parent_id, string $id ) {
        $single_settings = $this->get_single_settings( $group_id, $parent_id );

        if ( is_wp_error( $single_settings  ) ) {
            return $single_settings;
        }

        $error = new WP_Error( 'dokan_rest_setting_option_not_found', __( 'Setting Option not found', 'dokan-lite' ), [ 'status' => 404 ] );

        if ( ! isset( $single_settings['fields'] ) ) {
            return $error;
        }

        $single_fields_array_position_in_settings_array = array_search( $id, array_column( $single_settings['fields'], 'id' ), true );

        if ( false === $single_fields_array_position_in_settings_array ) {
            return $error;
        }

        return $single_settings['fields'][ $single_fields_array_position_in_settings_array ];
    }

    /**
     * Populate settings link section.
     *
     * @param array $settings Settings array.
     *
     * @return array
     */
    public function populate_settings_links_value( $settings ) {
        $rest_base = 'settings';
        $namespace = 'dokan/v2';
        $settings['_links'] = [
            'options' => [
                'href' => rest_url( sprintf( '%s/%s/%s', $namespace, $rest_base, $settings['id'] ) ),
            ],
            'collection' => [
                'href' => rest_url( sprintf( '%s/%s', $namespace, $rest_base ) ),
            ],
            'self' => [
                'href' => rest_url( sprintf( '%s/%s/%s', $namespace, $rest_base, $settings['id'] ) ),
            ],
        ];

        return $settings;
    }

    /**
     * Populate settings link section.
     *
     * @param array $settings Settings Element.
     *
     * @return array
     */
    public function populate_single_settings_links_value( $settings ) {
        $rest_base = 'settings';
        $namespace = 'dokan/v2';
        $settings['_links'] = [
            'self' => [
                'href' => rest_url( sprintf( '%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'] ) ),
            ],
            'collection' => [
                'href' => rest_url( sprintf( '%s/%s/%s', $namespace, $rest_base, $settings['parent_id'] ) ),
            ],
        ];
        if ( 'section' === $settings['type'] ) {
            $settings['_links']['options'] = [
                'href' => rest_url( sprintf( '%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'] ) ),
            ];

            foreach ( $settings['fields'] as $key => $field ) {
                $settings['fields'][ $key ]['_links'] = [
                    'self' => [
                        'href' => rest_url( sprintf( '%s/%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'], $field['id'] ) ),
                    ],
                    'collection' => [
                        'href' => rest_url( sprintf( '%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'] ) ),
                    ],
                ];
            }
        }

        return $settings;
    }

    /**
     * Populate value and active state for every payment fields.
     *
     * @param array $settings Single settings field.
     *
     * @return array
     */
    public function populate_settings_elements( $settings ) {
        if ( 'tab' === $settings['type'] || 'card' === $settings['type'] ) {
            return $settings;
        }

        $settings_values = $this->vendor->get_shop_info();
        if ( 'store' !== $settings['parent_id'] ) {
            $settings_values = $settings_values[ $settings['parent_id'] ];
        }

        if ( isset( $settings_values[ $settings['id'] ] ) ) {
            $settings['value'] = $settings_values[ $settings['id'] ];

            if ( 'section' === $settings['type'] ) {
                foreach ( $settings['fields'] as $key => $field ) {
                    $field_value = isset( $settings['value'][ $field['id'] ] ) ? $settings['value'][ $field['id'] ] : null;
                    $settings['fields'][ $key ]['value'] = $field_value;

                    if ( 'image' === $field['type'] ) {
                        $settings['fields'][ $key ]['url'] = ! empty( $field_value ) ? wp_get_attachment_url( $field_value ) : false;
                    }
                    unset( $field_value );
                }
            }
        } else {
            $settings['value'] = null;
        }

        if ( $settings['type'] === 'image' ) {
            $settings['url'] = ! empty( $settings['value'] ) ? wp_get_attachment_url( $settings['value'] ) : false;
        }

        return apply_filters( 'dokan_vendor_rest_settings_element_value_population', $this->populate_single_settings_links_value( $settings ), $settings_values, $settings['parent_id'] );
    }

    /**
     * Format and validate Settings Elements.
     *
     * @param string $settings_group_id Settings elements group ID.
     * @param array  $settings_values Settings elements.
     *
     * @return array
     * @throws Exception If settings is not found.
     */
    public function format_settings_elements_for_saving( string $settings_group_id, array $settings_values ) {
        $formatted_settings = [];
        foreach ( $settings_values as $settings ) {
            if ( ! isset( $settings['id'] ) || ! isset( $settings['value'] ) ) {
                continue;
            }
            $single_settings_id = $settings['id'];
            $fields_values      = $settings['value'];
            $settings_element   = $this->get_single_settings( $settings_group_id, $single_settings_id );

            if ( is_wp_error( $settings_element ) ) {
                throw new Exception( __( 'Settings Element not found', 'dokan-lite' ) );
            }

            if ( ! isset( $settings_element['type'] ) || ( 'tab' === $settings_element['type'] || 'card' === $settings_element['type'] ) ) {
                continue;
            }

            if ( 'section' === $settings_element['type']  ) {
                foreach ( $fields_values as $field_id => $value ) {
                    $settings_element_fields = $this->get_single_settings_field( $settings_group_id, $single_settings_id, $field_id );

                    if ( is_wp_error( $settings_element_fields ) ) {
                        throw new Exception( __( 'Settings Element Fields not found', 'dokan-lite' ) );
                    }

                    // TODO: sanitize, validate, and format settings field values.
                    $fields_values[ $field_id ] = $value;
                }
            }

            $formatted_settings[ $single_settings_id ] = $fields_values;
        }
        return $formatted_settings;
    }

    /**
     * Save settings group value.
     *
     * @since 3.7.10
     *
     * @param array $settings Settings to save.
     * @param string $group_id Settings group ID.
     *
     * @return array|WP_Error
     */
    public function save_settings_group( array $settings, string $group_id ) {
        $settings_page_found = $this->search_group( $group_id );

        if ( is_wp_error( $settings_page_found ) ) {
            return $settings_page_found;
        }

        $settings_data_array = [];

        try {
            $processed_settings_array = $this->format_settings_elements_for_saving( $group_id, $settings );
        } catch ( Exception $e ) {
            return new WP_Error( $e->getCode(), $e->getMessage() );
        }

        if ( 'store' === $group_id ) {
            $settings_data_array = $processed_settings_array;
        } else {
            $settings_data_array[ $group_id ] = $processed_settings_array;
        }

        $settings_updated = dokan()->vendor->update( $this->vendor->get_id(), $settings_data_array );

        if ( is_wp_error( $settings_updated ) ) {
            return $settings_updated;
        }

        // Some time the settings have not been updated. That's why we are force populating the settings.
        $this->vendor->popluate_store_data();

        do_action( 'dokan_rest_' . $group_id . '_settings_after_update', $this->vendor, $settings );

        return $this->get_settings_group( $group_id );
    }

    /**
     * Save settings child value.
     *
     * @param string $group_id Group identifier.
     * @param string $id Settings elements identifier.
     * @param mixed $value Settings elements value to save.
     *
     * @return array|WP_Error
     */
    public function save_single_settings( string $group_id, string $id, $value ) {
        $formatted_settings_element = [
            [
                'id'    => $id,
                'value' => $value,
            ],
        ];

        $settings_saved = $this->save_settings_group( $formatted_settings_element, $group_id );

        if ( is_wp_error( $settings_saved ) ) {
            return $settings_saved;
        }

        return $this->get_single_settings( $group_id, $id );
    }

    /**
     * Save settings child value.
     *
     * @param string $group_id Group identifier.
     * @param string $settings_id Settings identifier.
     * @param string $field_id Field identifier.
     * @param mixed $value Value to save.
     *
     * @return array|WP_Error
     */
    public function save_single_settings_field( string $group_id, string $settings_id, string $field_id, $value ) {
        $formatted_value = [ $field_id => $value ];
        $field_updated = $this->save_single_settings( $group_id, $settings_id, $formatted_value );

        if ( is_wp_error( $field_updated ) ) {
            return $field_updated;
        }

        return $this->get_single_settings_field( $group_id, $settings_id, $field_id );
    }

    /**
     * Search Group by Group or page key.
     *
     * @since 3.7.10
     *
     * @param string $group_id Group or page key.
     *
     * @return bool|WP_Error
     */
    protected function search_group( string $group_id ) {
        $found = in_array( $group_id, array_column( $this->get_settings_page_list(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return true;
    }

    /**
     * Search Single Settings.
     *
     * @since 3.7.10
     *
     * @param string $group_id Group or page key.
     * @param string $id Settings Element id.
     *
     * @return mixed|WP_Error
     */
    protected function search_single_settings( string $group_id, string $id ) {
        $settings = $this->get_settings_group( $group_id );

        if ( is_wp_error( $settings ) ) {
            return $settings;
        }

        $single_settings_array_position = array_search( $id, array_column( $settings, 'id' ), true );

        if ( false === $single_settings_array_position ) {
            return new WP_Error( 'dokan_rest_setting_option_not_found', __( 'Setting Option not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $settings[ $single_settings_array_position ];
    }
}
