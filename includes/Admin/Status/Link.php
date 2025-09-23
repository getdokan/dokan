<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class Link extends StatusElement {

    /**
     * @var string
     */
    protected string $type = 'link';
    protected string $url = '';
    protected string $title_text = '';

    /**
     * @return string
     */
    public function get_url(): string {
        return $this->url;
    }

    /**
     * @param  string  $url
     *
     * @return Link
     */
    public function set_url( string $url ): Link {
        $this->url = $url;

        return $this;
    }

    /**
     * @return string
     */
    public function get_title_text(): string {
        return $this->title_text;
    }

    /**
     * @param  string  $title_text
     *
     * @return Link
     */
    public function set_title_text( string $title_text ): Link {
        $this->title_text = $title_text;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function render(): array {
        $data = parent::render();
        $data['url'] = $this->get_url();
        $data['title_text'] = $this->get_title_text();
        return $data;
    }

    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        return esc_html( $data );
    }
}
