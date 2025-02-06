<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

use WeDevs\Dokan\Admin\Dashboard\Pageable;

abstract class AbstractPage implements Pageable {

    public function __construct() {
        add_filter( 'dokan_admin_dashboard_pages', [ $this, 'enlist' ] );
    }

    public function enlist( $pages ) {
        $pages[] = $this;
        return $pages;
    }

    /**
     * @inheritDoc
     */
    abstract public function get_id(): string;

    /**
     * @inheritDoc
     */
    abstract public function menu( string $capability, string $position ): array;

    /**
     * @inheritDoc
     */
    abstract public function settings(): array;

    /**
     * @inheritDoc
     */
    abstract public function scripts(): array;

    /**
     * @inheritDoc
     */
    abstract public function styles(): array;

    /**
     * @inheritDoc
     */
    abstract public function register(): void;
}
