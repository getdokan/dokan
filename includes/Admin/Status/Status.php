<?php

namespace WeDevs\Dokan\Admin\Status;

use Exception;
use WeDevs\Dokan\Abstracts\StatusElement;
use WeDevs\Dokan\VendorNavMenuChecker;

class Status extends StatusElement {

    protected bool $support_children = true;
    protected string $hook_key = 'dokan_status';

    public function __construct() {
        parent::__construct( 'dokan-status' );

        add_action( 'dokan_admin_menu', [ $this, 'register_menu' ], 99, 2 );
        add_action( 'dokan_register_scripts', [ $this, 'register_scripts' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
    }

    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        return $data;
    }

    public function render(): array {
        try {
            $this->describe();
        } catch ( Exception $e ) {
            dokan_log( $e->getMessage() );
        }
        return parent::render()['children'];
    }


    /**
     * Register the submenu menu.
     *
     * @since DOKAN_SINCE
     *
     * @param string $capability Menu capability.
     * @param string $position Menu position.
     *
     * @return void
     */
    public function register_menu( string $capability, string $position ) {
        add_submenu_page(
            'dokan',
            __( 'Dokan Status', 'dokan-lite' ),
            __( 'Status', 'dokan-lite' ),
            $capability,
            'dokan-status',
            [ $this, 'render_status_page' ],
            99
        );
    }

    public function register_scripts() {
        $asset_file = include DOKAN_DIR . '/assets/js/dokan-status.asset.php';

        wp_register_script(
            'dokan-status',
            DOKAN_PLUGIN_ASSEST . '/js/dokan-status.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            [
                'strategy' => 'defer',
                'in_footer' => true,
            ]
        );

        wp_register_style( 'dokan-status', DOKAN_PLUGIN_ASSEST . '/css/dokan-status.css', [], $asset_file['version'] );
    }

    public function enqueue_scripts() {
        if ( 'dokan_page_dokan-status' !== get_current_screen()->id ) {
            return;
        }

        wp_enqueue_script( 'dokan-status' );
        wp_enqueue_style( 'dokan-status' );
    }

    /**
     * Load Status Page Template
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function render_status_page() {
        echo '<div class="wrap"><div id="dokan-status" class="dokan-layout"></div></div>';
    }

    /**
     * Describe the settings options.
     *
     * @return void
     * @throws Exception
     */
    public function describe() {
		//        $this->add(
		//            StatusElementFactory::heading( 'main_heading' )
		//                ->set_title( __( 'Dokan Status', 'dokan-lite' ) )
		//                ->set_description( __( 'Check the status of your Dokan installation.', 'dokan-lite' ) )
		//        );

		//        $this->add(
		//            StatusElementFactory::section( 'overridden_features' )
		//                ->set_title( __( 'Overridden Templates', 'dokan-lite' ) )
		//                ->set_description( __( 'The templates currently overridden that is preventing enabling new features.', 'dokan-lite' ) )
		//                ->add(
		//                    StatusElementFactory::table( 'override_table' )
		//                        ->set_title( __( 'General Heading', 'dokan-lite' ) )
		//                        ->set_headers(
		//                            [
		//                                __( 'Template', 'dokan-lite' ),
		//                                __( 'Feature', 'dokan-lite' ),
		//                                'Action',
		//                            ]
		//                        )
		//                        ->add(
		//                            StatusElementFactory::table_row( 'override_row' )
		//                                ->add(
		//                                    StatusElementFactory::table_column( 'template' )
		//                                        ->add(
		//                                            StatusElementFactory::paragraph( 'file' )
		//                                                ->set_title( __( 'FileA.php', 'dokan-lite' ) )
		//                                        )
		//                                )
		//                                ->add(
		//                                    StatusElementFactory::table_column( 'action' )
		//                                        ->add(
		//                                            StatusElementFactory::button( 'action' )
		//                                                ->set_title( __( 'Remove', 'dokan-lite' ) )
		//                                        )
		//                                )
		//                        )
		//                )
		//        );

        do_action( 'dokan_status_after_describing_elements', $this );
    }
}
