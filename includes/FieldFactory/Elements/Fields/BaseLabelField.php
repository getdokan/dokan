<?php
/**
 * Base Label Field Element
 *
 * Section/group label field (display only).
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class BaseLabelField
 */
class BaseLabelField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'text';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'base_field_label';

    /**
     * Label size (small, medium, large).
     *
     * @var string
     */
    protected string $label_size = 'medium';

    /**
     * Label style (default, bold, uppercase).
     *
     * @var string
     */
    protected string $label_style = 'default';

    /**
     * Base label is read-only by nature.
     *
     * @var bool
     */
    protected bool $read_only = true;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'label_size',
                'label_style',
            ]
        );
    }

    /**
     * Get label size.
     *
     * @return string
     */
    public function get_label_size(): string {
        return $this->label_size;
    }

    /**
     * Get label style.
     *
     * @return string
     */
    public function get_label_style(): string {
        return $this->label_style;
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        // Label fields don't need validation
        return [
            'valid'  => true,
            'errors' => [],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'label_size'  => $this->label_size,
                'label_style' => $this->label_style,
            ]
        );
    }
}
