<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Model\Setting;

interface InterfaceSetting {
    public function get(): Setting;
    public function save( array $setting ): Setting;
}
