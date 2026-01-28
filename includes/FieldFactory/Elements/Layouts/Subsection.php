<?php
/**
 * Subsection Layout Element
 *
 * A subsection is a nested container within a section.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Layouts
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Layouts;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;

/**
 * Class Subsection
 */
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
