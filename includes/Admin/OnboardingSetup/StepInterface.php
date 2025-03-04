<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup;

interface StepInterface {
    public function get_id();

    public function register();

    public function scripts(): array;
    public function styles(): array;

}
