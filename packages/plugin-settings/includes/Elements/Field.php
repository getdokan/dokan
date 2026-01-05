<?php

namespace WeDevs\PluginSettings\Elements;

use WeDevs\PluginSettings\Abstracts\SettingsElement;
use WeDevs\PluginSettings\Elements\Fields\Text;
use WeDevs\PluginSettings\Elements\Fields\Number;
use WeDevs\PluginSettings\Elements\Fields\Select;
use WeDevs\PluginSettings\Elements\Fields\Switcher;
use WeDevs\PluginSettings\Elements\Fields\Checkbox;
use WeDevs\PluginSettings\Elements\Fields\Radio;
use WeDevs\PluginSettings\Elements\Fields\TextArea;
use WeDevs\PluginSettings\Elements\Fields\Password;

/**
 * Field Element Class.
 *
 * Factory for creating field inputs.
 *
 * @since 1.0.0
 */
class Field extends SettingsElement {

    /**
     * Is children Supported.
     *
     * @var bool
     */
    protected bool $support_children = false;

    /**
     * The Input Element Type.
     *
     * @var string
     */
    protected string $input_type = 'text';

    /**
     * The Settings Element Type.
     *
     * @var string
     */
    protected string $type = 'field';

    /**
     * Map for the Input type.
     *
     * @var array<string, string>
     */
    protected array $field_map = [
        'text'     => Text::class,
        'number'   => Number::class,
        'select'   => Select::class,
        'switch'   => Switcher::class,
        'checkbox' => Checkbox::class,
        'radio'    => Radio::class,
        'textarea' => TextArea::class,
        'password' => Password::class,
    ];

    /**
     * Constructor.
     *
     * @param string $id         Field ID.
     * @param string $input_type Input type.
     */
    public function __construct( string $id, string $input_type = 'text' ) {
        parent::__construct( $id );
        $this->input_type = $input_type;
    }

    /**
     * Get the Input element.
     *
     * @return SettingsElement
     */
    public function get_input(): SettingsElement {
        /**
         * Filters the field type map.
         *
         * @since 1.0.0
         *
         * @param array  $field_map  Field type to class map.
         * @param string $input_type Current input type.
         */
        $field_map = apply_filters( 'settings_framework_field_map', $this->field_map, $this->input_type );

        if ( isset( $field_map[ $this->input_type ] ) ) {
            return new $field_map[ $this->input_type ]( $this->id );
        }

        // Default to Text field.
        return new Text( $this->id );
    }

    /**
     * Register a custom field type.
     *
     * @param string $type       Field type identifier.
     * @param string $class_name Fully qualified class name.
     *
     * @return void
     */
    public static function register_field_type( string $type, string $class_name ): void {
        add_filter(
            'settings_framework_field_map',
            function ( $field_map ) use ( $type, $class_name ) {
                $field_map[ $type ] = $class_name;
                return $field_map;
            }
        );
    }

    /**
     * Data Validation condition.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return true;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return mixed
     */
    public function sanitize_element( $data ) {
        return $data;
    }

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for escaping.
     *
     * @return mixed
     */
    public function escape_element( $data ) {
        return $data;
    }
}

