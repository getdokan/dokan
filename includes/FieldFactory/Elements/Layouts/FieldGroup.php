<?php
/**
 * Field Group Element
 *
 * Groups related fields together.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Layouts
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Layouts;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;

/**
 * Class FieldGroup
 */
class FieldGroup extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'fieldgroup';

    /**
     * Group layout (vertical, horizontal, inline, grid).
     *
     * @var string
     */
    protected string $layout = 'vertical';

    /**
     * Number of columns (for grid layout).
     *
     * @var int
     */
    protected int $columns = 2;

    /**
     * Gap between fields (CSS value).
     *
     * @var string
     */
    protected string $gap = '1rem';

    /**
     * Whether group has border.
     *
     * @var bool
     */
    protected bool $bordered = false;

    /**
     * Whether group is collapsible.
     *
     * @var bool
     */
    protected bool $collapsible = false;

    /**
     * Whether group is collapsed by default.
     *
     * @var bool
     */
    protected bool $collapsed = false;

    /**
     * {@inheritdoc}
     */
    public function get_category(): string {
        return 'layout';
    }

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'layout',
                'columns',
                'gap',
                'bordered',
                'collapsible',
                'collapsed',
            ]
        );
    }

    /**
     * Get layout.
     *
     * @return string
     */
    public function get_layout(): string {
        return $this->layout;
    }

    /**
     * Get columns count.
     *
     * @return int
     */
    public function get_columns(): int {
        return $this->columns;
    }

    /**
     * Get gap.
     *
     * @return string
     */
    public function get_gap(): string {
        return $this->gap;
    }

    /**
     * Check if bordered.
     *
     * @return bool
     */
    public function is_bordered(): bool {
        return $this->bordered;
    }

    /**
     * Check if collapsible.
     *
     * @return bool
     */
    public function is_collapsible(): bool {
        return $this->collapsible;
    }

    /**
     * Check if collapsed.
     *
     * @return bool
     */
    public function is_collapsed(): bool {
        return $this->collapsed;
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'layout'      => $this->layout,
                'columns'     => $this->columns,
                'gap'         => $this->gap,
                'bordered'    => $this->bordered,
                'collapsible' => $this->collapsible,
                'collapsed'   => $this->collapsed,
            ]
        );
    }
}
