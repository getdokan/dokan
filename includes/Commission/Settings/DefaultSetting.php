<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Default setting class
 *
 * @since 3.14.0
 */
class DefaultSetting implements InterfaceSetting {

    const TYPE = Fixed::SOURCE;

    /**
     * Returns default setting.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get(): Setting {
        $setting = new Setting();
        $setting->set_type( self::TYPE );

        return $setting;
    }
}
