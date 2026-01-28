<?php
/**
 * Base implementation for all UI elements.
 *
 * @package WeDevs\Dokan\FieldFactory\Abstracts
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Abstracts;

use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;

abstract class AbstractElement implements ElementInterface {

    /**
     * Unique identifier.
     *
     * @var string
     */
    protected string $id = '';

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = '';

    /**
     * Display title/label.
     *
     * @var string
     */
    protected string $title = '';

    /**
     * Description text.
     *
     * @var string
     */
    protected string $description = '';

    /**
     * Icon identifier.
     *
     * @var string
     */
    protected string $icon = '';

    /**
     * Whether to display this element.
     *
     * @var bool
     */
    protected bool $display = true;

    /**
     * WordPress hook key for customization.
     *
     * @var string
     */
    protected string $hook_key = '';

    /**
     * Dependency key for value lookup.
     *
     * @var string
     */
    protected string $dependency_key = '';

    /**
     * Dependencies configuration.
     *
     * @var array
     */
    protected array $dependencies = [];

    /**
     * Tooltip text.
     *
     * @var string
     */
    protected string $tooltip = '';

    /**
     * {@inheritdoc}
     */
    public function get_id(): string {
        return $this->id;
    }

    /**
     * {@inheritdoc}
     */
    public function get_type(): string {
        return $this->type;
    }

    /**
     * {@inheritdoc}
     */
    public function get_title(): string {
        return $this->title;
    }

    /**
     * {@inheritdoc}
     */
    public function get_description(): string {
        return $this->description;
    }

    /**
     * Get icon.
     *
     * @return string
     */
    public function get_icon(): string {
        return $this->icon;
    }

    /**
     * {@inheritdoc}
     */
    public function should_display(): bool {
        return $this->display;
    }

    /**
     * {@inheritdoc}
     */
    public function get_hook_key(): string {
        return $this->hook_key;
    }

    /**
     * Get dependency key.
     *
     * @return string
     */
    public function get_dependency_key(): string {
        return $this->dependency_key;
    }

    /**
     * {@inheritdoc}
     */
    public function get_dependencies(): array {
        return $this->dependencies;
    }

    /**
     * Check if element has dependencies.
     *
     * @return bool
     */
    public function has_dependencies(): bool {
        return ! empty( $this->dependencies );
    }

    /**
     * Get tooltip.
     *
     * @return string
     */
    public function get_tooltip(): string {
        return $this->tooltip;
    }

    /**
     * {@inheritdoc}
     */
    abstract public function get_category(): string;

    /**
     * {@inheritdoc}
     */
    public function fill( array $config ): self {
        foreach ( $this->get_fillable_properties() as $property ) {
            if ( isset( $config[ $property ] ) ) {
                $this->{$property} = $config[ $property ];
            }
        }

        // Handle aliases
        if ( empty( $this->title ) && ! empty( $config['label'] ) ) {
            $this->title = $config['label'];
        }

        if ( empty( $this->title ) && ! empty( $config['name'] ) ) {
            $this->title = $config['name'];
        }

        // Generate hook_key if not set
        if ( empty( $this->hook_key ) && ! empty( $this->id ) ) {
            $this->hook_key = 'dokan_field_' . $this->id;
        }

        // Generate dependency_key if not set
        if ( empty( $this->dependency_key ) && ! empty( $this->id ) ) {
            $this->dependency_key = $this->id;
        }

        return $this;
    }

    /**
     * Get fillable property names.
     *
     * @return array
     */
    protected function get_fillable_properties(): array {
        return [
            'id',
            'type',
            'title',
            'description',
            'icon',
            'display',
            'hook_key',
            'dependency_key',
            'dependencies',
            'tooltip',
        ];
    }

    /**
     * Set a property value.
     *
     * @param string $property Property name.
     * @param mixed  $value    Property value.
     *
     * @return self
     */
    public function set_property( string $property, $value ): self {
        if ( property_exists( $this, $property ) ) {
            $this->{$property} = $value;
        }

        return $this;
    }

    /**
     * Get a property value.
     *
     * @param string $property Property name.
     * @param mixed  $default_data  Default value if not set.
     *
     * @return mixed
     */
    public function get_property( string $property, $default_data = null ) {
        if ( property_exists( $this, $property ) ) {
            return $this->{$property};
        }

        return $default_data;
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return [
            'id'             => $this->id,
            'type'           => $this->type,
            'title'          => $this->title,
            'description'    => $this->description,
            'icon'           => $this->icon,
            'display'        => $this->display,
            'hook_key'       => $this->hook_key,
            'dependency_key' => $this->dependency_key,
            'dependencies'   => $this->dependencies,
            'tooltip'        => $this->tooltip,
        ];
    }
}
