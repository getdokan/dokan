<?php

namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\ProductForm\Factory;
use WeDevs\Dokan\ProductForm\Field;
use WeDevs\Dokan\ProductForm\Section;
use WC_Product_Simple;
use Exception;

class FormManager {

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_action( 'dokan_after_add_product_btn', [ $this, 'add_new_product_link' ] );
        add_action( 'dokan_render_product_form_manager_template', [ $this, 'load_product_edit_template' ] );
        add_action( 'dokan_product_form_manager_inside_content', [ $this, 'load_product_edit_content' ] );
        add_action( 'wp_ajax_dokan_save_product_data', [ $this, 'dokan_save_product_data' ] );
        add_action( 'wp_ajax_dokan_get_product_variations', [ $this, 'dokan_get_product_variations' ] );
    }

    /**
     * Add new product link.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function add_new_product_link() {
        $add_product_url = add_query_arg(
            [
                'form_manager' => 'true',
            ],
            dokan_edit_product_url( 0, true )
        );
        ?>
        <a href="<?php echo esc_url( $add_product_url ); ?>" class="dokan-btn dokan-btn-theme">
            <i class="fas fa-briefcase">&nbsp;</i>
            <?php esc_html_e( 'Form Manager', 'dokan-lite' ); ?>
        </a>
        <?php
    }

    /**
     * Load product edit template.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_product_edit_template() {
        dokan_get_template_part( 'products/form-manager/form-wrapper' );
    }

    /**
     * Load product edit content.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_product_edit_content() {
        // check for permission
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this page', 'dokan-lite' ),
                ]
            );

            return;
        }

        // check if seller is enabled for selling
        if ( ! dokan_is_seller_enabled( dokan_get_current_user_id() ) ) {
            dokan_seller_not_enabled_notice();
            return;
        }
        $product_id = isset( $_GET['product_id'] ) ? intval( wp_unslash( $_GET['product_id'] ) ) : 0; //phpcs:ignore
        $new_product = false;

        if ( ! $product_id ) {
            // this is `add new` product page
            $product = new WC_Product_Simple();
            $product->set_status( 'auto-draft' );
            $product->set_name( '' );
            $product->save();
            $new_product = true;
            $product_id     = $product->get_id();
        }
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => __( 'Product not found', 'dokan-lite' ),
                ]
            );

            return;
        }

        dokan_get_template_part(
            'products/form-manager/form-content',
            '', [
				'product' => $product,
			]
        );
        $vendor_earning = dokan()->commission->get_earning_by_product( $product_id );
        // load scripts
        wp_enqueue_script( 'dokan-product-form-manager' );
        wp_enqueue_style( 'dokan-product-form-manager' );
        wp_localize_script(
            'dokan-product-form-manager',
            'dokanFormManager',
            [
                'sections' => self::get_form_fields( $product_id ),
                'form_manager_nonce' => wp_create_nonce( 'form_manager' ),
                'product_id' => $product_id,
                'is_new_product' => $new_product,
                'view_product_url' => get_permalink( $product_id ),
                'vendor_earning' => $vendor_earning,
                'variations' => self::get_product_variations( $product_id ),
            ]
        );
    }

    /**
     * Save product data.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function dokan_save_product_data() {
        if ( ! isset( $_POST['_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_nonce'] ), 'form_manager' ) ) {
            wp_send_json_error(
                [
                    'type'    => 'nonce',
                    'message' => __( 'Are you cheating?', 'dokan-lite' ),
                ]
            );
        }
        try {
			$product = dokan()->product->create( $_POST );
            wp_send_json_success(
                [
					'product' => $product->get_data(),
					'message'    => __( 'Product saved successfully', 'dokan-lite' ),
				]
            );
		} catch ( Exception $e ) {
			wp_send_json_error(
                [
                    'status' => false,
                    'message' => $e->getMessage(),
                ]
            );
		}
    }

    /**
     * Get form fields.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product ID.
     *
     * @return array
     */
    public static function get_form_fields( int $product_id ): array {
        $product    = wc_get_product( $product_id );
        $sections   = [];

        foreach ( Factory::get_sections() as $section ) {
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
                    'hidden_scope' => $field->get_hidden_scope( $product ),
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

    /**
     * Get product variations.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product ID.
     *
     * @return array
     */
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
     * @since DOKAN_SINCE
     *
     * @param int $parent_id The ID of the parent term (0 for top-level).
     *
     * @return array
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

    /**
     * AJAX handler to get product variations.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function dokan_get_product_variations() {
        if ( ! isset( $_GET['product_id'] ) ) {// phpcs:ignore
            wp_send_json_error( __( 'Product ID is required', 'dokan-lite' ) );
        }

        $product_id = intval( wp_unslash( $_GET['product_id'] ) ); // phpcs:ignore
        $variations = self::get_product_variations( $product_id );

        wp_send_json_success( $variations );
    }
}
