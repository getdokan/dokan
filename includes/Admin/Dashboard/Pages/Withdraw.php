<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Withdraw extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since 4.0.0
     *
     * @return string
     */
    public function get_id(): string {
        return 'withdraw';
    }

    /**
     * @inheritDoc
     */
    public function menu( string $capability, string $position ): array {
        $withdraw_count = dokan_get_withdraw_count();
        $pending_count  = absint( $withdraw_count['pending'] ?? 0 );

        $menu_title = $pending_count ? sprintf(
            /* translators: %s: Pending withdraw request count badge */
            __( 'Withdraw %s', 'dokan-lite' ),
            '<span class="awaiting-mod count-1"><span class="pending-count">'
            . number_format_i18n( $pending_count )
            . '</span></span>'
        ) : __( 'Withdraw', 'dokan-lite' );

        return [
            'page_title' => __( 'Withdraw Management', 'dokan-lite' ),
            'menu_title' => $menu_title,
            'route'      => 'withdraw',
            'capability' => $capability,
            'position'   => 10,
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
        return [];
    }

    /**
     * Get the styles.
     *
     * @since 4.0.0
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function register(): void {
        // No need to register assets here as the component is directly included in Dashboard route
    }
}
