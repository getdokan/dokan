<?php
/**
 * Row container for tables.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Tables
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Tables;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
class TableRow extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'table-row';

    /**
     * Row variant (header, body, footer).
     *
     * @var string
     */
    protected string $row_variant = 'body';

    /**
     * Row status/style (default, success, warning, danger, info).
     *
     * @var string
     */
    protected string $row_status = 'default';

    /**
     * Whether row is clickable.
     *
     * @var bool
     */
    protected bool $clickable = false;

    /**
     * Row click action/URL.
     *
     * @var string
     */
    protected string $click_action = '';

    /**
     * {@inheritdoc}
     */
    public function get_category(): string {
        return 'table';
    }

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'row_variant',
                'row_status',
                'clickable',
                'click_action',
            ]
        );
    }

    /**
     * Get row variant.
     *
     * @return string
     */
    public function get_row_variant(): string {
        return $this->row_variant;
    }

    /**
     * Get row status.
     *
     * @return string
     */
    public function get_row_status(): string {
        return $this->row_status;
    }

    /**
     * Check if clickable.
     *
     * @return bool
     */
    public function is_clickable(): bool {
        return $this->clickable;
    }

    /**
     * Get click action.
     *
     * @return string
     */
    public function get_click_action(): string {
        return $this->click_action;
    }

    /**
     * Get columns (alias for children).
     *
     * @return array
     */
    public function get_columns(): array {
        return $this->get_children();
    }

    /**
     * Add column.
     *
     * @param TableColumn $column Table column.
     *
     * @return self
     */
    public function add_column( ElementInterface $column ): self {
        return $this->add_child( $column );
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'row_variant'  => $this->row_variant,
                'row_status'   => $this->row_status,
                'clickable'    => $this->clickable,
                'click_action' => $this->click_action,
            ]
        );
    }
}
