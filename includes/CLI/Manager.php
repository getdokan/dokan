<?php

namespace WeDevs\Dokan\CLI;

/**
 * Dokan WP-CLI command registry.
 *
 * Owns the `wp dokan` command namespace and exposes the `dokan_cli_commands`
 * filter so Dokan and its extensions (e.g. Dokan Pro) can register commands
 * under the same namespace from a single place.
 *
 * @since DOKAN_SINCE
 */
class Manager {

    /**
     * Bootstraps the CLI command registry.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        // Only register commands while running under WP-CLI.
        if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
            return;
        }

        // Register late so every extension has contributed its commands to the filter first.
        add_action( 'init', [ $this, 'register_commands' ], 99 );
    }

    /**
     * Registers every Dokan WP-CLI command collected from the filter.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_commands() {
        // Extensions add their commands as [ 'dokan <command>' => HandlerClass::class ].
        $commands = (array) apply_filters( 'dokan_cli_commands', [] );

        foreach ( $commands as $name => $handler ) {
            \WP_CLI::add_command( $name, $handler );
        }
    }
}
