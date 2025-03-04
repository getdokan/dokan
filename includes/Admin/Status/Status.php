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
