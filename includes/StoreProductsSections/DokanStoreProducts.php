<?php

namespace WeDevs\Dokan\StoreProductsSections;

/**
 * Single store products class.
 *
 * For displaying additional products sections to single store page.
 *
 * @since 3.3.5
 *
 * @package dokan
 */
abstract class DokanStoreProducts {

    /**
     * Products section appearance settings.
     *
     * @since 3.3.5
     *
     * @var array
     */
    public $products_section_appearance = [];

    /**
     * Products to display in each additional sections.
     *
     * @since 3.3.5
     *
     * @var int
     */
    public $items_to_show = 3;

    /**
     * Store products section setting fields counter.
     *
     * @since 3.3.5
     *
     * @var bool
     */
    public static $store_setting_fields_counter = 0;

    /**
     * Additional products section status.
     *
     * @since 3.3.5
     *
     * @var bool
     */
    public static $has_additional_products_section = false;

    /**
     * Vendor ID.
     *
     * @since 3.3.5
     *
     * @var int
     */
    public $vendor_id = 0;

    /**
     * Store info.
     *
     * @since 3.3.5
     *
     * @var array
     */
    public $store_info = [];

    /**
     * Settings capability.
     *
     * @since 3.3.5
     *
     * @var string
     */
    public $capability = 'manage_options';

    /**
     * DokanStoreProducts constructor.
     *
     * @since 3.3.5
     */
    public function __construct() {
        $this->products_section_appearance = dokan_get_option( 'store_products_section', 'dokan_appearance' );
        $this->items_to_show               = apply_filters( 'dokan_store_products_section_number_of_items', get_option( 'woocommerce_catalog_columns', 3 ) );

        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_products_section' ], 5, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_title_for_regular_products' ], 99 );
        add_action( 'dokan_store_customizer_after_vendor_products', [ $this, 'render_customizer_settings_fields' ] );
        add_action( 'dokan_settings_after_store_more_products', [ $this, 'render_store_settings_form_fields' ], 10, 2 );
    }

    /**
     * Get products section data.
     *
     * @since 3.3.5
     *
     * @return array
     */
    abstract public function get_products_section_data();

    /**
     * Get customizer settings data.
     *
     * @since 3.3.5
     *
     * @return array
     */
    abstract public function get_customizer_settings_data();

    /**
     * Get store settings data.
     *
     * @since 3.3.5
     *
     * @return array
     */
    abstract public function get_store_settings_data();

    /**
     * Render additional products section.
     *
     * @since 3.3.5
     *
     * @param object $store_user Store user data
     * @param array  $store_info Store info data
     *
     * @return void
     */
    public function render_additional_products_section( $store_user, $store_info ) {
        $this->vendor_id  = $store_user->ID;
        $this->store_info = $store_info;

        // Get data for additional products section.
        $args = $this->get_products_section_data();

        // Check if there is any products.
        if ( ! $args['products']->have_posts() ) {
            return;
        }

        // Check if desired products section visibility enabled by admin and vendor.
        if ( ! $this->is_products_block_visible( $args['customizer_key'], $args['settings_key'] ) ) {
            return;
        }

        // Turns additional products section stat to true
        self::$has_additional_products_section = true;

        // Include product template after passing all checks.
        dokan_get_template_part(
            'store-products-block', '', [
                'products'      => $args['products'],
                'section_id'    => $args['section_id'],
                'section_title' => $args['section_title'],
            ]
        );
    }

    /**
     * Render additional title for regular products block.
     *
     * @since 3.3.5
     *
     * @return void
     */
    public function render_additional_title_for_regular_products() {
        // Check if there is any additional procucts section
        if ( empty( self::$has_additional_products_section ) ) {
            return;
        }

        // Turns additional products section stat to false again
        self::$has_additional_products_section = false;

        // Print the additional title for regular products
        ?>
            <h2 class="products-list-heading"><?php esc_html_e( 'All Products', 'dokan-lite' ); ?></h2>
        <?php
    }

    /**
     * Render customizer settings data.
     *
     * @since 3.3.5
     *
     * @param object $wp_customize
     *
     * @return void
     */
    public function render_customizer_settings_fields( $wp_customize ) {
        // Get data for customizer settings data.
        $args = $this->get_customizer_settings_data();

        $wp_customize->add_setting(
            'dokan_appearance[store_products_section][' . $args['customizer_key'] . ']',
            [
                'default'              => 'on',
                'type'                 => 'option',
                'capability'           => $this->capability,
                'sanitize_callback'    => 'dokan_bool_to_on_off',
                'sanitize_js_callback' => 'dokan_on_off_to_bool',
            ]
        );

        $wp_customize->add_control(
            $args['customizer_key'],
            [
                'label'    => $args['customizer_title'],
                'section'  => 'dokan_store',
                'settings' => 'dokan_appearance[store_products_section][' . $args['customizer_key'] . ']',
                'type'     => 'checkbox',
            ]
        );
    }

    public function render_store_settings_form_fields( $vendor, $profile_info ) {
        if ( ! array_search( 'off', $this->products_section_appearance ) ) {
            return;
        }

        $args                  = $this->get_store_settings_data();
        $show_products_section = isset( $profile_info[$args['settings_key']] ) ? $profile_info[$args['settings_key']] : 'no';

        // Increase store products section setting fields counter
        self::$store_setting_fields_counter++;
        ?>
        <div class="dokan-form-group">
            <label class="dokan-w3 dokan-control-label">
                <?php
                if ( 1 === self::$store_setting_fields_counter ) {
                    esc_html_e( 'Store page product sections', 'dokan-lite' );
                }
                ?>
            </label>

            <div class="dokan-w5 dokan-text-left">

            <?php if ( isset( $this->products_section_appearance[$args['customizer_key']] ) && 'off' === $this->products_section_appearance[$args['customizer_key']] ) : ?>
                <div class="checkbox">
                    <label>
                        <input type="checkbox" name="<?php echo esc_attr( $args['settings_field_name'] ); ?>" value="yes" <?php checked( $show_products_section, 'yes' ); ?>> <?php echo esc_html( $args['settings_field_label'] ); ?>
                    </label>
                </div>
            <?php endif; ?>

            </div>
        </div>
        <?php
    }

    /**
     * Check products block visibility settings by admin and vendor.
     *
     * @since 3.3.5
     *
     * @param string $customizer_key Cusomizer key for checking products section visibility by admin
     * @param string $settings_key   Settings key for checking products section visibility by vendor
     *
     * @return bool
     */
    public function is_products_block_visible( $customizer_key, $settings_key ) {
        // Check if current products section enabled by admin.
        if ( ! isset( $this->products_section_appearance[ $customizer_key ] ) || 'on' === $this->products_section_appearance[ $customizer_key ] ) {
            return false;
        }

        // Check if current products section enabled by vendor.
        if ( isset( $this->store_info[ $settings_key ] ) && 'no' === $this->store_info[ $settings_key ] ) {
            return false;
        }

        return true;
    }
}
