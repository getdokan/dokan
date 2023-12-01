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
        $data = [
            'name'            => '', // html name attribute of the field, if not exists id value will be used as name
            'property'        => '', // if exists, this will be the name of the field
            'section'         => '', // section id, required
            'field_type'      => '', // html field type
            'placeholder'     => '', // html placeholder attribute value for the field
            'options'         => '', // if the field is select, radio, checkbox, etc
            'additional_properties' => [], // additional arguments for the field
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
     * Set field name, validated by @since DOKAN_SINCE
     *
     * @param string $name
     *
     * @see sanitize_title()
     *
     * @return $this
     */
    public function set_name( string $name ): Field {
        $this->data['name'] = sanitize_title( $name );

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
     * Set field property, validated by
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
     * Set field placeholder, validated with
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
}
