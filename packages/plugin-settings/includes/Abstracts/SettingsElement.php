<?php

namespace WeDevs\PluginSettings\Abstracts;

use Exception;

/**
 * Settings Element Class.
 *
 * Base class for all settings elements (pages, sections, fields, etc.)
 *
 * @since 1.0.0
 */
abstract class SettingsElement {

    /**
     * ID of the settings element.
     *
     * @var string
     */
    protected string $id = '';

    /**
     * Title of the settings element.
     *
     * @var string
     */
    protected string $title = '';

    /**
     * Description of the settings element.
     *
     * @var string
     */
    protected string $description = '';

    /**
     * The Icon class for the settings element.
     *
     * @var string
     */
    protected string $icon = '';

    /**
     * Settings Element Value.
     *
     * @var mixed
     */
    protected $value;

    /**
     * Is the element support children?
     *
     * @var bool
     */
    protected bool $support_children = true;

    /**
     * Children Settings elements.
     *
     * @var SettingsElement[]
     */
    protected array $children = [];

    /**
     * The settings dependencies.
     *
     * @var array
     */
    protected array $dependencies = [];

    /**
     * Settings Type.
     *
     * @var string
     */
    protected string $type = '';

    /**
     * The key for generating dynamic hook.
     *
     * @var string
     */
    public string $hook_key = '';

    /**
     * The key for generating dynamic Dependency.
     *
     * @var string
     */
    public string $dependency_key = '';

    /**
     * Hook prefix for filters and actions.
     *
     * @var string
     */
    protected string $hook_prefix = 'settings_framework';

    /**
     * Page doc link.
     *
     * @var string|null
     */
    protected ?string $doc_link = null;

    /**
     * Tooltip/Help text of the settings element.
     *
     * @var string
     */
    protected string $tooltip = '';

    /**
     * The constructor.
     *
     * @param string $id          ID of the settings.
     * @param string $hook_prefix Hook prefix for filters (optional).
     */
    public function __construct( string $id, string $hook_prefix = '' ) {
        $this->id = $id;
        if ( ! empty( $hook_prefix ) ) {
            $this->hook_prefix = $hook_prefix;
        }
    }

    /**
     * Get the ID of the Settings element.
     *
     * @return string
     */
    public function get_id(): string {
        return $this->id;
    }

    /**
     * Set the ID of the Settings element.
     *
     * @param string $id ID.
     *
     * @return static
     */
    public function set_id( string $id ): self {
        $this->id = $id;

        return $this;
    }

    /**
     * Get the Type of the Settings element.
     *
     * @return string
     */
    public function get_type(): string {
        return $this->type;
    }

    /**
     * Get the Title of the Settings element.
     *
     * @return string
     */
    public function get_title(): string {
        return $this->title;
    }

    /**
     * Set the Title of the Settings element.
     *
     * @param string $title Title.
     *
     * @return static
     */
    public function set_title( string $title ): self {
        $this->title = $title;

        return $this;
    }

    /**
     * Get the Description of the Settings element.
     *
     * @return string
     */
    public function get_description(): string {
        return $this->description;
    }

    /**
     * Set the Description of the Settings element.
     *
     * @param string $description The description.
     *
     * @return static
     */
    public function set_description( string $description ): self {
        $this->description = $description;

        return $this;
    }

    /**
     * Get the Tooltip of the Settings element.
     *
     * @return string
     */
    public function get_tooltip(): string {
        return $this->tooltip;
    }

    /**
     * Set the Tooltip of the Settings element.
     *
     * @param string $tooltip Tooltip text.
     *
     * @return static
     */
    public function set_tooltip( string $tooltip ): self {
        $this->tooltip = $tooltip;

        return $this;
    }

    /**
     * Get the icon of the Settings element.
     *
     * @return string
     */
    public function get_icon(): string {
        return $this->icon;
    }

    /**
     * Set the icon of the Settings element.
     *
     * @param string $icon Icon class.
     *
     * @return static
     */
    public function set_icon( string $icon ): self {
        $this->icon = $icon;

        return $this;
    }

    /**
     * Get the doc link.
     *
     * @return string|null
     */
    public function get_doc_link(): ?string {
        return $this->doc_link;
    }

    /**
     * Set the doc link.
     *
     * @param string $doc_link Documentation URL.
     *
     * @return static
     */
    public function set_doc_link( string $doc_link ): self {
        $this->doc_link = $doc_link;

        return $this;
    }

    /**
     * Get Hook Key.
     *
     * @return string
     */
    public function get_hook_key(): string {
        return $this->hook_key;
    }

    /**
     * Set Hook key.
     *
     * @param string $hook_key Key.
     *
     * @return static
     */
    public function set_hook_key( string $hook_key ): self {
        $this->hook_key = $hook_key;

        return $this;
    }

    /**
     * Get Dependencies key.
     *
     * @return string
     */
    public function get_dependency_key(): string {
        return $this->dependency_key;
    }

    /**
     * Set Dependencies key.
     *
     * @param string $dependency_key The dependency_key.
     *
     * @return static
     */
    public function set_dependency_key( string $dependency_key ): self {
        $this->dependency_key = $dependency_key;

        return $this;
    }

    /**
     * Get hook prefix.
     *
     * @return string
     */
    public function get_hook_prefix(): string {
        return $this->hook_prefix;
    }

    /**
     * Set hook prefix.
     *
     * @param string $hook_prefix The hook prefix.
     *
     * @return static
     */
    public function set_hook_prefix( string $hook_prefix ): self {
        $this->hook_prefix = $hook_prefix;

        return $this;
    }

    /**
     * Get the Value for the element.
     *
     * @return mixed
     */
    public function get_value() {
        $value = $this->value;

        if ( ! isset( $value ) && method_exists( $this, 'get_default' ) ) {
            $value = $this->get_default();
        }

        return $this->sanitize_element( $value );
    }

    /**
     * Set The element value.
     *
     * @param mixed $value The element value.
     *
     * @return static
     */
    public function set_value( $value ): self {
        $this->value = $this->sanitize_element( $value );

        if ( $this->is_support_children() ) {
            $children = [];
            foreach ( $this->get_children() as $child ) {
                if ( isset( $value[ $child->get_id() ] ) ) {
                    $child->set_value( $value[ $child->get_id() ] );
                }
                $children[ $child->get_id() ] = $child;
            }
            $this->set_children( $children );
        }

        return $this;
    }

    /**
     * Check is the settings element support children.
     *
     * @return bool
     */
    public function is_support_children(): bool {
        return $this->support_children;
    }

    /**
     * Get the children of the settings elements.
     *
     * @return SettingsElement[]
     */
    public function get_children(): array {
        $children = [];

        /**
         * Filter the list of child elements.
         *
         * @since 1.0.0
         *
         * @param array           $children Child elements.
         * @param SettingsElement $this     Current element instance.
         */
        $filtered_children = apply_filters( $this->get_hook_key() . '_children', $this->children, $this );

        foreach ( $filtered_children as $child ) {
            $child->set_hook_key( $this->get_hook_key() . '_' . $child->get_id() );
            $child->set_dependency_key( trim( $this->get_dependency_key() . '.' . $child->get_id(), '. ' ) );
            $children[ $child->get_id() ] = $child;
        }

        return $children;
    }

    /**
     * Set Children.
     *
     * @param array $children Children.
     *
     * @return static
     * @throws Exception If children are not attachable.
     */
    public function set_children( array $children ): self {
        if ( ! $this->is_support_children() ) {
            throw new Exception(
                sprintf(
                    /* translators: %s is Settings element type */
                    esc_html__( 'Settings %s does not support adding any children.', 'settings-framework' ),
                    esc_html( $this->get_type() )
                )
            );
        }

        $this->children = $children;

        return $this;
    }

    /**
     * Get element dependency array.
     *
     * @return array
     */
    public function get_dependencies(): array {
        $dependency_key = $this->get_dependency_key();

        return array_map(
            function ( $dependency ) use ( $dependency_key ) {
                $dependency['self'] = $dependency_key;
                return $dependency;
            },
            $this->dependencies
        );
    }

    /**
     * Set Dependencies.
     *
     * @param array $dependencies Dependencies.
     *
     * @return static
     */
    public function set_dependencies( array $dependencies ): self {
        $this->dependencies = $dependencies;

        return $this;
    }

    /**
     * Add Dependencies to the SettingsElement.
     *
     * @param string $key        Dot (.) separated key string.
     * @param mixed  $value      Value for comparison.
     * @param bool   $to_self    Apply to self (Optional).
     * @param string $attribute  Attributes for operation (Optional).
     * @param string $effect     The effect of dependency (Optional).
     * @param string $comparison Value comparison operator (Optional).
     *
     * @return static
     */
    public function add_dependency( string $key, $value, bool $to_self = true, string $attribute = 'display', string $effect = 'hide', string $comparison = '=' ): self {
        $this->dependencies[] = [
            'key'        => $key,
            'value'      => $value,
            'to_self'    => $to_self,
            'attribute'  => $attribute,
            'effect'     => $effect,
            'comparison' => $comparison,
        ];

        return $this;
    }

    /**
     * Add child element.
     *
     * @param SettingsElement $element Settings element.
     *
     * @return static
     * @throws Exception If child element is not attachable.
     */
    public function add( SettingsElement $element ): self {
        if ( ! $this->is_support_children() ) {
            throw new Exception(
                sprintf(
                    /* translators: %s is Settings element type */
                    esc_html__( 'Settings %s does not support adding any children.', 'settings-framework' ),
                    esc_html( $this->get_type() )
                )
            );
        }

        $this->children[ $element->get_id() ] = $element;

        return $this;
    }

    /**
     * Detach any child element.
     *
     * @param SettingsElement $element Child Element.
     *
     * @return static
     * @throws Exception If Element is not removable.
     */
    public function remove( SettingsElement $element ): self {
        if ( ! $this->is_support_children() ) {
            throw new Exception(
                sprintf(
                    /* translators: %s is Settings element type */
                    esc_html__( 'Settings %s does not support removing any children.', 'settings-framework' ),
                    esc_html( $this->get_type() )
                )
            );
        }

        $this->children = array_filter(
            $this->children,
            function ( $child ) use ( $element ) {
                return $child !== $element;
            }
        );

        return $this;
    }

    /**
     * Validate the Data.
     *
     * @param mixed $data Data to store.
     *
     * @return bool
     */
    public function validate( $data ): bool {
        $validity = $this->data_validation( $data );

        if ( $validity && $this->is_support_children() ) {
            foreach ( $this->get_children() as $child ) {
                if ( isset( $data[ $child->get_id() ] ) ) {
                    if ( ! $child->validate( $data[ $child->get_id() ] ) ) {
                        $validity = false;
                        break;
                    }
                }
            }
        }

        return $validity;
    }

    /**
     * Populate The settings array.
     *
     * @return array
     */
    public function populate(): array {
        $children = [];
        if ( $this->is_support_children() ) {
            foreach ( $this->get_children() as $child ) {
                $children[] = $child->populate();
            }
        }

        $populated_data = [
            'id'             => $this->get_id(),
            'type'           => $this->get_type(),
            'title'          => $this->get_title(),
            'icon'           => $this->get_icon(),
            'tooltip'        => $this->get_tooltip(),
            'display'        => true,
            'hook_key'       => $this->get_hook_key(),
            'children'       => $children,
            'description'    => $this->get_description(),
            'dependency_key' => $this->get_dependency_key(),
            'dependencies'   => $this->get_dependencies(),
        ];

        if ( $this->get_doc_link() ) {
            $populated_data['doc_link'] = $this->get_doc_link();
        }

        /**
         * Filters the populated data for a settings element.
         *
         * @since 1.0.0
         *
         * @param array           $populated_data The array containing all element data.
         * @param SettingsElement $this           The current settings element instance.
         */
        return apply_filters( $this->get_hook_key() . '_populate', $populated_data, $this );
    }

    /**
     * Sanitize the settings element.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return array|string|mixed
     */
    public function sanitize( $data ) {
        $data = $this->sanitize_element( $data );

        if ( $this->is_support_children() && is_array( $data ) ) {
            foreach ( $this->get_children() as $child ) {
                if ( array_key_exists( $child->get_id(), $data ) ) {
                    $data[ $child->get_id() ] = $child->sanitize( $data[ $child->get_id() ] );
                }
            }
        }

        return $data;
    }

    /**
     * Data Validation condition.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    abstract public function data_validation( $data ): bool;

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return mixed
     */
    abstract public function sanitize_element( $data );

    /**
     * Escape Output for usage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return mixed
     */
    abstract public function escape_element( $data );
}

