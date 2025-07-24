<?php

namespace WeDevs\Dokan\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

/**
 * Class to register our custom field in the general settings page
 *
 * @since 4.0.3
 */
class DokanDoubleTextFieldSettings {

    /**
     * Constructor
     *
     * @since 4.0.3
     */
    public function __construct() {
        add_filter( 'dokan_settings_general_site_options', [ $this, 'add_double_text_field' ], 250 );
    }

    /**
     * Add double text field to general settings page
     *
     * @since 4.0.3
     *
     * @param array $fields
     *
     * @return array
     */
    public function add_double_text_field( $fields ) {
        // Add our double text field
        $fields[] = ElementFactory::double_text_field( 'dokan_double_text_field_example' )
                                    ->set_label( __( 'Double Text Field Example', 'dokan-lite' ) )
                                    ->set_tooltip( __( 'This is an example of a double text field.', 'dokan-lite' ) )
                                    ->set_first_label( __( 'First Value', 'dokan-lite' ) )
                                    ->set_first_value( 'Example First Value' )
                                    ->set_second_label( __( 'Second Value', 'dokan-lite' ) )
                                    ->set_second_value( 'Example Second Value' );

        return $fields;
    }
}

// Initialize the class
new DokanDoubleTextFieldSettings();
