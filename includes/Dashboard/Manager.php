<?php

namespace WeDevs\Dokan\Dashboard;

use WeDevs\Dokan\Dashboard\Templates\Manager as TemplateManager;
use WeDevs\Dokan\Traits\ChainableContainer;

/**
 * Dashboard Manager
 *
 * @since 3.0.0
 *
 * @property TemplateManager $templates Instance of TemplateManager class
 */
class Manager {

    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        $this->container['templates'] = new TemplateManager();
    }
}
