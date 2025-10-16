<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\VendorNavMenuChecker;
/**
 * @group core-feature
 */
class VendorNavMenuCheckerTest extends DokanTestCase {
    /**
     * Test that service is registered to container.
     *
     * @test
     */
    public function test_that_service_is_registered_to_container() {
        $container = dokan_get_container();
        $service = $container->get( VendorNavMenuChecker::class );
        $this->assertInstanceOf( VendorNavMenuChecker::class, $service );
    }

    /**
     * Test that template dependencies are returned.
     *
     * @test
     */
    public function test_that_template_dependencies_are_returned() {
        $checker      = new VendorNavMenuChecker();
        $dependencies = $checker->get_template_dependencies();
        $this->assertIsArray( $dependencies );
    }

    /**
     * Test that menu items are converted to react menu items.
     *
     * @test
     */
    public function test_that_menu_items_are_converted_to_react_menu_items() {
        $checker = new VendorNavMenuChecker();
        $menu_items = [
            'dashboard' => [
                'route' => 'dashboard',
                'url'   => 'http://example.com/dashboard',
                'name'  => 'Dashboard',
            ],
            'products' => [
                'route' => 'products',
                'url'   => 'http://example.com/products',
                'name'  => 'Products',
            ],
            'orders' => [
                'route' => 'orders',
                'url'   => 'http://example.com/orders',
                'name'  => 'Orders',
            ],
        ];
        $react_menu_items = $checker->convert_to_react_menu( $menu_items );
        $this->assertIsArray( $react_menu_items );
        $this->assertNotEquals( $menu_items['dashboard']['url'], $react_menu_items['dashboard']['url'] );
        $this->assertNotEquals( $menu_items['products']['url'], $react_menu_items['products']['url'] );

        add_filter(
            'dokan_get_dashboard_nav_template_dependency',
            function ( $template_dependencies ) {
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/dashboard',
                    'name' => '',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'big-counter',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'orders',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'products',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'sales-chart',
                    'name' => 'widget',
                    'args' => [],
                ];
                return $template_dependencies;
            }
        );

        $react_menu_items = $checker->convert_to_react_menu( $menu_items );
        $this->assertIsArray( $react_menu_items );
        $this->assertNotEquals( $menu_items['dashboard']['url'], $react_menu_items['dashboard']['url'] );
        $this->assertNotEquals( $menu_items['products']['url'], $react_menu_items['products']['url'] );
    }

    /**
     * Test that menu items are not converted to react if template is overridden by file.
     *
     * @test
     */
    public function test_that_menu_items_are_not_converted_to_react_if_template_is_overridden_by_file() {
        $checker    = new VendorNavMenuChecker();
        $menu_items = [
            'dashboard' => [
                'route' => 'dashboard',
                'url'   => dokan_get_navigation_url(),
                'name'  => 'Dashboard',
            ],
            'products'  => [
                'route' => 'products',
                'url'   => dokan_get_navigation_url( 'products' ),
                'name'  => 'Products',
            ],
            'orders'    => [
                'route' => 'orders',
                'url'   => dokan_get_navigation_url( 'orders' ),
                'name'  => 'Orders',
            ],
        ];

        add_filter(
            'dokan_get_dashboard_nav_template_dependency',
            function ( $template_dependencies ) {
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/dashboard',
                    'name' => '',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'big-counter',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'orders',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'products',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'sales-chart',
                    'name' => 'widget',
                    'args' => [],
                ];

                return $template_dependencies;
            }
        );

        $react_menu_items = $checker->convert_to_react_menu( $menu_items );
        $this->assertIsArray( $react_menu_items );
        $this->assertNotEquals( $menu_items['dashboard']['url'], $react_menu_items['dashboard']['url'] );
        $this->assertNotEquals( $menu_items['products']['url'], $react_menu_items['products']['url'] );

        $theme_dir = wp_get_theme()->get_stylesheet_directory();
        $file      = $theme_dir . '/dokan/dashboard/dashboard.php';

        self::touch( $file );

        $react_menu_items = $checker->convert_to_react_menu( $menu_items );
        $this->assertIsArray( $react_menu_items );
        $this->assertEquals( $menu_items['dashboard']['url'], $react_menu_items['dashboard']['url'] );
        $this->assertNotEquals( $menu_items['products']['url'], $react_menu_items['products']['url'] );

        self::unlink( $file );
    }

    /**
     * Test that menu items are not converted to react if template is overridden by third party plugin.
     *
     * @test
     */
    public function test_that_menu_items_are_not_converted_to_react_if_template_is_overridden_by_third_party_plugin() {
        $checker    = new VendorNavMenuChecker();
        $menu_items = [
            'dashboard' => [
                'route' => 'dashboard',
                'url'   => dokan_get_navigation_url(),
                'name'  => 'Dashboard',
            ],
            'products'  => [
                'route' => 'products',
                'url'   => dokan_get_navigation_url( 'products' ),
                'name'  => 'Products',
            ],
            'orders'    => [
                'route' => 'orders',
                'url'   => dokan_get_navigation_url( 'orders' ),
                'name'  => 'Orders',
            ],
        ];

        add_filter(
            'dokan_get_dashboard_nav_template_dependency',
            function ( $template_dependencies ) {
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/dashboard',
                    'name' => '',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'big-counter',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'orders',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'products',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'sales-chart',
                    'name' => 'widget',
                    'args' => [],
                ];

                return $template_dependencies;
            }
        );

        $react_menu_items = $checker->convert_to_react_menu( $menu_items );
        $this->assertIsArray( $react_menu_items );
        $this->assertNotEquals( $menu_items['dashboard']['url'], $react_menu_items['dashboard']['url'] );
        $this->assertNotEquals( $menu_items['products']['url'], $react_menu_items['products']['url'] );

        $custom_template_file = WP_PLUGIN_DIR . '/dokan-custom/dashboard/dashboard.php';

        add_filter(
            'dokan_get_template_part',
            function ( $template, $slug, $name ) use ( $custom_template_file ) {
                if ( 'dashboard/dashboard' === $slug && '' === $name ) {
                    return $custom_template_file;
                }

                return $template;
            },
            10,
            3
        );

        $react_menu_items = $checker->convert_to_react_menu( $menu_items );
        $this->assertIsArray( $react_menu_items );
        $this->assertEquals( $menu_items['dashboard']['url'], $react_menu_items['dashboard']['url'] );
        $this->assertNotEquals( $menu_items['products']['url'], $react_menu_items['products']['url'] );
    }

    /**
     * Test that menu items template dependency is being resolved on template override.
     *
     * @test
     */
    public function test_that_menu_items_template_dependency_is_being_resolved_on_template_override() {
        $checker    = new VendorNavMenuChecker();
        $menu_items = [
            'dashboard' => [
                'route' => 'dashboard',
                'url'   => dokan_get_navigation_url(),
                'name'  => 'Dashboard',
            ],
            'products'  => [
                'route' => 'products',
                'url'   => dokan_get_navigation_url( 'products' ),
                'name'  => 'Products',
            ],
            'orders'    => [
                'route' => 'orders',
                'url'   => dokan_get_navigation_url( 'orders' ),
                'name'  => 'Orders',
            ],
        ];

        add_filter(
            'dokan_get_dashboard_nav_template_dependency',
            function ( $template_dependencies ) {
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/dashboard',
                    'name' => '',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/big-counter',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/orders',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/products',
                    'name' => 'widget',
                    'args' => [],
                ];
                $template_dependencies['dashboard'][] = [
                    'slug' => 'dashboard/sales-chart',
                    'name' => 'widget',
                    'args' => [],
                ];

                return $template_dependencies;
            }
        );

        $theme_dir = wp_get_theme()->get_stylesheet_directory();
        $products_widget_file = $theme_dir . '/dokan/dashboard/products-widget.php';
        $orders_widget_file   = $theme_dir . '/dokan/dashboard/orders-widget.php';

        self::touch( $products_widget_file );
        self::touch( $orders_widget_file );

        $custom_template_file = WP_PLUGIN_DIR . '/dokan-custom/dashboard/dashboard.php';

        add_filter(
            'dokan_get_template_part',
            function ( $template, $slug, $name ) use ( $custom_template_file ) {
                if ( 'dashboard/dashboard' === $slug && '' === $name ) {
                    return $custom_template_file;
                }

                return $template;
            },
            10,
            3
        );

        $overridden = $checker->list_overridden_templates();

        self::unlink( $products_widget_file );
        self::unlink( $orders_widget_file );

        $this->assertIsArray( $overridden );
        $this->assertContains( $products_widget_file, $overridden );
        $this->assertContains( $orders_widget_file, $overridden );
        $this->assertContains( $custom_template_file, $overridden );
    }
}
