<?php
/**
 * Repeatable group of fields element.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

class RepeaterField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'array';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'repeater';

    /**
     * Sub-fields configuration.
     *
     * @var array
     */
    protected array $sub_fields = [];

    /**
     * Minimum rows.
     *
     * @var int
     */
    protected int $min_rows = 0;

    /**
     * Maximum rows.
     *
     * @var int|null
     */
    protected ?int $max_rows = null;

    /**
     * Add button text.
     *
     * @var string
     */
    protected string $add_button_text = '';

    /**
     * Remove button text.
     *
     * @var string
     */
    protected string $remove_button_text = '';

    /**
     * Enable row reordering.
     *
     * @var bool
     */
    protected bool $sortable = true;

    /**
     * Collapsed by default.
     *
     * @var bool
     */
    protected bool $collapsed = false;

    /**
     * Row layout (table, block, row).
     *
     * @var string
     */
    protected string $row_layout = 'table';

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'sub_fields',
                'min_rows',
                'max_rows',
                'add_button_text',
                'remove_button_text',
                'sortable',
                'collapsed',
                'row_layout',
            ]
        );
    }

    /**
     * Get sub-fields configuration.
     *
     * @return array
     */
    public function get_sub_fields(): array {
        return $this->sub_fields;
    }

    /**
     * Get minimum rows.
     *
     * @return int
     */
    public function get_min_rows(): int {
        return $this->min_rows;
    }

    /**
     * Get maximum rows.
     *
     * @return int|null
     */
    public function get_max_rows(): ?int {
        return $this->max_rows;
    }

    /**
     * Get add button text.
     *
     * @return string
     */
    public function get_add_button_text(): string {
        return ! empty( $this->add_button_text )
            ? $this->add_button_text
            : __( 'Add Row', 'dokan-lite' );
    }

    /**
     * Get remove button text.
     *
     * @return string
     */
    public function get_remove_button_text(): string {
        return ! empty( $this->remove_button_text )
            ? $this->remove_button_text
            : __( 'Remove', 'dokan-lite' );
    }

    /**
     * Check if sortable.
     *
     * @return bool
     */
    public function is_sortable(): bool {
        return $this->sortable;
    }

    /**
     * Check if collapsed by default.
     *
     * @return bool
     */
    public function is_collapsed(): bool {
        return $this->collapsed;
    }

    /**
     * Get row layout.
     *
     * @return string
     */
    public function get_row_layout(): string {
        return $this->row_layout;
    }

    /**
     * {@inheritdoc}
     */
    public function get_value( array $item = [] ) {
        $value = parent::get_value( $item );
        return is_array( $value ) ? $value : [];
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        $result = parent::validate( $item );
        $rows   = $this->get_value( $item );
        $count  = count( $rows );

        // Min rows validation
        if ( $count < $this->min_rows ) {
            $this->errors['min_rows'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: %d: minimum rows */
                    __( 'At least %d rows are required.', 'dokan-lite' ),
                    $this->min_rows
                ),
            ];
        }

        // Max rows validation
        if ( $this->max_rows !== null && $count > $this->max_rows ) {
            $this->errors['max_rows'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: %d: maximum rows */
                    __( 'Maximum %d rows allowed.', 'dokan-lite' ),
                    $this->max_rows
                ),
            ];
        }

        return [
            'valid'  => empty( $this->errors ),
            'errors' => $this->errors,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'sub_fields'         => $this->sub_fields,
                'min_rows'           => $this->min_rows,
                'max_rows'           => $this->max_rows,
                'add_button_text'    => $this->get_add_button_text(),
                'remove_button_text' => $this->get_remove_button_text(),
                'sortable'           => $this->sortable,
                'collapsed'          => $this->collapsed,
                'row_layout'         => $this->row_layout,
            ]
        );
    }
}
