<?php

namespace WeDevs\Dokan\Product;

use WC_Product_Attribute;
use WC_Product;

defined( 'ABSPATH' ) || exit;

/**
* Manage Product Attributes.
*
* @package dokan
*
* @since 3.7.10
*/
class ProductAttribute {

    /**
     * Request attributes.
     *
     * @since 3.7.10
     *
     * @var array
     */
    public $request_attributes;

    /**
     * Class constructor.
     *
     * @since 3.7.10
     *
     * @param array $attrs
     */
    public function __construct( $attrs = null ) {
        $this->request_attributes = empty( $attrs ) ? [] : $attrs;
    }

    /**
     * Set request attributes.
     *
     * @since 3.7.10
     *
     * @param array $attrs
     *
     * @return self
     */
    public function set_request_attributes( $attrs = [] ) {
        $this->request_attributes = $attrs;

        return $this;
    }

    /**
     * Get product attributes by product id.
     *
     * @since 3.7.10
     *
     * @param int    $post_id
     * @return array $product_attributes
     */
    public function get( $post_id ) {
        $product = wc_get_product( $post_id );

        if ( ! $product instanceof WC_Product ) {
            return [];
        }

        // Product attributes - taxonomies and custom, ordered, with visibility and variation attributes set
        $attributes = maybe_unserialize( $product->get_attributes() );
        $product_attributes = [];

        if ( empty( $attributes ) ) {
            return $product_attributes;
        }

        // Output all set attributes
        $attribute_keys  = array_keys( $attributes );
        $attribute_total = count( $attribute_keys );

        for ( $i = 0; $i < $attribute_total; $i++ ) {
            $attribute        = $attributes[ $attribute_keys[ $i ] ];
            $taxonomy         = '';
            $attribute_values = [];
            $all_terms        = [];

            if ( $attribute['is_taxonomy'] ) {
                $taxonomy = $attribute['name'];

                if ( ! taxonomy_exists( $taxonomy ) ) {
                    continue;
                }
                $attribute_label = wc_attribute_label( $taxonomy );

                $args = [
                    'orderby'    => 'name',
                    'hide_empty' => 0,
                ];

                $all_terms = get_terms( $taxonomy, apply_filters( 'dokan_product_attribute_terms', $args ) );
                $all_terms = is_wp_error( $all_terms ) ? [] : (array) $all_terms;

                foreach ( $all_terms as $term ) { // phpcs:ignore
                    if ( has_term( absint( $term->term_id ), $taxonomy, $post_id ) ) {
                        $attribute_values[] = $term;
                    }
                }
            } else {
                $attribute_label = apply_filters( 'woocommerce_attribute_label', $attribute['name'], $attribute['name'], false );

                if ( ! empty( $attribute['value'] ) ) {
                    $values = explode( WC_DELIMITER, $attribute['value'] );
                    foreach ( $values as $value ) {
                        $attribute_values[] = [
                            'label' => trim( $value ),
                            'value' => trim( $value ),
                        ];
                    }
                    $all_terms = $attribute_values;
                }
            }

            $product_attributes[] = [
                'id'        => wc_attribute_taxonomy_id_by_name( $attribute_label ),
                'name'      => $attribute_label,
                'slug'      => $taxonomy,
                'visible'   => (bool) $attribute['is_visible'],
                'variation' => (bool) $attribute['is_variation'],
                'taxonomy'  => (bool) $attribute['is_taxonomy'],
                'all_terms' => $all_terms,
                'options'   => $attribute_values,
            ];
        }

        return $product_attributes;
    }

    /**
     * Set and save product attributes.
     *
     * @since 3.7.10
     *
     * @param WC_Product $product
     * @param boolean    $needs_save
     *
     * @example $request_attributes
     * ```
     * $request_attributes = [
     *   {
     *     "id": 6,
     *     "name": "Color",
     *     "position": 0,
     *     "visible": false,
     *     "variation": true,
     *     "options": [
     *       "Black",
     *       "Green"
     *     ]
     *   },
     *   {
     *     "name": "Custom Attribute",
     *     "position": 1,
     *     "visible": true,
     *     "variation": false,
     *     "options": [
     *       "Value 1",
     *       "Value 2"
     *     ]
     *   },
     * ]
     *
     * @return WC_Product|boolean
     */
    public function set( &$product, $needs_save = false ) {
        // Stop if no attributes found.
        if ( ! count( $this->request_attributes ) ) {
            return $product;
        }

        $attributes = [];

        foreach ( $this->request_attributes as $attribute ) {
            $attribute_id   = 0;
            $attribute_name = '';

            // Check ID for global attributes or name for product attributes.
            if ( ! empty( $attribute['id'] ) ) {
                $attribute_id   = absint( $attribute['id'] );
                $attribute_name = wc_attribute_taxonomy_name_by_id( $attribute_id );
            } elseif ( ! empty( $attribute['name'] ) ) {
                $attribute_name = wc_clean( $attribute['name'] );
            }

            if ( ! $attribute_id && ! $attribute_name ) {
                continue;
            }

            if ( $attribute_id ) {
                if ( isset( $attribute['options'] ) ) {
                    $options = $attribute['options'];

                    if ( ! is_array( $attribute['options'] ) ) {
                        // Text based attributes - Posted values are term names.
                        $options = explode( WC_DELIMITER, $options );
                    }

                    $values = array_map( 'wc_sanitize_term_text_based', $options );
                    $values = array_filter( $values, 'strlen' );
                } else {
                    $values = array();
                }

                if ( ! empty( $values ) ) {
                    // Add attribute to array, but don't set values.
                    $attribute_object = new WC_Product_Attribute();
                    $attribute_object->set_id( $attribute_id );
                    $attribute_object->set_name( $attribute_name );
                    $attribute_object->set_options( $values );
                    $attribute_object->set_position( isset( $attribute['position'] ) ? (string) absint( $attribute['position'] ) : '0' );
                    $attribute_object->set_visible( ( isset( $attribute['visible'] ) && $attribute['visible'] ) ? 1 : 0 );
                    $attribute_object->set_variation( ( isset( $attribute['variation'] ) && $attribute['variation'] ) ? 1 : 0 );
                    $attributes[] = $attribute_object;
                }
            } elseif ( isset( $attribute['options'] ) ) {
                // Custom attribute - Add attribute to array and set the values.
                if ( is_array( $attribute['options'] ) ) {
                    $values = $attribute['options'];
                } else {
                    $values = explode( WC_DELIMITER, $attribute['options'] );
                }
                $attribute_object = new WC_Product_Attribute();
                $attribute_object->set_name( $attribute_name );
                $attribute_object->set_options( $values );
                $attribute_object->set_position( isset( $attribute['position'] ) ? (string) absint( $attribute['position'] ) : '0' );
                $attribute_object->set_visible( ( isset( $attribute['visible'] ) && $attribute['visible'] ) ? 1 : 0 );
                $attribute_object->set_variation( ( isset( $attribute['variation'] ) && $attribute['variation'] ) ? 1 : 0 );
                $attributes[] = $attribute_object;
            }
        }

        $product->set_attributes( $attributes );

        if ( $needs_save ) {
            return $product->save() > 0;
        }

        return true;
    }

    /**
     * Set default attribute for product.
     *
     * @since 3.7.10
     *
     * @param WC_Product $product
     * @param boolean    $needs_save
     *
     * @return WC_Product|boolean
     */
    public function set_default( &$product, $needs_save = false ) {
        // Stop if no attributes found.
        if ( ! count( $this->request_attributes ) ) {
            return $product;
        }

        $attributes         = $product->get_attributes();
        $default_attributes = [];

        foreach ( $this->request_attributes as $attribute ) {
            $attribute_id   = 0;
            $attribute_name = '';

            // Check ID for global attributes or name for product attributes.
            if ( ! empty( $attribute['id'] ) ) {
                $attribute_id   = absint( $attribute['id'] );
                $attribute_name = wc_attribute_taxonomy_name_by_id( $attribute_id );
            } elseif ( ! empty( $attribute['name'] ) ) {
                $attribute_name = sanitize_title( $attribute['name'] );
            }

            if ( ! $attribute_id && ! $attribute_name ) {
                continue;
            }

            if ( isset( $attributes[ $attribute_name ] ) ) {
                $_attribute = $attributes[ $attribute_name ];

                if ( $_attribute['is_variation'] ) {
                    $value = isset( $attribute['option'] ) ? wc_clean( stripslashes( $attribute['option'] ) ) : '';

                    if ( ! empty( $_attribute['is_taxonomy'] ) ) {
                        // If dealing with a taxonomy, we need to get the slug from the name posted to the API.
                        $term = get_term_by( 'name', $value, $attribute_name );

                        if ( $term && ! is_wp_error( $term ) ) {
                            $value = $term->slug;
                        } else {
                            $value = sanitize_title( $value );
                        }
                    }

                    if ( $value ) {
                        $default_attributes[ $attribute_name ] = $value;
                    }
                }
            }
        }

        $product->set_default_attributes( $default_attributes );

        if ( $needs_save ) {
            return $product->save() > 0;
        }

        return true;
    }
}
