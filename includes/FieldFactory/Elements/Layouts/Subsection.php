<?php
/**
 * Nested container within a section.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Layouts
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Layouts;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;
class Subsection extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'subsection';

    /**
     * {@inheritdoc}
     */
    public function get_category(): string {
        return 'layout';
    }
}
