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
        return [
            'page_title' => __( 'Withdraw Management', 'dokan-lite' ),
            'menu_title' => __( 'Withdraw', 'dokan-lite' ),
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
