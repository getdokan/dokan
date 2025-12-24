<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class Page extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'page';

    protected bool $support_children = true;


    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        // No escaping needed for page data.
        return $data;
    }
}
