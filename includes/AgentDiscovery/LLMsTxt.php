<?php

namespace WeDevs\Dokan\AgentDiscovery;

class LLMsTxt {

    private $data;

    public function __construct( DataProvider $data ) {
        $this->data = $data;
    }

    public function render() {
        $snapshot = $this->data->snapshot();

        $lines = [];

        $lines[] = '# ' . $snapshot['name'];
        $lines[] = '';
        $lines[] = sprintf(
            '> %s',
            sprintf(
                /* translators: 1: marketplace description 2: vendor count 3: product count */
                __( '%1$s Vendors: %2$d | Products: %3$d', 'dokan-lite' ),
                $snapshot['description'],
                $snapshot['vendor_count'],
                $snapshot['product_count']
            )
        );

        if ( ! empty( $snapshot['top_categories'] ) ) {
            $names    = array_map(
                function ( $cat ) {
                    return $cat['name'];
                },
                $snapshot['top_categories']
            );
            $lines[]  = '';
            $lines[]  = '> ' . sprintf( /* translators: %s: comma-separated category list */
                __( 'Top categories: %s', 'dokan-lite' ),
                implode( ', ', $names )
            );
        }

        $lines[] = '';

        $lines[] = '## Agent Capabilities';
        $lines[] = '';
        foreach ( $snapshot['capabilities'] as $cap => $enabled ) {
            $lines[] = sprintf( '- %s: %s', $cap, $enabled ? 'true' : 'false' );
        }
        $lines[] = '';

        $lines[] = '## API Endpoints';
        $lines[] = '';
        foreach ( $snapshot['endpoints'] as $label => $url ) {
            $lines[] = sprintf( '- %s: %s', $label, $url );
        }
        $lines[] = '';

        $lines[] = '## Policies';
        $lines[] = '';
        $lines[] = '- Returns: ' . $snapshot['policies']['returns'];
        $lines[] = '- Shipping: ' . $snapshot['policies']['shipping'];
        $lines[] = '';

        if ( ! empty( $snapshot['pages'] ) ) {
            $lines[] = '## Important pages';
            $lines[] = '';
            foreach ( $snapshot['pages'] as $label => $url ) {
                $lines[] = sprintf( '- %s: %s', $label, $url );
            }
            $lines[] = '';
        }

        $lines[] = sprintf( '<!-- generated: %s -->', gmdate( 'c', $snapshot['generated_at'] ) );

        $body = implode( "\n", $lines ) . "\n";

        return apply_filters( 'dokan_llms_txt_body', $body, $snapshot );
    }
}
