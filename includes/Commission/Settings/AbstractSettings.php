<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Formula\CategoryBased;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Model\Setting;

class AbstractSettings implements InterfaceSetting {
    
    protected ?InterfaceSetting $next = null;
    
    public function get_next(): InterfaceSetting() {
        return $this->next;
    }

    public function set_next( InterfaceSetting $next ): void {
        $this->next = $nex;
    }
}
