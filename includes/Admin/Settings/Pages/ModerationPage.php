<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

class ModerationPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'moderation';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 90;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_moderation';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() {}

    /**
     * Get the page scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page scripts.
     */
    public function scripts(): array {
        return [];
    }

    /**
     * Get the page styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page styles.
     */
    public function styles(): array {
        return [];
    }

    /**
     * Pass the settings options to frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings options.
     */
    public function settings(): array {
        return [];
    }

    /**
     * Describe the settings options
     *
     * @throws \Exception
     * @return void
     */
    public function describe_settings(): void {
        // Set up the main moderation page.
        $this
            ->set_title( esc_html__( 'Moderation', 'dokan-lite' ) )
            ->set_icon( 'Settings2' )
            ->set_description( esc_html__( 'Configure moderation settings, return policies, and customer request management.', 'dokan-lite' ) );
    }
}
