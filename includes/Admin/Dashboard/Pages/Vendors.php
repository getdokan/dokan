<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Vendors extends AbstractPage {
    public function get_id(): string {
        return 'vendors';
    }

    public function menu( string $capability, string $position ): array {
        $pending_count = dokan_get_pending_vendor_count();

        $menu_title = $pending_count ? sprintf(
            /* translators: %s: Pending vendor count badge */
            __( 'Vendors %s', 'dokan-lite' ),
            '<span class="awaiting-mod count-1"><span class="pending-count">'
            . number_format_i18n( $pending_count )
            . '</span></span>'
        ) : __( 'Vendors', 'dokan-lite' );

        return [
            'page_title' => __( 'Vendors', 'dokan-lite' ),
            'menu_title' => $menu_title,
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
