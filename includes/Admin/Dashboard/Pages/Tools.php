<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

/**
 * Admin Tools page (React dashboard).
 *
 * Renders the free Tools sections; Dokan Pro injects its own sections into the
 * same page via the `dokan_admin_dashboard_tools_sections` JS filter.
 *
 * @since DOKAN_SINCE
 */
class Tools extends AbstractPage {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'tools';
    }

    /**
     * @inheritDoc
     */
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Dokan Tools', 'dokan-lite' ),
            'menu_title' => __( 'Tools', 'dokan-lite' ),
            'route'      => 'tools',
            'capability' => $capability,
            // Sits between Modules (30) and Status (99).
            'position'   => 98,
        ];
    }

    /**
     * @inheritDoc
     */
    public function settings(): array {
        return [];
    }

    /**
     * @inheritDoc
     */
    public function scripts(): array {
        return [ 'dokan-admin-dashboard' ];
    }

    /**
     * @inheritDoc
     */
    public function styles(): array {
        return [ 'dokan-admin-dashboard' ];
    }

    /**
     * @inheritDoc
     */
    public function register(): void {}
}
