<?php

namespace WeDevs\Dokan\ProductForm;

defined( 'ABSPATH' ) || exit;

/**
 * Product Form Field
 *
 * @since DOKAN_SINCE
 */
class Field extends Component {

    /**
     * Required field attributes
     *
     * @since DOKAN_SINCE
     *
     * @var array $required_attributes
     */
    protected $required_fields = [
        'id',
        'title',
        'section',
        'type',
    ];

    /**
     * Class constructor
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @throws \Exception
     */
    public function __construct( string $id, array $args = [] ) {
        $data       = [
            'name'                  => '', // html name attribute of the field, if not exists id value will be used as name
            'value'                 => '', // html value attribute of the field
            'property'              => '', // if exists, this will be the name of the field
            'section'               => '', // section id, required
            'type'                  => 'prop', // field type, accept value can be 'prop', 'meta' or 'other', 'custom'
            'field_type'            => '', // html field type
            'placeholder'           => '', // html placeholder attribute value for the field
            'options'               => [], // if the field is select, radio, checkbox, etc
            'additional_properties' => [], // additional arguments for the field
            'sanitize_callback'     => '', // callback function for sanitizing the field value
            'value_callback'    => '', // callback function to get field value via a callback
        ];
        $this->data = array_merge( $this->data, $data );

        // set id from the args
        $this->set_id( $id );

        // call parent constructor
        parent::__construct( $id, $args );

        // check if the required attributes are exists
        $missing_arguments = self::get_missing_arguments( $this->data );
        if ( count( $missing_arguments ) > 0 ) {
            throw new \Exception(
                sprintf(
                /* translators: 1: Missing arguments list. */
                    esc_html__( 'You are missing required arguments of Dokan ProductForm Field: %1$s', 'dokan-lite' ),
                    esc_attr( join( ', ', $missing_arguments ) )
                )
            );
        }
    }

    /**
     * Get field name
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_name(): string {
        return $this->data['name'];
    }

    /**
     * Set field name, validated by sanitize_text_field()
     *
     * @since DOKAN_SINCE
     *
     * @param string $name
     *
     * @see   sanitize_text_field()
     *
     * @return $this
     */
    public function set_name( string $name ): Field {
        $this->data['name'] = sanitize_text_field( $name );

        return $this;
    }
    /**
     * Get callable function to get field value
     *
     * @since DOKAN_SINCE
     *
     * @return callable|string
     */
    public function get_value_callback() {
        return $this->data['value_callback'];
    }

    /**
     * Set callable function to get field value
     *
     * @since DOKAN_SINCE
     *
     * @param callable|string $method
     *
     * @return $this
     */
    public function set_value_callback( $method ): Field {
        $this->data['value_callback'] = $method;

        return $this;
    }

    /**
     * Get field value
     *
     * @since DOKAN_SINCE
     *
     * @return mixed
     */
    public function get_value( ...$value ) {
        // if value is set under the field, return that value
        if ( '' !== $this->data['value'] || empty( $value ) ) {
            return $this->data['value'];
        }

        $callback = $this->get_value_callback();
        if ( ! empty( $callback ) && is_callable( $callback ) ) {
            return call_user_func( $callback, ...$value );
        }

        $product = current( $value );
        if ( ! $product instanceof \WC_Product ) {
            return '';
        }

        $field_name = sanitize_key( $this->get_name() );
        if ( 0 === strpos( $field_name, '_' ) ) {
            $field_name = preg_replace( '/_/', '', $field_name, 1 );
        }

        if ( $this->is_prop() ) {
            $method_name = 'get_' . $field_name;
            return $product->{$method_name}();
        } elseif ( $this->is_meta() || $this->is_custom() ) {
            return $product->get_meta( $field_name );
        }

        return $value;
    }

    /**
     * Set field value
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value
     *
     * @return $this
     */
    public function set_value( $value ): Field {
        $this->data['value'] = $value;

        return $this;
    }

    /**
     * Get field property
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_property(): string {
        return $this->data['property'];
    }

    /**
     * Set field property, validated by sanitize_key()
     *
     * @since DOKAN_SINCE
     *
     * @param string $property
     *
     * @see   sanitize_key()
     *
     * @return $this
     */
    public function set_property( string $property ): Field {
        $this->data['property'] = sanitize_key( $property );

        return $this;
    }

    /**
     * Get the field section
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_section(): string {
        return $this->data['section'];
    }

    /**
     * Set field section
     *
     * @since DOKAN_SINCE
     *
     * @param string $section
     *
     * @return $this
     */
    public function set_section( string $section ): Field {
        $this->data['section'] = sanitize_key( $section );

        return $this;
    }

    /**
     * Get type of the current field
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_type(): string {
        return $this->data['type'];
    }

    /**
     * Return if the type is a prop
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_prop(): bool {
        return 'prop' === $this->data['type'];
    }

    /**
     * Return if the type is a meta_data
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_meta(): bool {
        return 'meta' === $this->data['type'];
    }

    /**
     * Return if the type is custom.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_custom(): bool {
        return 'custom' === $this->data['type'];
    }

    /**
     * Return if the type is a date_prop
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_other_type(): bool {
        return 'other' === $this->data['type'];
    }

    /**
     * Set field type
     *
     * @since DOKAN_SINCE
     *
     * @param string $field_type
     *
     * @return $this
     */
    public function set_type( string $type ): Field {
        $this->data['type'] = in_array( $type, [ 'prop', 'meta', 'other', 'custom' ], true ) ? sanitize_key( $type ) : 'other';

        return $this;
    }

    /**
     * Get the field type
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_field_type(): string {
        return $this->data['field_type'];
    }

    /**
     * Set field type
     *
     * @since DOKAN_SINCE
     *
     * @param string $field_type
     *
     * @return $this
     */
    public function set_field_type( string $field_type ): Field {
        // todo: add field type validation
        $this->data['field_type'] = sanitize_key( $field_type );

        return $this;
    }

    /**
     * Get field placeholder
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_placeholder(): string {
        return $this->data['placeholder'];
    }

    /**
     * Set field placeholder, validated with wp_kses_post()
     *
     * @since DOKAN_SINCE
     *
     * @param string $placeholder
     *
     * @see   wp_kses_post()
     *
     * @return $this
     */
    public function set_placeholder( string $placeholder ): Field {
        $this->data['placeholder'] = wp_kses_post( $placeholder );

        return $this;
    }

    /**
     * Get field options
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_options(): array {
        return $this->data['options'];
    }

    /**
     * Set field options
     *
     * @since DOKAN_SINCE
     *
     * @param array $options
     *
     * @return $this
     */
    public function set_options( array $options ): Field {
        $this->data['options'] = $options;

        return $this;
    }

    /**
     * Get field property
     *
     * @since DOKAN_SINCE
     *
     * @param string $property
     *
     * @return string|array
     */
    public function get_additional_properties( string $property = '' ) {
        if ( ! empty( $property ) ) {
            return array_key_exists( $property, $this->data['additional_properties'] ) ? $this->data['additional_properties'][ $property ] : '';
        }

        return $this->data['additional_properties'];
    }

    /**
     * Set additional properties
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $property
     * @param mixed $value
     *
     * @return $this
     */
    public function set_additional_properties( $property, $value = null ): Field {
        if ( ! empty( $property ) && null !== $value ) {
            $this->data['additional_properties'][ $property ] = $value;
        } elseif ( is_array( $property ) ) {
            $this->data['additional_properties'] = $property;
        }

        return $this;
    }

    /**
     * Set field sanitize callback
     *
     * @since DOKAN_SINCE
     *
     * @param callable|string $callback
     *
     * @return void
     */
    public function set_sanitize_callback( $callback ): Field {
        $this->data['sanitize_callback'] = $callback;

        return $this;
    }

    /**
     * Get field sanitize callback
     *
     * @since DOKAN_SINCE
     *
     * @return callable|string
     */
    public function get_sanitize_callback() {
        return $this->data['sanitize_callback'];
    }

    /**
     * Get field sanitize callback
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value
     *
     * @return mixed|\WP_Error
     */
    public function sanitize( ...$value ) {
        $callback = $this->get_sanitize_callback();
        if ( ! empty( $callback ) && is_callable( $callback ) ) {
            return call_user_func( $callback, ...$value );
        }

        $value = current( $value );
        if ( is_string( $value ) ) {
            return wc_clean( $value );
        }

        return $value;
    }

    /**
     * Print required field symbol.
     *
     * @since DOKAN_SINCE
     *
     * @param bool $output
     *
     * @return string|void
     */
    public function print_required_symbol( bool $output = true ) {
        if ( ! $this->is_required() ) {
            return '';
        }

        $symbol = '<span style="color: red; display: inline-block;">*</span>';

        if ( $output ) {
            echo $symbol;
            return;
        }

        return $symbol;
    }
}
