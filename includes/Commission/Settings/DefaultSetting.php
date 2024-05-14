<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Default setting class
 *
 * @since DOKAN_SINCE
 */
class DefaultSetting implements InterfaceSetting {

    const TYPE = Fixed::SOURCE;

    /**
     * Returns default setting.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get(): Setting {
        $setting = new Setting();
        $setting->set_type( self::TYPE );

        return $setting;
    }

    /**
     * Saves and returns default setting
     *
     * @since DOKAN_SINCE
     *
     * @param array $setting
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function save( array $setting ): Setting {
        return $this->get();
    }
}
