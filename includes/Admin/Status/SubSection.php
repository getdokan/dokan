<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class SubSection extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'sub-section';
    protected bool $support_children = true;


    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        // No escaping needed for page data.
        return $data;
    }
}
