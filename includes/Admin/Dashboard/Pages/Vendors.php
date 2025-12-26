<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Vendors extends AbstractPage {
    public function get_id(): string {
        return 'vendors';
    }

    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Vendors', 'dokan-lite' ),
            'menu_title' => __( 'Vendors', 'dokan-lite' ),
            'route'      => 'vendors',
            'capability' => $capability,
            'position'   => 100,
        ];
    }

    public function settings(): array {
        return apply_filters(
            'dokan_admin_dashboard_vendors_settings', [
				'new_seller_enable_selling' => dokan_get_container()->get( \WeDevs\Dokan\Utilities\AdminSettings::class )->get_new_seller_enable_selling_status(),
			]
        );
    }

    public function scripts(): array {
        // No direct asset registration needed; component is injected via Dashboard route.
        return [];
    }

    public function styles(): array {
        return [];
    }

    public function register(): void {
        // Intentionally left empty. Assets are handled via the Dashboard route filter.
    }
}
