<?php

namespace WeDevs\Dokan\Dashboard;

use WeDevs\Dokan\Dashboard\Templates\Manager as TemplateManager;
use WeDevs\Dokan\Traits\ChainableContainer;

class Manager {

    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function __construct() {
        $this->container['templates'] = new TemplateManager();
    }
}
