<?php

namespace WeDevs\Dokan\Admin\Status;

use WeDevs\Dokan\Abstracts\StatusElement;

class Button extends StatusElement {

    const REQUEST_GET = 'GET';
    const REQUEST_POST = 'POST';

    /**
     * @var string
     */
    protected string $type = 'button';

    /**
     * @var string
     */
    protected string $request = self::REQUEST_GET;

    /**
     * @var string
     */
    protected string $endpoint = '';

    protected array $payload = [];

    /**
     * @return string
     */
    public function get_request(): string {
        return $this->request;
    }

    /**
     * @param  string  $request
     *
     * @return Button
     */
    public function set_request( string $request ): Button {
        $this->request = $request;

        return $this;
    }

    /**
     * @return string
     */
    public function get_endpoint(): string {
        return $this->endpoint;
    }

    /**
     * @param  string  $endpoint
     *
     * @return Button
     */
    public function set_endpoint( string $endpoint ): Button {
        $this->endpoint = $endpoint;

        return $this;
    }

    /**
     * @return array
     */
    public function get_payload(): array {
        return $this->payload;
    }

    /**
     * @param  array  $payload
     *
     * @return Button
     */
    public function set_payload( array $payload ): Button {
        $this->payload = $payload;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function render(): array {
        $data = parent::render();
        $data['request'] = $this->get_request();
        $data['endpoint'] = trim( $this->get_endpoint(), '/' );
        $data['payload'] = $this->get_payload();
        return $data;
    }

    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        return esc_html( $data );
    }
}
