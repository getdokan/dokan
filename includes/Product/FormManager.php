<?php

namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\ProductForm\Factory as ProductFormFactory;
use WeDevs\Dokan\ProductForm\Field;
use WeDevs\Dokan\ProductForm\Section;

class FormManager {


    public static function get_form_fields( int $product_id ): array {
        $product    = wc_get_product( $product_id );
        $sections   = [];

        foreach ( ProductFormFactory::get_sections() as $section ) {
            /** @var Section $section */
            if ( is_wp_error( $section ) ) {
                continue;
            }

            $fields = [];

            foreach ( $section->get_fields() as $field ) {
                /** @var Field $field */
                if ( is_wp_error( $field ) ) {
                    continue;
                }

                $value = '';
                if ( $product ) {
                    try {
                        $value = $field->get_value( $product );
                    } catch ( \Throwable $e ) {
                        dokan_log( 'Error getting value for product ' . $product->get_id() . ': ' . $e->getMessage() );
                    }
                }

                $fields[] = [
                    'id'            => $field->get_id(),
                    'name'          => $field->get_name(),
                    'title'         => $field->get_title(),
                    'tooltip'       => $field->get_tooltip(),
                    'section_id'    => $section->get_id(),
                    'is_custom'     => $field->is_custom(),
                    'order'         => $field->get_order(),
                    'description'   => $field->get_description(),
                    'required'      => $field->is_required(),
                    'value'         => $value,
                    'field_type'    => $field->get_field_type(),
                    'options'       => $field->get_options( $product ),
                    'visibility'    => $field->is_visible(),
                    'placeholder'   => $field->get_placeholder(),
                    'help_content'  => $field->get_help_content(),
                    // dependency
                    'dependency_condition' => $field->get_dependency_condition(),
                    'hide_on_product_types' => $field->get_hide_on_product_types(),
                ];
            }

            $sections[] = [
                'id'     => $section->get_id(),
                'title'  => $section->get_title(),
                'order'  => $section->get_order(),
                'description' => $section->get_description(),
                'fields' => $fields,
            ];
        }
		return $sections;
	}

    public static function get_product_variations( int $product_id ): array {
        $variations = wc_get_products(
            [
                'status'  => [ 'private', 'publish' ],
                'type'    => 'variation',
                'parent'  => $product_id,
                'orderby' => [
                    'menu_order' => 'ASC',
                    'ID'         => 'DESC',
                ],
                'return'  => 'objects',
            ]
        );

        $variations_data = [];
        $parent_product  = wc_get_product( $product_id );

        if ( $variations ) {
            $iteration = 0;
            foreach ( $variations as $variation ) {
                /** @var \WC_Product_Variation $variation */
                $variation_id     = $variation->get_id();
                $formatted_attrs  = [];
                $attribute_values = $variation->get_attributes( 'edit' );

                foreach ( $parent_product->get_attributes( 'edit' ) as $attribute ) {
                    if ( ! $attribute->get_variation() ) {
                        continue;
                    }

                    $selected_val = isset( $attribute_values[ sanitize_title( $attribute->get_name() ) ] ) ? $attribute_values[ sanitize_title( $attribute->get_name() ) ] : '';
                    $options      = [];
                    $selected = null;

                    if ( $attribute->is_taxonomy() ) {
                        foreach ( $attribute->get_terms() as $option ) {
                            $opt = [
                                'value' => $option->slug,
                                'label' => apply_filters( 'woocommerce_variation_option_name', $option->name, $option, $attribute->get_name(), $parent_product ),
                            ];
                            $options[] = $opt;

                            if ( $selected_val === $opt['value'] ) {
                                $selected = $opt;
                            }
                        }
                    } else {
                        foreach ( $attribute->get_options() as $option ) {
                            $opt = [
                                'value' => $option,
                                'label' => apply_filters( 'woocommerce_variation_option_name', $option, null, $attribute->get_name(), $parent_product ),
                            ];
                            $options[] = $opt;

                            if ( $selected_val === $opt['value'] ) {
                                $selected = $opt;
                            }
                        }
                    }

                    $formatted_attrs[] = [
                        'label'           => wc_attribute_label( $attribute->get_name() ),
                        'value'           => sanitize_title( $attribute->get_name() ),
                        'selected_value' => $selected,
                        'options'        => $options,
                    ];
                }

                $variations_data[] = [
                    'id'         => $variation_id,
                    'parent_id'  => $product_id,
                    'menu_order' => $iteration++,
                    'attributes' => $formatted_attrs,
                ];
            }
        }
        return $variations_data;
    }

	/**
     * Get product brands recursively.
     *
     * @param int $parent_id The ID of the parent term (0 for top-level).
     *
     * @return array
     *
     * @since DOKAN_SINCE
     */
    public static function get_products_brands( int $parent_id = 0 ): array {
        $args = apply_filters(
            'dokan_product_brands_args', [
                'taxonomy'   => 'product_brand',
                'hide_empty' => 0,
                'parent'     => $parent_id,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]
        );

        $terms = get_terms( $args );
        $results = [];

        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            foreach ( $terms as $term ) {
                $children = self::get_products_brands( $term->term_id );

                $data = [
                    'value' => $term->term_id,
                    'slug'  => $term->slug,
                    'label' => $term->name,
                    'parent' => $parent_id,
                ];

                if ( ! empty( $children ) ) {
                    $data['children'] = $children;
                }

                $results[] = $data;
            }
        }

        return apply_filters( 'dokan_get_products_brands_data', $results );
    }

    /**
     * Search product tags
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_product_tags(): array {
        $drop_down_tags = apply_filters(
            'dokan_product_tags_args', [
                'taxonomy'   => 'product_tag',
                'hide_empty' => 0,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]
        );

        $data = [];
        $product_tags = get_terms( $drop_down_tags );
        if ( $product_tags ) {
            foreach ( $product_tags as $term ) {
                $data[] = [
                    'value' => $term->term_id,
                    'slug'  => $term->slug,
                    'label' => $term->name,
                ];
            }
        }

        return $data;
    }
}
