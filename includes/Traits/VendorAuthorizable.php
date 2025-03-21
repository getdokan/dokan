<?php

namespace WeDevs\Dokan\Traits;

trait VendorAuthorizable {
    /**
     * Check if user has vendor permission.
     *
     * @since 3.14.11
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'dokandar' );
    }
}
