<?php

namespace WeDevs\Dokan;

use Exception;
use WeDevs\Dokan\Admin\Status\Status;
use WeDevs\Dokan\Admin\Status\StatusElementFactory;

class VendorNavMenuChecker {

    /**
     * @since 4.0.0
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
     * Forcefully resolved dependencies.
     *
     * Using `dokan_is_dashboard_nav_dependency_resolved` filter hook.
     *
     * @since 4.0.0
     *
     * @var array $forcefully_resolved_dependencies List of forcefully resolved dependencies.
     */
    protected array $forcefully_resolved_dependencies = [];

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
     * @since 4.0.0
     *
     * @return array
     */
    public function get_template_dependencies(): array {
        return apply_filters( 'dokan_get_dashboard_nav_template_dependency', $this->template_dependencies );
    }

    /**
     * Convert menu items to react menu items
     *
     * @since 4.0.0
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
     * @since 4.0.0
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

        $filtered_clear = apply_filters( 'dokan_is_dashboard_nav_dependency_resolved', $clear, $route );

        if ( $clear !== $filtered_clear ) {
            $this->forcefully_resolved_dependencies[ $route ] = $filtered_clear;
        }

        return $filtered_clear;
    }

    /**
     * List forcefully resolved dependencies.
     *
     * @since 4.0.0
     *
     * @return array
     */
    public function list_force_dependency_resolved_alteration(): array {
        // Forcefully rebuild dependencies resolutions.
        dokan_get_dashboard_nav();

        return $this->forcefully_resolved_dependencies;
    }

    /**
     * Get URL for the route.
     *
     * @since 4.0.0
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
     * @since 4.0.0
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
     * @since 4.0.0
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
     * @since 4.0.0
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
     * @since 4.0.0
     *
     * @param array $notices Notices.
     *
     * @return array
     */
    public function display_notice( array $notices ): array {
        $overridden_templates = $this->list_overridden_templates();
        $overridden_routes = $this->list_force_dependency_resolved_alteration();

        if ( empty( $overridden_templates ) && empty( $overridden_routes ) ) {
            return $notices;
        }

        $notices[] = [
            'type'        => 'alert',
            'scope'       => 'global',
            'title'       => esc_html__( 'Some of Dokan Templates or functionalities are overridden which limit new features.', 'dokan-lite' ),
            'description' => esc_html__( 'Some of the Dokan templates or routes are overridden, which can prevent new features and intended functionalities from working correctly.', 'dokan-lite' ),
            'actions'     => [
                [
                    'type'   => 'primary',
                    'text' => esc_html__( 'Learn More', 'dokan-lite' ),
                    'action'   => admin_url( 'admin.php?page=dokan-dashboard#/status' ),
                    'target' => '_blank',
                ],
            ],
        ];

        return $notices;
    }

    /**
     * Add template dependencies to status page.
     *
     * @since 4.0.0
     *
     * @return void
     * @throws Exception
     */
    public function add_status_section( Status $status ) {
        $overridden_templates = $this->list_overridden_templates();
        $overridden_routes = $this->list_force_dependency_resolved_alteration();

        if ( empty( $overridden_templates ) && empty( $overridden_routes ) ) {
            return;
        }

        if ( ! empty( $overridden_templates ) ) {
            $template_table = StatusElementFactory::table( 'override_templates_table' )
                ->set_title( __( 'Overridden Template Table', 'dokan-lite' ) )
                ->set_headers(
                    [
                        __( 'Template', 'dokan-lite' ),
                    ]
                );

            foreach ( $overridden_templates as $id => $template ) {
                $template_table->add(
                    StatusElementFactory::table_row( 'override_row_' . $id )
                        ->add(
                            StatusElementFactory::table_column( 'template_' . $id )
                                ->add(
                                    StatusElementFactory::paragraph( 'file_location_' . $id )
                                        ->set_title( '<code>' . $template . '</code>' )
                                )
                                ->add(
                                    StatusElementFactory::paragraph( 'file_location_' . $id . '_instruction' )
                                        ->set_title( __( 'Please Remove the above file to enable new features.', 'dokan-lite' ) )
                                )
                        )
                );
            }
        }

        if ( ! empty( $overridden_routes ) ) {
            $route_table = StatusElementFactory::table( 'override_features_table' )
                ->set_title( __( 'Overridden Template Table', 'dokan-lite' ) )
                ->set_headers(
                    [
                        __( 'Route', 'dokan-lite' ),
                        __( 'Override Status', 'dokan-lite' ),
                    ]
                );

            foreach ( $overridden_routes as $route => $clearance ) {
                $route_table->add(
                    StatusElementFactory::table_row( 'override_feature_row_' . $route )
                        ->add(
                            StatusElementFactory::table_column( 'route_coll_' . $route )
                                ->add(
                                    StatusElementFactory::paragraph( 'route_' . $route )
                                        ->set_title( '<code>' . $route . '</code>' )
                                )
                        )
                        ->add(
                            StatusElementFactory::table_column( 'status_coll_' . $route )
                                ->add(
                                    StatusElementFactory::paragraph( 'status_' . $route )
                                        ->set_title( $clearance ? __( 'Forcefully enabled new feature.', 'dokan-lite' ) : __( 'Forcefully disabled new feature.', 'dokan-lite' ) )
                                )
                        )
                );
            }
        }

        $section = StatusElementFactory::section( 'overridden_features' )
            ->set_title( __( 'Overridden Templates or Routes', 'dokan-lite' ) )
            ->set_description( __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) );

        if ( ! empty( $overridden_templates ) ) {
            $section->add( $template_table );
        }

        if ( ! empty( $overridden_routes ) ) {
            $section->add( $route_table );
        }

        $status->add(
            $section
        );
    }
}
