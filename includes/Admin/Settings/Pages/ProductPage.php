<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\Pages\AbstractPage;

class ProductPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'product';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 110;
    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */

    protected $storage_key = 'dokan_settings_product';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() { }

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
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function describe_settings(): void {
        $this->set_icon( 'Box' )
            ->set_title( esc_html__( 'Product', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure product-related settings for your marketplace.', 'dokan-lite' ) );
    }
}
