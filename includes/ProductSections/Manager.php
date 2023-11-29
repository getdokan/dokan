<?php

namespace WeDevs\Dokan\ProductSections;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

use Wedevs\Dokan\Traits\ChainableContainer;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * Dokan store products section manager class
 *
 * @since 3.3.7
 */
class Manager {

    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since 3.3.7
     */
    public function __construct() {
        $this->init_classes();
        $this->init_hooks();
    }

    /**
     * Register all products section classes to chainable container
     *
     * @since 3.3.7
     *
     * @return void
     */
    public function init_classes() {
        $this->container['featured']     = new Featured();
        $this->container['latest']       = new Latest();
        $this->container['best_selling'] = new BestSelling();
        $this->container['top_rated']    = new TopRated();

        $this->container = apply_filters( 'dokan_product_sections_container', $this->container );
    }

    /**
     * Init required hooks
     *
     * @since 3.3.7
     *
     * @return void
     */
    public function init_hooks() {
        // customizer settings
        add_action( 'dokan_store_customizer_after_vendor_products', [ $this, 'render_customizer_settings_fields' ] );
        // render product sections on single store page
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_product_sections' ], 20, 1 );
    }

    /**
     * Render customizer settings fields.
     *
     * @since 3.3.7
     *
     * @param object $wp_customize
     *
     * @return void
     */
    public function render_customizer_settings_fields( $wp_customize ) {
        foreach ( $this->container as $section_object ) {
            // check if we've got AbstractProductSection class instance
            if ( ! $section_object instanceof AbstractProductSection ) {
                continue;
            }

            if ( ! $section_object->get_show_in_customizer() ) {
                continue;
            }

            $wp_customize->add_setting(
                'dokan_appearance[product_sections][' . $section_object->get_section_id() . ']',
                [
                    'default'              => 'on',
                    'type'                 => 'option',
                    'capability'           => 'manage_options',
                    'sanitize_callback'    => 'dokan_bool_to_on_off',
                    'sanitize_js_callback' => 'dokan_string_to_bool',
                ]
            );

            $wp_customize->add_control(
                $section_object->get_section_id(),
                [
                    /* translators: %s: product section name. */
                    'label'    => sprintf( __( 'Hide %s section', 'dokan-lite' ), $section_object->get_section_label() ),
                    'section'  => 'dokan_store',
                    'settings' => 'dokan_appearance[product_sections][' . $section_object->get_section_id() . ']',
                    'type'     => 'checkbox',
                ]
            );

            $wp_customize->add_setting(
                'dokan_appearance[product_sections][' . $section_object->get_section_id() . '_title]',
                [
                    'default'              => $section_object->get_section_title(),
                    'type'                 => 'option',
                    'capability'           => 'manage_options',
                    'sanitize_callback'    => 'sanitize_text_field',
                    'sanitize_js_callback' => 'sanitize_text_field',
                ]
            );

            $wp_customize->add_control(
                $section_object->get_section_id() . '_title',
                [
                    /* translators: %s: product section name. */
                    'label'    => sprintf( __( 'Section title for %s', 'dokan-lite' ), $section_object->get_section_label() ),
                    'section'  => 'dokan_store',
                    'settings' => 'dokan_appearance[product_sections][' . $section_object->get_section_id() . '_title]',
                    'type'     => 'text',
                ]
            );
        }
    }

    /**
     * Render additional products section.
     *
     * @since 3.3.7
     *
     * @param \WP_User $store_user Store user data
     * @param array  $store_info Store info data
     * @param Vendor $vendor Vendor class instance
     *
     * @return void
     */
    public function render_additional_product_sections( $store_user ) {
        $vendor        = dokan()->vendor->get( $store_user->ID );
        $section_count = 0;

        foreach ( $this->container as $section_object ) {
            // check if we've got AbstractProductSection class instance
            if ( ! $section_object instanceof AbstractProductSection ) {
                continue;
            }

            // Check if desired products section visibility enabled from customizer.
            if ( ! $section_object->is_enabled() ) {
                continue;
            }

            // get products
            $products = $section_object->get_products( $vendor->get_id() );

            // Check if there is any products.
            if ( ! $products instanceof \WP_Query || ! $products->have_posts() ) {
                continue;
            }

            $section_count++;

            // Include product template after passing all checks.
            dokan_get_template_part(
                'store-products-section', '', [
                    'section_id'    => $section_object->get_section_id(),
                    'products'      => $products,
                    'section_title' => $section_object->get_section_title(),
                    'vendor'        => $vendor,
                ]
            );
        }

        // Render additional title for regular products block.
        if ( $section_count > 0 ) {
            printf( '<h2 class="products-list-heading">%1$s</h2>', esc_html__( 'All Products', 'dokan-lite' ) );
        }
    }

    /**
     * Get available product sections
     *
     * @since 3.3.7
     *
     * @return array
     */
    public function get_available_product_sections() {
        $data = [];
        foreach ( $this->container as $section_object ) {
            // check if we've got AbstractProductSection class instance
            if ( ! $section_object instanceof AbstractProductSection ) {
                continue;
            }

            $data[] = [
                'id'    => $section_object->get_section_id(),
                'title' => $section_object->get_section_title(),
            ];
        }

        return $data;
    }
}
