<?php

namespace WeDevs\Dokan\VendorRegistration;

use Automattic\WooCommerce\Blocks\Utils\CartCheckoutUtils;
use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Passes the registry, defaults and related settings to the block's editor script.
 *
 * @since DOKAN_SINCE
 */
class EditorData implements Hookable {

    /** Global the editor script reads its data from. */
    const JS_GLOBAL = 'dokanVendorRegistrationEditor';

    /** @var FieldRegistry */
    protected FieldRegistry $registry;

    /** @var FormRenderer */
    protected FormRenderer $renderer;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FieldRegistry $registry Field registry.
     * @param FormRenderer  $renderer Form renderer.
     */
    public function __construct( FieldRegistry $registry, FormRenderer $renderer ) {
        $this->registry = $registry;
        $this->renderer = $renderer;
    }

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue' ] );
    }

    /**
     * Attach the editor data to the block's editor script.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function enqueue(): void {
        $handle = generate_block_asset_handle( FormSetup::BLOCK_NAME, 'editorScript' );

        wp_add_inline_script( $handle, 'window.' . self::JS_GLOBAL . ' = ' . wp_json_encode( $this->get_data() ) . ';', 'before' );
        wp_set_script_translations( $handle, 'dokan-lite', plugin_dir_path( DOKAN_FILE ) . 'languages' );
    }

    /**
     * Collect the data the editor needs.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_data(): array {
        $rows = array_map(
            function ( $row ) {
                // Callbacks stay on the server.
                unset( $row['render_callback'], $row['validate_callback'], $row['save_callback'] );

                return $row;
            },
            array_values( $this->registry->get_rows() )
        );

        $data = [
            'sections'       => $this->registry->get_sections(),
            'rows'           => $rows,
            // Every registered row, so a custom field can never take the ID of a module's row that's off.
            'registeredRowIds' => wp_list_pluck( $this->registry->get_registered_rows(), 'id' ),
            'suggestedSteps' => $this->registry->get_suggested_steps(),
            'customTypes'    => FieldRegistry::CUSTOM_FIELD_TYPES,
            'optionTypes'    => FieldRegistry::OPTION_FIELD_TYPES,
            'metaPrefix'     => FieldRegistry::META_KEY_PREFIX,
            'reservedKeys'   => FieldRegistry::RESERVED_META_KEYS,
            'texts'          => $this->renderer->get_default_texts(),
            'login'          => $this->renderer->get_login_settings( [] ),
            'woocommerce'    => [
                'generateUsername'  => 'no' !== get_option( 'woocommerce_registration_generate_username', 'yes' ),
                'generatePassword'  => 'yes' === get_option( 'woocommerce_registration_generate_password', 'yes' ),
                'usesCheckoutBlock' => class_exists( CartCheckoutUtils::class ) && CartCheckoutUtils::is_checkout_block_default(),
                'settingsUrl'       => admin_url( 'admin.php?page=wc-settings&tab=account' ),
            ],
            'dokan'          => [
                'onboardingPageId' => absint( dokan_get_option( 'vendor_onboarding', 'dokan_pages', 0 ) ),
                'termsEnabled'     => 'on' === dokan_get_option( 'enable_tc_on_reg', 'dokan_general', 'off' ),
                'termsPageId'      => absint( dokan_get_option( 'reg_tc_page', 'dokan_pages', 0 ) ),
                'addressEnabled'   => 'on' === dokan_get_option( 'enabled_address_on_reg', 'dokan_general', 'off' ),
                'storeUrlBase'     => home_url( '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ) . '/' ),
                'restNamespace'    => 'dokan/v1',
            ],
        ];

        /**
         * Filter the data the Vendor Registration Form block's editor receives.
         *
         * @since DOKAN_SINCE
         *
         * @param array $data Editor data.
         */
        return (array) apply_filters( 'dokan_vendor_registration_editor_data', $data );
    }
}
