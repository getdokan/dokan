<?php

namespace WeDevs\Dokan\ProductForm;

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
        $this->data['fields'] = [];
        $this->data = wp_parse_args( $args, $this->data );

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
     * Initialize fields
     *
     * @since DOKAN_SINCE
     *
     * @return $this
     */
    private function init_fields() {
        $fields = Factory::instance()->get_fields();
        $this->data['fields'] = array_filter(
            $fields,
            function ( Field $field ) {
                return $field->get_section() === $this->get_id();
            }
        );

        return $this;
    }
}
