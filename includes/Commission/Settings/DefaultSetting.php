<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Model\Setting;

class DefaultSetting implements InterfaceSetting {

    public function get(): Setting {
        return new Setting();
    }

    public function save( array $setting ): Setting {
        return $this->get();
    }
}
