<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class TableColumn extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'table-column';
    protected bool $support_children = true;


    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        // No escaping needed for table data.
        return $data;
    }
}
