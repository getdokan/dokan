<?php
/**
 * Element Registry
 *
 * Registry pattern for element type to class mapping.
 * Aligned with WordPress DataViews Fields API types.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#fields-api
 *
 * @package WeDevs\Dokan\FieldFactory\Registry
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Registry;

use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
use InvalidArgumentException;

/**
 * Class ElementRegistry
 */
class ElementRegistry {

    /**
     * Singleton instance.
     *
     * @var self|null
     */
    private static ?self $instance = null;

    /**
     * Registered element types.
     * Format: [ 'type:variant' => 'ClassName' ]
     *
     * @var array<string, string>
     */
    private array $elements = [];

    /**
     * Type aliases for legacy support.
     *
     * @var array<string, string>
     */
    private array $aliases = [];

    /**
     * Whether defaults have been registered.
     *
     * @var bool
     */
    private bool $defaults_registered = false;

    /**
     * Get singleton instance.
     *
     * @return self
     */
    public static function get_instance(): self {
        if ( self::$instance === null ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Reset instance (for testing).
     *
     * @return void
     */
    public static function reset_instance(): void {
        self::$instance = null;
    }

    /**
     * Private constructor for singleton.
     */
    private function __construct() {
        // Defaults registered lazily
    }

    /**
     * Ensure defaults are registered.
     *
     * @return void
     */
    private function ensure_defaults_registered(): void {
        if ( $this->defaults_registered ) {
            return;
        }

        $this->register_defaults();
        $this->defaults_registered = true;
    }

    /**
     * Register default element types.
     *
     * @return void
     */
    private function register_defaults(): void {
        $base_namespace = 'WeDevs\\Dokan\\FieldFactory\\Elements\\';

        // =========================================
        // Containers
        // =========================================
        $this->register( 'page', $base_namespace . 'Containers\\Page' );
        $this->register( 'subpage', $base_namespace . 'Containers\\Subpage' );

        // =========================================
        // Layouts
        // =========================================
        $this->register( 'section', $base_namespace . 'Layouts\\Section' );
        $this->register( 'subsection', $base_namespace . 'Layouts\\Subsection' );
        $this->register( 'fieldgroup', $base_namespace . 'Layouts\\FieldGroup' );

        // =========================================
        // Tables
        // =========================================
        $this->register( 'table', $base_namespace . 'Tables\\Table' );
        $this->register( 'table-row', $base_namespace . 'Tables\\TableRow' );
        $this->register( 'table-column', $base_namespace . 'Tables\\TableColumn' );

        // =========================================
        // Display Elements
        // =========================================
        $this->register( 'paragraph', $base_namespace . 'Display\\Paragraph' );

        // =========================================
        // Core Fields
        // =========================================
        $this->register( 'field:text', $base_namespace . 'Fields\\TextField' );
        $this->register( 'field:select', $base_namespace . 'Fields\\SelectField' );
        $this->register( 'field:switch', $base_namespace . 'Fields\\SwitchField' );
        $this->register( 'field:number', $base_namespace . 'Fields\\NumberField' );

        // =========================================
        // Radio Fields
        // =========================================
        $this->register( 'field:radio', $base_namespace . 'Fields\\RadioField' );
        $this->register( 'field:radio_box', $base_namespace . 'Fields\\RadioBoxField' );
        $this->register( 'field:radio_capsule', $base_namespace . 'Fields\\RadioCapsuleField' );

        // =========================================
        // Checkbox & Multi-select Fields
        // =========================================
        $this->register( 'field:multicheck', $base_namespace . 'Fields\\MulticheckField' );
        $this->register( 'field:checkbox', $base_namespace . 'Fields\\MulticheckField' );
        $this->register( 'field:checkbox_group', $base_namespace . 'Fields\\MulticheckField' );

        // =========================================
        // Text Input Fields
        // =========================================
        $this->register( 'field:textarea', $base_namespace . 'Fields\\TextareaField' );
        $this->register( 'field:rich_text', $base_namespace . 'Fields\\RichTextField' );
        $this->register( 'field:editor', $base_namespace . 'Fields\\RichTextField' );

        // =========================================
        // Toggle/Switch Variants
        // =========================================
        $this->register( 'field:toggle', $base_namespace . 'Fields\\SwitchField' );
        $this->register( 'field:show_hide', $base_namespace . 'Fields\\ShowHideField' );

        // =========================================
        // Special Input Fields
        // =========================================
        $this->register( 'field:copy_field', $base_namespace . 'Fields\\CopyField' );
        $this->register( 'field:combine_input', $base_namespace . 'Fields\\CombineInputField' );
        $this->register( 'field:double_input', $base_namespace . 'Fields\\CombineInputField' );
        $this->register( 'field:category_based_commission', $base_namespace . 'Fields\\CategoryBasedCommissionField' );
        $this->register( 'field:repeater', $base_namespace . 'Fields\\RepeaterField' );

        // =========================================
        // File & Media Fields
        // =========================================
        $this->register( 'field:file_upload', $base_namespace . 'Fields\\FileUploadField' );
        $this->register( 'field:image', $base_namespace . 'Fields\\FileUploadField' );
        $this->register( 'field:gallery', $base_namespace . 'Fields\\FileUploadField' );

        // =========================================
        // Color Fields
        // =========================================
        $this->register( 'field:color', $base_namespace . 'Fields\\ColorPickerField' );
        $this->register( 'field:select_color_picker', $base_namespace . 'Fields\\ColorPickerField' );
        $this->register( 'field:color_customizer', $base_namespace . 'Fields\\ColorPickerField' );

        // =========================================
        // Display/Info Fields (Read-only)
        // =========================================
        $this->register( 'field:info', $base_namespace . 'Fields\\InfoField' );
        $this->register( 'field:notice', $base_namespace . 'Fields\\NoticeField' );
        $this->register( 'field:base_field_label', $base_namespace . 'Fields\\BaseLabelField' );

        // =========================================
        // Number Variants
        // =========================================
        $this->register( 'field:integer', $base_namespace . 'Fields\\NumberField' );
        $this->register( 'field:currency', $base_namespace . 'Fields\\NumberField' );

        // =========================================
        // Default Fallbacks
        // =========================================
        $this->register( 'field', $base_namespace . 'Fields\\TextField' );

        // =========================================
        // Legacy Aliases (for backward compatibility)
        // =========================================
        // Basic types
        $this->add_alias( 'text', 'field:text' );
        $this->add_alias( 'select', 'field:select' );
        $this->add_alias( 'switch', 'field:switch' );
        $this->add_alias( 'toggle', 'field:toggle' );
        $this->add_alias( 'number', 'field:number' );
        $this->add_alias( 'integer', 'field:integer' );

        // Radio aliases
        $this->add_alias( 'radio', 'field:radio' );
        $this->add_alias( 'radio_box', 'field:radio_box' );
        $this->add_alias( 'radio_capsule', 'field:radio_capsule' );
        $this->add_alias( 'customize_radio', 'field:radio_box' );

        // Checkbox aliases
        $this->add_alias( 'multicheck', 'field:multicheck' );
        $this->add_alias( 'checkbox', 'field:checkbox' );
        $this->add_alias( 'checkbox_group', 'field:checkbox_group' );

        // Text input aliases
        $this->add_alias( 'textarea', 'field:textarea' );
        $this->add_alias( 'rich_text', 'field:rich_text' );
        $this->add_alias( 'editor', 'field:editor' );

        // Toggle aliases
        $this->add_alias( 'show_hide', 'field:show_hide' );

        // Special field aliases
        $this->add_alias( 'copy_field', 'field:copy_field' );
        $this->add_alias( 'combine_input', 'field:combine_input' );
        $this->add_alias( 'double_input', 'field:double_input' );
        $this->add_alias( 'category_based_commission', 'field:category_based_commission' );
        $this->add_alias( 'repeater', 'field:repeater' );

        // File aliases
        $this->add_alias( 'file_upload', 'field:file_upload' );
        $this->add_alias( 'image', 'field:image' );
        $this->add_alias( 'gallery', 'field:gallery' );

        // Color aliases
        $this->add_alias( 'color', 'field:color' );
        $this->add_alias( 'select_color_picker', 'field:select_color_picker' );
        $this->add_alias( 'color_customizer', 'field:color_customizer' );

        // Display field aliases
        $this->add_alias( 'info', 'field:info' );
        $this->add_alias( 'notice', 'field:notice' );
        $this->add_alias( 'base_field_label', 'field:base_field_label' );

        // Currency alias
        $this->add_alias( 'currency', 'field:currency' );
    }

    /**
     * Register an element type.
     *
     * @param string $type_key   Format: 'type' or 'type:variant'.
     * @param string $class_name Fully qualified class name.
     *
     * @return self
     * @throws InvalidArgumentException If class doesn't implement interface.
     */
    public function register( string $type_key, string $class_name ): self {
        if ( class_exists( $class_name ) ) {
            if ( ! is_subclass_of( $class_name, ElementInterface::class ) ) {
                throw new InvalidArgumentException(
                    esc_html( sprintf( 'Class %s must implement ElementInterface.', $class_name ) )
                );
            }
        }

        $this->elements[ $type_key ] = $class_name;

        return $this;
    }

    /**
     * Unregister an element type.
     *
     * @param string $type_key Type key to remove.
     *
     * @return bool True if removed, false if not found.
     */
    public function unregister( string $type_key ): bool {
        if ( isset( $this->elements[ $type_key ] ) ) {
            unset( $this->elements[ $type_key ] );
            return true;
        }
        return false;
    }

    /**
     * Add type alias.
     *
     * @param string $alias  Alias name.
     * @param string $target Target type key.
     *
     * @return self
     */
    public function add_alias( string $alias, string $target ): self {
        $this->aliases[ $alias ] = $target;
        return $this;
    }

    /**
     * Check if type is registered.
     *
     * @param string $type_key Type key to check.
     *
     * @return bool
     */
    public function has( string $type_key ): bool {
        $this->ensure_defaults_registered();

        $resolved = $this->resolve_alias( $type_key );
        return isset( $this->elements[ $resolved ] );
    }

    /**
     * Get class name for type.
     *
     * @param string $type_key Type key.
     *
     * @return string|null
     */
    public function get( string $type_key ): ?string {
        $this->ensure_defaults_registered();

        $resolved = $this->resolve_alias( $type_key );
        return $this->elements[ $resolved ] ?? null;
    }

    /**
     * Resolve type key including variant.
     *
     * @param string      $type    Base type.
     * @param string|null $variant Optional variant.
     *
     * @return string Resolved type key.
     */
    public function resolve_type_key( string $type, ?string $variant = null ): string {
        $this->ensure_defaults_registered();

        // If variant provided, try type:variant first
        if ( $variant !== null && $variant !== '' ) {
            $full_key = "{$type}:{$variant}";
            if ( $this->has( $full_key ) ) {
                return $full_key;
            }
        }

        // Try variant alone (for legacy formats)
        if ( $variant !== null && $variant !== '' && $this->has( $variant ) ) {
            return $this->resolve_alias( $variant );
        }

        // Fall back to type only
        if ( $this->has( $type ) ) {
            return $this->resolve_alias( $type );
        }

        // Default to 'field' if nothing else matches
        return 'field';
    }

    /**
     * Resolve alias to actual type key.
     *
     * @param string $type_key Type key that might be an alias.
     *
     * @return string Resolved type key.
     */
    private function resolve_alias( string $type_key ): string {
        $resolved = $type_key;
        $depth    = 0;

        while ( isset( $this->aliases[ $resolved ] ) && $depth < 5 ) {
            $resolved = $this->aliases[ $resolved ];
            ++$depth;
        }

        return $resolved;
    }

    /**
     * Get all registered types.
     *
     * @return array<string, string>
     */
    public function get_all(): array {
        $this->ensure_defaults_registered();
        return $this->elements;
    }

    /**
     * Fire WordPress action for plugin extensions.
     *
     * @return void
     */
    public function do_registration_hook(): void {
        $this->ensure_defaults_registered();

        /**
         * Action: Register custom element types.
         *
         * @param ElementRegistry $registry The registry instance.
         */
        do_action( 'dokan_field_register_elements', $this );
    }

    /**
     * Create instance of registered element.
     *
     * @param string $type_key Type key.
     *
     * @return ElementInterface|null
     */
    public function make( string $type_key ): ?ElementInterface {
        $class_name = $this->get( $type_key );

        if ( $class_name === null || ! class_exists( $class_name ) ) {
            return null;
        }

        return new $class_name();
    }
}
