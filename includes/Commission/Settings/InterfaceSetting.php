<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Setting interface class.
 *
 * @since 3.14.0
 */
interface InterfaceSetting {

    /**
     * Get commission setting.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get(): Setting;

    /**
     * Save commission.
     *
     * @since 3.14.0
     *
     * @param array $setting
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function save( array $setting ): Setting;
}
