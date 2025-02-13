<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class Heading extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'heading';


    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        // No escaping needed for page data.
        return esc_html( $data );
    }
}
