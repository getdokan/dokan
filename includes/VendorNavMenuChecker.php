<?php

namespace WeDevs\Dokan;

use Exception;
use WeDevs\Dokan\Admin\Status\Status;

class VendorNavMenuChecker {

    /**
     * @since DOKAN_SINCE
     *
     * @var array $template_dependencies List of template dependencies.
     * [ 'route' => [ ['slug' => 'template-slug', 'name' => 'template-name' (Optional), 'args' = [] (Optional)  ] ] ]
     */
    protected array $template_dependencies = [
        'withdraw' => [
            [ 'slug' => 'withdraw/withdraw-dashboard' ],
            [ 'slug' => 'withdraw/withdraw' ],
            [ 'slug' => 'withdraw/header' ],
            [ 'slug' => 'withdraw/status-listing' ],
            [ 'slug' => 'withdraw/pending-request-listing' ],
            [ 'slug' => 'withdraw/approved-request-listing' ],
            [ 'slug' => 'withdraw/cancelled-request-listing' ],
            [ 'slug' => 'withdraw/tmpl-withdraw-request-popup' ],
            [ 'slug' => 'withdraw/request-form' ],
            [ 'slug' => 'withdraw/pending-request-listing-dashboard' ],
        ],
    ];

    /**
     * Constructor.
     */

    public function __construct() {
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'convert_to_react_menu' ], 999 );
        add_filter( 'dokan_admin_notices', [ $this, 'display_notice' ] );
        add_action( 'dokan_status_after_describing_elements', [ $this, 'add_status_section' ] );
    }

    /**
     * Get template dependencies.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_template_dependencies(): array {
        return apply_filters( 'dokan_get_dashboard_nav_template_dependency', $this->template_dependencies );
    }

    /**
     * Convert menu items to react menu items
     *
     * @since DOKAN_SINCE
     *
     * @param array $menu_items Menu items.
     *
     * @return array
     */

    public function convert_to_react_menu( array $menu_items ): array {
        return array_map(
            function ( $item ) {
                if ( ! empty( $item['react_route'] ) && $this->is_dependency_resolved( $item['react_route'] ) ) {
                    $item['url'] = $this->get_url_for_route( $item['react_route'] );
                }
                if ( isset( $item['submenu'] ) ) {
                    $item['submenu'] = $this->convert_to_react_menu( $item['submenu'] );
                }

                return $item;
            }, $menu_items
        );
    }

    /**
     * Check if the dependency is cleared or not.
     *
     * @since DOKAN_SINCE
     *
     * @param string $route Route.
     *
     * @return bool
     */
    protected function is_dependency_resolved( string $route ): bool {
        $clear        = true;
        $dependencies = $this->get_template_dependencies_resolutions();

        if ( ! empty( $dependencies[ trim( $route, '/' ) ] ) ) {
            $clear = false;
        }

        return apply_filters( 'dokan_is_dashboard_nav_dependency_resolved', $clear, $route );
    }

    /**
     * Get URL for the route.
     *
     * @since DOKAN_SINCE
     *
     * @param string $route Route.
     *
     * @return string
     */
    protected function get_url_for_route( string $route ): string {
        $route = apply_filters( 'dokan_get_url_for_react_route', $route );

        return dokan_get_navigation_url( 'new' ) . '#' . trim( $route, '/' );
    }

    /**
     * Get template dependencies resolutions.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function get_template_dependencies_resolutions(): array {
        $dependencies = $this->get_template_dependencies();

        $resolved_dependencies = array_map(
            fn( $dependency_array ): array => array_filter(
                array_map(
                    fn( $dependency ) => $this->get_overridden_template(
                        $dependency['slug'],
                        $dependency['name'] ?? '',
                        $dependency['args'] ?? []
                    ),
                    $dependency_array
                )
            ),
            $dependencies
        );

        return apply_filters( 'dokan_get_dashboard_nav_template_dependency_resolutions', $resolved_dependencies );
    }

    /**
     * Get overridden template part path.
     *
     * @since DOKAN_SINCE
     *
     * @param string $slug Template slug.
     * @param string $name Template name.
     * @param array $args Arguments.
     *
     * @return false|string Returns the template file if found otherwise false.
     */
    protected function get_overridden_template( string $slug, string $name = '', array $args = [] ) {
        $defaults         = [ 'pro' => false ];
        $args             = wp_parse_args( $args, $defaults );
        $template         = '';
        $default_template = '';

        // Look in yourtheme/dokan/slug-name.php and yourtheme/dokan/slug.php
        $template_path = ! empty( $name ) ? "{$slug}-{$name}.php" : "{$slug}.php";
        $template      = locate_template( [ dokan()->template_path() . $template_path ] );

        /**
         * Change template directory path filter
         *
         * @since 2.5.3
         */
        $template_path = apply_filters( 'dokan_set_template_path', dokan()->plugin_path() . '/templates', $template, $args );

        // Get default slug-name.php
        if ( ! $template && $name && file_exists( $template_path . "/{$slug}-{$name}.php" ) ) {
            $template         = $template_path . "/{$slug}-{$name}.php";
            $default_template = $template;
        }

        if ( ! $template && ! $name && file_exists( $template_path . "/{$slug}.php" ) ) {
            $template         = $template_path . "/{$slug}.php";
            $default_template = $template;
        }

        // Allow 3rd party plugin filter template file from their plugin
        $template = apply_filters( 'dokan_get_template_part', $template, $slug, $name );

        return $template && $default_template !== $template ? $template : false;
    }

    /**
     * List overridden templates.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function list_overridden_templates(): array {
        $dependencies = $this->get_template_dependencies_resolutions();
        $overridden_templates = [];
        foreach ( $dependencies as $dependency ) {
            $overridden_templates = array_merge( $overridden_templates, $dependency );
        }

        return $overridden_templates;
    }

    /**
     * Display notice if templates are overridden.
     *
     * @since DOKAN_SINCE
     *
     * @param array $notices Notices.
     *
     * @return array
     */
    public function display_notice( array $notices ): array {
        $overridden_templates = $this->list_overridden_templates();

        if ( empty( $overridden_templates ) ) {
            return $notices;
        }

        $notice = sprintf(
            /* translators: %s: overridden templates */
            __( 'The following templates are overridden:<br><code>%s</code>', 'dokan-lite' ),
            implode( ',<br>', $overridden_templates )
        );

        $notices[] = [
            'type'        => 'alert',
            'title'       => esc_html__( 'Some of Dokan Templates are overridden which limit new features.', 'dokan-lite' ),
            'description' => $notice,
            'actions'     => [
                [
                    'type'   => 'primary',
                    'text' => esc_html__( 'Learn More', 'dokan-lite' ),
                    'action'   => admin_url( 'admin.php?page=dokan-status' ),
                    'target' => '_blank',
                ],
            ],
        ];

        return $notices;
    }

    /**
     * Add template dependencies to status page.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     * @throws Exception
     */
    public function add_status_section( Status $status ) {
        if ( empty( $this->list_overridden_templates() ) ) {
            return;
        }

        $table = Status::table( 'override_table' )
                ->set_title( __( 'General Heading', 'dokan-lite' ) )
                ->set_headers(
                    [
                        __( 'Template', 'dokan-lite' ),
                    ]
                );

        foreach ( $this->list_overridden_templates() as $id => $template ) {
            $table->add(
                Status::table_row( 'override_row_' . $id )
                    ->add(
                        Status::table_column( 'template_' . $id )
                            ->add(
                                Status::paragraph( 'file_location_' . $id )
                                    ->set_title( $template )
                            )
                            ->add(
                                Status::paragraph( 'file_location_' . $id . '_instruction' )
                                        ->set_title( __( 'Please Remove the above file to enable ', 'dokan-lite' ) )
                            )
                    )
            );
        }

        $status->add(
            Status::section( 'overridden_features' )
                ->set_title( __( 'Overridden Templates', 'dokan-lite' ) )
                ->set_description( __( 'The templates currently overridden that is preventing enabling new features.', 'dokan-lite' ) )
                ->add(
                    $table
                )
        );
    }
}
