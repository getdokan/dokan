<?php
/**
 * Field Factory main entry point.
 *
 * @package WeDevs\Dokan\FieldFactory
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory;

use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;
use WeDevs\Dokan\FieldFactory\Factory\ElementFactory;
use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;

class FieldFactory {

    /**
     * Factory instance.
     *
     * @var ElementFactory|null
     */
    private static ?ElementFactory $factory = null;

    /**
     * Get factory instance.
     *
     * @return ElementFactory
     */
    public static function get_factory(): ElementFactory {
        if ( self::$factory === null ) {
            self::$factory = new ElementFactory();
        }
        return self::$factory;
    }

    /**
     * Get registry instance.
     *
     * @return ElementRegistry
     */
    public static function get_registry(): ElementRegistry {
        return ElementRegistry::get_instance();
    }

    /**
     * Create elements from array data.
     *
     * @param array $data Configuration data.
     *
     * @return ElementInterface[]
     */
    public static function create_from_data( array $data ): array {
        return self::get_factory()->create_from_data( $data );
    }

    /**
     * Create a single element.
     *
     * @param array|ElementInterface $config Element configuration or existing element.
     *
     * @return ElementInterface
     */
    public static function create( $config ): ElementInterface {
        return self::get_factory()->create( $config );
    }

    /**
     * Create a field element with shorthand syntax.
     *
     * @param string $id      Field ID.
     * @param string $variant Field variant (text, select, switch, etc.).
     * @param array  $options Additional options.
     *
     * @return FieldInterface
     */
    public static function field( string $id, string $variant, array $options = [] ): FieldInterface {
        $config = array_merge(
            [
                'id'      => $id,
                'type'    => 'field',
                'variant' => $variant,
            ],
            $options
        );

        return self::create( $config );
    }

    /**
     * Create a text field.
     *
     * @param string $id      Field ID.
     * @param string $label   Field label.
     * @param array  $options Additional options.
     *
     * @return FieldInterface
     */
    public static function text( string $id, string $label, array $options = [] ): FieldInterface {
        return self::field( $id, 'text', array_merge( [ 'title' => $label ], $options ) );
    }

    /**
     * Create a textarea field.
     *
     * @param string $id      Field ID.
     * @param string $label   Field label.
     * @param array  $options Additional options.
     *
     * @return FieldInterface
     */
    public static function textarea( string $id, string $label, array $options = [] ): FieldInterface {
        return self::field( $id, 'textarea', array_merge( [ 'title' => $label ], $options ) );
    }

    /**
     * Create a select field.
     *
     * @param string $id       Field ID.
     * @param string $label    Field label.
     * @param array  $elements Select options.
     * @param array  $options  Additional options.
     *
     * @return FieldInterface
     */
    public static function select( string $id, string $label, array $elements, array $options = [] ): FieldInterface {
        return self::field(
            $id,
            'select',
            array_merge(
                [
                    'title'    => $label,
                    'elements' => $elements,
                ],
                $options
            )
        );
    }

    /**
     * Create a switch/toggle field.
     *
     * @param string $id      Field ID.
     * @param string $label   Field label.
     * @param array  $options Additional options.
     *
     * @return FieldInterface
     */
    public static function toggle( string $id, string $label, array $options = [] ): FieldInterface {
        return self::field( $id, 'switch', array_merge( [ 'title' => $label ], $options ) );
    }

    /**
     * Create a number field.
     *
     * @param string $id      Field ID.
     * @param string $label   Field label.
     * @param array  $options Additional options.
     *
     * @return FieldInterface
     */
    public static function number( string $id, string $label, array $options = [] ): FieldInterface {
        return self::field( $id, 'number', array_merge( [ 'title' => $label ], $options ) );
    }

    /**
     * Create a radio field.
     *
     * @param string $id       Field ID.
     * @param string $label    Field label.
     * @param array  $elements Radio options.
     * @param array  $options  Additional options.
     *
     * @return FieldInterface
     */
    public static function radio( string $id, string $label, array $elements, array $options = [] ): FieldInterface {
        return self::field(
            $id,
            'radio',
            array_merge(
                [
                    'title'    => $label,
                    'elements' => $elements,
                ],
                $options
            )
        );
    }

    /**
     * Create a radio box field.
     *
     * @param string $id       Field ID.
     * @param string $label    Field label.
     * @param array  $elements Radio options.
     * @param array  $options  Additional options.
     *
     * @return FieldInterface
     */
    public static function radio_box( string $id, string $label, array $elements, array $options = [] ): FieldInterface {
        return self::field(
            $id,
            'radio_box',
            array_merge(
                [
                    'title'    => $label,
                    'elements' => $elements,
                ],
                $options
            )
        );
    }

    /**
     * Create a multicheck field.
     *
     * @param string $id       Field ID.
     * @param string $label    Field label.
     * @param array  $elements Checkbox options.
     * @param array  $options  Additional options.
     *
     * @return FieldInterface
     */
    public static function multicheck( string $id, string $label, array $elements, array $options = [] ): FieldInterface {
        return self::field(
            $id,
            'multicheck',
            array_merge(
                [
                    'title'    => $label,
                    'elements' => $elements,
                ],
                $options
            )
        );
    }

    /**
     * Create a color picker field.
     *
     * @param string $id      Field ID.
     * @param string $label   Field label.
     * @param array  $options Additional options.
     *
     * @return FieldInterface
     */
    public static function color( string $id, string $label, array $options = [] ): FieldInterface {
        return self::field( $id, 'color', array_merge( [ 'title' => $label ], $options ) );
    }

    /**
     * Create a file upload field.
     *
     * @param string $id      Field ID.
     * @param string $label   Field label.
     * @param array  $options Additional options.
     *
     * @return FieldInterface
     */
    public static function file( string $id, string $label, array $options = [] ): FieldInterface {
        return self::field( $id, 'file_upload', array_merge( [ 'title' => $label ], $options ) );
    }

    /**
     * Create a page container.
     *
     * @param string $id       Page ID.
     * @param string $title    Page title.
     * @param array  $children Child elements.
     * @param array  $options  Additional options.
     *
     * @return ContainerInterface
     */
    public static function page( string $id, string $title, array $children = [], array $options = [] ): ContainerInterface {
        $config = array_merge(
            [
                'id'       => $id,
                'type'     => 'page',
                'title'    => $title,
                'children' => $children,
            ],
            $options
        );

        return self::create( $config );
    }

    /**
     * Create a subpage container.
     *
     * @param string $id       Subpage ID.
     * @param string $title    Subpage title.
     * @param array  $children Child elements.
     * @param array  $options  Additional options.
     *
     * @return ContainerInterface
     */
    public static function subpage( string $id, string $title, array $children = [], array $options = [] ): ContainerInterface {
        $config = array_merge(
            [
                'id'       => $id,
                'type'     => 'subpage',
                'title'    => $title,
                'children' => $children,
            ],
            $options
        );

        return self::create( $config );
    }

    /**
     * Create a section container.
     *
     * @param string $id       Section ID.
     * @param string $title    Section title.
     * @param array  $children Child elements.
     * @param array  $options  Additional options.
     *
     * @return ContainerInterface
     */
    public static function section( string $id, string $title, array $children = [], array $options = [] ): ContainerInterface {
        $config = array_merge(
            [
                'id'       => $id,
                'type'     => 'section',
                'title'    => $title,
                'children' => $children,
            ],
            $options
        );

        return self::create( $config );
    }

    /**
     * Convert elements to array.
     *
     * @param ElementInterface[] $elements Elements to convert.
     *
     * @return array
     */
    public static function to_array( array $elements ): array {
        return self::get_factory()->to_array( $elements );
    }

    /**
     * Find element by ID.
     *
     * @param ElementInterface[] $elements Elements to search.
     * @param string             $id       Element ID.
     *
     * @return ElementInterface|null
     */
    public static function find( array $elements, string $id ): ?ElementInterface {
        return self::get_factory()->find_by_id( $elements, $id );
    }

    /**
     * Validate all fields in element tree.
     *
     * @param ElementInterface[] $elements   Elements to validate.
     * @param array              $data       Data to validate against.
     * @param bool               $stop_first Stop on first error.
     *
     * @return array Validation result with 'valid' and 'errors'.
     */
    public static function validate( array $elements, array $data, bool $stop_first = false ): array {
        $all_errors = [];
        $is_valid   = true;

        foreach ( $elements as $element ) {
            if ( $element instanceof FieldInterface ) {
                $result = $element->validate( $data );
                if ( ! $result['valid'] ) {
                    $is_valid                         = false;
                    $all_errors[ $element->get_id() ] = $result['errors'];

                    if ( $stop_first ) {
                        break;
                    }
                }
            }

            if ( $element instanceof ContainerInterface ) {
                $child_result = self::validate( $element->get_children(), $data, $stop_first );
                if ( ! $child_result['valid'] ) {
                    $is_valid   = false;
                    $all_errors = array_merge( $all_errors, $child_result['errors'] );

                    if ( $stop_first ) {
                        break;
                    }
                }
            }
        }

        return [
            'valid'  => $is_valid,
            'errors' => $all_errors,
        ];
    }

    /**
     * Get all field values from element tree.
     *
     * @param ElementInterface[] $elements Elements to extract values from.
     * @param array              $data     Data source.
     *
     * @return array Field ID => value pairs.
     */
    public static function get_values( array $elements, array $data ): array {
        $values = [];

        foreach ( $elements as $element ) {
            if ( $element instanceof FieldInterface ) {
                $values[ $element->get_id() ] = $element->get_value( $data );
            }

            if ( $element instanceof ContainerInterface ) {
                $child_values = self::get_values( $element->get_children(), $data );
                $values       = array_merge( $values, $child_values );
            }
        }

        return $values;
    }

    /**
     * Get all fields from element tree (flattened).
     *
     * @param ElementInterface[] $elements Elements to search.
     *
     * @return FieldInterface[]
     */
    public static function get_all_fields( array $elements ): array {
        $fields = [];

        foreach ( $elements as $element ) {
            if ( $element instanceof FieldInterface ) {
                $fields[] = $element;
            }

            if ( $element instanceof ContainerInterface ) {
                $child_fields = self::get_all_fields( $element->get_children() );
                $fields       = array_merge( $fields, $child_fields );
            }
        }

        return $fields;
    }

    /**
     * Register a custom element type.
     *
     * @param string $type_key   Type key (e.g., 'field:custom').
     * @param string $class_name Fully qualified class name.
     *
     * @return void
     */
    public static function register( string $type_key, string $class_name ): void {
        self::get_registry()->register( $type_key, $class_name );
    }

    /**
     * Check if type is supported.
     *
     * @param string      $type    Element type.
     * @param string|null $variant Optional variant.
     *
     * @return bool
     */
    public static function supports( string $type, ?string $variant = null ): bool {
        return self::get_factory()->supports( $type, $variant ?? '' );
    }

    /**
     * Reset factory instance (for testing).
     *
     * @return void
     */
    public static function reset(): void {
        self::$factory = null;
        ElementRegistry::reset_instance();
    }
}
