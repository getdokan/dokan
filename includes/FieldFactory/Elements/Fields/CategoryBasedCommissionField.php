<?php
/**
 * Category Based Commission Field
 *
 * Custom field used by Admin Setup Guide (commission step).
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   4.0.0
 */
namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class CategoryBasedCommissionField
 */
class CategoryBasedCommissionField extends AbstractField {

	/**
	 * {@inheritdoc}
	 *
	 * This is a custom, complex field (array-like payload).
	 *
	 * @var string
	 */
	protected string $field_type = 'array';

	/**
	 * {@inheritdoc}
	 *
	 * @var string
	 */
	protected string $variant = 'category_based_commission';

	/**
	 * Categories tree/map used by the UI.
	 *
	 * @var array
	 */
	protected array $categories = [];

	/**
	 * Whether to reset subcategory values.
	 *
	 * Kept for parity with legacy setup-guide payloads.
	 *
	 * @var string
	 */
	protected string $reset_subcategory = 'on';

	/**
	 * {@inheritdoc}
	 */
	protected function get_fillable_properties(): array {
		return array_merge(
			parent::get_fillable_properties(),
			[
				'categories',
				'reset_subcategory',
			]
		);
	}

	/**
	 * {@inheritdoc}
	 */
	public function to_array(): array {
		return array_merge(
			parent::to_array(),
			[
				'categories'        => $this->categories,
				'reset_subcategory' => $this->reset_subcategory,
			]
		);
	}
}
