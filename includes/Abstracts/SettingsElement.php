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
	 * The settings validations.
	 *
	 * @var array $validations Validations.
	 */
	protected $validations = array();

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
     * Page doc link.
     *
     * @var string|null $doc_link
     */
    protected ?string $doc_link = null;

    /**
     * Get the subpage doc link.
     *
     * @return string|null
     */
    public function get_doc_link(): ?string {
        return $this->doc_link;
    }

    /**
     * Help text of the settings element.
     *
     * @var string $helpText Help text.
     */
    protected $tooltip = '';

    /**
     * Set the subpage doc link.
     *
     * @param string $doc_link
     *  return SettingsElement
     */
    public function set_doc_link( string $doc_link ): SettingsElement {
        $this->doc_link = $doc_link;

        return $this;
    }
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
     * Get the Help Text of the Settings element.
     *
     * @return string
     */
    public function get_tooltip(): string {
        return $this->tooltip;
    }

    /**
     * Set the Help Text of the Settings element.
     *
     * @param string $tooltip Title.
     *
     * @return SettingsElement
     */
    public function set_tooltip( string $tooltip ): SettingsElement {
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
			$child->set_dependency_key( $child->get_id() );

            if ( isset( $this->value[ $child->get_id() ] ) ) {
                $child->set_value( $this->value[ $child->get_id() ] );
            }

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
		$self = $this->get_id();

		return array_map(
			function ( $dependency ) use ( $self ) {
				$dependency['self'] = $self;
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
	 * Get element validation array.
     *
     * @since DOKAN_SINCE
	 *
	 * @return array
	 */
	public function get_validations(): array {
		$self = $this->get_id();

		return array_map(
			function ( $validation ) use ( $self ) {
				$validation['self'] = $self;
				return $validation;
			},
			$this->validations
		);
	}

	/**
	 * Set Validations.
     *
     * @SINCE DOKAN_SINCE
	 *
	 * @param array $validations Validations.
	 *
	 * @return SettingsElement
	 */
	public function set_validations( array $validations ): SettingsElement {
		$this->validations = $validations;

		return $this;
	}

	/**
	 * Add Validation to the SettingsElement.
	 *
	 * @since DOKAN_SINCE
	 *
	 * Supports multiple formats:
	 *
	 * Format 1: Multiple rules as pipe-separated string
	 * ->add_validation( 'required|not_empty|min_value', 'Error message' )
	 *
	 * Format 2: Rules as array with params
	 * ->add_validation( ['not_empty', 'min_value' => 10, 'max_value' => 1440 ], 'Error message' )
	 *
	 * @param string|array $rules   Validation rules (string or array).
	 * @param string       $message Custom error message.
	 *
	 * @return SettingsElement
	 */
	public function add_validation( $rules, string $message = '' ): SettingsElement {
		$rules_list = array();
		$params     = array();

		if ( is_string( $rules ) ) {
			$rules_list[] = $rules;
		}

		if ( is_array( $rules ) ) {
			foreach ( $rules as $key => $value ) {
				if ( is_int( $key ) ) {
					// Indexed value - rule name or error message.
					if ( $this->is_validation_rule( $value ) ) {
						$rules_list[] = $value;
					} elseif ( empty( $message ) ) {
						$message = $value;
					}
					continue;
				}

				// Associative key - rule name with its param value.
				$rules_list[] = $key;

				if ( in_array( $key, array( 'min_value', 'max_value' ), true ) ) {
					$params[ str_replace( '_value', '', $key ) ] = $value;
				} elseif ( in_array( $key, array( 'in_array', 'not_in' ), true ) ) {
					$params['values'] = (array) $value;
				}
			}
		}

		$this->validations[] = array(
			'rules'   => implode( '|', $rules_list ),
			'message' => $message,
			'params'  => $params,
		);

		return $this;
	}

	/**
	 * Check if a string is a valid validation rule name.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param mixed $value The value to check.
	 *
	 * @return bool True if it's a validation rule name.
	 */
	protected function is_validation_rule( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$validation_rules = array(
			'required',
			'not_empty',
			'min_value',
			'max_value',
			'in_array',
			'not_in',
		);

		return in_array( $value, $validation_rules, true );
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
	 * @since DOKAN_SINCE Updated to support error messages from data_validation.
	 *
	 * @param mixed $data Data to store.
	 *
	 * @return bool
	 */
	public function validate( $data ): bool {
		$validity = $this->data_validation( $data );

		if ( $validity && $this->is_support_children() ) {
			foreach ( $this->get_children() as $child ) {
				// Allow partial updates: only validate child if it is present in the incoming data.
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
            'tooltip'        => $this->get_tooltip(),
			'display'        => true, // to manage element display action from dependencies.
			'hook_key'       => $this->get_hook_key(),
			'children'       => $children,
			'description'    => $this->get_description(),
			'dependency_key' => $this->get_dependency_key(),
			'dependencies'   => $this->get_dependencies(),
			'validations'    => $this->get_validations(),
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

		if ( $this->is_support_children() && is_array( $data ) ) {
			foreach ( $this->get_children() as $child ) {
				// Allow partial updates: only sanitize child if present in incoming data
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
	 * @since DOKAN_SINCE Updated return type to support error messages.
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
