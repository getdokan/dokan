<?php
/**
 * Subpage Container Element
 *
 * A subpage is a child container within a page.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Containers
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Containers;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;

class Subpage extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'subpage';

    /**
     * Display priority.
     *
     * @var int
     */
    protected int $priority = 100;

    /**
     * Documentation link.
     *
     * @var string
     */
    protected string $doc_link = '';

    /**
     * {@inheritdoc}
     */
    public function get_category(): string {
        return 'container';
    }

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'priority',
                'doc_link',
            ]
        );
    }

    /**
     * Get priority.
     *
     * @return int
     */
    public function get_priority(): int {
        return $this->priority;
    }

    /**
     * Get documentation link.
     *
     * @return string
     */
    public function get_doc_link(): string {
        return $this->doc_link;
    }
}
