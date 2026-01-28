<?php
/**
 * Page Container Element
 *
 * A page is a top-level container for settings or admin sections.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Containers
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Containers;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;

/**
 * Class Page
 */
class Page extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'page';

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
