<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Formula\CategoryBased;
use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Commission\Settings\Builder;
use WeDevs\Dokan\Commission\Settings\DefaultSetting;

class DefaultStrategy extends AbstractStrategy {

    /**
     * Global commission strategy source.
     *
     * @since 3.14.0
     */
    const SOURCE = 'default';

    /**
     * Returns global strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns global commission settings.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get_settings(): Setting {
        $builder = Builder::build( '', '' );
        $setting = $builder->get();

        $setting->set_type( DefaultSetting::TYPE )
            ->set_flat( 0 )
            ->set_percentage( 0 )
            ->set_category_commissions( [] );

        return $setting;
    }
}
