<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class Table extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'table';
    protected bool $support_children = true;
    protected array $headers = [];

    /**
     * @return array
     */
    public function get_headers(): array {
        return $this->headers;
    }

    /**
     * @param  array  $headers
     *
     * @return Table
     */
    public function set_headers( array $headers ): Table {
        $this->headers = $headers;

        return $this;
    }

    public function render(): array {
        $data = parent::render();
        $data['headers'] = $this->get_headers();

        return $data;
    }

    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        // No escaping needed for table data.
        return $data;
    }
}
