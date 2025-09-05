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
        return [];
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
