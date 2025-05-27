<?php

namespace WeDevs\Dokan\Abstracts;

use Exception;

/**
 * Settings Element Class.
 */
abstract class SettingsElement {

	/**
	 * ID of the settings element.
	 *
	 * @var string $id ID.
	 */
	protected $id = '';

	/**
	 * Title of the  settings element.
	 *
	 * @var string $title Title.
	 */
	protected $title = '';

	/**
	 * Description of the settings element.
	 *
	 * @var string $description Description.
	 */
	protected $description = '';

	/**
	 * The Icon class for the settings element.
	 *
	 * @var string $icon Icon.
	 */
	protected $icon = '';

	/**
	 * Settings Element Value.
	 *
	 * @var mixed $value Value.
	 */
	protected $value;

	/**
	 * Is the element support children?
	 *
	 * @var bool $support_children Has children.
	 */
	protected $support_children = true;

	/**
	 * Children Settings elements.
	 *
	 * @var SettingsElement[] $children Children Elements.
	 */
	protected $children = array();

	/**
	 * The settings dependencies.
	 *
	 * @var array $dependencies Dependencies.
	 */
	protected $dependencies = array();

	/**
	 * Settings Type.
	 *
	 * @var string $type Settings Type.
	 */
	protected $type = '';

	/**
	 * The key for generating dynamic hook.
	 *
	 * @var string $hook_key Hook Key.
	 */
	public $hook_key = '';

	/**
	 * The key for generating dynamic Dependency.
	 *
	 * @var string $dependency_key Dependency Key.
	 */
	public $dependency_key = '';

	/**
	 * The constructor.
	 *
	 * @param string $id ID of the settings.
	 */
	public function __construct( string $id ) {
		$this->id = $id;
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
	 * @return SettingsElement
	 */
	public function set_id( string $id ): SettingsElement {
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
	 * @return SettingsElement
	 */
	public function set_title( string $title ): SettingsElement {
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
	 * @return SettingsElement
	 */
	public function set_description( string $description ): SettingsElement {
		$this->description = $description;

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
	 * @return SettingsElement
	 */
	public function set_icon( string $icon ): SettingsElement {
		$this->icon = $icon;

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
	 * @return SettingsElement
	 */
	public function set_hook_key( string $hook_key ): SettingsElement {
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
	 * @return SettingsElement
	 */
	public function set_dependency_key( string $dependency_key ): SettingsElement {
		$this->dependency_key = $dependency_key;

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
	 * @return SettingsElement
	 */
	public function set_value( $value ): SettingsElement {
		$this->value = $this->sanitize_element( $value );

		if ( $this->is_support_children() ) {
			$children = array();
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
		$children = array();

        /**
         * An array containing the filtered list of child elements or objects.
         * This variable is intended to store a subset of children
         * after applying specific filtering criteria.
         *
         * @since 4.0.0
         *
         * @param array           $children
         * @param SettingsElement $this
         */
		$filtered_children = apply_filters( $this->get_hook_key() . '_children', $this->children, $this ); // phpcs:ignore.

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
	 * @return SettingsElement
     * @throws Exception If children are not attachable.
	 */
	public function set_children( array $children ): SettingsElement {
        if ( ! $this->is_support_children() ) {
            // translators: %s is Settings element type.
            throw new Exception( sprintf( esc_html__( 'Settings %s Does not support adding any children.', 'dokan-lite' ), esc_html( $this->get_type() ) ) );
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
	 * @return SettingsElement
	 */
	public function set_dependencies( array $dependencies ): SettingsElement {
		$this->dependencies = $dependencies;

		return $this;
	}

	/**
	 * Add Dependencies to the SettingsElement.
	 *
	 * @param string $key       Dot (.) seperated key string.
	 * @param mixed  $value     Value for comparison.
	 * @param bool   $to_self   Value for comparison.
	 * @param string $attribute Attributes for operation (Optional).
	 * @param string $effect    The effect of dependency (Optional).
	 * @param string $comparison Value comparison operator (Optional).
	 *
	 * @return SettingsElement
	 */
	public function add_dependency( string $key, $value, bool $to_self = true, string $attribute = 'display', string $effect = 'hide', string $comparison = '=' ): SettingsElement {
		$this->dependencies[] = array(
			'key'        => $key,
			'value'      => $value,
			'to_self'    => $to_self,
			'attribute'  => $attribute,
			'effect'     => $effect,
			'comparison' => $comparison,
		);

		return $this;
	}

	/**
	 * Add child element.
	 *
	 * @param SettingsElement $element Settings element.
	 *
	 * @return $this
	 * @throws Exception If child element is not attachable.
	 */
	public function add( SettingsElement $element ): SettingsElement {
        if ( ! $this->is_support_children() ) {
            // translators: %s is Settings element type.
            throw new Exception( sprintf( esc_html__( 'Settings %s Does not support adding any children.', 'dokan-lite' ), esc_html( $this->get_type() ) ) );
        }

		$this->children[ $element->get_id() ] = $element;

		return $this;
	}

	/**
	 * Detach any child element.
	 *
	 * @param SettingsElement $element Child Element.
	 *
	 * @return SettingsElement
	 * @throws Exception If Element is not removable.
	 */
	public function remove( SettingsElement $element ): SettingsElement {
		if ( ! $this->is_support_children() ) {
			// translators: %s is Settings element type.
			throw new Exception( sprintf( esc_html__( 'Settings %s Does not support removing any children.', 'dokan-lite' ), esc_html( $this->get_type() ) ) );
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
				if ( ! isset( $data[ $child->get_id() ] ) || ! $child->validate( $data[ $child->get_id() ] ) ) {
					$validity = false;
					break;
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
		$children = array();
		if ( $this->is_support_children() ) {
			foreach ( $this->get_children() as $child ) {
				$children[] = $child->populate();
			}
		}

		$populated_data = array(
			'id'             => $this->get_id(),
			'type'           => $this->get_type(),
			'title'          => $this->get_title(),
			'icon'           => $this->get_icon(),
			'display'        => true, // to manage element display action from dependencies.
			'hook_key'       => $this->get_hook_key(),
			'children'       => $children,
			'description'    => $this->get_description(),
			'dependency_key' => $this->get_dependency_key(),
			'dependencies'   => $this->get_dependencies(),
		);

        /**
         * Filters the populated data for a settings element.
         * This filter allows modification of the complete array of populated data
         * before it's returned from the populate method. The data includes all element
         * properties such as ID, type, title, children, dependencies, etc.
         *
         * @since 4.0.0
         *
         * @param array           $populated_data The array containing all element data.
         * @param SettingsElement $this           The current settings element instance.
         *
         * @return array Modified populated data.
         */
        return apply_filters( $this->get_hook_key() . '_populate', $populated_data, $this );
	}

	/**
	 * Sanitize the settings element.
	 *
	 * @param mixed $data Data for sanitization.
	 *
	 * @return array|string
	 */
	public function sanitize( $data ) {
		$data = $this->sanitize_element( $data );

		if ( $this->is_support_children() ) {
			foreach ( $this->get_children() as $child ) {
				$data[ $child->get_id() ] = $child->sanitize( $data[ $child->get_id() ] );
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
