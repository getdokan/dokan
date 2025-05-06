<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\QueryFilter as StatsQueryFilter;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\ScheduleListener;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;


class AnalyticsServiceProvider extends BaseServiceProvider {
    /**
     * Tags for services added to the container.
     */
    protected $tags = [ 'analytics-service' ];

    protected $services = [
        ScheduleListener::class,
        QueryFilter::class,
        StatsQueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Products\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Products\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Variations\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Variations\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Categories\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\DataStoreModifier::class,
        \WeDevs\Dokan\Analytics\Reports\CacheKeyModifier::class,
        \WeDevs\Dokan\Analytics\Reports\Taxes\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Taxes\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Coupons\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Coupons\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Customers\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Customers\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Stock\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Assets::class,
        \WeDevs\Dokan\Analytics\VendorDashboardManager::class,
        \WeDevs\Dokan\Analytics\Reports\DataStoreCacheModifier::class,
        \WeDevs\Dokan\Analytics\Settings::class,
    ];

    /**
     * Register the classes.
     */
    public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
