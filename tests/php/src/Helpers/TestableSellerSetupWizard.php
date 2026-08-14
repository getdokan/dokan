<?php

namespace WeDevs\Dokan\Test\Helpers;

use WeDevs\Dokan\Vendor\SetupWizard;

/**
 * Primes the vendor setup wizard the way `setup_wizard()` does on a real page
 * load, minus the page gate and render — so tests can drive the step handlers
 * and the SPA seams the shell would otherwise only exercise in a browser.
 */
class TestableSellerSetupWizard extends SetupWizard {

    public function prime( int $vendor_id, string $step = 'store' ): void {
        $this->store_id   = $vendor_id;
        $this->store_info = dokan_get_store_info( $vendor_id );
        $this->set_steps();
        $this->current_step = $step;
    }

    public function set_current_step( string $step ): void {
        $this->current_step = $step;
    }

    public function current_step(): string {
        return $this->current_step;
    }

    public function step_order(): array {
        return $this->wizard_step_order();
    }

    public function payload_keys(): array {
        return $this->payload_keys;
    }

    public function step_payload(): array {
        return $this->current_step_payload();
    }

    public function uses_react(): bool {
        return $this->use_react_wizard();
    }

    public function bootstrap_steps(): void {
        $this->bootstrap_all_steps();
    }

    public function capture_output( string $html ): void {
        $this->defer_output( $html );
    }

    public function flush_deferred_output(): void {
        $this->render_deferred_output();
    }
}
