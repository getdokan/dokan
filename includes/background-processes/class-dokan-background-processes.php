<?php

/**
 * Continue all Dokan background processes
 */
class Dokan_Background_Processes {

    /**
     * Class constructor
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function __construct() {
        $processes = get_option( 'dokan_background_processes', array() );

        if ( ! empty( $processes ) ) {
            foreach ( $processes as $processor => $file ) {
                if ( file_exists( $file ) ) {
                    include_once $file;
                    new $processor();
                }
            }
        }
    }
}

