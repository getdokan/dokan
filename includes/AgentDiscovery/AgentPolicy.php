<?php

namespace WeDevs\Dokan\AgentDiscovery;

class AgentPolicy {

    private $data;

    public function __construct( DataProvider $data ) {
        $this->data = $data;
    }

    public function render() {
        $snapshot = $this->data->snapshot();

        $payload = [
            'marketplace' => [
                'name'        => $snapshot['name'],
                'description' => $snapshot['description'],
                'url'         => $snapshot['home_url'],
                'vendors'     => $snapshot['vendor_count'],
                'products'    => $snapshot['product_count'],
                'categories'  => $snapshot['top_categories'],
            ],
            'capabilities' => $snapshot['capabilities'],
            'endpoints'    => $snapshot['endpoints'],
            'policies'     => $snapshot['policies'],
            'pages'        => $snapshot['pages'],
            'generated_at' => gmdate( 'c', $snapshot['generated_at'] ),
        ];

        $payload = apply_filters( 'dokan_agent_policy_payload', $payload, $snapshot );

        return wp_json_encode( $payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
    }
}
