<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use WeDevs\Dokan\Dashboard\Templates\Dashboard;
use WeDevs\Dokan\Dashboard\Templates\Main;
use WeDevs\Dokan\Dashboard\Templates\Orders;
use WeDevs\Dokan\Dashboard\Templates\Products;
use WeDevs\Dokan\Dashboard\Templates\Settings;
use WeDevs\Dokan\Dashboard\Templates\Withdraw;
use WeDevs\Dokan\Traits\ChainableContainer;

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
        $this->container['main']      = new Main();
        $this->container['dashboard'] = new Dashboard();
        $this->container['products']  = new Products();
        $this->container['orders']    = new Orders();
        $this->container['settings']  = new Settings();
        $this->container['withdraw']  = new Withdraw();
    }
}
