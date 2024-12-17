<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use WeDevs\Dokan\Traits\ChainableContainer;

/**
 * Dashboard Template Manager
 *
 * @since 3.0.0
 *
 * @property Dashboard           $dashboard          Instance of Dashboard class
 * @property Orders              $orders             Instance of Orders class
 * @property Products            $products           Instance of Dashboard class
 * @property Settings            $settings           Instance of Settings class
 * @property Withdraw            $withdraw           Instance of Withdraw class
 * @property MultiStepCategories $product_category   Instance of MultiStepCategories class
 * @property ReverseWithdrawal   $reverse_withdrawal Instance of ReverseWithdrawal class
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
        $this->container['main']               = new Main();
        $this->container['dashboard']          = new Dashboard();
        $this->container['products']           = new Products();
        $this->container['orders']             = new Orders();
        $this->container['settings']           = new Settings();
        $this->container['withdraw']           = new Withdraw();
        $this->container['product_category']   = new MultiStepCategories();
        $this->container['reverse_withdrawal'] = new ReverseWithdrawal();
    }
}
