<?php

namespace WeDevs\Dokan\Exceptions;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Handles application-level exceptions and errors in a unified way.
 *
 * This class registers shutdown and error handlers to catch critical or fatal errors.
 * It also displays admin notices in case a module is forcefully deactivated.
 */
class Handler implements Hookable {

    /**
     * Registers hooks for error handling and admin notices.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'dokan_admin_notices', [ $this, 'dokan_store_follow_module_deactivation_notice' ] );

        // Handles fatal errors
        register_shutdown_function( [ $this, 'check_for_fatal_error' ] );

        // Handles non-fatal errors
        set_error_handler( [ $this, 'handle_error' ] );
    }

    /**
     * Detects and handles fatal errors on shutdown.
     *
     * @return void
     */
    public function check_for_fatal_error(): void {
        $error = error_get_last();

        if ( $error && in_array( $error['type'], [ E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR ], true ) ) {
            $this->maybe_deactivate_store_follow_module( $error );
        }
    }

    /**
     * Handles non-fatal runtime errors.
     *
     * @param int    $errno   The level of the error raised.
     * @param string $errstr  The error message.
     * @param string $errfile The filename that the error was raised in.
     * @param int    $errline The line number the error occurred on.
     *
     * @return bool False to allow PHP's internal error handler to run as well.
     */
    public function handle_error( int $errno, string $errstr, string $errfile, int $errline ): bool {
        $this->maybe_deactivate_store_follow_module(
            [
                'message' => $errstr,
                'type'    => $errno,
                'file'    => $errfile,
                'line'    => $errline,
            ]
        );

        return false;
    }

    /**
     * Conditionally deactivates the Follow Store  module based on error content.
     *
     * @see https://github.com/getdokan/dokan-pro/issues/4401
     *
     * @param array $error {
     *     Error details.
     *
     *     @type string $message Error message text.
     *     @type int    $type    Error type code.
     *     @type string $file    File where the error occurred.
     *     @type int    $line    Line number of the error.
     * }
     *
     * @return void
     */
    private function maybe_deactivate_store_follow_module( array $error ): void {
        $msg = $error['message'] ?? '';

        if ( strpos( $msg, 'Abstract_Dokan_Background_Processes' ) !== false ) {
            dokan_log( '[DOKAN] Deactivating follow_store module due to error: ' . $msg );

            $active_modules = get_option( 'dokan_pro_active_modules', [] );

            if ( in_array( 'follow_store', $active_modules, true ) ) {
                $updated_modules = array_filter(
                    $active_modules,
                    fn( $module ) => $module !== 'follow_store'
                );

                update_option( 'dokan_pro_active_modules', $updated_modules );
                set_transient( 'dokan_store_follow_deactivated_forcefully', 'yes', WEEK_IN_SECONDS );

                error_log( '[DOKAN] follow_store module deactivated.' );
            }
        }
    }

    /**
     * Adds an admin notice when the Follow Store  module is forcefully deactivated.
     *
     * @param array $notices Existing Dokan admin notices.
     *
     * @return array Updated list of notices including the deactivation message.
     */
    public function dokan_store_follow_module_deactivation_notice( array $notices ): array {
        if (
            ! current_user_can( 'manage_options' ) ||
            ! get_transient( 'dokan_store_follow_deactivated_forcefully' )
        ) {
            return $notices;
        }

        if ( dokan()->is_pro_exists() && dokan_pro()->module->is_active( 'follow_store' ) ) {
            delete_transient( 'dokan_store_follow_deactivated_forcefully' );

            return $notices;
		}

        $notices[] = [
            'type'        => 'warning',
            'title'       => __( 'Follow Store  Module Deactivated', 'dokan-lite' ),
            'description' => __( 'The <strong>Follow Store </strong> module has been automatically deactivated due to incompatibility with the current versions of Dokan Lite and Dokan Pro. Please update Dokan Pro to the latest version and then reactivate the Follow Store  module.', 'dokan-lite' ),
            'priority'    => 1,
            'actions'     => [
                [
                    'type'   => 'primary',
                    'text'   => __( 'Activate Module', 'dokan-lite' ),
                    'action' => admin_url( '/admin.php?page=dokan#/modules' ),
                ],
            ],
            'scope' => 'global',
        ];

        return $notices;
    }
}
