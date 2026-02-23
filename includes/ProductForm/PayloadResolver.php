<?php

namespace WeDevs\Dokan\ProductForm;

defined( 'ABSPATH' ) || exit;

/**
 * Resolves product form payload (schema field ids) to WooCommerce REST API shape.
 * Allows the frontend to send data keyed by form field id; server resolves to API keys.
 *
 * @since DOKAN_SINCE
 */
class PayloadResolver {

    /**
     * Transform request body from schema field ids to WC REST product API shape.
     * When schema keys are present they are mapped and removed; existing API keys are kept.
     *
     * @since DOKAN_SINCE
     *
     * @param array $data Request body (e.g. from get_json_params()).
     *
     * @return array Data suitable for WC REST product create/update.
     */
    public static function schema_to_wc_api( array $data ): array {
        $out = self::strip_empty_values( $data );
        $out = self::resolve_meta_booleans( $out );
        $out = self::resolve_integer_fields( $out );
        $out = self::resolve_taxonomies( $out );
        $out = self::resolve_images( $out );
        $out = self::resolve_dimensions( $out );
        $out = self::resolve_shipping_class( $out );
        $out = self::resolve_linked_products( $out );
        $out = self::resolve_attributes( $out );

        return apply_filters( 'dokan_product_form_schema_payload', $out );
    }

    /**
     * Remove null and empty-string values from the payload.
     *
     * @since DOKAN_SINCE
     */
    private static function strip_empty_values( array $data ): array {
        return array_filter(
            $data,
            static function ( $v ) {
                return $v !== null && $v !== '';
            }
        );
    }

    /**
     * Convert boolean meta flags to yes/no strings expected by WooCommerce.
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_meta_booleans( array $data ): array {
        $meta_map = [
            // Form: true = requires shipping → Meta: 'no' = not disabled.
            Elements::DISABLE_SHIPPING_META   => [
				true => 'no',
				false => 'yes',
			],
            Elements::OVERWRITE_SHIPPING_META => [
				true => 'yes',
				false => 'no',
			],
        ];

        foreach ( $meta_map as $key => $mapping ) {
            if ( array_key_exists( $key, $data ) && is_bool( $data[ $key ] ) ) {
                $data[ $key ] = $mapping[ $data[ $key ] ];
            }
        }

        return $data;
    }

    /**
     * Cast numeric string fields to integers for the WC REST API.
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_integer_fields( array $data ): array {
        $int_fields = [
            Elements::STOCK_QUANTITY,
            Elements::LOW_STOCK_AMOUNT,
            Elements::DOWNLOAD_LIMIT,
            Elements::DOWNLOAD_EXPIRY,
        ];

        foreach ( $int_fields as $key ) {
            if ( array_key_exists( $key, $data ) && $data[ $key ] !== '' && $data[ $key ] !== null && is_numeric( $data[ $key ] ) ) {
                $data[ $key ] = (int) $data[ $key ];
            }
        }

        return $data;
    }

    /**
     * Transform taxonomy fields (categories, tags, brands) from flat ID arrays
     * to the WC REST API format: [ { id: int }, ... ].
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_taxonomies( array $data ): array {
        $taxonomy_map = [
            Elements::CATEGORIES => 'categories',
            Elements::TAGS       => 'tags',
            Elements::BRANDS     => 'brands',
        ];

        foreach ( $taxonomy_map as $schema_key => $api_key ) {
            if ( isset( $data[ $schema_key ] ) && is_array( $data[ $schema_key ] ) ) {
                $data[ $api_key ] = self::map_ids_to_objects( $data[ $schema_key ] );
                unset( $data[ $schema_key ] );
            }
        }

        return $data;
    }

    /**
     * Transform featured image and gallery image IDs into the WC REST images array.
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_images( array $data ): array {
        $images = [];

        if ( ! empty( $data[ Elements::FEATURED_IMAGE_ID ] ) ) {
            $images[] = [ 'id' => self::extract_image_id( $data[ Elements::FEATURED_IMAGE_ID ] ) ];
            unset( $data[ Elements::FEATURED_IMAGE_ID ] );
        }

        if ( isset( $data[ Elements::GALLERY_IMAGE_IDS ] ) && is_array( $data[ Elements::GALLERY_IMAGE_IDS ] ) ) {
            foreach ( $data[ Elements::GALLERY_IMAGE_IDS ] as $img ) {
                $images[] = [ 'id' => self::extract_image_id( $img ) ];
            }
            unset( $data[ Elements::GALLERY_IMAGE_IDS ] );
        }

        if ( ! empty( $images ) ) {
            $data['images'] = $images;
        }

        return $data;
    }

    /**
     * Combine individual dimension fields into a nested dimensions object.
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_dimensions( array $data ): array {
        $dimension_keys = [
            'length' => Elements::DIMENSIONS_LENGTH,
            'width'  => Elements::DIMENSIONS_WIDTH,
            'height' => Elements::DIMENSIONS_HEIGHT,
        ];

        $has_dimensions = false;
        foreach ( $dimension_keys as $element_key ) {
            if ( array_key_exists( $element_key, $data ) ) {
                $has_dimensions = true;
                break;
            }
        }

        if ( ! $has_dimensions ) {
            return $data;
        }

        $dimensions = [];
        foreach ( $dimension_keys as $dim_name => $element_key ) {
            $dimensions[ $dim_name ] = isset( $data[ $element_key ] ) ? (string) $data[ $element_key ] : '';
            unset( $data[ $element_key ] );
        }

        $data['dimensions'] = $dimensions;

        return $data;
    }

    /**
     * Map the schema shipping_class key to the WC API product_shipping_class key.
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_shipping_class( array $data ): array {
        if ( array_key_exists( Elements::SHIPPING_CLASS, $data ) ) {
            $data['product_shipping_class'] = (string) $data[ Elements::SHIPPING_CLASS ];
            unset( $data[ Elements::SHIPPING_CLASS ] );
        }

        return $data;
    }

    /**
     * Normalize linked product fields (upsells, cross-sells, grouped) to integer ID arrays.
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_linked_products( array $data ): array {
        $linked_keys = [
            Elements::UPSELL_IDS,
            Elements::CROSS_SELL_IDS,
            Elements::GROUPED_PRODUCTS,
        ];

        foreach ( $linked_keys as $key ) {
            if ( isset( $data[ $key ] ) && is_array( $data[ $key ] ) ) {
                $data[ $key ] = array_map( 'absint', array_filter( array_map( [ __CLASS__, 'extract_product_id' ], $data[ $key ] ) ) );
            }
        }

        return $data;
    }

    /**
     * Transform attributes to the WC REST API shape.
     *
     * @since DOKAN_SINCE
     */
    private static function resolve_attributes( array $data ): array {
        if ( isset( $data[ Elements::ATTRIBUTES ] ) && is_array( $data[ Elements::ATTRIBUTES ] ) ) {
            $data[ Elements::ATTRIBUTES ] = self::transform_attributes_for_api( $data[ Elements::ATTRIBUTES ] );
        }

        return $data;
    }

    /**
     * Transform attributes array to WC REST product schema (options as string array).
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes List of attribute objects.
     *
     * @return array
     */
    private static function transform_attributes_for_api( array $attributes ): array {
        $result = [];

        foreach ( $attributes as $index => $attr ) {
            $options = $attr['options'] ?? [];

            if ( isset( $attr['terms'] ) && is_array( $attr['terms'] ) ) {
                $options = array_map(
                    static function ( $o ) use ( $attr ) {
                        foreach ( $attr['terms'] as $t ) {
                            if ( (int) ( $t['value'] ?? $t['id'] ?? 0 ) === (int) $o ) {
                                return $t['label'] ?? (string) $o;
                            }
                        }
                        return (string) $o;
                    },
                    $options
                );
            } else {
                $options = array_map( 'strval', $options );
            }

            $result[] = [
                'id'        => isset( $attr['id'] ) ? (int) $attr['id'] : 0,
                'name'      => isset( $attr['name'] ) ? (string) $attr['name'] : '',
                'position'  => isset( $attr['position'] ) ? (int) $attr['position'] : $index,
                'visible'   => ! empty( $attr['visible'] ),
                'variation' => ! empty( $attr['variation'] ),
                'options'   => $options,
            ];
        }

        return $result;
    }

    /**
     * Convert an array of IDs to WC REST taxonomy format: [ { id: int }, ... ].
     *
     * @since DOKAN_SINCE
     *
     * @param array $ids Flat array of term IDs.
     *
     * @return array Array of objects with 'id' key.
     */
    private static function map_ids_to_objects( array $ids ): array {
        return array_map(
            static function ( $id ) {
                return [ 'id' => (int) $id ];
            },
            $ids
        );
    }

    /**
     * Extract an image ID from either a plain integer or an array with 'id' key.
     *
     * @since DOKAN_SINCE
     *
     * @param array|int|string $image Image data.
     *
     * @return int
     */
    private static function extract_image_id( $image ): int {
        if ( is_array( $image ) && isset( $image['id'] ) ) {
            return (int) $image['id'];
        }

        return (int) $image;
    }

    /**
     * Extract a product ID from mixed input formats (plain int, array with value/id key, object).
     *
     * @since DOKAN_SINCE
     *
     * @param array|object|int|string $item Product reference.
     *
     * @return int
     */
    private static function extract_product_id( $item ): int {
        if ( is_array( $item ) ) {
            return (int) ( $item['value'] ?? $item['id'] ?? 0 );
        }

        if ( is_object( $item ) && isset( $item->value ) ) {
            return (int) $item->value;
        }

        return (int) $item;
    }
}
