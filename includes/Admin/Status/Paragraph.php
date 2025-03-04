<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class Paragraph extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'paragraph';


    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        $allowed_tags = [
            'a' => [
                'href' => [],
                'title' => [],
            ],
            'br' => [],
            'em' => [],
            'strong' => [],
            'span' => [],
            'code' => [],
        ];
        return wp_kses( $data, $allowed_tags );
    }
}
