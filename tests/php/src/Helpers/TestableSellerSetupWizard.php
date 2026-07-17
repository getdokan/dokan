<?php

namespace WeDevs\Dokan\Test\Helpers;

use WeDevs\Dokan\Vendor\SetupWizard;

/**
 * Primes the vendor setup wizard the way `setup_wizard()` does on a real page
 * load, minus the page gate and render — so tests can drive the step handlers.
 */
class TestableSellerSetupWizard extends SetupWizard {

    public function prime( int $vendor_id ): void {
        $this->store_id   = $vendor_id;
        $this->store_info = dokan_get_store_info( $vendor_id );
        $this->set_steps();
        $this->current_step = 'store';
    }
}
