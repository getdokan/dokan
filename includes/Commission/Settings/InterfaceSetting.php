<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Setting interface class.
 *
 * @since DOKAN_SINCE
 */
interface InterfaceSetting {

    /**
     * Get commission setting.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get(): Setting;

    /**
     * Save commission.
     *
     * @since DOKAN_SINCE
     *
     * @param array $setting
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function save( array $setting ): Setting;
}
