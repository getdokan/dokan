<?php

namespace WeDevs\Dokan\ProductForm;

use WeDevs\Dokan\Traits\Singleton;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Product Form Factory
 *
 * @since DOKAN_SINCE
 */
class Factory {
    use Singleton;

    /**
     * Store form sections.
     *
     * @var array
     */
    protected static $form_sections = [];

    /**
     * Store form fields.
     *
     * @var array
     */
    protected static $form_fields = [];

    /**
     * Adds a field to the product form.
     *
     * @param string $id   Field id.
     * @param array  $args Array containing the necessary arguments.
     *                     $args = array(
     *                     'id'              => '', // (string - required) html id attribute of the field
     *                     'title'           => '', // (string - required) label for the field
     *                     'section'         => '', // (string - required) section id
     *                     'name'            => '', // (string) html name attribute of the field, if not exists id value will be used as name
     *                     'property'        => '', // (string) if exists, this will be the name of the field
     *                     'field_type'      => '', // (string) html field type
     *                     'placeholder'     => '', // (string) html placeholder attribute value for the field
     *                     'options'         => '', // (array) if the field is select, radio, checkbox, etc
     *                     'additional_args' => [], // (array) additional arguments for the field
     *                     'description'      => '', // (string) description of the field
     *                     'help_content'     => '', // (string) help content for the field
     *                     'visibility'       => true, // (bool) field visibility, if the field is visible under frontend
     *                     'required'         => false, // (bool) by default, all fields are not required
     *                     'order'            => 30, // (int) field order
     *                     ).
     *
     * @return Field|WP_Error New field or WP_Error.
     */
    public static function add_field( $id, $args ) {
        if ( empty( $args['id'] ) ) {
            $args['id'] = $id;
        }

        $new_field = self::create_item( 'field', 'Field', $id, $args );
        if ( is_wp_error( $new_field ) ) {
            return $new_field;
        }

        // store newly created field
        self::$form_fields[ $id ] = $new_field;

        // sort fields after adding a new item
        self::$form_fields = self::get_items( 'field', 'Field' );

        return $new_field;
    }

    /**
     * Adds a section to the product form.
     *
     * @since DOKAN_SINCE
     *
     * @param string $id   Card id.
     * @param array  $args Array containing the necessary arguments.
     *
     * @return Section|WP_Error New section or WP_Error.
     */
    public static function add_section( $id, $args ) {
        if ( empty( $args['id'] ) ) {
            $args['id'] = $id;
        }

        $new_section = self::create_item( 'section', 'Section', $id, $args );
        if ( is_wp_error( $new_section ) ) {
            return $new_section;
        }

        // store newly created section
        self::$form_sections[ $id ] = $new_section;

        //sort sections after adding a new item
        self::$form_sections = self::get_items( 'section', 'Section' );

        return $new_section;
    }

    /**
     * Returns list of registered fields.
     *
     * @return Field[] list of registered fields.
     */
    public static function get_fields(): array {
        return self::$form_fields;
    }

    /**
     * Return list of registered fields by type eg: custom, props etc.
     *
     * @since DOKAN_SINCE
     *
     * @param string $type
     * @param string $section_id
     *
     * @return \WeDevs\Dokan\ProductForm\Field[]
     */
    public static function get_fields_by_type( string $type = '', string $section_id = '' ): array {
        if ( ! empty( $section_id ) ) {
            $section = static::get_section( $section_id );
            $items = is_wp_error( $section ) ? [] : $section->get_fields();
        } else {
            $items = self::get_fields();
        }

        if ( empty( $type ) ) {
            return $items;
        }

        return array_filter(
            $items,
            function ( $item ) use ( $type ) {
                return $type === $item->get_type();
            }
        );
    }

    /**
     * Returns registered field based on given field id.
     *
     * @param string $id Field id.
     *
     * @return Field|WP_Error New field or WP_Error.
     */
    public static function get_field( string $id ) {
        if ( array_key_exists( $id, self::$form_fields ) ) {
            return self::$form_fields[ $id ];
        }

        return new WP_Error( 'dokan_product_form_missing_field', esc_html__( 'No field found with given id', 'dokan-lite' ) );
    }

    /**
     * Returns list of registered sections.
     *
     * @param string $sort_by key and order to sort by.
     *
     * @return array list of registered sections.
     */
    public static function get_sections( string $sort_by = 'asc' ): array {
        return self::get_items( 'section', 'Section', $sort_by );
    }

    /**
     * Returns list of registered sections by type eg: default, custom.
     *
     * @param string $type
     * @param string $sort_by
     *
     * @return \WeDevs\Dokan\ProductForm\Section[]
     */
    public static function get_sections_by_type( string $type = 'default', string $sort_by = 'asc' ): array {
        $items = self::get_sections( $sort_by );

        return array_filter(
            $items,
            function ( $item ) use ( $type ) {
                return $type === $item->get_type();
            }
        );
    }

    /**
     * Returns registerd section with given section id.
     *
     * @param string $id Section id.
     *
     * @return Section|WP_Error New section or WP_Error.
     */
    public static function get_section( string $id ) {
        if ( array_key_exists( $id, self::$form_sections ) ) {
            return self::$form_sections[ $id ];
        }

        return new WP_Error( 'dokan_product_form_missing_section', esc_html__( 'No section found with given id', 'dokan-lite' ) );
    }

    /**
     * Returns list of registered items.
     *
     * @param string       $type       Form component type.
     * @param class-string $class_name Class name of \WeDevs\Dokan\ProductForm\Component type.
     * @param string       $sort_by    key and order to sort by.
     *
     * @return array       list of registered items.
     */
    private static function get_items( string $type, string $class_name, string $sort_by = 'asc' ) {
        $item_list = self::get_item_list( $type );

        if ( class_exists( $class_name ) && method_exists( $class_name, 'sort' ) ) {
            /**
             * @var Component $class_name
             */
            uasort(
                $item_list,
                function ( $a, $b ) use ( $sort_by, $class_name ) {
                    return $class_name::sort( $a, $b, $sort_by );
                }
            );
        }

        return $item_list;
    }

    /**
     * @param string $type
     *
     * @return array
     */
    private static function get_item_list( string $type ): array {
        $mapping = [
            'field'   => self::$form_fields,
            'section' => self::$form_sections,
        ];

        if ( array_key_exists( $type, $mapping ) ) {
            return $mapping[ $type ];
        }

        return [];
    }

    /**
     * Creates a new item.
     *
     * @since DOKAN_SINCE
     *
     * @param string       $type       Form component type.
     * @param class-string $class_name Class name of \WeDevs\Dokan\ProductForm\Component type.
     * @param string       $id         Item id.
     * @param array        $args       additional arguments for item.
     *
     * @return Field|Section|WP_Error New product form item or WP_Error.
     */
    private static function create_item( string $type, string $class_name, string $id, array $args ) {
        $class_name = __NAMESPACE__ . '\\' . $class_name;
        if ( ! class_exists( $class_name ) ) {
            return new WP_Error(
                'dokan_product_form_' . $type . '_missing_form_class',
                sprintf(
                /* translators: 1: missing class name. */
                    esc_html__( '%1$s class does not exist.', 'dokan-lite' ),
                    $class_name
                )
            );
        }

        $item_list = self::get_item_list( $type );
        if ( isset( $item_list[ $id ] ) ) {
            return new WP_Error(
                'dokan_product_form_' . $type . '_duplicate_field_id',
                sprintf(
                /* translators: 1: Item type 2: Duplicate registered item id. */
                    esc_html__( 'You have attempted to register a duplicate form %1$s with WooCommerce Form: %2$s', 'dokan-lite' ),
                    $type,
                    '`' . $id . '`'
                )
            );
        }

        try {
            return apply_filters( 'dokan_product_form_item_created', new $class_name( $id, $args ), $type );
        } catch ( \Exception $e ) {
            return new WP_Error(
                'dokan_product_form_' . $type . '_class_creation',
                $e->getMessage()
            );
        }
    }
}
