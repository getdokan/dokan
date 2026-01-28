<?php
/**
 * Section Layout Element
 *
 * A section is a container that groups related fields or subsections.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Layouts
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Layouts;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;

class Section extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'section';

    /**
     * Display order.
     *
     * @var int
     */
    protected int $order = 10;

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
        return 'layout';
    }

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'order',
                'doc_link',
            ]
        );
    }

    /**
     * Get display order.
     *
     * @return int
     */
    public function get_order(): int {
        return $this->order;
    }

    /**
     * Set display order.
     *
     * @param int $order Order value.
     *
     * @return self
     */
    public function set_order( int $order ): self {
        $this->order = $order;
        return $this;
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
