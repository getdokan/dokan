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
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_product_sections' ], 5, 1 );
        // vendor store settings section
        add_action( 'dokan_settings_after_store_more_products', [ $this, 'render_store_settings_form_fields' ], 10, 2 );
        add_filter( 'dokan_store_profile_settings_args', [ $this, 'process_store_settings_form_fields' ] );
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
        $vendor     = dokan()->vendor->get( $store_user->ID );
        $store_info = $vendor->get_shop_info();

        $section_count  = 0;
        $store_settings = isset( $store_info['product_sections'] ) ? $store_info['product_sections'] : [];

        foreach ( $this->container as $section_object ) {
            // check if we've got AbstractProductSection class instance
            if ( ! $section_object instanceof AbstractProductSection ) {
                continue;
            }

            // Check if desired products section visibility enabled by admin and vendor.
            if ( ! $this->is_visible( $section_object, $store_settings ) ) {
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

        //Render additional title for regular products block
        if ( $section_count > 0 ) {
            printf( '<h2 class="products-list-heading">%1$s</h2>', esc_html__( 'All Products', 'dokan-lite' ) );
        }
    }

    /**
     * Render store settings form fields.
     *
     * @since 3.3.7
     *
     * @param int   $vendor_id    Vendor id
     * @param array $profile_info Vendor profile info
     *
     * @return void
     */
    public function render_store_settings_form_fields( $vendor_id, $profile_info ) {
        $setting_count = 0;
        foreach ( $this->container as $section_object ) {
            // check if we've got AbstractProductSection class instance
            if ( ! $section_object instanceof AbstractProductSection ) {
                continue;
            }

            if ( ! $section_object->get_show_in_settings() ) {
                continue;
            }

            // check if enabled from customizer
            if ( ! $section_object->is_enabled() ) {
                continue;
            }

            // Current products section visibility setting by vendor
            $show_products_section = isset( $profile_info['product_sections'][ $section_object->get_section_id() ] ) ? $profile_info['product_sections'][ $section_object->get_section_id() ] : 'yes';

            if ( 0 === $setting_count ) {
                $setting_count = 1;
				?>
                <div class="dokan-form-group">
                    <label class="dokan-w3 dokan-control-label"><?php esc_html_e( 'Store page product sections', 'dokan-lite' ); ?></label>
                    <div class="dokan-w5 dokan-text-left">
				<?php
            }
            ?>
                    <div class="checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="product_sections[<?php echo sanitize_key( $section_object->get_section_id() ); ?>]"
                                <?php /* translators: %s: product section name. */ ?>
                                value="yes" <?php checked( $show_products_section, 'yes' ); ?>> <?php echo esc_html( sprintf( __( 'Show %s section', 'dokan-lite' ), $section_object->get_section_label() ) ); ?>
                        </label>
                    </div>
            <?php
        }

        if ( 1 === $setting_count ) {
			?>
                    </div>
                </div>
			<?php
        }
    }

    /**
     * Save store products section settings input data.
     *
     * @since 3.3.7
     *
     * @param array $dokan_settings Dokan settings data
     *
     * @return array
     */
    public function process_store_settings_form_fields( $dokan_settings ) {
        // Validate nonce
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'dokan_store_settings_nonce' ) ) {
            return $dokan_settings;
        }

        foreach ( $this->container as $section_object ) {
            // check if we've got AbstractProductSection class instance
            if ( ! $section_object instanceof AbstractProductSection ) {
                continue;
            }

            $dokan_settings['product_sections'][ $section_object->get_section_id() ] = 'no';

            if ( ! $section_object->get_show_in_settings() ) {
                continue;
            }

            // check if enabled from customizer
            if ( ! $section_object->is_enabled() ) {
                continue;
            }

            if ( isset( $_POST['product_sections'][ $section_object->get_section_id() ] ) ) {
                // Add inputs to the store settings args
                $dokan_settings['product_sections'][ $section_object->get_section_id() ] = 'yes';
            }
        }

        return $dokan_settings;
    }

    /**
     * Check products block visibility settings by admin and vendor.
     *
     * @since 3.3.7
     *
     * @param AbstractProductSection $section_object
     * @param array $store_settings
     *
     * @return bool
     */
    protected function is_visible( $section_object, $store_settings ) {
        // Check if current products section enabled by admin.
        if ( ! $section_object->is_enabled() ) {
            return false;
        }

        // Check if current products section enabled by vendor.
        // for setting fields, default value is show
        if ( $section_object->get_show_in_settings() &&
            (
                isset( $store_settings[ $section_object->get_section_id() ] ) &&
                'yes' !== $store_settings[ $section_object->get_section_id() ]
            )
        ) {
            return false;
        }

        return true;
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
