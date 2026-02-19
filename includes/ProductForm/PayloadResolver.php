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
     * @return array Data suitable for WC REST product create/update (categories, tags, images, dimensions, etc.).
     */
    public static function schema_to_wc_api( array $data ): array {
        $out = $data;

        // Remove empty values from the payload
        foreach ( $out as $k => $v ) {
            if ( $v === null || $v === '' ) {
                unset( $out[ $k ] );
            }
        }

        // Meta checkboxes (form sends boolean, meta expects yes/no strings).
        if ( array_key_exists( Elements::DISABLE_SHIPPING_META, $out ) && is_bool( $out[ Elements::DISABLE_SHIPPING_META ] ) ) {
            // Form: true = requires shipping, Meta: 'no' = not disabled.
            $out[ Elements::DISABLE_SHIPPING_META ] = $out[ Elements::DISABLE_SHIPPING_META ] ? 'no' : 'yes';
        }
        if ( array_key_exists( Elements::OVERWRITE_SHIPPING_META, $out ) && is_bool( $out[ Elements::OVERWRITE_SHIPPING_META ] ) ) {
            $out[ Elements::OVERWRITE_SHIPPING_META ] = $out[ Elements::OVERWRITE_SHIPPING_META ] ? 'yes' : 'no';
        }

        // Integer fields: WC REST expects integer (form may send string)
        foreach ( [ Elements::STOCK_QUANTITY, Elements::LOW_STOCK_AMOUNT, Elements::DOWNLOAD_LIMIT, Elements::DOWNLOAD_EXPIRY ] as $key ) {
            if ( array_key_exists( $key, $out ) && $out[ $key ] !== '' && $out[ $key ] !== null && is_numeric( $out[ $key ] ) ) {
                $out[ $key ] = (int) $out[ $key ];
            }
        }

        // categories: category_ids (array of ids) -> categories (array of { id })
        if ( isset( $out[ Elements::CATEGORIES ] ) && is_array( $out[ Elements::CATEGORIES ] ) ) {
            $out['categories'] = array_map(
                static function ( $id ) {
                    return [ 'id' => (int) $id ];
                },
                $out[ Elements::CATEGORIES ]
            );
            unset( $out[ Elements::CATEGORIES ] );
        }

        // tags: product_tag -> tags
        if ( isset( $out[ Elements::TAGS ] ) && is_array( $out[ Elements::TAGS ] ) ) {
            $out['tags'] = array_map(
                static function ( $id ) {
                    return [ 'id' => (int) $id ];
                },
                $out[ Elements::TAGS ]
            );
            unset( $out[ Elements::TAGS ] );
        }

        // brands: product_brand -> brands (if WC or Dokan expects it)
        if ( isset( $out[ Elements::BRANDS ] ) && is_array( $out[ Elements::BRANDS ] ) ) {
            $out['brands'] = array_map(
                static function ( $id ) {
                    return [ 'id' => (int) $id ];
                },
                $out[ Elements::BRANDS ]
            );
            unset( $out[ Elements::BRANDS ] );
        }

        // images: image_id + gallery_image_ids -> images
        $images = [];
        if ( ! empty( $out[ Elements::FEATURED_IMAGE_ID ] ) ) {
            $feat = $out[ Elements::FEATURED_IMAGE_ID ];
            $id   = is_array( $feat ) && isset( $feat['id'] ) ? (int) $feat['id'] : (int) $feat;
            $images[] = [ 'id' => $id ];
            unset( $out[ Elements::FEATURED_IMAGE_ID ] );
        }
        if ( isset( $out[ Elements::GALLERY_IMAGE_IDS ] ) && is_array( $out[ Elements::GALLERY_IMAGE_IDS ] ) ) {
            foreach ( $out[ Elements::GALLERY_IMAGE_IDS ] as $img ) {
                $id = is_array( $img ) && isset( $img['id'] ) ? (int) $img['id'] : (int) $img;
                $images[] = [ 'id' => $id ];
            }
            unset( $out[ Elements::GALLERY_IMAGE_IDS ] );
        }
        if ( ! empty( $images ) ) {
            $out['images'] = $images;
        }

        // dimensions: length, width, height -> dimensions
        if (
            array_key_exists( Elements::DIMENSIONS_LENGTH, $out ) ||
            array_key_exists( Elements::DIMENSIONS_WIDTH, $out ) ||
            array_key_exists( Elements::DIMENSIONS_HEIGHT, $out )
        ) {
            $out['dimensions'] = [
                'length' => isset( $out[ Elements::DIMENSIONS_LENGTH ] ) ? (string) $out[ Elements::DIMENSIONS_LENGTH ] : '',
                'width'  => isset( $out[ Elements::DIMENSIONS_WIDTH ] ) ? (string) $out[ Elements::DIMENSIONS_WIDTH ] : '',
                'height' => isset( $out[ Elements::DIMENSIONS_HEIGHT ] ) ? (string) $out[ Elements::DIMENSIONS_HEIGHT ] : '',
            ];
            unset( $out[ Elements::DIMENSIONS_LENGTH ], $out[ Elements::DIMENSIONS_WIDTH ], $out[ Elements::DIMENSIONS_HEIGHT ] );
        }

        // shipping_class
        if ( array_key_exists( Elements::SHIPPING_CLASS, $out ) ) {
            $out['product_shipping_class'] = (string) $out[ Elements::SHIPPING_CLASS ];
            unset( $out[ Elements::SHIPPING_CLASS ] );
        }

        // upsell_ids / cross_sell_ids: ensure arrays of ids (WC API uses these keys)
        if ( isset( $out[ Elements::UPSELL_IDS ] ) && is_array( $out[ Elements::UPSELL_IDS ] ) ) {
            $ids = array_map(
                static function ( $u ) {
                    if ( is_array( $u ) ) {
                        return (int) ( $u['value'] ?? $u['id'] ?? 0 );
                    }
                    if ( is_object( $u ) && isset( $u->value ) ) {
                        return (int) $u->value;
                    }
                    return (int) $u;
                },
                $out[ Elements::UPSELL_IDS ]
            );
            $out['upsell_ids'] = array_map( 'absint', array_filter( $ids ) );
        }
        if ( isset( $out[ Elements::CROSS_SELL_IDS ] ) && is_array( $out[ Elements::CROSS_SELL_IDS ] ) ) {
            $ids = array_map(
                static function ( $c ) {
                    if ( is_array( $c ) ) {
                        return (int) ( $c['value'] ?? $c['id'] ?? 0 );
                    }
                    if ( is_object( $c ) && isset( $c->value ) ) {
                        return (int) $c->value;
                    }
                    return (int) $c;
                },
                $out[ Elements::CROSS_SELL_IDS ]
            );
            $out['cross_sell_ids'] = array_map( 'absint', array_filter( $ids ) );
        }

        // grouped products (GROUPED_PRODUCTS): ensure array of ids
        if ( isset( $out[ Elements::GROUPED_PRODUCTS ] ) && is_array( $out[ Elements::GROUPED_PRODUCTS ] ) ) {
            $ids = array_map(
                static function ( $c ) {
                    if ( is_array( $c ) ) {
                        return (int) ( $c['value'] ?? $c['id'] ?? 0 );
                    }
                    if ( is_object( $c ) && isset( $c->value ) ) {
                        return (int) $c->value;
                    }
                    return (int) $c;
                },
                $out[ Elements::GROUPED_PRODUCTS ]
            );
            $out[ Elements::GROUPED_PRODUCTS ] = array_map( 'absint', array_filter( $ids ) );
        }

        // attributes: form shape -> WC API shape (id, name, position, visible, variation, options)
        if ( isset( $out[ Elements::ATTRIBUTES ] ) && is_array( $out[ Elements::ATTRIBUTES ] ) ) {
            $out['attributes'] = self::transform_attributes_for_api( $out[ Elements::ATTRIBUTES ] );
        }

        return apply_filters( 'dokan_product_form_payload_resolver', $out );
    }

    /**
     * Transform attributes array to WC REST product schema (options as string array).
     *
     * @param array $attributes List of attribute objects (id, name, options, visible, variation, position).
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
}
