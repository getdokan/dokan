<?php

namespace WeDevs\Dokan\ProductEditor;

defined( 'ABSPATH' ) || exit;

/**
 * Resolves product form payload (schema field ids) to WooCommerce REST API shape.
 * Allows the frontend to send data keyed by form field id; server resolves to API keys.
 *
 * @since 5.0.0
 */
class PayloadResolver {

    /**
     * Transform request body from schema field ids to WC REST product API shape.
     * When schema keys are present they are mapped and removed; existing API keys are kept.
     *
     * @since 5.0.0
     *
     * @param array $data Request body (e.g. from get_json_params()).
     *
     * @return array Data suitable for WC REST product create/update.
     */
    public static function resolve( array $data ): array {
        $resolver = new static();

        $out = $resolver->resolve_single_select_fields( $data );
        $out = $resolver->resolve_integer_fields( $out );
        $out = $resolver->resolve_taxonomies( $out );
        $out = $resolver->resolve_images( $out );
        $out = $resolver->resolve_dimensions( $out );
        $out = $resolver->resolve_linked_products( $out );
        $out = $resolver->resolve_attributes( $out );
        $out = $resolver->resolve_additional_fields( $out );

        return apply_filters( 'dokan_product_editor_schema_payload', $out );
    }


    /**
     * Unwrap single-element arrays to scalar strings for fields the WC REST API
     * expects as plain strings (e.g. select variant fields like tax_status).
     *
     * The DataForm select component sends values as arrays (e.g. ['taxable']).
     * WooCommerce product setters expect plain strings.
     *
     * @since 5.0.0
     */
    public function resolve_single_select_fields( array $data ): array {
        $string_fields = [
            Elements::TAX_STATUS,
            Elements::TAX_CLASS,
            Elements::STOCK_STATUS,
            Elements::BACKORDERS,
            Elements::CATALOG_VISIBILITY,
            Elements::STATUS,
            Elements::SHIPPING_CLASS,
        ];

        /**
         * Filter the list of fields that should be unwrapped from single-element arrays to strings.
         *
         * @since 5.0.0
         *
         * @param string[] $string_fields List of field IDs.
         */
        $string_fields = apply_filters( 'dokan_product_editor_single_select_fields', $string_fields );

        foreach ( $string_fields as $key ) {
            if ( isset( $data[ $key ] ) && is_array( $data[ $key ] ) && count( $data[ $key ] ) === 1 ) {
                $data[ $key ] = (string) reset( $data[ $key ] );
            }
        }

        return $data;
    }

    /**
     * Cast numeric string fields to integers for the WC REST API.
     *
     * @since 5.0.0
     */
    public function resolve_integer_fields( array $data ): array {
        $int_fields = [
            Elements::STOCK_QUANTITY,
            Elements::LOW_STOCK_AMOUNT,
            Elements::DOWNLOAD_LIMIT,
            Elements::DOWNLOAD_EXPIRY,
        ];

        foreach ( $int_fields as $key ) {
            if ( ! array_key_exists( $key, $data ) ) {
                continue;
            }

            if ( is_numeric( $data[ $key ] ) ) {
                $data[ $key ] = (int) $data[ $key ];
            } elseif ( $data[ $key ] === '' || $data[ $key ] === null ) {
                unset( $data[ $key ] );
            }
        }

        return $data;
    }

    /**
     * Transform taxonomy fields (categories, tags, brands) from flat ID arrays
     * to the WC REST API format: [ { id: int }, ... ].
     *
     * @since 5.0.0
     */
    public function resolve_taxonomies( array $data ): array {
        $taxonomy_map = [
            Elements::CATEGORIES => 'categories',
            Elements::TAGS       => 'tags',
            Elements::BRANDS     => 'brands',
        ];

        foreach ( $taxonomy_map as $schema_key => $api_key ) {
            if ( isset( $data[ $schema_key ] ) && is_array( $data[ $schema_key ] ) ) {
                $data[ $api_key ] = $this->map_ids_to_objects( $data[ $schema_key ] );
                unset( $data[ $schema_key ] );
            }
        }

        return $data;
    }

    /**
     * Transform featured image and gallery image IDs into the WC REST images array.
     *
     * @since 5.0.0
     */
    public function resolve_images( array $data ): array {
        $images = [];

        if ( ! empty( $data[ Elements::FEATURED_IMAGE_ID ] ) ) {
            $id = $this->extract_image_id( $data[ Elements::FEATURED_IMAGE_ID ] );
            if ( $id > 0 ) {
                $images[] = [ 'id' => $id ];
            }
            unset( $data[ Elements::FEATURED_IMAGE_ID ] );
        }

        if ( isset( $data[ Elements::GALLERY_IMAGE_IDS ] ) && is_array( $data[ Elements::GALLERY_IMAGE_IDS ] ) ) {
            foreach ( $data[ Elements::GALLERY_IMAGE_IDS ] as $img ) {
                $id = $this->extract_image_id( $img );
                if ( $id > 0 ) {
                    $images[] = [ 'id' => $id ];
                }
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
     * @since 5.0.0
     */
    public function resolve_dimensions( array $data ): array {
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
     * Normalize linked product fields (upsells, cross-sells, grouped) to integer ID arrays.
     *
     * @since 5.0.0
     */
    public function resolve_linked_products( array $data ): array {
        $linked_map = [
            Elements::UPSELL_IDS       => 'upsell_ids',
            Elements::CROSS_SELL_IDS   => 'crosssell_ids',
            Elements::GROUPED_PRODUCTS => 'grouped_products',
        ];

        foreach ( $linked_map as $schema_key => $api_key ) {
            if ( ! isset( $data[ $schema_key ] ) || ! is_array( $data[ $schema_key ] ) ) {
                continue;
            }

            $ids = array_map( [ $this, 'extract_product_id' ], $data[ $schema_key ] );
            $ids = array_filter( $ids );

            $data[ $api_key ] = array_values( $ids );
            if ( $schema_key !== $api_key ) {
                unset( $data[ $schema_key ] );
            }
        }

        return $data;
    }

    /**
     * Transform attributes to the WC REST API shape.
     *
     * @since 5.0.0
     */
    public function resolve_attributes( array $data ): array {
        if ( isset( $data[ Elements::ATTRIBUTES ] ) && is_array( $data[ Elements::ATTRIBUTES ] ) ) {
            $data[ Elements::ATTRIBUTES ] = $this->transform_attributes( $data[ Elements::ATTRIBUTES ] );
        }

        return $data;
    }

    /**
     * Transform attributes array to WC REST product schema (options as string array).
     *
     * @since 5.0.0
     *
     * @param array $attributes List of attribute objects.
     *
     * @return array
     */
    public function transform_attributes( array $attributes ): array {
        $result = [];

        foreach ( $attributes as $index => $attr ) {
            $options = $attr['options'] ?? [];

            if ( ! is_array( $options ) ) {
                $options = [ $options ];
            }

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
     * @since 5.0.0
     *
     * @param array $ids Flat array of term IDs.
     *
     * @return array Array of objects with 'id' key.
     */
    public function map_ids_to_objects( array $ids ): array {
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
     * @since 5.0.0
     *
     * @param array|int|string $image Image data.
     *
     * @return int
     */
    public function extract_image_id( $image ): int {
        if ( is_array( $image ) && isset( $image['id'] ) ) {
            return (int) $image['id'];
        }

        return (int) $image;
    }

    /**
     * Extract a product ID from mixed input formats (plain int, array with value/id key, object).
     *
     * @since 5.0.0
     *
     * @param array|object|int|string $item Product reference.
     *
     * @return int
     */
    public function extract_product_id( $item ): int {
        if ( is_array( $item ) ) {
            return (int) ( $item['value'] ?? $item['id'] ?? 0 );
        }

        if ( is_object( $item ) && isset( $item->value ) ) {
            return (int) $item->value;
        }

        return (int) $item;
    }

    /**
     * Resolve additional fields like sale schedule into their API representations.
     *
     * @since 5.0.0
     */
    public function resolve_additional_fields( array $data ): array {
        if ( empty( $data[ Elements::CREATE_SCHEDULE_FOR_DISCOUNT ] ) ) {
            $data[ Elements::DATE_ON_SALE_FROM ] = '';
            $data[ Elements::DATE_ON_SALE_TO ]   = '';
        }
        // convert int to string fields
        $fields = [
            Elements::REGULAR_PRICE,
            Elements::SALE_PRICE,
        ];
        foreach ( $fields as $key ) {
            if ( isset( $data[ $key ] ) && is_numeric( $data[ $key ] ) ) {
                $data[ $key ] = (string) $data[ $key ];
            }
        }
        return $data;
    }
}
