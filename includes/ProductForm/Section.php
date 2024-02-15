<?php

namespace WeDevs\Dokan\ProductForm;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Product Form Section
 *
 * @since DOKAN_SINCE
 */
class Section extends Component {

    /**
     * Section constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param string $id
     * @param array  $args
     *
     * @throws \Exception
     *
     * @return void
     */
    public function __construct( string $id, array $args = [] ) {
        $data       = [
            'type'         => 'default', // field type, accept value can be 'default', 'custom'
            'fields'       => [],
            'product_type' => '',
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
     * Get fields of the section
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\ProductForm\Field[]
     */
    public function get_fields(): array {
        // initialize fields
        $this->init_fields();

        return $this->data['fields'];
    }

    /**
     * Add field to the section
     *
     * @since DOKAN_SINCE
     *
     * @param string $id
     * @param array  $args
     *
     * @return void
     */
    public function add_field( string $id, array $args ) {
        // set section id manually
        $args['section'] = $this->get_id();

        // todo: handle error
        Factory::add_field( $id, $args );
    }

    /**
     * Returns registered field based on given field id.
     *
     * @param string $id Field id.
     *
     * @return Field|WP_Error New field or WP_Error.
     */
    public function get_field( string $id ) {
        return Factory::get_field( $id );
    }

    /**
     * Initialize fields
     *
     * @since DOKAN_SINCE
     *
     * @return $this
     */
    private function init_fields() {
        $this->data['fields'] = [];
        foreach ( Factory::instance()->get_fields() as $field ) {
            if ( $field->get_section() === $this->get_id() ) {
                $this->data['fields'][ $field->get_id() ] = $field;
            }
        }

        return $this;
    }

    /**
     * Get type of the current field.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_type(): string {
        return $this->data['type'];
    }

    /**
     * Set field type.
     *
     * @since DOKAN_SINCE
     *
     * @param string $type
     *
     * @return $this
     */
    public function set_type( string $type ): Section {
        $this->data['type'] = in_array( $type, [ 'default', 'custom' ], true ) ? sanitize_key( $type ) : 'other';

        return $this;
    }

    /**
     * Get product type for the current section.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_product_type(): string {
        return $this->data['product_type'];
    }

    /**
     * Set product type for the current section.
     *
     * @since DOKAN_SINCE
     *
     * @param string $product_type
     *
     * @return $this
     */
    public function set_product_type( string $product_type ): Section {
        $this->data['product_type'] = ! empty( $product_type ) ? $product_type : '';

        return $this;
    }
}
