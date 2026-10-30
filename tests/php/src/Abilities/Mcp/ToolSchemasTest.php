<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\ToolSchemas;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * The Dokan server's tool schemas, as strict MCP clients need them.
 */
class ToolSchemasTest extends DokanTestCase {

    public function test_date_time_formats_are_dropped_from_tool_output_schemas() {
        $args = [
            'output_schema' => [
                'type'       => 'object',
                'properties' => [
                    'products' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'date_created' => [
                                    'type'   => 'string',
                                    'format' => 'date-time',
                                ],
                                'permalink'    => [
                                    'type'   => 'string',
                                    'format' => 'uri',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $portable = ( new ToolSchemas() )->make_portable( $args, 'woocommerce/products-query' );
        $item     = $portable['output_schema']['properties']['products']['items']['properties'];

        $this->assertArrayNotHasKey( 'format', $item['date_created'] );
        $this->assertSame( 'string', $item['date_created']['type'] );
        $this->assertSame( 'uri', $item['permalink']['format'] );

        // Abilities the Dokan server does not offer as tools are not touched.
        $this->assertSame( $args, ( new ToolSchemas() )->make_portable( $args, 'woocommerce/customers-query' ) );
    }

    public function test_one_of_branches_are_mirrored_as_top_level_properties() {
        $args = [
            'input_schema' => [
                'type'  => 'object',
                'oneOf' => [
                    [
                        'type'       => 'object',
                        'properties' => [
                            'product_type_alias' => [
                                'type' => 'string',
                                'enum' => [ 'physical' ],
                            ],
                            'name'               => [ 'type' => 'string' ],
                            'regular_price'      => [ 'type' => 'string' ],
                        ],
                        'required'   => [ 'name' ],
                    ],
                    [
                        'type'       => 'object',
                        'properties' => [
                            'product_type_alias' => [
                                'type' => 'string',
                                'enum' => [ 'digital' ],
                            ],
                            'name'               => [ 'type' => 'string' ],
                            'downloads'          => [ 'type' => 'array' ],
                        ],
                        'required'   => [ 'name', 'product_type_alias' ],
                    ],
                ],
            ],
        ];

        $schema = ( new ToolSchemas() )->make_portable( $args, 'woocommerce/product-create' )['input_schema'];

        $this->assertSame( [ 'product_type_alias', 'name', 'regular_price', 'downloads' ], array_keys( $schema['properties'] ) );
        $this->assertSame( [ 'physical', 'digital' ], $schema['properties']['product_type_alias']['enum'] );
        $this->assertCount( 2, $schema['oneOf'] );

        // A schema that already lists its fields keeps them.
        $flat = [
            'input_schema' => [
                'type'       => 'object',
                'properties' => [ 'id' => [ 'type' => 'integer' ] ],
            ],
        ];
        $this->assertSame( $flat, ( new ToolSchemas() )->make_portable( $flat, 'woocommerce/product-delete' ) );
    }
}
