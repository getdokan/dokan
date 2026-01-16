<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

/**
 * Dokan Refresh Select Field.
 */
class RefreshSelectField extends Select {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'refresh_select';

    /**
     * API endpoint for refreshing options.
     *
     * @var string $api_endpoint Full API endpoint path with query args.
     */
    protected string $api_endpoint = '';

    /**
     * Get API endpoint.
     *
     * @return string
     */
    public function get_api_endpoint(): string {
        return $this->api_endpoint;
    }

    /**
     * Set API endpoint.
     *
     * @param string $endpoint Full API endpoint path with query args.
     *
     * @return RefreshSelectField
     */
    public function set_api_endpoint( string $endpoint ): RefreshSelectField {
        $this->api_endpoint = $endpoint;
        return $this;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                 = parent::populate();
        $data['api_endpoint'] = $this->get_api_endpoint();

        return $data;
    }
}
