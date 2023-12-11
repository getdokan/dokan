<?php

namespace WeDevs\Dokan\ProductForm;

defined( 'ABSPATH' ) || exit;

abstract class Component {

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
    ];

    /**
     * Field Data
     *
     * @since DOKAN_SINCE
     *
     * @var array $data
     */
    protected $data = [
        'id'            => '', // html id attribute of the field, required
        'title'         => '', // label for the field
        'description'   => '', // description of the field
        'help_content'  => '', // help content for the field
        'visibility'    => true, // field visibility, if the field is visible under frontend
        'required'      => false, // by default, all fields are not required
        'order'         => 30,
        'error_message' => '',
    ];

    public function __construct( string $id, array $args = [] ) {
        foreach ( $args as $key => $value ) {
            if ( method_exists( $this, "set_{$key}" ) && null !== $value ) {
                $this->{"set_{$key}"}( $value );
            }
        }
    }

    /**
     * Get field id
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_id(): string {
        return $this->data['id'];
    }

    /**
     * Set Field ID
     *
     * @since DOKAN_SINCE
     *
     * @param string $id
     *
     * @see   sanitize_key()
     *
     * @return $this
     */
    public function set_id( string $id ): self {
        $this->data['id'] = sanitize_key( $id );

        return $this;
    }

    /**
     * Get field label
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_title(): string {
        return $this->data['title'];
    }

    /**
     * Set field label validated with
     *
     * @since DOKAN_SINCE
     *
     * @param string $title
     *
     * @see   wp_kses_post()
     *
     * @return $this
     */
    public function set_title( string $title ): self {
        $this->data['title'] = wp_kses_post( $title );

        return $this;
    }

    /**
     * Get field description
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_description(): string {
        return $this->data['description'];
    }

    /**
     * Set field description, validated with
     *
     * @since DOKAN_SINCE
     *
     * @param string $description
     *
     * @see   wp_kses_post()
     *
     * @return $this
     */
    public function set_description( string $description ): self {
        $this->data['description'] = wp_kses_post( $description );

        return $this;
    }

    /**
     * Get field help content
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_help_content(): string {
        return $this->data['help_content'];
    }

    /**
     * Set field help content, validated with
     *
     * @since DOKAN_SINCE
     *
     * @param string $help_content
     *
     * @see   wp_kses_post()
     *
     * @return $this
     */
    public function set_help_content( string $help_content ): self {
        $this->data['help_content'] = wp_kses_post( $help_content );

        return $this;
    }

    /**
     * Get field visibility
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function get_visibility(): bool {
        return wc_string_to_bool( $this->data['visibility'] );
    }

    /**
     * Check the field is visible or not
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_visible(): bool {
        return $this->get_visibility();
    }

    /**
     * Set field visibility
     *
     * @since DOKAN_SINCE
     *
     * @param bool $visibility
     *
     * @return $this
     */
    public function set_visibility( bool $visibility ): self {
        $this->data['visibility'] = $visibility;

        return $this;
    }

    /**
     * Get field required status
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function get_required(): bool {
        return wc_string_to_bool( $this->data['required'] );
    }

    /**
     * Check the field is required or not
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_required(): bool {
        return $this->get_required();
    }

    /**
     * Set field required status
     *
     * @since DOKAN_SINCE
     *
     * @param bool $required
     *
     * @return $this
     */
    public function set_required( bool $required ): self {
        $this->data['required'] = $required;

        return $this;
    }

    /**
     * Get field options
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_order(): int {
        return $this->data['order'];
    }

    /**
     * Set field order
     *
     * @since DOKAN_SINCE
     *
     * @param int $order
     *
     * @return $this
     */
    public function set_order( int $order ): self {
        $this->data['order'] = $order;

        return $this;
    }

    /**
     * Get a field error message
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_error_message() {
        return $this->data['error_message'];
    }

    /**
     * Set field error message
     *
     * @since DOKAN_SINCE
     *
     * @param string $error_message
     *
     * @see   wp_kses_post()
     *
     * @return $this
     */
    public function set_error_message( string $error_message ): self {
        $this->data['error_message'] = wp_kses_post( $error_message );

        return $this;
    }

    /**
     * Sorting function for product fields form Component class.
     *
     * @param Component $a       Component a.
     * @param Component $b       Component b.
     * @param string    $sort_by sort order.
     *
     * @return int
     */
    public static function sort( Component $a, Component $b, string $sort_by = 'asc' ) {
        $a_val = $a->get_order();
        $b_val = $b->get_order();
        if ( 'asc' === $sort_by ) {
            return $a_val <=> $b_val;
        } else {
            return $b_val <=> $a_val;
        }
    }

    /**
     * Get missing arguments of args array.
     *
     * @param array $args field arguments.
     *
     * @return array
     */
    public function get_missing_arguments( $args ) {
        return array_values(
            array_filter(
                $this->required_fields,
                function ( $arg_key ) use ( $args ) {
                    // return false if not exists or empty
                    if ( ! array_key_exists( $arg_key, $args ) || empty( $args[ $arg_key ] ) ) {
                        return true;
                    }

                    return false;
                }
            )
        );
    }
}
