<?php

namespace WeDevs\Dokan\Admin\Status;

use Exception;
use WeDevs\Dokan\FieldFactory\Adapters\StatusElementAdapter;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;

/**
 * Status Class
 *
 * Fully migrated to use Unified Field Factory.
 *
 * @since 4.0.0
 */
class Status {

	/**
	 * FieldFactory elements container.
	 *
	 * @var ElementInterface[]
	 */
	protected array $elements = [];

	/**
	 * Hook key for filters.
	 *
	 * @var string
	 */
	protected string $hook_key = 'dokan_status';

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Constructor can be extended if needed
	}

	/**
	 * Render status elements.
	 *
	 * @return array StatusElement render format for frontend compatibility.
	 */
	public function render(): array {
		try {
			$this->describe();
		} catch ( Exception $e ) {
			dokan_log( $e->getMessage() );
		}

		// Convert FieldFactory elements to StatusElement format for frontend
		return StatusElementAdapter::to_status_format_array( $this->elements );
	}

	/**
	 * Describe the status elements using FieldFactory.
	 *
	 * @return void
	 * @throws Exception
	 */
	public function describe(): void {
		// If elements already exist (e.g., added programmatically or in tests),
		// skip the describe logic and only fire the hook
		if ( ! empty( $this->elements ) ) {
			/**
			 * Action hook fired after describing status elements.
			 * Allows other classes (like VendorNavMenuChecker) to add elements.
			 *
			 * @since 4.0.0
			 *
			 * @param Status $status Status instance.
			 */
			do_action( 'dokan_status_after_describing_elements', $this );
			return;
		}

		// Build status elements using FieldFactory
		// This method can be extended by child classes or via filters
		$this->elements = [];

		/**
		 * Filter to modify FieldFactory elements before rendering.
		 *
		 * @since 4.0.0
		 *
		 * @param ElementInterface[] $elements FieldFactory elements.
		 * @param Status             $status   Status instance.
		 *
		 * @return ElementInterface[] Modified elements.
		 */
		$this->elements = apply_filters(
			'dokan_status_field_elements',
			$this->elements,
			$this
		);

		/**
		 * Action hook fired after describing status elements.
		 * Allows other classes (like VendorNavMenuChecker) to add elements.
		 *
		 * @since 4.0.0
		 *
		 * @param Status $status Status instance.
		 */
		do_action( 'dokan_status_after_describing_elements', $this );
	}

	/**
	 * Add FieldFactory element.
	 *
	 * @since 4.0.0
	 *
	 * @param ElementInterface $element FieldFactory element.
	 *
	 * @return self
	 */
	public function add( ElementInterface $element ): self {
		$this->elements[] = $element;
		return $this;
	}

	/**
	 * Add multiple FieldFactory elements.
	 *
	 * @since 4.0.0
	 *
	 * @param ElementInterface[] $elements FieldFactory elements.
	 *
	 * @return self
	 */
	public function add_elements( array $elements ): self {
		foreach ( $elements as $element ) {
			if ( $element instanceof ElementInterface ) {
				$this->elements[] = $element;
			}
		}
		return $this;
	}

	/**
	 * Get FieldFactory elements.
	 *
	 * @since 4.0.0
	 *
	 * @return ElementInterface[]
	 */
	public function get_elements(): array {
		return $this->elements;
	}

	/**
	 * Clear all elements.
	 *
	 * @since 4.0.0
	 *
	 * @return self
	 */
	public function clear(): self {
		$this->elements = [];
		return $this;
	}

	/**
	 * Get hook key.
	 *
	 * @since 4.0.0
	 *
	 * @return string
	 */
	public function get_hook_key(): string {
		return $this->hook_key;
	}
}
