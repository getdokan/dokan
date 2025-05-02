<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Commission\Calculator;
use WeDevs\Dokan\Commission\OrderCommission;
use WeDevs\Dokan\Commission\OrderLineItemCommission;
use WeDevs\Dokan\Commission\ProductCommission;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\Order\VendorBalanceUpdateHandler;

class CommissionServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'commission-service' ];

    protected $services = [
        OrderCommission::class,
        OrderLineItemCommission::class,
        ProductCommission::class,
        Calculator::class,
        VendorBalanceUpdateHandler::class,
    ];

    /**
     * Register the classes.
     */
    public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->add_with_implements_tags( $service, $service, false );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
