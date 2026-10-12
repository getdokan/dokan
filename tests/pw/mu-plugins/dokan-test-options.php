<?php
/**
 * Plugin Name: Dokan — E2E Option Helper
 * Description: TEST-ONLY REST route (namespace `dokan-test/v1`) that reads and writes
 *              `dokan_*` options through get_option()/update_option(). Since Dokan 5.2.0 the
 *              mapped settings live in `dokan_admin_settings` and are overlaid on the legacy
 *              `dokan_*` rows, so only a write that goes through update_option() is adopted
 *              by the settings bridge; a raw SQL write to the legacy row is shadowed.
 *              Used by tests/pw/utils/dbUtils.ts. NOT for production use.
 *
 *              GET  /dokan-test/v1/option?name=dokan_general   -> { name, value } (overlay applied)
 *              POST /dokan-test/v1/option { name, value }      -> { name, value } after the write
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

add_action(
    'rest_api_init',
    function () {
        register_rest_route(
            'dokan-test/v1',
            '/option',
            [
                'methods'             => [ 'GET', 'POST' ],
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
                'args'                => [
                    'name' => [
                        'required'          => true,
                        'validate_callback' => function ( $name ) {
                            return is_string( $name ) && 0 === strpos( $name, 'dokan_' );
                        },
                    ],
                ],
                'callback'            => function ( WP_REST_Request $request ) {
                    $name = $request->get_param( 'name' );
                    if ( 'POST' === $request->get_method() ) {
                        // Serialized strings arrive as-is from raw row snapshots; store the PHP value.
                        update_option( $name, maybe_unserialize( $request->get_param( 'value' ) ) );
                    }

                    return rest_ensure_response(
                        [
                            'name'  => $name,
                            'value' => get_option( $name, null ),
                        ]
                    );
                },
            ]
        );
    }
);
