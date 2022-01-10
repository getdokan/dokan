<?php

namespace WeDevs\Dokan\StoreProductsSections;

/**
 * Single store products class.
 *
 * For displaying additional products sections to single store page.
 *
 * @since 3.3.6
 *
 * @package dokan
 */
abstract class DokanStoreProducts {

    /**
     * Products section appearance settings.
     *
     * @since 3.3.6
     *
     * @var array
     */
    public $products_section_appearance = [];

    /**
     * Products to display in each additional sections.
     *
     * @since 3.3.6
     *
     * @var int
     */
    public $items_to_show = 3;

    /**
     * Vendor ID.
     *
     * @since 3.3.6
     *
     * @var int
     */
    public $vendor_id = 0;

    /**
     * Store info.
     *
     * @since 3.3.6
     *
     * @var array
     */
    public $store_info = [];

    /**
     * Settings capability.
     *
     * @since 3.3.6
     *
     * @var string
     */
    protected $capability = 'manage_options';

    /**
     * Store products section setting fields counter.
     *
     * @since 3.3.6
     *
     * @var int
     */
    public static $store_setting_fields_counter = 0;

    /**
     * Additional products section status.
     *
     * @since 3.3.6
     *
     * @var bool
     */
    public static $has_additional_products_section = false;

    /**
     * DokanStoreProducts constructor.
     *
     * @since 3.3.6
     */
    public function __construct() {
        $this->products_section_appearance = dokan_get_option( 'store_products_section', 'dokan_appearance' );
        $this->items_to_show               = apply_filters( 'dokan_store_products_section_number_of_items', get_option( 'woocommerce_catalog_columns', 3 ) );

        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_products_section' ], 5, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_title_for_regular_products' ], 99 );

        add_action( 'dokan_store_customizer_after_vendor_products', [ $this, 'render_customizer_settings_fields' ] );
        add_action( 'dokan_settings_after_store_more_products', [ $this, 'render_store_settings_form_fields' ], 10, 2 );
        add_filter( 'dokan_store_profile_settings_args', [ $this, 'process_store_products_section_settings' ] );
    }

    /**
     * Get products section data.
     *
     * @since 3.3.6
     *
     * @return array
     */
    abstract public function get_products_section_data();

    /**
     * Get customizer settings data.
     *
     * @since 3.3.6
     *
     * @return array
     */
    abstract public function get_customizer_settings_data();

    /**
     * Get store settings data.
     *
     * @since 3.3.6
     *
     * @return array
     */
    abstract public function get_store_settings_data();

    /**
     * Render additional products section.
     *
     * @since 3.3.6
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
            'store-products-section', '', [
                'products_type' => $args['products_type'],
                'products'      => $args['products'],
                'section_id'    => $args['section_id'],
                'section_title' => $args['section_title'],
                'store_user'    => $store_user,
                'store_info'    => $store_info,
            ]
        );
    }

    /**
     * Render additional title for regular products block.
     *
     * @since 3.3.6
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
     * Render customizer settings fields.
     *
     * @since 3.3.6
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

    /**
     * Render store settings form fields.
     *
     * @since 3.3.6
     *
     * @param int   $vendor_id    Vendor id
     * @param array $profile_info Vendor profile info
     *
     * @return void
     */
    public function render_store_settings_form_fields( $vendor_id, $profile_info ) {
        $args = $this->get_store_settings_data();

        // Check if current products section visibility enabled by admin
        if ( empty( $this->products_section_appearance[ $args['customizer_key'] ] ) || 'on' === $this->products_section_appearance[ $args['customizer_key'] ] ) {
            return;
        }

        // Increase store products section setting field counter
        self::$store_setting_fields_counter++;

        ?>
        <div class="dokan-form-group">
        <?php
        // Print store setting input fields for products section by conditional checking
        if ( 1 === self::$store_setting_fields_counter ) {
            ?>
            <label class="dokan-w3 dokan-control-label"><?php esc_html_e( 'Store page product sections', 'dokan-lite' ); ?></label>
            <?php
        } else {
            ?>
            <label class="dokan-w3 dokan-control-label">&nbsp;</label>
            <?php
        }

        // Current products section visibility setting by vendor
        $show_products_section = isset( $profile_info[ $args['settings_key'] ] ) ? $profile_info[ $args['settings_key'] ] : 'yes';
        ?>
            <div class="dokan-w5 dokan-text-left"><div class="checkbox">
                    <label>
                        <input type="checkbox" name="<?php echo esc_attr( $args['settings_field_name'] ); ?>" value="yes" <?php checked( $show_products_section, 'yes' ); ?>> <?php echo esc_html( $args['settings_field_label'] ); ?>
                    </label>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Process store products section settings input data.
     *
     * @since 3.3.6
     *
     * @param array $dokan_settings Dokan settings data
     *
     * @return array
     */
    public function process_store_products_section_settings( $dokan_settings ) {
        // Validate nonce
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'dokan_store_settings_nonce' ) ) {
            return $dokan_settings;
        }

        // Add inputs to the store settings args
        $dokan_settings['show_featured_products']  = isset( $_POST['setting_show_featured_products'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_show_featured_products'] ) ) : 'no';
        $dokan_settings['show_latest_products']    = isset( $_POST['setting_show_latest_products'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_show_latest_products'] ) ) : 'no';
        $dokan_settings['show_best_sell_products'] = isset( $_POST['setting_show_best_sell_products'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_show_best_sell_products'] ) ) : 'no';
        $dokan_settings['show_top_rated_products'] = isset( $_POST['setting_show_top_rated_products'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_show_top_rated_products'] ) ) : 'no';

        return $dokan_settings;
    }

    /**
     * Check products block visibility settings by admin and vendor.
     *
     * @since 3.3.6
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
