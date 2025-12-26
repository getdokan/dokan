<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class ReverseWithdrawal extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since 4.2.0
     *
     * @return string
     */
    public function get_id(): string {
        return 'reverse-withdrawal';
    }

    /**
     * @inheritDoc
     */
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => esc_html__( 'Reverse Withdrawal Management', 'dokan-lite' ),
            'menu_title' => esc_html__( 'Reverse Withdrawal', 'dokan-lite' ),
            'route'      => 'reverse-withdrawal',
            'capability' => $capability,
            'position'   => 11,
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
     * @since 4.2.0
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since 4.2.0
     *
     * @return void
     */
    public function register(): void {
        // No need to register assets here as the component is directly included in Dashboard route.
    }
}
