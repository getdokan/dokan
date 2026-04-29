<?php

namespace WeDevs\Dokan\REST;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Admin Extensions REST Controller.
 *
 * Handles plugin installation from the extensions page.
 *
 * @since SUSPENDED
 */
class AdminExtensionsController extends DokanBaseAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'extensions';

    /**
     * Register routes.
     *
     * @since SUSPENDED
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/install', [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'install_plugin' ],
                    'args'                => [
                        'slug' => [
                            'description'       => __( 'Plugin slug from WordPress.org.', 'dokan-lite' ),
                            'type'              => 'string',
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                    ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Install a plugin from WordPress.org.
     *
     * @since SUSPENDED
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function install_plugin( $request ) {
        $slug = $request->get_param( 'slug' );

        include_once ABSPATH . 'wp-admin/includes/file.php';
        include_once ABSPATH . 'wp-admin/includes/plugin-install.php';
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        include_once ABSPATH . 'wp-admin/includes/plugin.php';

        // Check if already installed.
        $installed_plugins = get_plugins();
        foreach ( $installed_plugins as $basename => $plugin_data ) {
            $parts = explode( '/', $basename );
            if ( ! empty( $parts[0] ) && $parts[0] === $slug ) {
                return rest_ensure_response(
                    [
                        'success'  => true,
                        'message'  => __( 'Plugin is already installed.', 'dokan-lite' ),
                        'basename' => $basename,
                    ]
                );
            }
        }

        // Fetch plugin info from WordPress.org.
        $api = plugins_api(
            'plugin_information', [
                'slug'   => $slug,
                'fields' => [
                    'sections' => false,
                ],
            ]
        );

        if ( is_wp_error( $api ) ) {
            return new WP_Error(
                'dokan_rest_plugin_info_failed',
                /* translators: %s: plugin slug */
                sprintf( __( 'Unable to fetch plugin information for %s.', 'dokan-lite' ), $slug ),
                [ 'status' => 400 ]
            );
        }

        $upgrader  = new \Plugin_Upgrader( new \WP_Ajax_Upgrader_Skin() );
        $installed = $upgrader->install( $api->download_link );

        if ( is_wp_error( $installed ) ) {
            return $installed;
        }

        if ( ! $installed ) {
            return new WP_Error(
                'dokan_rest_plugin_install_failed',
                /* translators: %s: plugin slug */
                sprintf( __( 'Unable to install %s.', 'dokan-lite' ), $slug ),
                [ 'status' => 500 ]
            );
        }

        return rest_ensure_response(
            [
                'success' => true,
                'message' => __( 'Plugin installed successfully.', 'dokan-lite' ),
            ]
        );
    }
}