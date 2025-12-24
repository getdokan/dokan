<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class Tab extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'tab';
    protected bool $support_children = true;


    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        // No escaping needed for tab data.
        return $data;
    }
}
