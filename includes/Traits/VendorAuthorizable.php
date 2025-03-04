<?php

namespace WeDevs\Dokan\Traits;

trait VendorAuthorizable {
    /**
     * Check if user has vendor permission.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'dokandar' );
    }
}
