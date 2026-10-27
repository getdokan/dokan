<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Contracts\Hookable;

defined( 'ABSPATH' ) || exit;

/**
 * Makes the WooCommerce ability schemas in the catalog usable by strict MCP clients.
 *
 * Clients built on the MCP TypeScript SDK (Claude Desktop through a proxy, the MCP Inspector)
 * validate every result against the tool's output schema with full format checking, and list a
 * tool's fields from the top-level `properties` of its input schema. WooCommerce's schemas trip
 * both: order and product dates are declared `date-time` but carry no timezone, so every read is
 * rejected on the client; and product-create / product-update keep their fields inside `oneOf`
 * branches (one per product type), so the client shows no fields at all.
 *
 * Only the schemas change, and only for the abilities the Dokan server exposes; values stay as
 * WooCommerce sends them, and the Abilities API still validates input through the branches.
 *
 * @since DOKAN_SINCE
 */
class ToolSchemas implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        // After the scope classes (priority 10) have added their own properties.
        add_filter( 'wp_register_ability_args', [ $this, 'make_portable' ], 20, 2 );
    }

    /**
     * Adjust the schemas of a catalog ability.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $args Ability registration arguments.
     * @param string $name Ability name.
     *
     * @return array
     */
    public function make_portable( $args, $name ) {
        if ( ! is_array( $args ) || ! in_array( $name, Catalog::configured_ability_ids(), true ) ) {
            return $args;
        }

        if ( isset( $args['output_schema'] ) && is_array( $args['output_schema'] ) ) {
            $args['output_schema'] = self::without_date_time_format( $args['output_schema'] );
        }

        if ( isset( $args['input_schema'] ) && is_array( $args['input_schema'] ) ) {
            $args['input_schema'] = self::with_top_level_properties( $args['input_schema'] );
        }

        return $args;
    }

    /**
     * Drop `format: date-time` everywhere in a schema; the `string` type stays.
     *
     * @since DOKAN_SINCE
     *
     * @param array $schema A JSON schema.
     *
     * @return array
     */
    public static function without_date_time_format( array $schema ): array {
        if ( 'date-time' === ( $schema['format'] ?? '' ) ) {
            unset( $schema['format'] );
        }

        foreach ( $schema as $key => $value ) {
            if ( is_array( $value ) ) {
                $schema[ $key ] = self::without_date_time_format( $value );
            }
        }

        return $schema;
    }

    /**
     * Mirror the union of the `oneOf` branches' properties at the top level, so a client can
     * list the fields. The branches stay, so validation is unchanged.
     *
     * @since DOKAN_SINCE
     *
     * @param array $schema An input schema.
     *
     * @return array
     */
    public static function with_top_level_properties( array $schema ): array {
        if ( ! empty( $schema['properties'] ) || empty( $schema['oneOf'] ) || ! is_array( $schema['oneOf'] ) ) {
            return $schema;
        }

        $properties = [];

        foreach ( $schema['oneOf'] as $branch ) {
            foreach ( (array) ( $branch['properties'] ?? [] ) as $key => $definition ) {
                if ( ! isset( $properties[ $key ] ) ) {
                    $properties[ $key ] = $definition;
                    continue;
                }

                // One field may allow different values per branch (`product_type_alias`); offer them all.
                if ( isset( $definition['enum'], $properties[ $key ]['enum'] ) && is_array( $definition['enum'] ) && is_array( $properties[ $key ]['enum'] ) ) {
                    $properties[ $key ]['enum'] = array_values( array_unique( array_merge( $properties[ $key ]['enum'], $definition['enum'] ) ) );
                }
            }
        }

        if ( ! empty( $properties ) ) {
            $schema['properties'] = $properties;
        }

        return $schema;
    }
}
